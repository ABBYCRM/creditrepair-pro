import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { analyzeCreditProfile } from "./lib/credit-engine";
import { getDb } from "./queries/connection";
import {
  creditReports,
  creditAccounts,
  creditScores,
  activities,
  disputes,
} from "@db/schema";

export const analysisRouter = createRouter({
  analyzeProfile: authedQuery
    .input(
      z.object({
        name: z.string(),
        ssnLastFour: z.string().optional(),
        dateOfBirth: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        zipCode: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const userId = ctx.user.id;

      // Run the credit analysis engine
      const analysis = analyzeCreditProfile({
        name: input.name,
        ssnLastFour: input.ssnLastFour,
        dateOfBirth: input.dateOfBirth,
      });

      // Create credit reports for each bureau
      const bureaus = ["equifax", "experian", "transunion"] as const;
      const reportIds: number[] = [];

      for (const bureau of bureaus) {
        const [report] = await db.insert(creditReports).values({
          userId,
          reportDate: new Date(),
          bureau,
          reportSource: "VantageScore Analysis Engine",
          score: analysis.bureauScores[bureau],
          scoreModel: "VantageScore 3.0",
          totalAccounts: analysis.totalAccounts,
          negativeAccounts: analysis.negativeItems.filter(
            (n) => n.bureau === bureau && n.issueType !== "Hard Inquiry"
          ).length,
          inquiries: analysis.negativeItems.filter(
            (n) => n.bureau === bureau && n.issueType === "Hard Inquiry"
          ).length,
          totalBalance: String(analysis.totalNegativeBalance),
          isActive: true,
        });
        reportIds.push(Number(report.insertId));

        // Insert credit scores
        await db.insert(creditScores).values({
          userId,
          reportId: Number(report.insertId),
          bureau,
          score: analysis.bureauScores[bureau],
          scoreModel: "VantageScore 3.0",
          factors: analysis.factors.map((f) => f.description).join("; "),
          dateRecorded: new Date(),
        });
      }

      // Create credit accounts from negative items
      for (const item of analysis.negativeItems) {
        const bureauIndex = bureaus.indexOf(item.bureau);
        const reportId = reportIds[bureauIndex] || reportIds[0];

        await db.insert(creditAccounts).values({
          reportId,
          userId,
          accountName: item.accountName,
          accountType: mapAccountType(item.accountType),
          creditorName: item.creditorName,
          bureau: item.bureau,
          dateOpened: new Date(item.dateOpened),
          dateFirstDelinquency: item.dateFirstDelinquency
            ? new Date(item.dateFirstDelinquency)
            : undefined,
          balance: String(item.balance),
          status: mapStatus(item.issueType),
          isNegative: true,
          negativeReason: item.issueType,
          isDisputed: false,
          isDeleted: false,
        });
      }

      // Auto-create disputes for critical and high severity items
      let disputeCount = 0;
      for (const item of analysis.negativeItems) {
        if (item.severity === "critical" || item.severity === "high") {
          const [account] = await db
            .select()
            .from(creditAccounts)
            .where(
              and(
                eq(creditAccounts.userId, userId),
                eq(creditAccounts.accountName, item.accountName)
              )
            )
            .limit(1);

          if (account) {
            await db.insert(disputes).values({
              userId,
              accountId: account.id,
              bureau: item.bureau,
              roundNumber: 1,
              letterType: item.recommendedLetterType as never,
              disputeReason: item.disputeReasons[0],
              disputeMethod: "mail",
              status: "draft",
            });
            disputeCount++;
          }
        }
      }

      // Log activity
      await db.insert(activities).values({
        userId,
        type: "report_imported",
        title: "Credit Analysis Complete",
        description: `Auto-analyzed credit profile: ${analysis.overallScore} score, ${analysis.negativeItems.length} negative items found, ${disputeCount} disputes auto-created`,
      });

      return {
        ...analysis,
        disputesCreated: disputeCount,
      };
    }),

  getAnalysis: authedQuery.query(async ({ ctx }) => {
    // Return latest analysis data from user's reports
    const db = getDb();
    const reports = await db
      .select()
      .from(creditReports)
      .where(eq(creditReports.userId, ctx.user.id))
      .orderBy(creditReports.createdAt);

    if (reports.length === 0) return null;

    const accounts = await db
      .select()
      .from(creditAccounts)
      .where(eq(creditAccounts.userId, ctx.user.id));

    const scores = await db
      .select()
      .from(creditScores)
      .where(eq(creditScores.userId, ctx.user.id));

    return {
      reports,
      accounts,
      scores,
    };
  }),
});

function mapAccountType(type: string) {
  const map: Record<string, string> = {
    "Credit Card": "credit_card",
    "Auto Loan": "auto_loan",
    Mortgage: "mortgage",
    "Personal Loan": "personal_loan",
    "Student Loan": "student_loan",
    Collection: "collection",
    "Charge-Off": "charge_off",
    "Line of Credit": "credit_card",
  };
  return (map[type] || "other") as never;
}

function mapStatus(issueType: string) {
  const map: Record<string, string> = {
    "Late Payment": "open",
    "Collection Account": "collection",
    "Charge-Off": "charged_off",
    "Hard Inquiry": "open",
    "High Credit Utilization": "open",
    "Public Record": "closed",
    Bankruptcy: "closed",
  };
  return (map[issueType] || "unknown") as never;
}

import { eq, and } from "drizzle-orm";

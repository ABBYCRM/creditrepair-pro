import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { creditReports, creditAccounts, creditScores } from "@db/schema";
import { eq, and, desc } from "drizzle-orm";

export const creditReportRouter = createRouter({
  list: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db
      .select()
      .from(creditReports)
      .where(eq(creditReports.userId, ctx.user.id))
      .orderBy(desc(creditReports.reportDate));
  }),

  getById: authedQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const [report] = await db
        .select()
        .from(creditReports)
        .where(
          and(
            eq(creditReports.id, input.id),
            eq(creditReports.userId, ctx.user.id)
          )
        );
      return report;
    }),

  create: authedQuery
    .input(
      z.object({
        reportDate: z.string(),
        bureau: z.enum(["equifax", "experian", "transunion"]),
        reportSource: z.string().optional(),
        score: z.number().optional(),
        scoreModel: z.string().optional(),
        totalAccounts: z.number().optional(),
        negativeAccounts: z.number().optional(),
        inquiries: z.number().optional(),
        publicRecords: z.number().optional(),
        totalBalance: z.string().optional(),
        totalMonthlyPayments: z.string().optional(),
        creditUtilization: z.string().optional(),
        oldestAccountDate: z.string().optional(),
        avgAccountAge: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const [report] = await db.insert(creditReports).values({
        ...input,
        userId: ctx.user.id,
        reportDate: new Date(input.reportDate),
        oldestAccountDate: input.oldestAccountDate
          ? new Date(input.oldestAccountDate)
          : undefined,
      });

      if (input.score) {
        await db.insert(creditScores).values({
          userId: ctx.user.id,
          reportId: Number(report.insertId),
          bureau: input.bureau,
          score: input.score,
          scoreModel: input.scoreModel || "FICO 8",
          dateRecorded: new Date(input.reportDate),
        });
      }

      return { id: Number(report.insertId) };
    }),

  update: authedQuery
    .input(
      z.object({
        id: z.number(),
        score: z.number().optional(),
        totalAccounts: z.number().optional(),
        negativeAccounts: z.number().optional(),
        inquiries: z.number().optional(),
        publicRecords: z.number().optional(),
        totalBalance: z.string().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db
        .update(creditReports)
        .set(data)
        .where(
          and(eq(creditReports.id, id), eq(creditReports.userId, ctx.user.id))
        );
      return { success: true };
    }),

  delete: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      await db
        .delete(creditReports)
        .where(
          and(
            eq(creditReports.id, input.id),
            eq(creditReports.userId, ctx.user.id)
          )
        );
      return { success: true };
    }),

  getWithAccounts: authedQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const [report] = await db
        .select()
        .from(creditReports)
        .where(
          and(
            eq(creditReports.id, input.id),
            eq(creditReports.userId, ctx.user.id)
          )
        );
      if (!report) return null;

      const accounts = await db
        .select()
        .from(creditAccounts)
        .where(eq(creditAccounts.reportId, input.id));

      return { ...report, accounts };
    }),

  stats: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const reports = await db
      .select()
      .from(creditReports)
      .where(eq(creditReports.userId, ctx.user.id));

    const totalDisputes = await db
      .select()
      .from(creditAccounts)
      .where(
        and(
          eq(creditAccounts.userId, ctx.user.id),
          eq(creditAccounts.isDisputed, true)
        )
      );

    const deletedItems = await db
      .select()
      .from(creditAccounts)
      .where(
        and(
          eq(creditAccounts.userId, ctx.user.id),
          eq(creditAccounts.isDeleted, true)
        )
      );

    const negativeItems = await db
      .select()
      .from(creditAccounts)
      .where(
        and(
          eq(creditAccounts.userId, ctx.user.id),
          eq(creditAccounts.isNegative, true),
          eq(creditAccounts.isDeleted, false)
        )
      );

    return {
      totalReports: reports.length,
      totalDisputes: totalDisputes.length,
      deletedItems: deletedItems.length,
      remainingNegative: negativeItems.length,
    };
  }),
});

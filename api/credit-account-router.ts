import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { creditAccounts } from "@db/schema";
import { eq, and, desc } from "drizzle-orm";

export const creditAccountRouter = createRouter({
  list: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db
      .select()
      .from(creditAccounts)
      .where(eq(creditAccounts.userId, ctx.user.id))
      .orderBy(desc(creditAccounts.dateOpened));
  }),

  listByReport: authedQuery
    .input(z.object({ reportId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      return db
        .select()
        .from(creditAccounts)
        .where(
          and(
            eq(creditAccounts.reportId, input.reportId),
            eq(creditAccounts.userId, ctx.user.id)
          )
        );
    }),

  getNegativeItems: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db
      .select()
      .from(creditAccounts)
      .where(
        and(
          eq(creditAccounts.userId, ctx.user.id),
          eq(creditAccounts.isNegative, true),
          eq(creditAccounts.isDeleted, false)
        )
      )
      .orderBy(desc(creditAccounts.balance));
  }),

  getById: authedQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const [account] = await db
        .select()
        .from(creditAccounts)
        .where(
          and(
            eq(creditAccounts.id, input.id),
            eq(creditAccounts.userId, ctx.user.id)
          )
        );
      return account;
    }),

  create: authedQuery
    .input(
      z.object({
        reportId: z.number(),
        accountName: z.string(),
        accountNumber: z.string().optional(),
        accountType: z.enum([
          "credit_card",
          "mortgage",
          "auto_loan",
          "student_loan",
          "personal_loan",
          "collection",
          "charge_off",
          "inquiry",
          "public_record",
          "other",
        ]),
        creditorName: z.string().optional(),
        originalCreditor: z.string().optional(),
        bureau: z.enum(["equifax", "experian", "transunion"]),
        dateOpened: z.string().optional(),
        dateClosed: z.string().optional(),
        dateLastPayment: z.string().optional(),
        dateFirstDelinquency: z.string().optional(),
        creditLimit: z.string().optional(),
        highBalance: z.string().optional(),
        balance: z.string().optional(),
        monthlyPayment: z.string().optional(),
        status: z.enum(["open", "closed", "paid", "collection", "charged_off", "settled", "unknown"]).optional(),
        paymentStatus: z.string().optional(),
        isNegative: z.boolean().optional(),
        negativeReason: z.string().optional(),
        daysLate: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const [account] = await db.insert(creditAccounts).values({
        ...input,
        userId: ctx.user.id,
        dateOpened: input.dateOpened ? new Date(input.dateOpened) : undefined,
        dateClosed: input.dateClosed ? new Date(input.dateClosed) : undefined,
        dateLastPayment: input.dateLastPayment
          ? new Date(input.dateLastPayment)
          : undefined,
        dateFirstDelinquency: input.dateFirstDelinquency
          ? new Date(input.dateFirstDelinquency)
          : undefined,
      });
      return { id: Number(account.insertId) };
    }),

  update: authedQuery
    .input(
      z.object({
        id: z.number(),
        accountName: z.string().optional(),
        accountNumber: z.string().optional(),
        balance: z.string().optional(),
        status: z.enum(["open", "closed", "paid", "collection", "charged_off", "settled", "unknown"]).optional(),
        paymentStatus: z.string().optional(),
        isNegative: z.boolean().optional(),
        isDisputed: z.boolean().optional(),
        isDeleted: z.boolean().optional(),
        negativeReason: z.string().optional(),
        disputeId: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db
        .update(creditAccounts)
        .set(data)
        .where(
          and(eq(creditAccounts.id, id), eq(creditAccounts.userId, ctx.user.id))
        );
      return { success: true };
    }),

  delete: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      await db
        .delete(creditAccounts)
        .where(
          and(
            eq(creditAccounts.id, input.id),
            eq(creditAccounts.userId, ctx.user.id)
          )
        );
      return { success: true };
    }),

  bulkCreate: authedQuery
    .input(
      z.array(
        z.object({
          reportId: z.number(),
          accountName: z.string(),
          accountNumber: z.string().optional(),
          accountType: z.enum([
            "credit_card",
            "mortgage",
            "auto_loan",
            "student_loan",
            "personal_loan",
            "collection",
            "charge_off",
            "inquiry",
            "public_record",
            "other",
          ]),
          creditorName: z.string().optional(),
          bureau: z.enum(["equifax", "experian", "transunion"]),
          dateOpened: z.string().optional(),
          balance: z.string().optional(),
          status: z.enum(["open", "closed", "paid", "collection", "charged_off", "settled", "unknown"]).optional(),
          isNegative: z.boolean().optional(),
          negativeReason: z.string().optional(),
        })
      )
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const values = input.map((item) => ({
        ...item,
        userId: ctx.user.id,
        dateOpened: item.dateOpened ? new Date(item.dateOpened) : undefined,
      }));
      await db.insert(creditAccounts).values(values);
      return { inserted: input.length };
    }),
});

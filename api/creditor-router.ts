import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { creditors } from "@db/schema";
import { eq, and, desc, like, or } from "drizzle-orm";

export const creditorRouter = createRouter({
  list: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db
      .select()
      .from(creditors)
      .where(eq(creditors.userId, ctx.user.id))
      .orderBy(desc(creditors.createdAt));
  }),

  search: authedQuery
    .input(z.object({ query: z.string() }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      return db
        .select()
        .from(creditors)
        .where(
          and(
            eq(creditors.userId, ctx.user.id),
            or(
              like(creditors.name, `%${input.query}%`),
              like(creditors.accountNumber || "", `%${input.query}%`),
              like(creditors.originalCreditor || "", `%${input.query}%`)
            )
          )
        );
    }),

  getById: authedQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const [creditor] = await db
        .select()
        .from(creditors)
        .where(
          and(eq(creditors.id, input.id), eq(creditors.userId, ctx.user.id))
        );
      return creditor;
    }),

  create: authedQuery
    .input(
      z.object({
        name: z.string(),
        address: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        zipCode: z.string().optional(),
        phone: z.string().optional(),
        fax: z.string().optional(),
        email: z.string().optional(),
        website: z.string().optional(),
        isCollectionAgency: z.boolean().default(false),
        originalCreditor: z.string().optional(),
        accountNumber: z.string().optional(),
        contactPerson: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const [creditor] = await db.insert(creditors).values({
        ...input,
        userId: ctx.user.id,
      });
      return { id: Number(creditor.insertId) };
    }),

  update: authedQuery
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        zipCode: z.string().optional(),
        phone: z.string().optional(),
        fax: z.string().optional(),
        email: z.string().optional(),
        website: z.string().optional(),
        isCollectionAgency: z.boolean().optional(),
        originalCreditor: z.string().optional(),
        accountNumber: z.string().optional(),
        contactPerson: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db
        .update(creditors)
        .set(data)
        .where(and(eq(creditors.id, id), eq(creditors.userId, ctx.user.id)));
      return { success: true };
    }),

  delete: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      await db
        .delete(creditors)
        .where(
          and(eq(creditors.id, input.id), eq(creditors.userId, ctx.user.id))
        );
      return { success: true };
    }),
});

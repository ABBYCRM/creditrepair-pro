import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { creditScores } from "@db/schema";
import { eq, desc } from "drizzle-orm";

export const scoreRouter = createRouter({
  list: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db
      .select()
      .from(creditScores)
      .where(eq(creditScores.userId, ctx.user.id))
      .orderBy(desc(creditScores.dateRecorded));
  }),

  listByBureau: authedQuery
    .input(z.object({ bureau: z.enum(["equifax", "experian", "transunion"]) }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      return db
        .select()
        .from(creditScores)
        .where(
          eq(creditScores.bureau, input.bureau) &&
          eq(creditScores.userId, ctx.user.id)
        )
        .orderBy(desc(creditScores.dateRecorded));
    }),

  create: authedQuery
    .input(
      z.object({
        bureau: z.enum(["equifax", "experian", "transunion"]),
        score: z.number(),
        scoreModel: z.string().optional(),
        factors: z.string().optional(),
        dateRecorded: z.string(),
        reportId: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const [score] = await db.insert(creditScores).values({
        ...input,
        userId: ctx.user.id,
        dateRecorded: new Date(input.dateRecorded),
      });
      return { id: Number(score.insertId) };
    }),

  delete: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .delete(creditScores)
        .where(eq(creditScores.id, input.id));
      return { success: true };
    }),
});

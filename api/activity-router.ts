import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { activities } from "@db/schema";
import { eq, and, desc } from "drizzle-orm";

export const activityRouter = createRouter({
  list: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db
      .select()
      .from(activities)
      .where(eq(activities.userId, ctx.user.id))
      .orderBy(desc(activities.createdAt))
      .limit(50);
  }),

  listRecent: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db
      .select()
      .from(activities)
      .where(eq(activities.userId, ctx.user.id))
      .orderBy(desc(activities.createdAt))
      .limit(10);
  }),

  getUnread: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db
      .select()
      .from(activities)
      .where(
        and(eq(activities.userId, ctx.user.id), eq(activities.isRead, false))
      )
      .orderBy(desc(activities.createdAt));
  }),

  markAsRead: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      await db
        .update(activities)
        .set({ isRead: true })
        .where(
          and(eq(activities.id, input.id), eq(activities.userId, ctx.user.id))
        );
      return { success: true };
    }),

  markAllAsRead: authedQuery.mutation(async ({ ctx }) => {
    const db = getDb();
    await db
      .update(activities)
      .set({ isRead: true })
      .where(eq(activities.userId, ctx.user.id));
    return { success: true };
  }),

  create: authedQuery
    .input(
      z.object({
        type: z.enum([
          "dispute_created",
          "dispute_sent",
          "dispute_response",
          "dispute_deleted",
          "dispute_updated",
          "letter_generated",
          "letter_sent",
          "score_update",
          "report_imported",
          "account_added",
          "account_updated",
          "reminder",
          "note_added",
        ]),
        title: z.string(),
        description: z.string().optional(),
        relatedId: z.number().optional(),
        relatedType: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const [activity] = await db.insert(activities).values({
        ...input,
        userId: ctx.user.id,
      });
      return { id: Number(activity.insertId) };
    }),
});

import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { reminders } from "@db/schema";
import { eq, and, desc, gte, sql } from "drizzle-orm";

export const reminderRouter = createRouter({
  list: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db
      .select()
      .from(reminders)
      .where(eq(reminders.userId, ctx.user.id))
      .orderBy(desc(reminders.dueDate));
  }),

  listUpcoming: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db
      .select()
      .from(reminders)
      .where(
        and(
          eq(reminders.userId, ctx.user.id),
          eq(reminders.isCompleted, false),
          gte(reminders.dueDate, sql`CURDATE()`)
        )
      )
      .orderBy(reminders.dueDate)
      .limit(10);
  }),

  listOverdue: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db
      .select()
      .from(reminders)
      .where(
        and(
          eq(reminders.userId, ctx.user.id),
          eq(reminders.isCompleted, false),
          sql`${reminders.dueDate} <= CURDATE()`
        )
      )
      .orderBy(reminders.dueDate);
  }),

  getById: authedQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const [reminder] = await db
        .select()
        .from(reminders)
        .where(
          and(eq(reminders.id, input.id), eq(reminders.userId, ctx.user.id))
        );
      return reminder;
    }),

  create: authedQuery
    .input(
      z.object({
        title: z.string(),
        description: z.string().optional(),
        dueDate: z.string(),
        relatedId: z.number().optional(),
        relatedType: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const [reminder] = await db.insert(reminders).values({
        ...input,
        userId: ctx.user.id,
        dueDate: new Date(input.dueDate),
      });
      return { id: Number(reminder.insertId) };
    }),

  update: authedQuery
    .input(
      z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        dueDate: z.string().optional(),
        isCompleted: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const { id, ...data } = input;
      const updateData: Record<string, unknown> = { ...data };
      if (data.dueDate) updateData.dueDate = new Date(data.dueDate);

      await db
        .update(reminders)
        .set(updateData)
        .where(and(eq(reminders.id, id), eq(reminders.userId, ctx.user.id)));
      return { success: true };
    }),

  toggleComplete: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const [reminder] = await db
        .select()
        .from(reminders)
        .where(
          and(eq(reminders.id, input.id), eq(reminders.userId, ctx.user.id))
        );
      if (reminder) {
        await db
          .update(reminders)
          .set({ isCompleted: !reminder.isCompleted })
          .where(
            and(eq(reminders.id, input.id), eq(reminders.userId, ctx.user.id))
          );
      }
      return { success: true };
    }),

  delete: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      await db
        .delete(reminders)
        .where(
          and(eq(reminders.id, input.id), eq(reminders.userId, ctx.user.id))
        );
      return { success: true };
    }),
});

import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { disputes, creditAccounts, activities } from "@db/schema";
import { eq, and, desc, sql } from "drizzle-orm";

export const disputeRouter = createRouter({
  list: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db
      .select()
      .from(disputes)
      .where(eq(disputes.userId, ctx.user.id))
      .orderBy(desc(disputes.createdAt));
  }),

  listByAccount: authedQuery
    .input(z.object({ accountId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      return db
        .select()
        .from(disputes)
        .where(
          and(
            eq(disputes.accountId, input.accountId),
            eq(disputes.userId, ctx.user.id)
          )
        )
        .orderBy(desc(disputes.createdAt));
    }),

  getById: authedQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const [dispute] = await db
        .select()
        .from(disputes)
        .where(
          and(eq(disputes.id, input.id), eq(disputes.userId, ctx.user.id))
        );
      return dispute;
    }),

  create: authedQuery
    .input(
      z.object({
        accountId: z.number(),
        creditorId: z.number().optional(),
        bureau: z.enum(["equifax", "experian", "transunion"]),
        roundNumber: z.number().default(1),
        letterType: z.enum([
          "general",
          "section_609",
          "section_611",
          "section_623",
          "debt_validation",
          "goodwill",
          "pay_for_delete",
          "cease_desist",
        ]),
        disputeReason: z.string(),
        disputeMethod: z.enum(["mail", "online", "phone", "fax"]).default("mail"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();

      const [dispute] = await db.insert(disputes).values({
        ...input,
        userId: ctx.user.id,
        status: "draft",
      });

      await db
        .update(creditAccounts)
        .set({ isDisputed: true, disputeId: Number(dispute.insertId) })
        .where(
          and(
            eq(creditAccounts.id, input.accountId),
            eq(creditAccounts.userId, ctx.user.id)
          )
        );

      await db.insert(activities).values({
        userId: ctx.user.id,
        type: "dispute_created",
        title: "New Dispute Created",
        description: `Dispute created for account with ${input.bureau}`,
        relatedId: Number(dispute.insertId),
        relatedType: "dispute",
      });

      return { id: Number(dispute.insertId) };
    }),

  update: authedQuery
    .input(
      z.object({
        id: z.number(),
        status: z
          .enum([
            "draft",
            "sent",
            "under_investigation",
            "verified",
            "deleted",
            "updated",
            "reinserted",
            "no_response",
            "closed",
          ])
          .optional(),
        sentDate: z.string().optional(),
        responseDate: z.string().optional(),
        responseDueDate: z.string().optional(),
        responseSummary: z.string().optional(),
        methodOfVerification: z.string().optional(),
        nextAction: z.string().optional(),
        nextActionDate: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const { id, ...data } = input;
      const updateData: Record<string, unknown> = { ...data };

      if (data.sentDate) updateData.sentDate = new Date(data.sentDate);
      if (data.responseDate) updateData.responseDate = new Date(data.responseDate);
      if (data.responseDueDate)
        updateData.responseDueDate = new Date(data.responseDueDate);
      if (data.nextActionDate)
        updateData.nextActionDate = new Date(data.nextActionDate);

      await db
        .update(disputes)
        .set(updateData)
        .where(and(eq(disputes.id, id), eq(disputes.userId, ctx.user.id)));

      if (data.status === "deleted") {
        const [dispute] = await db
          .select()
          .from(disputes)
          .where(
            and(eq(disputes.id, id), eq(disputes.userId, ctx.user.id))
          );
        if (dispute) {
          await db
            .update(creditAccounts)
            .set({ isDeleted: true })
            .where(eq(creditAccounts.id, dispute.accountId));
        }

        await db.insert(activities).values({
          userId: ctx.user.id,
          type: "dispute_deleted",
          title: "Item Deleted!",
          description: "A disputed item has been removed from your credit report",
          relatedId: id,
          relatedType: "dispute",
        });
      }

      return { success: true };
    }),

  delete: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      await db
        .delete(disputes)
        .where(
          and(eq(disputes.id, input.id), eq(disputes.userId, ctx.user.id))
        );
      return { success: true };
    }),

  stats: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const allDisputes = await db
      .select()
      .from(disputes)
      .where(eq(disputes.userId, ctx.user.id));

    const statusCounts = {
      draft: 0,
      sent: 0,
      under_investigation: 0,
      verified: 0,
      deleted: 0,
      updated: 0,
      reinserted: 0,
      no_response: 0,
      closed: 0,
    };

    allDisputes.forEach((d) => {
      statusCounts[d.status] = (statusCounts[d.status] || 0) + 1;
    });

    return {
      total: allDisputes.length,
      active: allDisputes.filter(
        (d) => d.status === "sent" || d.status === "under_investigation"
      ).length,
      successful: statusCounts.deleted,
      byStatus: statusCounts,
    };
  }),

  pendingActions: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db
      .select()
      .from(disputes)
      .where(
        and(
          eq(disputes.userId, ctx.user.id),
          sql`${disputes.nextActionDate} <= CURDATE() + INTERVAL 7 DAY`,
          sql`${disputes.status} NOT IN ('deleted', 'closed')`
        )
      )
      .orderBy(disputes.nextActionDate);
  }),
});

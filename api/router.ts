import { authRouter } from "./auth-router";
import { createRouter, publicQuery } from "./middleware";
import { creditReportRouter } from "./credit-report-router";
import { creditAccountRouter } from "./credit-account-router";
import { disputeRouter } from "./dispute-router";
import { letterRouter } from "./letter-router";
import { creditorRouter } from "./creditor-router";
import { scoreRouter } from "./score-router";
import { activityRouter } from "./activity-router";
import { reminderRouter } from "./reminder-router";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  creditReport: creditReportRouter,
  creditAccount: creditAccountRouter,
  dispute: disputeRouter,
  letter: letterRouter,
  creditor: creditorRouter,
  score: scoreRouter,
  activity: activityRouter,
  reminder: reminderRouter,
});

export type AppRouter = typeof appRouter;

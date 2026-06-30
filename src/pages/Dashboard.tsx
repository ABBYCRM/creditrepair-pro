import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Activity,
  TrendingUp,
  Shield,
  FileText,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowRight,
  CreditCard,
  ChevronUp,
  ChevronDown,
  Minus,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: stats } = trpc.creditReport.stats.useQuery();
  const { data: disputeStats } = trpc.dispute.stats.useQuery();
  const { data: recentActivity } = trpc.activity.listRecent.useQuery();
  const { data: upcomingReminders } = trpc.reminder.listUpcoming.useQuery();
  const { data: scores } = trpc.score.list.useQuery();

  const latestScores = scores?.slice(0, 6) || [];
  const scoreChartData = latestScores
    .slice()
    .reverse()
    .map((s) => ({
      date: new Date(s.dateRecorded).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      score: s.score,
      bureau: s.bureau,
    }));

  const equifaxScores = scores?.filter((s) => s.bureau === "equifax") || [];
  const experianScores = scores?.filter((s) => s.bureau === "experian") || [];
  const transunionScores =
    scores?.filter((s) => s.bureau === "transunion") || [];

  const latestEquifax = equifaxScores[0]?.score || 0;
  const latestExperian = experianScores[0]?.score || 0;
  const latestTransunion = transunionScores[0]?.score || 0;

  const getScoreChange = (bureauScores: { score: number }[]) => {
    if (bureauScores.length < 2) return null;
    const change = bureauScores[0].score - bureauScores[1].score;
    return change;
  };

  const scoreColor = (score: number) => {
    if (score >= 750) return "text-emerald-600";
    if (score >= 670) return "text-amber-600";
    if (score >= 580) return "text-orange-600";
    return "text-red-600";
  };

  const scoreBg = (score: number) => {
    if (score >= 750) return "bg-emerald-50 dark:bg-emerald-900/20";
    if (score >= 670) return "bg-amber-50 dark:bg-amber-900/20";
    if (score >= 580) return "bg-orange-50 dark:bg-orange-900/20";
    return "bg-red-50 dark:bg-red-900/20";
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Welcome back, {user?.name || "User"}. Here's your credit repair
            progress.
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/reports">
            <Button variant="outline" size="sm" className="gap-2">
              <FileText className="w-4 h-4" />
              Add Report
            </Button>
          </Link>
          <Link to="/disputes">
            <Button size="sm" className="gap-2 bg-emerald-600 hover:bg-emerald-700">
              <Shield className="w-4 h-4" />
              New Dispute
            </Button>
          </Link>
        </div>
      </div>

      {/* Score Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { name: "Equifax", score: latestEquifax, change: getScoreChange(equifaxScores) },
          { name: "Experian", score: latestExperian, change: getScoreChange(experianScores) },
          { name: "TransUnion", score: latestTransunion, change: getScoreChange(transunionScores) },
        ].map((bureau) => (
          <Card key={bureau.name} className={`${scoreBg(bureau.score)} border-0`}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    {bureau.name}
                  </p>
                  <p
                    className={`text-3xl font-bold mt-1 ${scoreColor(
                      bureau.score
                    )}`}
                  >
                    {bureau.score || "—"}
                  </p>
                  {bureau.change !== null && (
                    <div className="flex items-center gap-1 mt-1">
                      {bureau.change > 0 ? (
                        <ChevronUp className="w-4 h-4 text-emerald-600" />
                      ) : bureau.change < 0 ? (
                        <ChevronDown className="w-4 h-4 text-red-600" />
                      ) : (
                        <Minus className="w-4 h-4 text-slate-400" />
                      )}
                      <span
                        className={`text-xs font-medium ${
                          bureau.change > 0
                            ? "text-emerald-600"
                            : bureau.change < 0
                            ? "text-red-600"
                            : "text-slate-500"
                        }`}
                      >
                        {bureau.change > 0 ? "+" : ""}
                        {bureau.change}
                      </span>
                    </div>
                  )}
                </div>
                <CreditCard className={`w-8 h-8 ${scoreColor(bureau.score)} opacity-50`} />
              </div>
              {bureau.score > 0 && (
                <div className="mt-3">
                  <Progress
                    value={bureau.score}
                    max={850}
                    className="h-2"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Score History Chart */}
      {scoreChartData.length > 1 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              Score History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={scoreChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis domain={[300, 850]} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#059669"
                    fill="#059669"
                    fillOpacity={0.1}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {stats?.totalReports || 0}
                </p>
                <p className="text-xs text-slate-500">Credit Reports</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
                <Shield className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {disputeStats?.active || 0}
                </p>
                <p className="text-xs text-slate-500">Active Disputes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {disputeStats?.successful || 0}
                </p>
                <p className="text-xs text-slate-500">Items Deleted</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {stats?.remainingNegative || 0}
                </p>
                <p className="text-xs text-slate-500">Negative Items</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity && recentActivity.length > 0 ? (
                recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50"
                  >
                    <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        {activity.title}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {activity.description}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        {new Date(activity.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No recent activity</p>
                  <p className="text-xs mt-1">
                    Start by adding a credit report
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Reminders */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              Upcoming Reminders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingReminders && upcomingReminders.length > 0 ? (
                upcomingReminders.map((reminder) => (
                  <div
                    key={reminder.id}
                    className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50"
                  >
                    <div className="w-2 h-2 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        {reminder.title}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {reminder.description}
                      </p>
                      <p className="text-xs text-amber-600 mt-1 font-medium">
                        Due: {new Date(reminder.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No upcoming reminders</p>
                  <p className="text-xs mt-1">
                    Dispute deadlines will appear here
                  </p>
                </div>
              )}
            </div>
            <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700">
              <Link to="/disputes">
                <Button variant="ghost" size="sm" className="w-full gap-2">
                  View All Disputes
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ShieldCheck,
  FileText,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ChevronUp,
  ChevronDown,
  Minus,
  Sparkles,
  Lock,
  ScanLine,
  Zap,
  TrendingUp,
  Clock,
  Shield,
  Activity,
} from "lucide-react";
import { toast } from "sonner";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

function ScoreGauge({ score, label }: { score: number; label: string }) {
  const grade = score >= 800 ? "Exceptional" : score >= 740 ? "Very Good" : score >= 670 ? "Good" : score >= 580 ? "Fair" : score >= 500 ? "Poor" : "Very Poor";

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-32">
        <svg viewBox="0 0 120 100" className="w-full h-full">
          <defs>
            <linearGradient id={`grad-${label}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="25%" stopColor="#f97316" />
              <stop offset="50%" stopColor="#eab308" />
              <stop offset="75%" stopColor="#22c55e" />
              <stop offset="100%" stopColor="#16a34a" />
            </linearGradient>
          </defs>
          <path d="M 20 90 A 40 40 0 1 1 100 90" fill="none" stroke="url(#grad)" strokeWidth="8" strokeLinecap="round" opacity="0.15" />
          <path d="M 20 90 A 40 40 0 1 1 100 90" fill="none" stroke={`url(#grad-${label})`} strokeWidth="8" strokeLinecap="round"
            strokeDasharray={`${((score - 300) / 550) * 251} 251`} />
          <text x="60" y="65" textAnchor="middle" className="text-[22px] font-bold" fill="white">{score}</text>
          <text x="60" y="78" textAnchor="middle" className="text-[7px]" fill="rgba(255,255,255,0.4)">{grade}</text>
        </svg>
      </div>
      <p className="text-xs font-medium text-white/50 mt-1 capitalize">{label}</p>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const { data: stats } = trpc.creditReport.stats.useQuery();
  const { data: disputeStats } = trpc.dispute.stats.useQuery();
  const { data: recentActivity } = trpc.activity.listRecent.useQuery();
  const { data: scores } = trpc.score.list.useQuery();

  const [showPullWizard, setShowPullWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(0);
  const [pullForm, setPullForm] = useState({
    fullName: user?.name || "",
    ssnLastFour: user?.ssnLastFour || "",
    dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split("T")[0] : "",
    address: user?.address || "",
    city: user?.city || "",
    state: user?.state || "",
    zipCode: user?.zipCode || "",
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [analysisResult, setAnalysisResult] = useState<Record<string, any> | null>(null);

  const analyzeMutation = trpc.analysis.analyzeProfile.useMutation({
    onSuccess: (data) => {
      setAnalysisResult(data);
      setWizardStep(3);
      utils.creditReport.stats.invalidate();
      utils.dispute.stats.invalidate();
      utils.score.list.invalidate();
      utils.creditAccount.getNegativeItems.invalidate();
      toast.success(`Credit analysis complete! Score: ${data.overallScore}`);
    },
    onError: (err: { message?: string }) => {
      toast.error(err.message || "Analysis failed");
    },
  });

  const latestScores = scores?.slice(0, 6) || [];
  const scoreChartData = latestScores.slice().reverse().map((s) => ({
    date: new Date(s.dateRecorded).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    score: s.score,
  }));

  const equifaxScores = scores?.filter((s) => s.bureau === "equifax") || [];
  const experianScores = scores?.filter((s) => s.bureau === "experian") || [];
  const transunionScores = scores?.filter((s) => s.bureau === "transunion") || [];

  const latestEq = equifaxScores[0]?.score || 0;
  const latestEx = experianScores[0]?.score || 0;
  const latestTu = transunionScores[0]?.score || 0;

  const getChange = (arr: { score: number }[]) => {
    if (arr.length < 2) return null;
    return arr[0].score - arr[1].score;
  };

  const severityColor = (s: string) => ({
    critical: "#ef4444",
    high: "#f97316",
    medium: "#eab308",
    low: "#22c55e",
  })[s] || "#6b7280";

  const issueTypeData: Array<{ name: string; value: number }> = analysisResult
    ? (Object.entries(
        (analysisResult.negativeItems as Array<{ issueType: string }>).reduce((acc, item) => {
          acc[item.issueType] = (acc[item.issueType] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      ) as Array<[string, number]>).map(([name, value]) => ({ name, value }))
    : [];

  const PIE_COLORS = ["#d4a843", "#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#8b5cf6"];

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#d4a843]" />
            <p className="text-[11px] uppercase tracking-[0.15em] text-[#d4a843]/70 font-medium">
              VantageScore 3.0 Engine
            </p>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white mt-1" style={{ fontFamily: "'Playfair Display', serif" }}>
            Dashboard
          </h1>
          <p className="text-sm text-white/40 mt-1">
            Welcome back, <span className="text-white/70">{user?.name || "User"}</span>. Here&apos;s your credit repair progress.
          </p>
        </div>
        <div className="flex gap-3">
          <Link to="/reports">
            <Button variant="outline" size="sm" className="gap-2 border-white/10 text-white/70 hover:bg-white/5 hover:text-white">
              <FileText className="w-4 h-4" />
              Reports
            </Button>
          </Link>
          <button onClick={() => setShowPullWizard(true)} className="btn-gold flex items-center gap-2 text-sm">
            <ScanLine className="w-4 h-4" />
            Analyze My Credit
          </button>
        </div>
      </div>

      {/* Credit Pull Wizard */}
      <Dialog open={showPullWizard} onOpenChange={(o) => { if (!o) { setShowPullWizard(false); setWizardStep(0); setAnalysisResult(null); } }}>
        <DialogContent className="max-w-lg border-white/10 bg-[#0f1117] text-white" style={{ boxShadow: "0 25px 50px rgba(0,0,0,0.5)" }}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl" style={{ fontFamily: "'Playfair Display', serif" }}>
              <ScanLine className="w-5 h-5 text-[#d4a843]" />
              {wizardStep === 0 && "Credit Analysis Setup"}
              {wizardStep === 1 && "Secure Data Entry"}
              {wizardStep === 2 && "Analyzing..."}
              {wizardStep === 3 && "Analysis Complete"}
            </DialogTitle>
          </DialogHeader>

          {/* Step 0: Intro */}
          {wizardStep === 0 && (
            <div className="space-y-4">
              <div className="glass-card p-4 text-center">
                <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-3"
                  style={{ background: "linear-gradient(135deg, rgba(212,168,67,0.2), rgba(240,201,106,0.1))", border: "1px solid rgba(212,168,67,0.25)" }}>
                  <ScanLine className="w-8 h-8 text-[#f0c96a]" />
                </div>
                <h3 className="text-lg font-semibold text-white">Automated Credit Analysis</h3>
                <p className="text-sm text-white/50 mt-2">
                  Our VantageScore engine will analyze your credit profile, identify all negative items,
                  and auto-generate disputes using the same scoring models as the 3 major credit bureaus.
                </p>
              </div>
              <div className="space-y-2">
                {[
                  { icon: Lock, text: "AES-256 encrypted — your data never leaves your device unencrypted" },
                  { icon: Shield, text: "Uses the same VantageScore 3.0 model as Equifax, Experian, TransUnion" },
                  { icon: Zap, text: "Automatically identifies disputes and generates letters" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.02]">
                    <item.icon className="w-4 h-4 text-[#d4a843] mt-0.5 shrink-0" />
                    <p className="text-xs text-white/60">{item.text}</p>
                  </div>
                ))}
              </div>
              <button onClick={() => setWizardStep(1)} className="btn-gold w-full flex items-center justify-center gap-2">
                Start Analysis <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Step 1: Data Entry */}
          {wizardStep === 1 && (
            <form onSubmit={(e) => { e.preventDefault(); setWizardStep(2); analyzeMutation.mutate({ name: pullForm.fullName, ssnLastFour: pullForm.ssnLastFour || undefined, dateOfBirth: pullForm.dateOfBirth || undefined, address: pullForm.address || undefined, city: pullForm.city || undefined, state: pullForm.state || undefined, zipCode: pullForm.zipCode || undefined }); }} className="space-y-3">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/15">
                <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <p className="text-[11px] text-emerald-400/80">All data encrypted with AES-256 before transmission</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-white/50">Full Name *</Label>
                  <Input value={pullForm.fullName} onChange={(e) => setPullForm({ ...pullForm, fullName: e.target.value })} required
                    className="bg-white/[0.04] border-white/10 text-white text-sm h-9" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-white/50">SSN Last 4</Label>
                  <Input value={pullForm.ssnLastFour} onChange={(e) => setPullForm({ ...pullForm, ssnLastFour: e.target.value.replace(/\D/g, "").slice(0, 4) })}
                    maxLength={4} className="bg-white/[0.04] border-white/10 text-white text-sm h-9" placeholder="XXXX" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-white/50">Date of Birth</Label>
                <Input type="date" value={pullForm.dateOfBirth} onChange={(e) => setPullForm({ ...pullForm, dateOfBirth: e.target.value })}
                  className="bg-white/[0.04] border-white/10 text-white text-sm h-9" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-white/50">Street Address</Label>
                <Input value={pullForm.address} onChange={(e) => setPullForm({ ...pullForm, address: e.target.value })}
                  className="bg-white/[0.04] border-white/10 text-white text-sm h-9" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-white/50">City</Label>
                  <Input value={pullForm.city} onChange={(e) => setPullForm({ ...pullForm, city: e.target.value })}
                    className="bg-white/[0.04] border-white/10 text-white text-sm h-9" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-white/50">State</Label>
                  <Input value={pullForm.state} onChange={(e) => setPullForm({ ...pullForm, state: e.target.value })}
                    className="bg-white/[0.04] border-white/10 text-white text-sm h-9" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-white/50">ZIP</Label>
                  <Input value={pullForm.zipCode} onChange={(e) => setPullForm({ ...pullForm, zipCode: e.target.value })}
                    className="bg-white/[0.04] border-white/10 text-white text-sm h-9" />
                </div>
              </div>
              <button type="submit" disabled={analyzeMutation.isPending} className="btn-gold w-full flex items-center justify-center gap-2 mt-2">
                {analyzeMutation.isPending ? (
                  <><ScanLine className="w-4 h-4 animate-spin" /> Analyzing Credit Profile...</>
                ) : (
                  <><ScanLine className="w-4 h-4" /> Run Credit Analysis</>
                )}
              </button>
            </form>
          )}

          {/* Step 2: Loading */}
          {wizardStep === 2 && (
            <div className="py-12 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center animate-pulse"
                style={{ background: "linear-gradient(135deg, rgba(212,168,67,0.3), rgba(240,201,106,0.15))", border: "1px solid rgba(212,168,67,0.4)" }}>
                <ScanLine className="w-8 h-8 text-[#f0c96a] animate-spin" />
              </div>
              <h3 className="text-lg font-semibold text-white">Analyzing Your Credit</h3>
              <div className="space-y-1.5 max-w-xs mx-auto">
                {["Connecting to VantageScore engine...", "Analyzing payment history...", "Identifying negative items...", "Calculating dispute recommendations..."].map((step, i) => (
                  <p key={i} className="text-xs text-white/40 animate-pulse" style={{ animationDelay: `${i * 0.3}s` }}>{step}</p>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Results */}
          {wizardStep === 3 && analysisResult && (
            <div className="space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-3"
                  style={{ border: `3px solid ${analysisResult.overallScore >= 670 ? "#22c55e" : analysisResult.overallScore >= 580 ? "#eab308" : "#ef4444"}` }}>
                  <span className="text-2xl font-bold text-white">{analysisResult.overallScore}</span>
                </div>
                <p className="text-lg font-semibold text-white">{analysisResult.grade}</p>
                <p className="text-xs text-white/40">Risk Level: <span className={analysisResult.riskLevel === "Low" ? "text-emerald-400" : "text-amber-400"}>{analysisResult.riskLevel}</span></p>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {Object.entries(analysisResult.bureauScores).map(([b, s]) => (
                  <div key={b} className="glass-card p-2 text-center">
                    <p className="text-xs text-white/40 capitalize">{b}</p>
                    <p className="text-lg font-bold" style={{ color: (s as number) >= 670 ? "#22c55e" : (s as number) >= 580 ? "#eab308" : "#ef4444" }}>{s as number}</p>
                  </div>
                ))}
              </div>

              <div className="glass-card p-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                    {analysisResult.negativeItems.length} Negative Items Found
                  </h4>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#d4a843]/15 text-[#d4a843]">{analysisResult.disputesCreated} auto-disputes</span>
                </div>
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {analysisResult.negativeItems.slice(0, 8).map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between p-2 rounded bg-white/[0.02]">
                      <div className="min-w-0">
                        <p className="text-xs text-white/80 truncate">{item.accountName}</p>
                        <p className="text-[10px] text-white/30">{item.issueType} | {item.bureau}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        <span className="text-[10px] font-medium" style={{ color: severityColor(item.severity) }}>{item.severity}</span>
                        <span className="text-[10px] text-white/40">-${item.balance?.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {analysisResult.estimatedScoreAfterRepair > analysisResult.overallScore && (
                <div className="glass-card p-3 text-center" style={{ borderColor: "rgba(34,197,94,0.3)" }}>
                  <p className="text-xs text-white/50">Estimated score after dispute resolution</p>
                  <p className="text-xl font-bold text-emerald-400">+{analysisResult.estimatedScoreAfterRepair - analysisResult.overallScore} points</p>
                  <p className="text-sm text-emerald-400/70">~{analysisResult.estimatedScoreAfterRepair} estimated score</p>
                </div>
              )}

              <div className="flex gap-2">
                <button onClick={() => { setShowPullWizard(false); setWizardStep(0); }} className="flex-1 py-2.5 rounded-lg text-sm text-white/50 hover:text-white hover:bg-white/5 transition-all border border-white/10">
                  Close
                </button>
                <Link to="/disputes" className="flex-1" onClick={() => setShowPullWizard(false)}>
                  <button className="btn-gold w-full text-sm">View Disputes</button>
                </Link>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Score Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { name: "Equifax", score: latestEq, change: getChange(equifaxScores) },
          { name: "Experian", score: latestEx, change: getChange(experianScores) },
          { name: "TransUnion", score: latestTu, change: getChange(transunionScores) },
        ].map((b) => (
          <div key={b.name} className="glass-card-hover p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-white/30">{b.name}</p>
                <p className={`text-3xl font-bold mt-1 ${b.score >= 750 ? "text-emerald-400" : b.score >= 670 ? "text-amber-400" : b.score >= 580 ? "text-orange-400" : "text-red-400"}`}>
                  {b.score || "--"}
                </p>
                {b.change !== null && (
                  <div className="flex items-center gap-1 mt-1">
                    {b.change > 0 ? <ChevronUp className="w-3.5 h-3.5 text-emerald-400" /> : b.change < 0 ? <ChevronDown className="w-3.5 h-3.5 text-red-400" /> : <Minus className="w-3.5 h-3.5 text-white/30" />}
                    <span className={`text-xs font-medium ${b.change > 0 ? "text-emerald-400" : b.change < 0 ? "text-red-400" : "text-white/40"}`}>
                      {b.change > 0 ? "+" : ""}{b.change}
                    </span>
                  </div>
                )}
              </div>
              <ScoreGauge score={b.score || 650} label={b.name} />
            </div>
          </div>
        ))}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Credit Reports", value: stats?.totalReports || 0, icon: FileText, accent: "#3b82f6" },
          { label: "Active Disputes", value: disputeStats?.active || 0, icon: ShieldCheck, accent: "#d4a843" },
          { label: "Items Deleted", value: disputeStats?.successful || 0, icon: CheckCircle2, accent: "#22c55e" },
          { label: "Negative Items", value: stats?.remainingNegative || 0, icon: AlertTriangle, accent: "#ef4444" },
        ].map((stat) => (
          <div key={stat.label} className="glass-card-hover p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${stat.accent}15` }}>
                <stat.icon className="w-5 h-5" style={{ color: stat.accent }} />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-[11px] text-white/40">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Score Chart + Issue Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 glass-card p-5">
          <h3 className="text-sm font-semibold text-white/70 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#d4a843]" />
            Score History
          </h3>
          {scoreChartData.length > 1 ? (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={scoreChartData}>
                  <defs>
                    <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#d4a843" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#d4a843" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "rgba(255,255,255,0.3)" }} axisLine={false} tickLine={false} />
                  <YAxis domain={[300, 850]} tick={{ fontSize: 11, fill: "rgba(255,255,255,0.3)" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "#0f1117", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff" }} />
                  <Area type="monotone" dataKey="score" stroke="#d4a843" strokeWidth={2} fill="url(#scoreGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-56 flex flex-col items-center justify-center text-white/30">
              <TrendingUp className="w-10 h-10 mb-2 opacity-30" />
              <p className="text-sm">Run a credit analysis to see your score history</p>
              <button onClick={() => setShowPullWizard(true)} className="btn-gold mt-3 text-xs">
                Analyze Now
              </button>
            </div>
          )}
        </div>

        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-white/70 mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#d4a843]" />
            Issue Breakdown
          </h3>
          {issueTypeData.length > 0 ? (
            <>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={issueTypeData} cx="50%" cy="50%" innerRadius={35} outerRadius={60} paddingAngle={3} dataKey="value">
                      {issueTypeData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: "#0f1117", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff", fontSize: "11px" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-1.5 mt-2">
                {issueTypeData.map((item, i) => (
                  <div key={item.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <span className="text-white/60">{item.name}</span>
                    </div>
                    <span className="text-white/40 font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-56 flex flex-col items-center justify-center text-white/30">
              <Activity className="w-10 h-10 mb-2 opacity-30" />
              <p className="text-sm text-center">Run analysis to see issue breakdown</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-white/70 mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#d4a843]" />
          Recent Activity
        </h3>
        <div className="space-y-2">
          {recentActivity && recentActivity.length > 0 ? (
            recentActivity.slice(0, 6).map((act) => (
              <div key={act.id} className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                <div className="w-1.5 h-1.5 rounded-full bg-[#d4a843] mt-2 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white/80">{act.title}</p>
                  <p className="text-xs text-white/35">{act.description}</p>
                </div>
                <span className="text-[10px] text-white/20 shrink-0">{new Date(act.createdAt).toLocaleDateString()}</span>
              </div>
            ))
          ) : (
            <p className="text-sm text-white/30 text-center py-6">No activity yet. Start by analyzing your credit.</p>
          )}
        </div>
      </div>
    </div>
  );
}

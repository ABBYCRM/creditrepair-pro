import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router";
import TiltCard from "@/components/TiltCard";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  FileText, CheckCircle2, ArrowRight,
  ScanLine, Lock, Shield, Zap, TrendingUp,
  Clock, Activity, AlertTriangle, ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";

const PIE_COLORS = ["#d4a843", "#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#8b5cf6"];

function ScoreCard3D({ score, label }: { score: number; label: string }) {
  const grade = score >= 800 ? "Exceptional" : score >= 740 ? "Very Good" : score >= 670 ? "Good" : score >= 580 ? "Fair" : score >= 500 ? "Poor" : "Very Poor";
  const color = score >= 750 ? "#22c55e" : score >= 670 ? "#eab308" : score >= 580 ? "#f97316" : "#ef4444";
  const pct = Math.max(0, Math.min(100, ((score - 300) / 550) * 100));

  return (
    <TiltCard tiltAmount={10} glowColor="rgba(212, 168, 67, 0.3)">
      <div className="glass-card-hover p-5 relative overflow-hidden">
        {/* Holographic border glow */}
        <div className="absolute inset-0 rounded-xl opacity-30" style={{
          background: `conic-gradient(from 180deg at 50% 50%, transparent 0%, ${color}40 25%, transparent 50%, ${color}30 75%, transparent 100%)`,
          mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          maskComposite: "exclude",
          WebkitMaskComposite: "xor",
          padding: "1px",
          mixBlendMode: "screen",
        }} />

        <div className="relative z-10">
          <p className="text-[10px] uppercase tracking-[0.15em] text-white/25 font-medium">{label}</p>

          {/* SVG Score Arc */}
          <div className="flex justify-center my-3">
            <svg width="140" height="80" viewBox="0 0 140 80">
              <defs>
                <linearGradient id={`arcGrad-${label}`} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#ef4444" />
                  <stop offset="30%" stopColor="#eab308" />
                  <stop offset="60%" stopColor="#22c55e" />
                  <stop offset="100%" stopColor="#16a34a" />
                </linearGradient>
              </defs>
              {/* Background arc */}
              <path d="M 15 70 A 55 55 0 0 1 125 70" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" strokeLinecap="round" />
              {/* Score arc */}
              <path d="M 15 70 A 55 55 0 0 1 125 70" fill="none" stroke={`url(#arcGrad-${label})`} strokeWidth="10" strokeLinecap="round"
                strokeDasharray={`${pct * 1.73} 200`} strokeDashoffset="0" />
              {/* Score number */}
              <text x="70" y="55" textAnchor="middle" fill="white" fontSize="22" fontWeight="bold">{score || "--"}</text>
              <text x="70" y="68" textAnchor="middle" fill={color} fontSize="7" fontWeight="600">{grade}</text>
            </svg>
          </div>
        </div>
      </div>
    </TiltCard>
  );
}

function StatCard3D({ label, value, icon: Icon, accent }: { label: string; value: string | number; icon: typeof FileText; accent: string }) {
  return (
    <TiltCard tiltAmount={8} glowColor={`${accent}20`}>
      <div className="glass-card-hover p-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: `${accent}15` }}>
            <Icon className="w-5 h-5" style={{ color: accent }} />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-[10px] text-white/30 uppercase tracking-wider">{label}</p>
          </div>
        </div>
      </div>
    </TiltCard>
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
  const [pullForm, setPullForm] = useState({ fullName: user?.name || "", ssnLastFour: user?.ssnLastFour || "", dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split("T")[0] : "", address: user?.address || "", city: user?.city || "", state: user?.state || "", zipCode: user?.zipCode || "" });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [analysisResult, setAnalysisResult] = useState<Record<string, any> | null>(null);

  const analyzeMutation = trpc.analysis.analyzeProfile.useMutation({
    onSuccess: (data) => { setAnalysisResult(data); setWizardStep(3); utils.creditReport.stats.invalidate(); utils.dispute.stats.invalidate(); utils.score.list.invalidate(); utils.creditAccount.getNegativeItems.invalidate(); toast.success(`Analysis complete! Score: ${data.overallScore}`); },
    onError: (err: { message?: string }) => { toast.error(err.message || "Analysis failed"); },
  });

  const eqScores = scores?.filter(s => s.bureau === "equifax") || [];
  const exScores = scores?.filter(s => s.bureau === "experian") || [];
  const tuScores = scores?.filter(s => s.bureau === "transunion") || [];
  const latestEq = eqScores[0]?.score || 0;
  const latestEx = exScores[0]?.score || 0;
  const latestTu = tuScores[0]?.score || 0;

  const scoreChartData = scores?.slice(0, 6).reverse().map(s => ({
    date: new Date(s.dateRecorded).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    score: s.score,
  })) || [];

  const issueTypeData: Array<{ name: string; value: number }> = analysisResult
    ? (Object.entries(
        (analysisResult.negativeItems as Array<{ issueType: string }>).reduce((acc, item) => {
          acc[item.issueType] = (acc[item.issueType] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      ) as Array<[string, number]>).map(([name, value]) => ({ name, value }))
    : [];

  const severityColor = (s: string) => ({ critical: "#ef4444", high: "#f97316", medium: "#eab308", low: "#22c55e" })[s] || "#6b7280";

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2"><ScanLine className="w-3.5 h-3.5 text-[#d4a843]" /><p className="text-[10px] uppercase tracking-[0.15em] text-[#d4a843]/70 font-medium">VantageScore 3.0 Engine</p></div>
          <h1 className="text-3xl font-bold text-white mt-1" style={{ fontFamily: "'Playfair Display', serif" }}>Dashboard</h1>
          <p className="text-sm text-white/40 mt-1">Welcome back, <span className="text-white/70">{user?.name || "User"}</span>. Here&apos;s your credit repair progress.</p>
        </div>
        <div className="flex gap-3">
          <Link to="/reports"><button className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm text-white/50 border border-white/8 hover:bg-white/[0.04] hover:text-white/80 transition-all"><FileText className="w-4 h-4" /> Reports</button></Link>
          <button onClick={() => setShowPullWizard(true)} className="btn-gold flex items-center gap-2 text-sm"><ScanLine className="w-4 h-4" /> Analyze My Credit</button>
        </div>
      </div>

      {/* Credit Pull Wizard */}
      <Dialog open={showPullWizard} onOpenChange={o => { if (!o) { setShowPullWizard(false); setWizardStep(0); setAnalysisResult(null); } }}>
        <DialogContent className="max-w-lg border-white/10 bg-[#0f1117] text-white" style={{ boxShadow: "0 25px 50px rgba(0,0,0,0.5)" }}>
          <DialogHeader><DialogTitle className="text-xl flex items-center gap-2" style={{ fontFamily: "'Playfair Display', serif" }}><ScanLine className="w-5 h-5 text-[#d4a843]" />{wizardStep === 0 ? "Credit Analysis" : wizardStep === 1 ? "Secure Entry" : wizardStep === 2 ? "Analyzing..." : "Results"}</DialogTitle></DialogHeader>
          {wizardStep === 0 && (
            <div className="space-y-4">
              <div className="glass-card p-4 text-center">
                <div className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-2" style={{ background: "linear-gradient(135deg, rgba(212,168,67,0.2), rgba(240,201,106,0.1))", border: "1px solid rgba(212,168,67,0.25)" }}><ScanLine className="w-7 h-7 text-[#f0c96a]" /></div>
                <h3 className="text-base font-semibold text-white">Automated Credit Analysis</h3>
                <p className="text-xs text-white/40 mt-1">VantageScore engine analyzes your profile, identifies issues, auto-generates disputes.</p>
              </div>
              {[{ icon: Lock, text: "AES-256 encrypted" }, { icon: Shield, text: "Same scoring as Equifax, Experian, TransUnion" }, { icon: Zap, text: "Auto-identifies disputes and generates letters" }].map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.02]"><item.icon className="w-4 h-4 text-[#d4a843] mt-0.5 shrink-0" /><p className="text-xs text-white/50">{item.text}</p></div>
              ))}
              <button onClick={() => setWizardStep(1)} className="btn-gold w-full flex items-center justify-center gap-2 text-sm">Start Analysis <ArrowRight className="w-4 h-4" /></button>
            </div>
          )}
          {wizardStep === 1 && (
            <form onSubmit={e => { e.preventDefault(); setWizardStep(2); analyzeMutation.mutate({ name: pullForm.fullName, ssnLastFour: pullForm.ssnLastFour || undefined, dateOfBirth: pullForm.dateOfBirth || undefined, address: pullForm.address || undefined, city: pullForm.city || undefined, state: pullForm.state || undefined, zipCode: pullForm.zipCode || undefined }); }} className="space-y-3">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/15"><Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" /><p className="text-[10px] text-emerald-400/80">AES-256 encrypted transmission</p></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label className="text-xs text-white/40">Full Name *</Label><input value={pullForm.fullName} onChange={e => setPullForm({ ...pullForm, fullName: e.target.value })} required className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-white text-sm" /></div>
                <div className="space-y-1.5"><Label className="text-xs text-white/40">SSN Last 4</Label><input value={pullForm.ssnLastFour} onChange={e => setPullForm({ ...pullForm, ssnLastFour: e.target.value.replace(/\D/g, "").slice(0, 4) })} maxLength={4} className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-white text-sm" placeholder="XXXX" /></div>
              </div>
              <div className="space-y-1.5"><Label className="text-xs text-white/40">Date of Birth</Label><input type="date" value={pullForm.dateOfBirth} onChange={e => setPullForm({ ...pullForm, dateOfBirth: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-white text-sm" /></div>
              <div className="space-y-1.5"><Label className="text-xs text-white/40">Address</Label><input value={pullForm.address} onChange={e => setPullForm({ ...pullForm, address: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-white text-sm" /></div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5"><Label className="text-xs text-white/40">City</Label><input value={pullForm.city} onChange={e => setPullForm({ ...pullForm, city: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-white text-sm" /></div>
                <div className="space-y-1.5"><Label className="text-xs text-white/40">State</Label><input value={pullForm.state} onChange={e => setPullForm({ ...pullForm, state: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-white text-sm" /></div>
                <div className="space-y-1.5"><Label className="text-xs text-white/40">ZIP</Label><input value={pullForm.zipCode} onChange={e => setPullForm({ ...pullForm, zipCode: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-white text-sm" /></div>
              </div>
              <button type="submit" disabled={analyzeMutation.isPending} className="btn-gold w-full flex items-center justify-center gap-2 text-sm disabled:opacity-50">{analyzeMutation.isPending ? <><ScanLine className="w-4 h-4 animate-spin" /> Analyzing...</> : <><ScanLine className="w-4 h-4" /> Run Analysis</>}</button>
            </form>
          )}
          {wizardStep === 2 && (
            <div className="py-12 text-center space-y-4">
              <div className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center animate-pulse" style={{ background: "linear-gradient(135deg, rgba(212,168,67,0.3), rgba(240,201,106,0.15))", border: "1px solid rgba(212,168,67,0.4)" }}><ScanLine className="w-7 h-7 text-[#f0c96a] animate-spin" /></div>
              <h3 className="text-base font-semibold text-white">Analyzing Your Credit</h3>
              {["Connecting to VantageScore engine...", "Analyzing payment history...", "Identifying negative items...", "Calculating recommendations..."].map((s, i) => (<p key={i} className="text-xs text-white/30 animate-pulse" style={{ animationDelay: `${i * 0.3}s` }}>{s}</p>))}
            </div>
          )}
          {wizardStep === 3 && analysisResult && (
            <div className="space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-2" style={{ border: `3px solid ${analysisResult.overallScore >= 670 ? "#22c55e" : "#eab308"}` }}>
                  <span className="text-2xl font-bold text-white">{analysisResult.overallScore}</span>
                </div>
                <p className="text-base font-semibold text-white">{analysisResult.grade}</p>
                <p className="text-xs text-white/30">Risk: <span className={analysisResult.riskLevel === "Low" ? "text-emerald-400" : "text-amber-400"}>{analysisResult.riskLevel}</span></p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(analysisResult.bureauScores).map(([b, s]) => (
                  <div key={b} className="glass-card p-2 text-center"><p className="text-[10px] text-white/30 capitalize">{b}</p><p className="text-lg font-bold" style={{ color: (s as number) >= 670 ? "#22c55e" : (s as number) >= 580 ? "#eab308" : "#ef4444" }}>{s as number}</p></div>
                ))}
              </div>
              <div className="glass-card p-3">
                <div className="flex items-center justify-between mb-2"><h4 className="text-xs font-semibold text-white flex items-center gap-2"><AlertTriangle className="w-3 h-3 text-red-400" />{analysisResult.negativeItems.length} Issues Found</h4><span className="text-[10px] px-2 py-0.5 rounded-full bg-[#d4a843]/15 text-[#d4a843]">{analysisResult.disputesCreated} auto-disputes</span></div>
                <div className="space-y-1 max-h-36 overflow-y-auto">
                  {(analysisResult.negativeItems as Array<{id: string; accountName: string; issueType: string; bureau: string; severity: string; balance?: number}>).slice(0, 8).map(item => (
                    <div key={item.id} className="flex items-center justify-between p-2 rounded bg-white/[0.02]">
                      <div className="min-w-0"><p className="text-xs text-white/70 truncate">{item.accountName}</p><p className="text-[9px] text-white/25">{item.issueType} | {item.bureau}</p></div>
                      <div className="flex items-center gap-2 shrink-0 ml-2"><span className="text-[9px] font-medium" style={{ color: severityColor(item.severity) }}>{item.severity}</span></div>
                    </div>
                  ))}
                </div>
              </div>
              {analysisResult.estimatedScoreAfterRepair > analysisResult.overallScore && (
                <div className="glass-card p-3 text-center" style={{ borderColor: "rgba(34,197,94,0.3)" }}><p className="text-xs text-white/40">Estimated improvement</p><p className="text-xl font-bold text-emerald-400">+{analysisResult.estimatedScoreAfterRepair - analysisResult.overallScore} pts</p></div>
              )}
              <div className="flex gap-2">
                <button onClick={() => { setShowPullWizard(false); setWizardStep(0); }} className="flex-1 py-2.5 rounded-lg text-xs text-white/40 border border-white/10 hover:bg-white/5 transition-all">Close</button>
                <Link to="/disputes" className="flex-1" onClick={() => setShowPullWizard(false)}><button className="btn-gold w-full text-xs">View Disputes</button></Link>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 3D Score Gauge Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <ScoreCard3D score={latestEq} label="Equifax" />
        <ScoreCard3D score={latestEx} label="Experian" />
        <ScoreCard3D score={latestTu} label="TransUnion" />
      </div>

      {/* 3D Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard3D label="Credit Reports" value={stats?.totalReports || 0} icon={FileText} accent="#3b82f6" />
        <StatCard3D label="Active Disputes" value={disputeStats?.active || 0} icon={ShieldCheck} accent="#d4a843" />
        <StatCard3D label="Items Deleted" value={disputeStats?.successful || 0} icon={CheckCircle2} accent="#22c55e" />
        <StatCard3D label="Negative Items" value={stats?.remainingNegative || 0} icon={AlertTriangle} accent="#ef4444" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <TiltCard className="lg:col-span-2" tiltAmount={6} glowColor="rgba(212,168,67,0.15)">
          <div className="glass-card p-5">
            <h3 className="text-xs font-semibold text-white/50 mb-4 flex items-center gap-2 uppercase tracking-wider"><TrendingUp className="w-3.5 h-3.5 text-[#d4a843]" />Score History</h3>
            {scoreChartData.length > 1 ? (
              <div className="h-52"><ResponsiveContainer width="100%" height="100%">
                <AreaChart data={scoreChartData}>
                  <defs><linearGradient id="sg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#d4a843" stopOpacity={0.3} /><stop offset="95%" stopColor="#d4a843" stopOpacity={0} /></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "rgba(255,255,255,0.25)" }} axisLine={false} tickLine={false} />
                  <YAxis domain={[300, 850]} tick={{ fontSize: 10, fill: "rgba(255,255,255,0.25)" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "#0f1117", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff", fontSize: "11px" }} />
                  <Area type="monotone" dataKey="score" stroke="#d4a843" strokeWidth={2} fill="url(#sg)" />
                </AreaChart>
              </ResponsiveContainer></div>
            ) : (
              <div className="h-52 flex flex-col items-center justify-center text-white/25 gap-2"><TrendingUp className="w-8 h-8 opacity-30" /><p className="text-xs">Run a credit analysis to see score history</p><button onClick={() => setShowPullWizard(true)} className="btn-gold text-[10px] mt-1">Analyze Now</button></div>
            )}
          </div>
        </TiltCard>

        <TiltCard tiltAmount={6} glowColor="rgba(212,168,67,0.15)">
          <div className="glass-card p-5">
            <h3 className="text-xs font-semibold text-white/50 mb-4 flex items-center gap-2 uppercase tracking-wider"><Activity className="w-3.5 h-3.5 text-[#d4a843]" />Issue Breakdown</h3>
            {issueTypeData.length > 0 ? (<>
              <div className="h-36"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={issueTypeData} cx="50%" cy="50%" innerRadius={28} outerRadius={50} paddingAngle={3} dataKey="value">{issueTypeData.map((_, i) => (<Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />))}</Pie><Tooltip contentStyle={{ background: "#0f1117", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff", fontSize: "11px" }} /></PieChart></ResponsiveContainer></div>
              <div className="space-y-1 mt-2">{issueTypeData.map((item, i) => (<div key={item.name} className="flex items-center justify-between text-[10px]"><div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} /><span className="text-white/40">{item.name}</span></div><span className="text-white/30 font-medium">{item.value}</span></div>))}</div>
            </>) : (<div className="h-52 flex flex-col items-center justify-center text-white/25 gap-2"><Activity className="w-8 h-8 opacity-30" /><p className="text-xs">Run analysis for breakdown</p></div>)}
          </div>
        </TiltCard>
      </div>

      {/* Activity */}
      <TiltCard tiltAmount={4} glowColor="rgba(255,255,255,0.05)">
        <div className="glass-card p-5">
          <h3 className="text-xs font-semibold text-white/50 mb-4 flex items-center gap-2 uppercase tracking-wider"><Clock className="w-3.5 h-3.5 text-[#d4a843]" />Recent Activity</h3>
          <div className="space-y-1.5">
            {recentActivity && recentActivity.length > 0 ? recentActivity.slice(0, 6).map(act => (
              <div key={act.id} className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                <div className="w-1.5 h-1.5 rounded-full bg-[#d4a843] mt-2 shrink-0" />
                <div className="flex-1 min-w-0"><p className="text-xs text-white/70">{act.title}</p><p className="text-[10px] text-white/25">{act.description}</p></div>
                <span className="text-[9px] text-white/15 shrink-0">{new Date(act.createdAt).toLocaleDateString()}</span>
              </div>
            )) : <p className="text-xs text-white/20 text-center py-6">No activity yet. Start by analyzing your credit.</p>}
          </div>
        </div>
      </TiltCard>
    </div>
  );
}

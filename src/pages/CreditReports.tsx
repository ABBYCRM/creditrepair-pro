import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { Link } from "react-router";
import TiltCard from "@/components/TiltCard";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, Plus, Trash2, ChevronDown, ChevronUp, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function CreditReports() {
  const utils = trpc.useUtils();
  const { data: reports, isLoading } = trpc.creditReport.list.useQuery();
  const [selected, setSelected] = useState<number | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ reportDate: new Date().toISOString().split("T")[0], bureau: "equifax" as "equifax" | "experian" | "transunion", score: "", totalAccounts: "", negativeAccounts: "", inquiries: "", totalBalance: "" });

  const { data: withAccounts } = trpc.creditReport.getWithAccounts.useQuery({ id: selected! }, { enabled: !!selected });

  const create = trpc.creditReport.create.useMutation({ onSuccess: () => { utils.creditReport.list.invalidate(); utils.creditReport.stats.invalidate(); setShowAdd(false); toast.success("Report added"); setForm({ reportDate: new Date().toISOString().split("T")[0], bureau: "equifax", score: "", totalAccounts: "", negativeAccounts: "", inquiries: "", totalBalance: "" }); } });
  const del = trpc.creditReport.delete.useMutation({ onSuccess: () => { utils.creditReport.list.invalidate(); utils.creditReport.stats.invalidate(); toast.success("Deleted"); } });

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); create.mutate({ reportDate: form.reportDate, bureau: form.bureau, score: form.score ? parseInt(form.score) : undefined, totalAccounts: form.totalAccounts ? parseInt(form.totalAccounts) : undefined, negativeAccounts: form.negativeAccounts ? parseInt(form.negativeAccounts) : undefined, inquiries: form.inquiries ? parseInt(form.inquiries) : undefined, totalBalance: form.totalBalance || undefined }); };

  const bureauColor = (b: string) => ({ equifax: "text-red-400 bg-red-400/10 border-red-400/20", experian: "text-blue-400 bg-blue-400/10 border-blue-400/20", transunion: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" })[b] || "";

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2"><FileText className="w-3.5 h-3.5 text-[#d4a843]" /><p className="text-[10px] uppercase tracking-[0.15em] text-[#d4a843]/60">Bureau Reports</p></div>
          <h1 className="text-3xl font-bold text-white mt-1" style={{ fontFamily: "'Playfair Display', serif" }}>Credit Reports</h1>
          <p className="text-sm text-white/40 mt-1">Manage credit reports and imported accounts</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-gold flex items-center gap-2 text-sm"><Plus className="w-4 h-4" /> Add Report</button>
      </div>

      {showAdd && (
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-white/70 mb-4">Add New Credit Report</h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="space-y-1.5"><Label className="text-xs text-white/40">Date</Label><input type="date" value={form.reportDate} onChange={e => setForm({ ...form, reportDate: e.target.value })} required className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-white text-sm" /></div>
              <div className="space-y-1.5"><Label className="text-xs text-white/40">Bureau</Label>
                <Select value={form.bureau} onValueChange={v => setForm({ ...form, bureau: v as typeof form.bureau })}><SelectTrigger className="bg-white/[0.04] border-white/10 text-white h-9"><SelectValue /></SelectTrigger><SelectContent className="bg-[#0f1117] border-white/10"><SelectItem value="equifax">Equifax</SelectItem><SelectItem value="experian">Experian</SelectItem><SelectItem value="transunion">TransUnion</SelectItem></SelectContent></Select></div>
              <div className="space-y-1.5"><Label className="text-xs text-white/40">Score</Label><input type="number" placeholder="720" value={form.score} onChange={e => setForm({ ...form, score: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-white text-sm" /></div>
              <div className="space-y-1.5"><Label className="text-xs text-white/40">Inquiries</Label><input type="number" placeholder="0" value={form.inquiries} onChange={e => setForm({ ...form, inquiries: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-white text-sm" /></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5"><Label className="text-xs text-white/40">Total Accounts</Label><input type="number" placeholder="0" value={form.totalAccounts} onChange={e => setForm({ ...form, totalAccounts: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-white text-sm" /></div>
              <div className="space-y-1.5"><Label className="text-xs text-white/40">Negative</Label><input type="number" placeholder="0" value={form.negativeAccounts} onChange={e => setForm({ ...form, negativeAccounts: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-white text-sm" /></div>
              <div className="space-y-1.5"><Label className="text-xs text-white/40">Total Balance</Label><input type="text" placeholder="$0.00" value={form.totalBalance} onChange={e => setForm({ ...form, totalBalance: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-white text-sm" /></div>
            </div>
            <div className="flex gap-2"><button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 rounded-lg text-xs text-white/40 border border-white/10 hover:bg-white/5 transition-colors">Cancel</button><button type="submit" disabled={create.isPending} className="btn-gold text-xs disabled:opacity-50">{create.isPending ? "Adding..." : "Add Report"}</button></div>
          </form>
        </div>
      )}

      {isLoading ? <div className="text-center py-12 text-white/30">Loading...</div> : reports && reports.length > 0 ? (
        <div className="space-y-3">
          {reports.map(r => (
            <TiltCard key={r.id} tiltAmount={5} glowColor="rgba(255,255,255,0.04)">
              <div className="glass-card overflow-hidden">
                <div onClick={() => setSelected(selected === r.id ? null : r.id)} className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center"><FileText className="w-5 h-5 text-white/40" /></div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${bureauColor(r.bureau)}`}>{r.bureau.charAt(0).toUpperCase() + r.bureau.slice(1)}</span>
                        <span className="text-[10px] text-white/20">{new Date(r.reportDate).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm text-white/70 mt-1">Score: {r.score || "N/A"} | {r.totalAccounts || 0} accounts | {r.negativeAccounts || 0} negative | {r.inquiries || 0} inquiries</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={e => { e.stopPropagation(); del.mutate({ id: r.id }); }} className="p-2 rounded hover:bg-red-500/5 text-red-400/40 hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    {selected === r.id ? <ChevronUp className="w-4 h-4 text-white/20" /> : <ChevronDown className="w-4 h-4 text-white/20" />}
                  </div>
                </div>
                {selected === r.id && (
                  <div className="border-t border-white/[0.04] p-4">
                    <div className="flex items-center justify-between mb-3"><h3 className="text-sm font-semibold text-white/70">Accounts</h3><Link to="/disputes"><button className="px-3 py-1.5 rounded-lg text-[10px] text-[#d4a843] border border-[#d4a843]/25 hover:bg-[#d4a843]/5 transition-colors flex items-center gap-1"><Plus className="w-3 h-3" /> Add & Dispute</button></Link></div>
                    {withAccounts?.accounts && withAccounts.accounts.length > 0 ? (
                      <div className="overflow-x-auto"><Table><TableHeader><TableRow className="border-white/[0.04] hover:bg-transparent"><TableHead className="text-white/25 text-[10px]">Account</TableHead><TableHead className="text-white/25 text-[10px]">Type</TableHead><TableHead className="text-white/25 text-[10px]">Balance</TableHead><TableHead className="text-white/25 text-[10px]">Status</TableHead><TableHead className="text-white/25 text-[10px]">Negative</TableHead></TableRow></TableHeader>
                        <TableBody>{withAccounts.accounts.map(a => (<TableRow key={a.id} className="border-white/[0.03] hover:bg-white/[0.02]"><TableCell className="text-sm text-white/80">{a.accountName}{a.accountNumber && <span className="text-[9px] text-white/20 block">...{a.accountNumber.slice(-4)}</span>}</TableCell><TableCell className="text-xs text-white/40 capitalize">{a.accountType.replace("_", " ")}</TableCell><TableCell className="text-xs text-white/40">{a.balance ? `$${Number(a.balance).toLocaleString()}` : "—"}</TableCell><TableCell><span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.04] text-white/30">{a.status}</span></TableCell><TableCell>{a.isNegative ? <span className="flex items-center gap-1 text-red-400 text-[10px]"><CheckCircle2 className="w-3 h-3" />{a.negativeReason}</span> : <CheckCircle2 className="w-4 h-4 text-emerald-500/30" />}</TableCell></TableRow>))}</TableBody>
                      </Table></div>
                    ) : <p className="text-center py-6 text-sm text-white/25">No accounts yet.</p>}
                  </div>
                )}
              </div>
            </TiltCard>
          ))}
        </div>
      ) : (
        <TiltCard tiltAmount={4} glowColor="rgba(255,255,255,0.03)">
          <div className="glass-card p-10 text-center">
            <FileText className="w-10 h-10 text-white/15 mx-auto mb-3" />
            <p className="text-white/40 text-sm">No credit reports yet. Run a credit analysis or add your first report.</p>
          </div>
        </TiltCard>
      )}
    </div>
  );
}

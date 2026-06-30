import { useState } from "react";
import { trpc } from "@/providers/trpc";
import TiltCard from "@/components/TiltCard";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Plus, Trash2, FileText, CheckCircle2, Clock, XCircle, Send, Zap } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router";

const statusCfg: Record<string, { label: string; bg: string; text: string; icon: typeof Clock }> = {
  draft: { label: "Draft", bg: "bg-white/[0.04]", text: "text-white/50", icon: FileText },
  sent: { label: "Sent", bg: "bg-blue-500/10", text: "text-blue-400", icon: Send },
  under_investigation: { label: "Under Review", bg: "bg-[#d4a843]/10", text: "text-[#d4a843]", icon: Clock },
  verified: { label: "Verified", bg: "bg-orange-500/10", text: "text-orange-400", icon: CheckCircle2 },
  deleted: { label: "Deleted!", bg: "bg-emerald-500/10", text: "text-emerald-400", icon: CheckCircle2 },
  updated: { label: "Updated", bg: "bg-blue-500/10", text: "text-blue-400", icon: CheckCircle2 },
  reinserted: { label: "Reinserted", bg: "bg-red-500/10", text: "text-red-400", icon: XCircle },
  no_response: { label: "No Response", bg: "bg-purple-500/10", text: "text-purple-400", icon: Clock },
  closed: { label: "Closed", bg: "bg-white/[0.04]", text: "text-white/40", icon: XCircle },
};

export default function DisputeCenter() {
  const utils = trpc.useUtils();
  const { data: disputes, isLoading } = trpc.dispute.list.useQuery();
  const { data: negativeItems } = trpc.creditAccount.getNegativeItems.useQuery();
  const { data: disputeStats } = trpc.dispute.stats.useQuery();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ accountId: "", bureau: "equifax" as "equifax" | "experian" | "transunion", letterType: "general", disputeReason: "" });

  const createD = trpc.dispute.create.useMutation({
    onSuccess: () => { utils.dispute.list.invalidate(); utils.dispute.stats.invalidate(); utils.creditAccount.getNegativeItems.invalidate(); setShowAdd(false); toast.success("Dispute created!"); setForm({ accountId: "", bureau: "equifax", letterType: "general", disputeReason: "" }); },
  });
  const updateD = trpc.dispute.update.useMutation({ onSuccess: () => { utils.dispute.list.invalidate(); utils.dispute.stats.invalidate(); toast.success("Updated"); } });
  const deleteD = trpc.dispute.delete.useMutation({ onSuccess: () => { utils.dispute.list.invalidate(); utils.dispute.stats.invalidate(); } });

  const handleCreate = (e: React.FormEvent) => { e.preventDefault(); if (!form.accountId) { toast.error("Select an account"); return; } createD.mutate({ accountId: parseInt(form.accountId), bureau: form.bureau, letterType: form.letterType as never, disputeReason: form.disputeReason }); };

  const descs: Record<string, string> = { general: "Basic dispute requesting investigation", section_609: "Request verification of information source (FCRA 609)", section_611: "Follow-up asking for method of verification (FCRA 611)", section_623: "Direct dispute to data furnisher (FCRA 623)", debt_validation: "Request debt validation from collector (FDCPA 809)", goodwill: "Request goodwill removal of late payment", pay_for_delete: "Offer payment in exchange for deletion", cease_desist: "Demand collector stop contacting you (FDCPA)" };
  const reasons = ["I do not recognize this account - may be fraudulent or identity theft", "This account does not belong to me - mixed file with another consumer", "The balance reported is incorrect - I have proof of different amount", "Payment history is inaccurate - I was never late on this account", "This collection account lacks proper validation and documentation", "The date of first delinquency is incorrect", "This account is past the statute of limitations", "Account was included in bankruptcy but still showing as active", "I have documentation showing this account was paid in full", "Duplicate entry - same debt reported multiple times", "Credit limit reported incorrectly affecting utilization ratio", "Hard inquiry was unauthorized - I did not apply for this credit", "Account status shows closed but I never closed it", "Previous dispute was resolved but item was reinserted without notice"];

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2"><Zap className="w-3.5 h-3.5 text-[#d4a843]" /><p className="text-[10px] uppercase tracking-[0.15em] text-[#d4a843]/60">FCRA / FDCPA Compliant</p></div>
          <h1 className="text-3xl font-bold text-white mt-1" style={{ fontFamily: "'Playfair Display', serif" }}>Dispute Center</h1>
          <p className="text-sm text-white/40 mt-1">Create and manage credit disputes to repair your credit</p>
        </div>
        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <DialogTrigger asChild><button className="btn-gold flex items-center gap-2 text-sm"><Plus className="w-4 h-4" /> New Dispute</button></DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border-white/10 bg-[#0f1117] text-white" style={{ boxShadow: "0 25px 50px rgba(0,0,0,0.5)" }}>
            <DialogHeader><DialogTitle className="text-xl flex items-center gap-2" style={{ fontFamily: "'Playfair Display', serif" }}><ShieldCheck className="w-5 h-5 text-[#d4a843]" /> Create New Dispute</DialogTitle></DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2"><Label className="text-xs text-white/50">1. Select Negative Account *</Label>
                {negativeItems && negativeItems.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto rounded-lg border border-white/[0.06] p-2">
                    {negativeItems.map(item => (
                      <div key={item.id} onClick={() => setForm({ ...form, accountId: String(item.id) })} className={`p-3 rounded-lg border cursor-pointer transition-all ${form.accountId === String(item.id) ? "border-[#d4a843]/40 bg-[#d4a843]/5" : "border-white/[0.04] hover:bg-white/[0.02]"}`}>
                        <div className="flex items-center justify-between"><div><p className="text-sm font-medium text-white/90">{item.accountName}</p><p className="text-[10px] text-white/30">{item.accountType.replace("_", " ")} | Balance: {item.balance ? `$${Number(item.balance).toLocaleString()}` : "N/A"}</p></div>{form.accountId === String(item.id) && <CheckCircle2 className="w-5 h-5 text-[#d4a843]" />}</div>
                      </div>
                    ))}
                  </div>
                ) : <div className="text-center py-4 rounded-lg border border-white/[0.04] bg-white/[0.02]"><p className="text-xs text-white/30">No negative accounts found. Run a credit analysis first.</p></div>}
              </div>
              <div className="space-y-2"><Label className="text-xs text-white/50">2. Credit Bureau *</Label><Select value={form.bureau} onValueChange={v => setForm({ ...form, bureau: v as typeof form.bureau })}><SelectTrigger className="bg-white/[0.04] border-white/10 text-white"><SelectValue /></SelectTrigger><SelectContent className="bg-[#0f1117] border-white/10"><SelectItem value="equifax">Equifax</SelectItem><SelectItem value="experian">Experian</SelectItem><SelectItem value="transunion">TransUnion</SelectItem></SelectContent></Select></div>
              <div className="space-y-2"><Label className="text-xs text-white/50">3. Letter Type *</Label><Select value={form.letterType} onValueChange={v => setForm({ ...form, letterType: v })}><SelectTrigger className="bg-white/[0.04] border-white/10 text-white"><SelectValue /></SelectTrigger><SelectContent className="bg-[#0f1117] border-white/10">{Object.entries(descs).map(([k]) => (<SelectItem key={k} value={k}>{k.replace("_", " ").toUpperCase()}</SelectItem>))}</SelectContent></Select>{form.letterType && <p className="text-[10px] text-[#d4a843]/60">{descs[form.letterType]}</p>}</div>
              <div className="space-y-2"><Label className="text-xs text-white/50">4. Dispute Reason *</Label><Select value={form.disputeReason} onValueChange={v => setForm({ ...form, disputeReason: v })}><SelectTrigger className="bg-white/[0.04] border-white/10 text-white"><SelectValue placeholder="Select..." /></SelectTrigger><SelectContent className="bg-[#0f1117] border-white/10 max-h-64">{reasons.map((r, i) => (<SelectItem key={i} value={r}>{r.length > 60 ? r.substring(0, 60) + "..." : r}</SelectItem>))}</SelectContent></Select><Textarea placeholder="Or enter custom reason..." value={form.disputeReason} onChange={e => setForm({ ...form, disputeReason: e.target.value })} className="min-h-[50px] bg-white/[0.04] border-white/10 text-white text-sm" /></div>
              <button type="submit" disabled={createD.isPending || !form.accountId} className="btn-gold w-full text-sm disabled:opacity-50">{createD.isPending ? "Creating..." : "Create Dispute"}</button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {disputeStats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[{ label: "Total", value: disputeStats.total, color: "#3b82f6" }, { label: "Active", value: disputeStats.active, color: "#d4a843" }, { label: "Deleted", value: disputeStats.successful, color: "#22c55e" }, { label: "Success Rate", value: disputeStats.total > 0 ? `${Math.round((disputeStats.successful / disputeStats.total) * 100)}%` : "0%", color: "#8b5cf6" }].map(s => (
            <TiltCard key={s.label} tiltAmount={8} glowColor={`${s.color}20`}><div className="glass-card-hover p-4"><p className="text-[10px] text-white/25 uppercase tracking-wider">{s.label}</p><p className="text-2xl font-bold mt-1" style={{ color: s.color }}>{s.value}</p></div></TiltCard>
          ))}
        </div>
      )}

      <Tabs defaultValue="all">
        <TabsList className="bg-white/[0.03] border border-white/8"><TabsTrigger value="all" className="text-white/40 data-[state=active]:text-[#f0c96a] data-[state=active]:bg-[#d4a843]/10">All</TabsTrigger><TabsTrigger value="active" className="text-white/40 data-[state=active]:text-[#f0c96a] data-[state=active]:bg-[#d4a843]/10">Active</TabsTrigger><TabsTrigger value="successful" className="text-white/40 data-[state=active]:text-[#f0c96a] data-[state=active]:bg-[#d4a843]/10">Deleted</TabsTrigger></TabsList>
        <TabsContent value="all" className="mt-4"><DTable disputes={disputes || []} isLoading={isLoading} onDel={id => deleteD.mutate({ id })} onUpd={(id, s) => updateD.mutate({ id, status: s as never })} /></TabsContent>
        <TabsContent value="active" className="mt-4"><DTable disputes={disputes?.filter(d => d.status === "sent" || d.status === "under_investigation") || []} isLoading={isLoading} onDel={id => deleteD.mutate({ id })} onUpd={(id, s) => updateD.mutate({ id, status: s as never })} /></TabsContent>
        <TabsContent value="successful" className="mt-4"><DTable disputes={disputes?.filter(d => d.status === "deleted") || []} isLoading={isLoading} onDel={id => deleteD.mutate({ id })} onUpd={(id, s) => updateD.mutate({ id, status: s as never })} /></TabsContent>
      </Tabs>
    </div>
  );
}

function DTable({ disputes, isLoading, onDel, onUpd }: { disputes: Array<{ id: number; bureau: string; letterType: string; status: string; disputeReason: string; roundNumber: number; sentDate: Date | null; responseDueDate: Date | null; createdAt: Date }>; isLoading: boolean; onDel: (id: number) => void; onUpd: (id: number, s: string) => void }) {
  if (isLoading) return <div className="text-center py-12 text-white/30">Loading disputes...</div>;
  if (disputes.length === 0) return <TiltCard tiltAmount={4} glowColor="rgba(255,255,255,0.05)"><div className="glass-card p-8 text-center"><ShieldCheck className="w-10 h-10 text-white/15 mx-auto mb-3" /><p className="text-white/40 text-sm">No disputes yet. Create your first dispute to start repairing your credit.</p></div></TiltCard>;
  return (
    <TiltCard tiltAmount={3} glowColor="rgba(255,255,255,0.03)">
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader><TableRow className="border-white/[0.04] hover:bg-transparent"><TableHead className="text-white/30 text-[10px]">Bureau / Reason</TableHead><TableHead className="text-white/30 text-[10px]">Letter</TableHead><TableHead className="text-white/30 text-[10px]">Status</TableHead><TableHead className="text-white/30 text-[10px]">Round</TableHead><TableHead className="text-white/30 text-[10px] w-[80px]">Actions</TableHead></TableRow></TableHeader>
            <TableBody>{disputes.map(d => { const cfg = statusCfg[d.status] || statusCfg.draft; const Icon = cfg.icon; return (
              <TableRow key={d.id} className="border-white/[0.03] hover:bg-white/[0.02]"><TableCell><p className="text-sm font-medium text-white/80 capitalize">{d.bureau}</p><p className="text-[10px] text-white/25 line-clamp-1 max-w-[200px]">{d.disputeReason}</p></TableCell><TableCell><Badge variant="outline" className="text-[10px] capitalize border-white/8 text-white/40">{d.letterType.replace("_", " ")}</Badge></TableCell><TableCell><span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}><Icon className="w-2.5 h-2.5" />{cfg.label}</span></TableCell><TableCell><span className="text-xs text-white/40">R{d.roundNumber}</span></TableCell><TableCell><div className="flex items-center gap-0.5"><Link to="/letters"><button className="p-1.5 rounded hover:bg-white/5 text-white/25 hover:text-white/60"><FileText className="w-3.5 h-3.5" /></button></Link>{d.status === "draft" && <button onClick={() => onUpd(d.id, "sent")} className="p-1.5 rounded hover:bg-white/5 text-blue-400/50 hover:text-blue-400"><Send className="w-3.5 h-3.5" /></button>}<button onClick={() => onDel(d.id)} className="p-1.5 rounded hover:bg-red-500/5 text-red-400/30 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button></div></TableCell></TableRow>
            )})}</TableBody>
          </Table>
        </div>
      </div>
    </TiltCard>
  );
}

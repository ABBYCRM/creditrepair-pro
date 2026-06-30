import { useState } from "react";
import { trpc } from "@/providers/trpc";
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

const statusConfig: Record<string, { label: string; bg: string; text: string; icon: typeof Clock }> = {
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

  const [showAddDispute, setShowAddDispute] = useState(false);
  const [disputeForm, setDisputeForm] = useState({ accountId: "", bureau: "equifax" as "equifax" | "experian" | "transunion", letterType: "general", disputeReason: "" });

  const createDispute = trpc.dispute.create.useMutation({
    onSuccess: () => { utils.dispute.list.invalidate(); utils.dispute.stats.invalidate(); utils.creditAccount.getNegativeItems.invalidate(); setShowAddDispute(false); toast.success("Dispute created!"); setDisputeForm({ accountId: "", bureau: "equifax", letterType: "general", disputeReason: "" }); },
  });
  const updateDispute = trpc.dispute.update.useMutation({ onSuccess: () => { utils.dispute.list.invalidate(); utils.dispute.stats.invalidate(); toast.success("Dispute updated"); } });
  const deleteDispute = trpc.dispute.delete.useMutation({ onSuccess: () => { utils.dispute.list.invalidate(); utils.dispute.stats.invalidate(); } });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!disputeForm.accountId) { toast.error("Select an account"); return; }
    createDispute.mutate({ accountId: parseInt(disputeForm.accountId), bureau: disputeForm.bureau, letterType: disputeForm.letterType as never, disputeReason: disputeForm.disputeReason });
  };

  const descriptions: Record<string, string> = {
    general: "Basic dispute requesting investigation",
    section_609: "Request verification of information source (FCRA §609)",
    section_611: "Follow-up asking for method of verification (FCRA §611)",
    section_623: "Direct dispute to data furnisher (FCRA §623)",
    debt_validation: "Request debt validation from collector (FDCPA §809)",
    goodwill: "Request goodwill removal of late payment",
    pay_for_delete: "Offer payment in exchange for deletion",
    cease_desist: "Demand collector stop contacting you (FDCPA)",
  };

  const reasons = [
    "I do not recognize this account and believe it may be fraudulent or identity theft",
    "This account does not belong to me - mixed file with another consumer",
    "The balance reported is incorrect - I have proof of different amount",
    "Payment history is inaccurate - I was never late on this account",
    "This collection account lacks proper validation and documentation",
    "The date of first delinquency is incorrect",
    "This account is past the statute of limitations and should not be reported",
    "Account was included in bankruptcy but still showing as active",
    "I have documentation showing this account was paid in full",
    "Duplicate entry - same debt reported multiple times",
    "Credit limit reported incorrectly affecting utilization ratio",
    "Hard inquiry was unauthorized - I did not apply for this credit",
    "Account status shows closed but I never closed it",
    "Previous dispute was resolved but item was reinserted without notice",
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-[#d4a843]" />
            <p className="text-[10px] uppercase tracking-[0.15em] text-[#d4a843]/60">FCRA / FDCPA Compliant</p>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white mt-1" style={{ fontFamily: "'Playfair Display', serif" }}>Dispute Center</h1>
          <p className="text-sm text-white/40 mt-1">Create and manage credit disputes to repair your credit</p>
        </div>
        <Dialog open={showAddDispute} onOpenChange={setShowAddDispute}>
          <DialogTrigger asChild>
            <button className="btn-gold flex items-center gap-2 text-sm"><Plus className="w-4 h-4" /> New Dispute</button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border-white/10 bg-[#0f1117] text-white" style={{ boxShadow: "0 25px 50px rgba(0,0,0,0.5)" }}>
            <DialogHeader><DialogTitle style={{ fontFamily: "'Playfair Display', serif" }} className="text-xl flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-[#d4a843]" /> Create New Dispute</DialogTitle></DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs text-white/50">1. Select Negative Account *</Label>
                {negativeItems && negativeItems.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto rounded-lg border border-white/8 p-2">
                    {negativeItems.map((item) => (
                      <div key={item.id} onClick={() => setDisputeForm({ ...disputeForm, accountId: String(item.id) })}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${disputeForm.accountId === String(item.id) ? "border-[#d4a843]/50 bg-[#d4a843]/5" : "border-white/5 hover:bg-white/[0.03]"}`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-white/90">{item.accountName}</p>
                            <p className="text-[11px] text-white/35">{item.accountType.replace("_", " ")} | Balance: {item.balance ? `$${Number(item.balance).toLocaleString()}` : "N/A"}</p>
                          </div>
                          {disputeForm.accountId === String(item.id) && <CheckCircle2 className="w-5 h-5 text-[#d4a843]" />}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 rounded-lg border border-white/5 bg-white/[0.02]">
                    <p className="text-sm text-white/40">No negative accounts found. Run a credit analysis first.</p>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-white/50">2. Credit Bureau *</Label>
                <Select value={disputeForm.bureau} onValueChange={(v: "equifax" | "experian" | "transunion") => setDisputeForm({ ...disputeForm, bureau: v })}>
                  <SelectTrigger className="bg-white/[0.04] border-white/10 text-white"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[#0f1117] border-white/10"><SelectItem value="equifax">Equifax</SelectItem><SelectItem value="experian">Experian</SelectItem><SelectItem value="transunion">TransUnion</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-white/50">3. Letter Type *</Label>
                <Select value={disputeForm.letterType} onValueChange={(v) => setDisputeForm({ ...disputeForm, letterType: v })}>
                  <SelectTrigger className="bg-white/[0.04] border-white/10 text-white"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[#0f1117] border-white/10">
                    {Object.entries(descriptions).map(([k, d]) => (<SelectItem key={k} value={k}>{k.replace("_", " ").toUpperCase()} — {d}</SelectItem>))}
                  </SelectContent>
                </Select>
                {disputeForm.letterType && <p className="text-[11px] text-[#d4a843]/60">{descriptions[disputeForm.letterType]}</p>}
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-white/50">4. Dispute Reason *</Label>
                <Select value={disputeForm.disputeReason} onValueChange={(v) => setDisputeForm({ ...disputeForm, disputeReason: v })}>
                  <SelectTrigger className="bg-white/[0.04] border-white/10 text-white"><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent className="bg-[#0f1117] border-white/10 max-h-64">{reasons.map((r, i) => (<SelectItem key={i} value={r}>{r.length > 70 ? r.substring(0, 70) + "..." : r}</SelectItem>))}</SelectContent>
                </Select>
                <Textarea placeholder="Or enter custom reason..." value={disputeForm.disputeReason} onChange={(e) => setDisputeForm({ ...disputeForm, disputeReason: e.target.value })} className="min-h-[60px] bg-white/[0.04] border-white/10 text-white text-sm" />
              </div>
              <button type="submit" disabled={createDispute.isPending || !disputeForm.accountId} className="btn-gold w-full text-sm disabled:opacity-50">{createDispute.isPending ? "Creating..." : "Create Dispute"}</button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      {disputeStats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total", value: disputeStats.total, color: "#3b82f6" },
            { label: "Active", value: disputeStats.active, color: "#d4a843" },
            { label: "Deleted", value: disputeStats.successful, color: "#22c55e" },
            { label: "Success Rate", value: disputeStats.total > 0 ? `${Math.round((disputeStats.successful / disputeStats.total) * 100)}%` : "0%", color: "#8b5cf6" },
          ].map((s) => (
            <div key={s.label} className="glass-card-hover p-4">
              <p className="text-[11px] text-white/30">{s.label}</p>
              <p className="text-2xl font-bold mt-1" style={{ color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="all">
        <TabsList className="bg-white/[0.03] border border-white/8"><TabsTrigger value="all" className="text-white/40 data-[state=active]:text-[#f0c96a] data-[state=active]:bg-[#d4a843]/10">All</TabsTrigger><TabsTrigger value="active" className="text-white/40 data-[state=active]:text-[#f0c96a] data-[state=active]:bg-[#d4a843]/10">Active</TabsTrigger><TabsTrigger value="successful" className="text-white/40 data-[state=active]:text-[#f0c96a] data-[state=active]:bg-[#d4a843]/10">Deleted</TabsTrigger></TabsList>
        <TabsContent value="all" className="mt-4"><DisputesTable disputes={disputes || []} isLoading={isLoading} onDelete={(id) => deleteDispute.mutate({ id })} onUpdate={(id, status) => updateDispute.mutate({ id, status: status as never })} /></TabsContent>
        <TabsContent value="active" className="mt-4"><DisputesTable disputes={disputes?.filter(d => d.status === "sent" || d.status === "under_investigation") || []} isLoading={isLoading} onDelete={(id) => deleteDispute.mutate({ id })} onUpdate={(id, status) => updateDispute.mutate({ id, status: status as never })} /></TabsContent>
        <TabsContent value="successful" className="mt-4"><DisputesTable disputes={disputes?.filter(d => d.status === "deleted") || []} isLoading={isLoading} onDelete={(id) => deleteDispute.mutate({ id })} onUpdate={(id, status) => updateDispute.mutate({ id, status: status as never })} /></TabsContent>
      </Tabs>
    </div>
  );
}

function DisputesTable({ disputes, isLoading, onDelete, onUpdate }: { disputes: Array<{ id: number; bureau: string; letterType: string; status: string; disputeReason: string; roundNumber: number; sentDate: Date | null; responseDueDate: Date | null; createdAt: Date }>; isLoading: boolean; onDelete: (id: number) => void; onUpdate: (id: number, s: string) => void }) {
  if (isLoading) return <div className="text-center py-12 text-white/30">Loading disputes...</div>;
  if (disputes.length === 0) return (
    <div className="glass-card p-8 text-center">
      <ShieldCheck className="w-10 h-10 text-white/15 mx-auto mb-3" />
      <p className="text-white/50 text-sm">No disputes yet. Create your first dispute to start repairing your credit.</p>
    </div>
  );
  return (
    <div className="glass-card overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-white/[0.04] hover:bg-transparent">
              <TableHead className="text-white/35 text-xs font-medium">Bureau / Reason</TableHead>
              <TableHead className="text-white/35 text-xs font-medium">Letter</TableHead>
              <TableHead className="text-white/35 text-xs font-medium">Status</TableHead>
              <TableHead className="text-white/35 text-xs font-medium">Round</TableHead>
              <TableHead className="text-white/35 text-xs font-medium w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {disputes.map((d) => {
              const cfg = statusConfig[d.status] || statusConfig.draft;
              const Icon = cfg.icon;
              return (
                <TableRow key={d.id} className="border-white/[0.03] hover:bg-white/[0.02]">
                  <TableCell>
                    <p className="text-sm font-medium text-white/80 capitalize">{d.bureau}</p>
                    <p className="text-[11px] text-white/30 line-clamp-1 max-w-[240px]">{d.disputeReason}</p>
                  </TableCell>
                  <TableCell><Badge variant="outline" className="text-[10px] capitalize border-white/10 text-white/50">{d.letterType.replace("_", " ")}</Badge></TableCell>
                  <TableCell><span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}><Icon className="w-2.5 h-2.5" />{cfg.label}</span></TableCell>
                  <TableCell><span className="text-xs text-white/50">Round {d.roundNumber}</span></TableCell>
                  <TableCell>
                    <div className="flex items-center gap-0.5">
                      <Link to="/letters"><button className="p-1.5 rounded hover:bg-white/5 text-white/30 hover:text-white/70 transition-colors"><FileText className="w-3.5 h-3.5" /></button></Link>
                      {d.status === "draft" && <button onClick={() => onUpdate(d.id, "sent")} className="p-1.5 rounded hover:bg-white/5 text-blue-400/60 hover:text-blue-400 transition-colors"><Send className="w-3.5 h-3.5" /></button>}
                      <button onClick={() => onDelete(d.id)} className="p-1.5 rounded hover:bg-red-500/5 text-red-400/40 hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

import { useState } from "react";
import { trpc } from "@/providers/trpc";
import TiltCard from "@/components/TiltCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Mail, FileText, Send, Trash2, Eye, CheckCircle2, Clock, Copy, Download, PenTool } from "lucide-react";
import { toast } from "sonner";

const typeLabels: Record<string, string> = { general: "General Dispute", section_609: "FCRA 609 Verification", section_611: "FCRA 611 Method", section_623: "FCRA 623 Furnisher", debt_validation: "FDCPA 809 Validation", goodwill: "Goodwill Removal", pay_for_delete: "Pay for Delete", cease_desist: "Cease and Desist" };

export default function LetterGenerator() {
  const utils = trpc.useUtils();
  const { data: letters, isLoading } = trpc.letter.list.useQuery();
  const { data: disputes } = trpc.dispute.list.useQuery();
  const { data: creditors } = trpc.creditor.list.useQuery();

  const [viewLetter, setViewLetter] = useState<number | null>(null);
  const [showGen, setShowGen] = useState(false);
  const [genForm, setGenForm] = useState({ disputeId: "", creditorName: "", creditorAddress: "", accountName: "", accountNumber: "", bureau: "equifax" as "equifax" | "experian" | "transunion", roundNumber: 1 });

  const genLetter = trpc.letter.generate.useMutation({ onSuccess: (data) => { utils.letter.list.invalidate(); setShowGen(false); setViewLetter(data.id); toast.success("Letter generated!"); } });
  const markSent = trpc.letter.markAsSent.useMutation({ onSuccess: () => { utils.letter.list.invalidate(); toast.success("Marked as sent"); } });
  const delLetter = trpc.letter.delete.useMutation({ onSuccess: () => utils.letter.list.invalidate() });
  const selected = letters?.find(l => l.id === viewLetter);

  const handleGen = (e: React.FormEvent) => { e.preventDefault(); if (!genForm.disputeId) { toast.error("Select a dispute"); return; } const d = disputes?.find(x => x.id === parseInt(genForm.disputeId)); genLetter.mutate({ disputeId: parseInt(genForm.disputeId), letterType: d?.letterType as never || "general", creditorName: genForm.creditorName, creditorAddress: genForm.creditorAddress, accountName: genForm.accountName, accountNumber: genForm.accountNumber, bureau: genForm.bureau, disputeReason: d?.disputeReason || "", roundNumber: genForm.roundNumber }); };
  const copy = (text: string) => { navigator.clipboard.writeText(text); toast.success("Copied"); };
  const download = (l: { subject: string | null; letterContent: string; letterType: string }) => { const blob = new Blob([`${l.subject || "Dispute Letter"}\n\n${l.letterContent}`], { type: "text/plain" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `${l.letterType.replace("_", "-")}-letter.txt`; a.click(); URL.revokeObjectURL(url); toast.success("Downloaded"); };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2"><PenTool className="w-3.5 h-3.5 text-[#d4a843]" /><p className="text-[10px] uppercase tracking-[0.15em] text-[#d4a843]/60">Legal Letter Engine</p></div>
          <h1 className="text-3xl font-bold text-white mt-1" style={{ fontFamily: "'Playfair Display', serif" }}>Letter Generator</h1>
          <p className="text-sm text-white/40 mt-1">Generate professional FCRA/FDCPA dispute letters</p>
        </div>
        <button onClick={() => setShowGen(true)} className="btn-gold flex items-center gap-2 text-sm"><Mail className="w-4 h-4" /> Generate Letter</button>
      </div>

      <Dialog open={showGen} onOpenChange={setShowGen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border-white/10 bg-[#0f1117] text-white">
          <DialogHeader><DialogTitle className="text-xl flex items-center gap-2" style={{ fontFamily: "'Playfair Display', serif" }}><PenTool className="w-5 h-5 text-[#d4a843]" /> Generate Letter</DialogTitle></DialogHeader>
          <form onSubmit={handleGen} className="space-y-4">
            <div className="space-y-2"><label className="text-xs text-white/50">Select Dispute *</label><Select value={genForm.disputeId} onValueChange={v => { const d = disputes?.find(x => x.id === parseInt(v)); if (d) setGenForm({ ...genForm, disputeId: v, bureau: d.bureau, roundNumber: d.roundNumber }); }}><SelectTrigger className="bg-white/[0.04] border-white/10 text-white"><SelectValue placeholder="Choose..." /></SelectTrigger><SelectContent className="bg-[#0f1117] border-white/10">{disputes?.map(d => (<SelectItem key={d.id} value={String(d.id)}>{d.bureau} — {d.letterType.replace("_", " ")} (R{d.roundNumber})</SelectItem>))}</SelectContent></Select></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><label className="text-xs text-white/50">Account Name *</label><input type="text" className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-white text-sm" value={genForm.accountName} onChange={e => setGenForm({ ...genForm, accountName: e.target.value })} required /></div>
              <div className="space-y-1.5"><label className="text-xs text-white/50">Account Number</label><input type="text" className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-white text-sm" value={genForm.accountNumber} onChange={e => setGenForm({ ...genForm, accountNumber: e.target.value })} placeholder="...1234" /></div>
            </div>
            <div className="space-y-1.5"><label className="text-xs text-white/50">Creditor Name *</label><Select value={genForm.creditorName} onValueChange={v => { const c = creditors?.find(x => x.name === v); setGenForm({ ...genForm, creditorName: v, creditorAddress: c ? `${c.address || ""}\n${c.city || ""}, ${c.state || ""} ${c.zipCode || ""}`.trim() : "" }); }}><SelectTrigger className="bg-white/[0.04] border-white/10 text-white"><SelectValue placeholder="Select..." /></SelectTrigger><SelectContent className="bg-[#0f1117] border-white/10">{creditors?.map(c => (<SelectItem key={c.id} value={c.name}>{c.name}{c.isCollectionAgency ? " (Collection)" : ""}</SelectItem>))}</SelectContent></Select></div>
            <div className="space-y-1.5"><label className="text-xs text-white/50">Mailing Address *</label><Textarea value={genForm.creditorAddress} onChange={e => setGenForm({ ...genForm, creditorAddress: e.target.value })} placeholder="Full mailing address..." className="min-h-[60px] bg-white/[0.04] border border-white/10 text-white text-sm" required /></div>
            <button type="submit" disabled={genLetter.isPending} className="btn-gold w-full text-sm disabled:opacity-50">{genLetter.isPending ? "Generating..." : "Generate Letter"}</button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewLetter} onOpenChange={() => setViewLetter(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto border-white/10 bg-[#0f1117] text-white">
          <DialogHeader><DialogTitle className="flex items-center gap-2 text-lg" style={{ fontFamily: "'Playfair Display', serif" }}><FileText className="w-5 h-5 text-[#d4a843]" />{selected?.letterType ? typeLabels[selected.letterType] : "Letter"}</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <button onClick={() => copy(selected.letterContent)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 text-xs text-white/50 hover:bg-white/5 transition-colors"><Copy className="w-3 h-3" /> Copy</button>
                <button onClick={() => download(selected)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 text-xs text-white/50 hover:bg-white/5 transition-colors"><Download className="w-3 h-3" /> Download</button>
                {!selected.isSent && <button onClick={() => markSent.mutate({ id: selected.id, sentVia: "certified_mail" })} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#d4a843]/30 text-xs text-[#d4a843] hover:bg-[#d4a843]/10 transition-colors"><Send className="w-3 h-3" /> Mark Sent</button>}
                {selected.isSent && <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400"><CheckCircle2 className="w-3 h-3" /> Sent via {selected.sentVia?.replace("_", " ")}</span>}
              </div>
              <div className="rounded-lg p-5 bg-black/30 border border-white/[0.06] whitespace-pre-wrap text-sm leading-relaxed font-mono text-white/80">{selected.letterContent}</div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {isLoading ? <div className="text-center py-12 text-white/30">Loading...</div> : letters && letters.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {letters.map(l => {
            const label = typeLabels[l.letterType] || l.letterType;
            return (
              <TiltCard key={l.id} tiltAmount={8} glowColor="rgba(212,168,67,0.12)">
                <div className="glass-card-hover p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2"><FileText className="w-4 h-4 text-[#d4a843]" /><span className="text-sm font-semibold text-white/90">{label}</span></div>
                      <p className="text-[10px] text-white/25 mt-1">To: {l.recipientName || "Credit Bureau"} | {new Date(l.createdAt).toLocaleDateString()}</p>
                      {l.isSent ? (<span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 mt-2"><CheckCircle2 className="w-2.5 h-2.5" /> Sent</span>) : (<span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#d4a843]/10 text-[#d4a843] mt-2"><Clock className="w-2.5 h-2.5" /> Draft</span>)}
                    </div>
                    <div className="flex flex-col gap-0.5 ml-2">
                      <button onClick={() => setViewLetter(l.id)} className="p-1.5 rounded hover:bg-white/5 text-white/25 hover:text-white/60 transition-colors"><Eye className="w-3.5 h-3.5" /></button>
                      <button onClick={() => copy(l.letterContent)} className="p-1.5 rounded hover:bg-white/5 text-white/25 hover:text-white/60 transition-colors"><Copy className="w-3.5 h-3.5" /></button>
                      <button onClick={() => delLetter.mutate({ id: l.id })} className="p-1.5 rounded hover:bg-red-500/5 text-red-400/40 hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                </div>
              </TiltCard>
            );
          })}
        </div>
      ) : (
        <TiltCard tiltAmount={4} glowColor="rgba(255,255,255,0.03)">
          <div className="glass-card p-10 text-center"><Mail className="w-10 h-10 text-white/15 mx-auto mb-3" /><p className="text-white/40 text-sm">No letters yet. Create a dispute first, then generate letters.</p></div>
        </TiltCard>
      )}
    </div>
  );
}

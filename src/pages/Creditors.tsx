import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Building2, Plus, Trash2, Phone, Mail, MapPin, Search, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export default function Creditors() {
  const utils = trpc.useUtils();
  const { data: creditors, isLoading } = trpc.creditor.list.useQuery();
  const [q, setQ] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", address: "", city: "", state: "", zipCode: "", phone: "", fax: "", email: "", website: "", isCollectionAgency: false, originalCreditor: "", accountNumber: "", contactPerson: "", notes: "" });

  const create = trpc.creditor.create.useMutation({ onSuccess: () => { utils.creditor.list.invalidate(); setShowForm(false); toast.success("Added"); reset(); } });
  const update = trpc.creditor.update.useMutation({ onSuccess: () => { utils.creditor.list.invalidate(); setEditId(null); setShowForm(false); toast.success("Updated"); } });
  const del = trpc.creditor.delete.useMutation({ onSuccess: () => utils.creditor.list.invalidate() });

  const reset = () => setForm({ name: "", address: "", city: "", state: "", zipCode: "", phone: "", fax: "", email: "", website: "", isCollectionAgency: false, originalCreditor: "", accountNumber: "", contactPerson: "", notes: "" });
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); if (editId) update.mutate({ id: editId, ...form }); else create.mutate(form); };
  const startEdit = (c: NonNullable<typeof creditors>[0]) => { setForm({ name: c.name, address: c.address || "", city: c.city || "", state: c.state || "", zipCode: c.zipCode || "", phone: c.phone || "", fax: c.fax || "", email: c.email || "", website: c.website || "", isCollectionAgency: c.isCollectionAgency || false, originalCreditor: c.originalCreditor || "", accountNumber: c.accountNumber || "", contactPerson: c.contactPerson || "", notes: c.notes || "" }); setEditId(c.id); setShowForm(true); };

  const filtered = creditors?.filter(c => c.name.toLowerCase().includes(q.toLowerCase()) || c.originalCreditor?.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2"><Building2 className="w-3.5 h-3.5 text-[#d4a843]" /><p className="text-[10px] uppercase tracking-[0.15em] text-[#d4a843]/60">Data Furnishers</p></div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white mt-1" style={{ fontFamily: "'Playfair Display', serif" }}>Creditors</h1>
          <p className="text-sm text-white/40 mt-1">Manage creditor and collection agency contacts</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditId(null); reset(); }} className="btn-gold flex items-center gap-2 text-sm"><Plus className="w-4 h-4" /> Add Creditor</button>
      </div>

      <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" /><input placeholder="Search creditors..." value={q} onChange={e => setQ(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white/[0.04] border border-white/10 text-white text-sm" /></div>

      {showForm && (
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-white/70 mb-4">{editId ? "Edit" : "Add New"} Creditor</h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label className="text-xs text-white/40">Name *</Label><input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-white text-sm" /></div>
              <div className="space-y-1.5"><Label className="text-xs text-white/40">Contact Person</Label><input value={form.contactPerson} onChange={e => setForm({ ...form, contactPerson: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-white text-sm" /></div>
            </div>
            <div className="space-y-1.5"><Label className="text-xs text-white/40">Address</Label><input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-white text-sm" /></div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5"><Label className="text-xs text-white/40">City</Label><input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-white text-sm" /></div>
              <div className="space-y-1.5"><Label className="text-xs text-white/40">State</Label><input value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-white text-sm" /></div>
              <div className="space-y-1.5"><Label className="text-xs text-white/40">ZIP</Label><input value={form.zipCode} onChange={e => setForm({ ...form, zipCode: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-white text-sm" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label className="text-xs text-white/40">Phone</Label><input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-white text-sm" /></div>
              <div className="space-y-1.5"><Label className="text-xs text-white/40">Fax</Label><input value={form.fax} onChange={e => setForm({ ...form, fax: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-white text-sm" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label className="text-xs text-white/40">Email</Label><input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-white text-sm" /></div>
              <div className="space-y-1.5"><Label className="text-xs text-white/40">Original Creditor</Label><input value={form.originalCreditor} onChange={e => setForm({ ...form, originalCreditor: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-white text-sm" /></div>
            </div>
            <div className="flex items-center gap-2"><Switch id="ca" checked={form.isCollectionAgency} onCheckedChange={c => setForm({ ...form, isCollectionAgency: c })} /><Label htmlFor="ca" className="text-xs text-white/40">Collection Agency</Label></div>
            <div className="flex gap-2"><button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg text-xs text-white/40 border border-white/10 hover:bg-white/5 transition-colors">Cancel</button><button type="submit" className="btn-gold text-xs">{editId ? "Update" : "Add"}</button></div>
          </form>
        </div>
      )}

      {isLoading ? <div className="text-center py-12 text-white/30">Loading...</div> : filtered && filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(c => (
            <div key={c.id} className="glass-card-hover p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2"><Building2 className="w-4 h-4 text-[#d4a843]" /><h3 className="text-sm font-semibold text-white/90 truncate">{c.name}</h3></div>
                  {c.isCollectionAgency && <span className="inline-block text-[9px] font-medium px-1.5 py-0.5 rounded bg-red-400/10 text-red-400 mt-1">Collection Agency</span>}
                  {c.originalCreditor && <p className="text-[10px] text-white/30 mt-1">Original: {c.originalCreditor}</p>}
                  <div className="mt-2 space-y-1">
                    {c.address && <div className="flex items-center gap-1.5 text-[10px] text-white/30"><MapPin className="w-2.5 h-2.5" />{c.address}{c.city && `, ${c.city}`}{c.state && `, ${c.state}`}</div>}
                    {c.phone && <div className="flex items-center gap-1.5 text-[10px] text-white/30"><Phone className="w-2.5 h-2.5" />{c.phone}</div>}
                    {c.email && <div className="flex items-center gap-1.5 text-[10px] text-white/30"><Mail className="w-2.5 h-2.5" />{c.email}</div>}
                  </div>
                </div>
                <div className="flex flex-col gap-0.5 ml-2">
                  <button onClick={() => startEdit(c)} className="p-1.5 rounded hover:bg-white/5 text-white/30 hover:text-white/60 transition-colors"><ExternalLink className="w-3.5 h-3.5" /></button>
                  <button onClick={() => del.mutate({ id: c.id })} className="p-1.5 rounded hover:bg-red-500/5 text-red-400/40 hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card p-10 text-center">
          <Building2 className="w-10 h-10 text-white/15 mx-auto mb-3" />
          <p className="text-white/50 text-sm">No creditors yet. Add your first one.</p>
        </div>
      )}
    </div>
  );
}

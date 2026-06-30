import { useState, useEffect } from "react";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { User, Shield, Save, Info, BookOpen, Scale, CreditCard, ChevronRight, FileText } from "lucide-react";
import { toast } from "sonner";

export default function Settings() {
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "", city: "", state: "", zipCode: "", dateOfBirth: "", ssnLastFour: "" });
  useEffect(() => { if (user) setForm({ name: user.name || "", email: user.email || "", phone: user.phone || "", address: user.address || "", city: user.city || "", state: user.state || "", zipCode: user.zipCode || "", dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split("T")[0] : "", ssnLastFour: user.ssnLastFour || "" }); }, [user]);

  const update = trpc.auth.updateProfile.useMutation({
    onSuccess: () => { utils.auth.me.invalidate(); toast.success("Profile saved"); },
    onError: () => toast.error("Failed to save"),
  });

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); update.mutate({ name: form.name || undefined, email: form.email || undefined, phone: form.phone || undefined, address: form.address || undefined, city: form.city || undefined, state: form.state || undefined, zipCode: form.zipCode || undefined, dateOfBirth: form.dateOfBirth || undefined, ssnLastFour: form.ssnLastFour || undefined }); };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      <div>
        <div className="flex items-center gap-2"><User className="w-3.5 h-3.5 text-[#d4a843]" /><p className="text-[10px] uppercase tracking-[0.15em] text-[#d4a843]/60">Configuration</p></div>
        <h1 className="text-2xl lg:text-3xl font-bold text-white mt-1" style={{ fontFamily: "'Playfair Display', serif" }}>Settings</h1>
        <p className="text-sm text-white/40 mt-1">Manage profile, learn credit repair, and know your rights</p>
      </div>

      <Tabs defaultValue="profile">
        <TabsList className="bg-white/[0.03] border border-white/8">
          <TabsTrigger value="profile" className="text-white/40 data-[state=active]:text-[#f0c96a] data-[state=active]:bg-[#d4a843]/10 gap-1.5"><User className="w-3.5 h-3.5" />Profile</TabsTrigger>
          <TabsTrigger value="education" className="text-white/40 data-[state=active]:text-[#f0c96a] data-[state=active]:bg-[#d4a843]/10 gap-1.5"><BookOpen className="w-3.5 h-3.5" />Education</TabsTrigger>
          <TabsTrigger value="rights" className="text-white/40 data-[state=active]:text-[#f0c96a] data-[state=active]:bg-[#d4a843]/10 gap-1.5"><Scale className="w-3.5 h-3.5" />Your Rights</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-white/80 flex items-center gap-2 mb-1" style={{ fontFamily: "'Playfair Display', serif" }}><User className="w-4 h-4 text-[#d4a843]" />Personal Information</h2>
            <p className="text-xs text-white/30 mb-5">Used to generate dispute letters. All sensitive data is AES-256 encrypted.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5"><label className="text-xs text-white/40">Full Name</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="John Doe" className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-white text-sm" /></div>
                <div className="space-y-1.5"><label className="text-xs text-white/40">Email</label><input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="john@example.com" className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-white text-sm" /></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5"><label className="text-xs text-white/40">Phone</label><input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="(555) 123-4567" className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-white text-sm" /></div>
                <div className="space-y-1.5"><label className="text-xs text-white/40">Date of Birth</label><input type="date" value={form.dateOfBirth} onChange={e => setForm({ ...form, dateOfBirth: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-white text-sm" /></div>
              </div>
              <div className="space-y-1.5"><label className="text-xs text-white/40">Street Address</label><input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="123 Main Street" className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-white text-sm" /></div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5"><label className="text-xs text-white/40">City</label><input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} placeholder="New York" className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-white text-sm" /></div>
                <div className="space-y-1.5"><label className="text-xs text-white/40">State</label><input value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} placeholder="NY" className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-white text-sm" /></div>
                <div className="space-y-1.5"><label className="text-xs text-white/40">ZIP</label><input value={form.zipCode} onChange={e => setForm({ ...form, zipCode: e.target.value })} placeholder="10001" className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-white text-sm" /></div>
              </div>
              <Separator className="bg-white/[0.06]" />
              <div className="space-y-1.5">
                <label className="text-xs text-white/40">SSN Last 4 Digits</label>
                <input value={form.ssnLastFour} onChange={e => setForm({ ...form, ssnLastFour: e.target.value.replace(/\D/g, "").slice(0, 4) })} placeholder="6789" maxLength={4} className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-white text-sm" />
                <p className="text-[10px] text-white/20">Encrypted with AES-256. Only used in dispute letters.</p>
              </div>
              <button type="submit" disabled={update.isPending} className="btn-gold flex items-center gap-2 text-sm disabled:opacity-50"><Save className="w-4 h-4" />{update.isPending ? "Saving..." : "Save Profile"}</button>
            </form>
          </div>
        </TabsContent>

        <TabsContent value="education" className="mt-6 space-y-4">
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-white/80 flex items-center gap-2 mb-1" style={{ fontFamily: "'Playfair Display', serif" }}><BookOpen className="w-4 h-4 text-[#d4a843]" />Credit Repair Education</h2>
            <div className="space-y-3 mt-4">
              {[{ title: "How Credit Repair Works", icon: CreditCard, content: "Credit repair is identifying and disputing inaccurate, unverifiable, or outdated information on credit reports. Under the FCRA, credit bureaus must investigate within 30 days and remove information they cannot verify." }, { title: "The Dispute Process Timeline", icon: FileText, content: "1. Identify errors\n2. File dispute with bureaus\n3. Bureau investigates within 30 days\n4. Bureau contacts data furnisher\n5. You receive results\n6. If verified, escalate with follow-up disputes\n7. If unverified, item must be deleted" }, { title: "Types of Dispute Letters", icon: Shield, content: "General Dispute: Basic investigation request.\nFCRA 609: Request source verification and original documents.\nFCRA 611: Follow-up requesting method of verification.\nFCRA 623: Direct dispute to data furnisher.\nFDCPA 809: Debt validation from collectors.\nGoodwill: Removal request for isolated late payments." }, { title: "Best Practices", icon: ChevronRight, content: "Send via certified mail with return receipt\nKeep copies of everything\nNever dispute accurate positive information\nSpace disputes 30-45 days apart\nFollow up if no response within 45 days\nCheck all three bureaus\nDocument everything" }].map((s, i) => (
                <div key={i} className="border border-white/[0.06] rounded-lg p-4 hover:border-[#d4a843]/20 transition-colors">
                  <h3 className="font-semibold text-white/80 flex items-center gap-2 text-sm mb-1"><s.icon className="w-3.5 h-3.5 text-[#d4a843]" />{s.title}</h3>
                  <p className="text-xs text-white/40 whitespace-pre-line">{s.content}</p>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="rights" className="mt-6 space-y-4">
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-white/80 flex items-center gap-2 mb-1" style={{ fontFamily: "'Playfair Display', serif" }}><Scale className="w-4 h-4 text-[#d4a843]" />Your Legal Rights</h2>
            <div className="space-y-3 mt-4">
              {[{ law: "Fair Credit Reporting Act (FCRA)", rights: ["Free annual credit report from each bureau", "Right to dispute inaccurate information", "Bureaus must investigate within 30 days", "Right to know who accessed your report", "Outdated negative info removed after 7 years", "Right to sue for willful violations ($1,000+ damages)"] }, { law: "Fair Debt Collection Practices Act (FDCPA)", rights: ["Right to request debt validation within 30 days", "Collector must cease collection until validation", "Right to demand collector stop contacting you", "Prohibition on harassment and threats", "Cannot call before 8am or after 9pm", "Right to sue for violations ($1,000+ damages)"] }, { law: "Credit Repair Organizations Act (CROA)", rights: ["No fees before services are performed", "Written contract with specific disclosures", "Right to cancel within 3 business days", "Prohibition on false claims about services"] }].map((s, i) => (
                <div key={i} className="border border-white/[0.06] rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-[#d4a843]/80 mb-2">{s.law}</h3>
                  <ul className="space-y-1.5">
                    {s.rights.map((r, j) => (<li key={j} className="flex items-start gap-2 text-xs text-white/40"><Shield className="w-3 h-3 text-emerald-500/60 mt-0.5 shrink-0" />{r}</li>))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="mt-4 border border-[#d4a843]/15 rounded-lg p-4 bg-[#d4a843]/[0.03]">
              <p className="text-[10px] text-[#d4a843]/50 flex items-start gap-2"><Info className="w-3 h-3 shrink-0 mt-0.5" />This application helps you exercise your legal rights. It does not provide legal advice. For complex cases or if being sued, consult a consumer rights attorney. File complaints with the CFPB at consumerfinance.gov.</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

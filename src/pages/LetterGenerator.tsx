import { useState } from "react";
import { trpc } from "@/providers/trpc";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "react-router";
import {
  Mail,
  FileText,
  Send,
  Trash2,
  Eye,
  CheckCircle2,
  Clock,
  Copy,
  Download,
} from "lucide-react";
import { toast } from "sonner";

export default function LetterGenerator() {
  const utils = trpc.useUtils();
  const { data: letters, isLoading } = trpc.letter.list.useQuery();
  const { data: disputes } = trpc.dispute.list.useQuery();
  const { data: creditors } = trpc.creditor.list.useQuery();

  const [viewLetter, setViewLetter] = useState<number | null>(null);
  const [showGenerate, setShowGenerate] = useState(false);
  const [genForm, setGenForm] = useState({
    disputeId: "",
    letterType: "general" as string,
    creditorName: "",
    creditorAddress: "",
    accountName: "",
    accountNumber: "",
    bureau: "equifax" as "equifax" | "experian" | "transunion",
    disputeReason: "",
    roundNumber: 1,
  });

  const generateLetter = trpc.letter.generate.useMutation({
    onSuccess: (data) => {
      utils.letter.list.invalidate();
      utils.activity.listRecent.invalidate();
      setShowGenerate(false);
      toast.success("Letter generated successfully!");
      setViewLetter(data.id);
      setGenForm({
        disputeId: "",
        letterType: "general",
        creditorName: "",
        creditorAddress: "",
        accountName: "",
        accountNumber: "",
        bureau: "equifax",
        disputeReason: "",
        roundNumber: 1,
      });
    },
  });

  const markAsSent = trpc.letter.markAsSent.useMutation({
    onSuccess: () => {
      utils.letter.list.invalidate();
      toast.success("Letter marked as sent");
    },
  });

  const deleteLetter = trpc.letter.delete.useMutation({
    onSuccess: () => {
      utils.letter.list.invalidate();
      toast.success("Letter deleted");
    },
  });

  const selectedLetter = letters?.find((l) => l.id === viewLetter);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!genForm.disputeId) {
      toast.error("Please select a dispute");
      return;
    }
    generateLetter.mutate({
      disputeId: parseInt(genForm.disputeId),
      letterType: genForm.letterType as never,
      creditorName: genForm.creditorName,
      creditorAddress: genForm.creditorAddress,
      accountName: genForm.accountName,
      accountNumber: genForm.accountNumber,
      bureau: genForm.bureau,
      disputeReason: genForm.disputeReason,
      roundNumber: genForm.roundNumber,
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const downloadLetter = (letter: { subject: string | null; letterContent: string; letterType: string }) => {
    const content = `${letter.subject || "Dispute Letter"}\n\n${letter.letterContent}`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${letter.letterType.replace("_", "-")}-dispute-letter.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Letter downloaded");
  };

  const letterTypeLabels: Record<string, string> = {
    general: "General Dispute",
    section_609: "FCRA §609 Verification",
    section_611: "FCRA §611 Method of Verification",
    section_623: "FCRA §623 Furnisher Dispute",
    debt_validation: "FDCPA §809 Debt Validation",
    goodwill: "Goodwill Removal",
    pay_for_delete: "Pay for Delete",
    cease_desist: "Cease and Desist",
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Letter Generator
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Generate and manage your dispute letters
          </p>
        </div>
        <Button
          onClick={() => setShowGenerate(true)}
          className="gap-2 bg-emerald-600 hover:bg-emerald-700"
        >
          <Mail className="w-4 h-4" />
          Generate Letter
        </Button>
      </div>

      {/* Generate Letter Dialog */}
      <Dialog open={showGenerate} onOpenChange={setShowGenerate}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Generate Dispute Letter</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleGenerate} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Dispute *</label>
              <Select
                value={genForm.disputeId}
                onValueChange={(v) => {
                  const dispute = disputes?.find((d) => d.id === parseInt(v));
                  if (dispute) {
                    setGenForm({
                      ...genForm,
                      disputeId: v,
                      bureau: dispute.bureau,
                      letterType: dispute.letterType,
                      disputeReason: dispute.disputeReason,
                      roundNumber: dispute.roundNumber,
                    });
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a dispute..." />
                </SelectTrigger>
                <SelectContent>
                  {disputes?.map((d) => (
                    <SelectItem key={d.id} value={String(d.id)}>
                      {d.bureau} - {d.letterType.replace("_", " ")} (Round{" "}
                      {d.roundNumber})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Account Name *</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-md text-sm"
                  value={genForm.accountName}
                  onChange={(e) =>
                    setGenForm({ ...genForm, accountName: e.target.value })
                  }
                  placeholder="e.g. Capital One"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Account Number</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-md text-sm"
                  value={genForm.accountNumber}
                  onChange={(e) =>
                    setGenForm({ ...genForm, accountNumber: e.target.value })
                  }
                  placeholder="...1234"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Creditor / Furnisher Name *
              </label>
              <Select
                value={genForm.creditorName}
                onValueChange={(v) => {
                  const creditor = creditors?.find((c) => c.name === v);
                  setGenForm({
                    ...genForm,
                    creditorName: v,
                    creditorAddress: creditor
                      ? `${creditor.address || ""}\n${creditor.city || ""}, ${creditor.state || ""} ${creditor.zipCode || ""}`.trim()
                      : "",
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select or type creditor name..." />
                </SelectTrigger>
                <SelectContent>
                  {creditors?.map((c) => (
                    <SelectItem key={c.id} value={c.name}>
                      {c.name}
                      {c.isCollectionAgency ? " (Collection Agency)" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Creditor / Bureau Address *
              </label>
              <Textarea
                value={genForm.creditorAddress}
                onChange={(e) =>
                  setGenForm({ ...genForm, creditorAddress: e.target.value })
                }
                placeholder="Full mailing address..."
                className="min-h-[80px]"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700"
              disabled={generateLetter.isPending}
            >
              {generateLetter.isPending
                ? "Generating..."
                : "Generate Letter"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Letter Dialog */}
      <Dialog open={!!viewLetter} onOpenChange={() => setViewLetter(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              {selectedLetter?.letterType
                ? letterTypeLabels[selectedLetter.letterType]
                : "Dispute Letter"}
            </DialogTitle>
          </DialogHeader>
          {selectedLetter && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1"
                  onClick={() => copyToClipboard(selectedLetter.letterContent)}
                >
                  <Copy className="w-3.5 h-3.5" />
                  Copy
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1"
                  onClick={() => downloadLetter(selectedLetter)}
                >
                  <Download className="w-3.5 h-3.5" />
                  Download
                </Button>
                {!selectedLetter.isSent && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1"
                      onClick={() => {
                        markAsSent.mutate({
                          id: selectedLetter.id,
                          sentVia: "certified_mail",
                        });
                      }}
                    >
                      <Send className="w-3.5 h-3.5" />
                      Mark as Sent
                    </Button>
                  </>
                )}
                {selectedLetter.isSent && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                    <CheckCircle2 className="w-3 h-3" />
                    Sent via {selectedLetter.sentVia?.replace("_", " ")}
                  </span>
                )}
              </div>
              <div className="border rounded-lg p-6 bg-slate-50 dark:bg-slate-800/50 whitespace-pre-wrap text-sm leading-relaxed font-mono">
                {selectedLetter.letterContent}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Letters List */}
      {isLoading ? (
        <div className="text-center py-12 text-slate-500">Loading...</div>
      ) : letters && letters.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {letters.map((letter) => {
            const label =
              letterTypeLabels[letter.letterType] || letter.letterType;
            return (
              <Card key={letter.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-emerald-600" />
                        <span className="text-sm font-semibold text-slate-900 dark:text-white">
                          {label}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        To: {letter.recipientName || "Credit Bureau"}
                      </p>
                      <p className="text-xs text-slate-400">
                        {new Date(letter.createdAt).toLocaleDateString()}
                      </p>
                      {letter.isSent ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 mt-2">
                          <CheckCircle2 className="w-3 h-3" />
                          Sent
                          {letter.sentVia
                            ? ` via ${letter.sentVia.replace("_", " ")}`
                            : ""}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 mt-2">
                          <Clock className="w-3 h-3" />
                          Draft
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => setViewLetter(letter.id)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => copyToClipboard(letter.letterContent)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => deleteLetter.mutate({ id: letter.id })}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Mail className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-1">
              No Letters Generated Yet
            </h3>
            <p className="text-sm text-slate-500 mb-4">
              Create a dispute first, then generate your dispute letter here
            </p>
            <Link to="/disputes">
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                Go to Dispute Center
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

import { useState } from "react";
import { trpc } from "@/providers/trpc";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  Plus,
  Trash2,
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
  Send,
} from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router";

const statusConfig: Record<
  string,
  { label: string; color: string; icon: typeof Clock }
> = {
  draft: { label: "Draft", color: "bg-slate-100 text-slate-700", icon: FileText },
  sent: { label: "Sent", color: "bg-blue-50 text-blue-700", icon: Send },
  under_investigation: {
    label: "Under Review",
    color: "bg-amber-50 text-amber-700",
    icon: Clock,
  },
  verified: { label: "Verified", color: "bg-orange-50 text-orange-700", icon: CheckCircle2 },
  deleted: { label: "Deleted!", color: "bg-emerald-50 text-emerald-700", icon: CheckCircle2 },
  updated: { label: "Updated", color: "bg-blue-50 text-blue-700", icon: CheckCircle2 },
  reinserted: { label: "Reinserted", color: "bg-red-50 text-red-700", icon: XCircle },
  no_response: { label: "No Response", color: "bg-purple-50 text-purple-700", icon: Clock },
  closed: { label: "Closed", color: "bg-slate-100 text-slate-600", icon: XCircle },
};

export default function DisputeCenter() {
  const utils = trpc.useUtils();
  const { data: disputes, isLoading } = trpc.dispute.list.useQuery();
  const { data: negativeItems } = trpc.creditAccount.getNegativeItems.useQuery();
  const { data: disputeStats } = trpc.dispute.stats.useQuery();

  const [showAddDispute, setShowAddDispute] = useState(false);
  const [disputeForm, setDisputeForm] = useState({
    accountId: "",
    bureau: "equifax" as "equifax" | "experian" | "transunion",
    letterType: "general" as string,
    disputeReason: "",
  });

  const createDispute = trpc.dispute.create.useMutation({
    onSuccess: () => {
      utils.dispute.list.invalidate();
      utils.dispute.stats.invalidate();
      utils.creditAccount.getNegativeItems.invalidate();
      setShowAddDispute(false);
      toast.success("Dispute created! Now generate your letter.");
      setDisputeForm({
        accountId: "",
        bureau: "equifax",
        letterType: "general",
        disputeReason: "",
      });
    },
  });

  const updateDispute = trpc.dispute.update.useMutation({
    onSuccess: () => {
      utils.dispute.list.invalidate();
      utils.dispute.stats.invalidate();
      toast.success("Dispute updated");
    },
  });

  const deleteDispute = trpc.dispute.delete.useMutation({
    onSuccess: () => {
      utils.dispute.list.invalidate();
      utils.dispute.stats.invalidate();
      toast.success("Dispute deleted");
    },
  });

  const handleCreateDispute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!disputeForm.accountId) {
      toast.error("Please select an account");
      return;
    }
    createDispute.mutate({
      accountId: parseInt(disputeForm.accountId),
      bureau: disputeForm.bureau,
      letterType: disputeForm.letterType as
        | "general"
        | "section_609"
        | "section_611"
        | "section_623"
        | "debt_validation"
        | "goodwill"
        | "pay_for_delete"
        | "cease_desist",
      disputeReason: disputeForm.disputeReason,
    });
  };

  const letterTypeDescriptions: Record<string, string> = {
    general: "Basic dispute requesting investigation",
    section_609: "Request verification of information source (FCRA §609)",
    section_611: "Follow-up asking for method of verification (FCRA §611)",
    section_623: "Direct dispute to data furnisher (FCRA §623)",
    debt_validation: "Request debt validation from collector (FDCPA §809)",
    goodwill: "Request goodwill removal of late payment",
    pay_for_delete: "Offer payment in exchange for deletion",
    cease_desist: "Demand collector stop contacting you (FDCPA)",
  };

  const disputeReasons = [
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
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Dispute Center
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Create and manage credit disputes to repair your credit
          </p>
        </div>
        <Dialog open={showAddDispute} onOpenChange={setShowAddDispute}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700">
              <Plus className="w-4 h-4" />
              New Dispute
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Dispute</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateDispute} className="space-y-4">
              {/* Step 1: Select Account */}
              <div className="space-y-2">
                <Label>
                  1. Select Negative Account *
                </Label>
                {negativeItems && negativeItems.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto border rounded-lg p-2">
                    {negativeItems.map((item) => (
                      <div
                        key={item.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          disputeForm.accountId === String(item.id)
                            ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
                            : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                        }`}
                        onClick={() =>
                          setDisputeForm({
                            ...disputeForm,
                            accountId: String(item.id),
                          })
                        }
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-slate-900 dark:text-white">
                              {item.accountName}
                            </p>
                            <p className="text-xs text-slate-500">
                              {item.accountType.replace("_", " ")} | Balance:{" "}
                              {item.balance
                                ? `$${Number(item.balance).toLocaleString()}`
                                : "N/A"}
                              {item.negativeReason && ` | ${item.negativeReason}`}
                            </p>
                          </div>
                          {disputeForm.accountId === String(item.id) && (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 border rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <p className="text-sm text-slate-500">
                      No negative accounts found
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Add accounts from your credit report first
                    </p>
                  </div>
                )}
              </div>

              {/* Step 2: Select Bureau */}
              <div className="space-y-2">
                <Label>2. Select Credit Bureau *</Label>
                <Select
                  value={disputeForm.bureau}
                  onValueChange={(v: "equifax" | "experian" | "transunion") =>
                    setDisputeForm({ ...disputeForm, bureau: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="equifax">Equifax</SelectItem>
                    <SelectItem value="experian">Experian</SelectItem>
                    <SelectItem value="transunion">TransUnion</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Step 3: Select Letter Type */}
              <div className="space-y-2">
                <Label>3. Select Dispute Letter Type *</Label>
                <Select
                  value={disputeForm.letterType}
                  onValueChange={(v) =>
                    setDisputeForm({ ...disputeForm, letterType: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General Dispute Letter</SelectItem>
                    <SelectItem value="section_609">
                      FCRA Section 609 - Verification Request
                    </SelectItem>
                    <SelectItem value="section_611">
                      FCRA Section 611 - Method of Verification
                    </SelectItem>
                    <SelectItem value="section_623">
                      FCRA Section 623 - Direct Furnisher Dispute
                    </SelectItem>
                    <SelectItem value="debt_validation">
                      FDCPA Section 809 - Debt Validation
                    </SelectItem>
                    <SelectItem value="goodwill">
                      Goodwill Removal Request
                    </SelectItem>
                    <SelectItem value="pay_for_delete">
                      Pay for Delete Offer
                    </SelectItem>
                    <SelectItem value="cease_desist">
                      Cease and Desist (Collectors)
                    </SelectItem>
                  </SelectContent>
                </Select>
                {disputeForm.letterType && (
                  <p className="text-xs text-slate-500 mt-1">
                    {letterTypeDescriptions[disputeForm.letterType]}
                  </p>
                )}
              </div>

              {/* Step 4: Dispute Reason */}
              <div className="space-y-2">
                <Label>4. Dispute Reason *</Label>
                <Select
                  value={disputeForm.disputeReason}
                  onValueChange={(v) =>
                    setDisputeForm({ ...disputeForm, disputeReason: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a reason..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-64">
                    {disputeReasons.map((reason, idx) => (
                      <SelectItem key={idx} value={reason}>
                        {reason.length > 80
                          ? reason.substring(0, 80) + "..."
                          : reason}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Textarea
                  placeholder="Or enter your custom dispute reason..."
                  value={disputeForm.disputeReason}
                  onChange={(e) =>
                    setDisputeForm({
                      ...disputeForm,
                      disputeReason: e.target.value,
                    })
                  }
                  className="min-h-[80px]"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700"
                disabled={
                  createDispute.isPending || !disputeForm.accountId
                }
              >
                {createDispute.isPending ? "Creating..." : "Create Dispute"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Overview */}
      {disputeStats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Disputes", value: disputeStats.total, color: "bg-blue-50 text-blue-700" },
            { label: "Active", value: disputeStats.active, color: "bg-amber-50 text-amber-700" },
            { label: "Successful", value: disputeStats.successful, color: "bg-emerald-50 text-emerald-700" },
            {
              label: "Success Rate",
              value:
                disputeStats.total > 0
                  ? `${Math.round(
                      (disputeStats.successful / disputeStats.total) * 100
                    )}%`
                  : "0%",
              color: "bg-purple-50 text-purple-700",
            },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-4">
                <p className="text-xs text-slate-500">{stat.label}</p>
                <p
                  className={`text-2xl font-bold mt-1 inline-block px-2 py-0.5 rounded-lg ${stat.color}`}
                >
                  {stat.value}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Disputes List */}
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Disputes</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="successful">Successful</TabsTrigger>
          <TabsTrigger value="closed">Closed</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <DisputesTable
            disputes={disputes || []}
            isLoading={isLoading}
            onDelete={(id) => deleteDispute.mutate({ id })}
            onUpdateStatus={(id, status) =>
              updateDispute.mutate({ id, status: status as never })
            }
          />
        </TabsContent>
        <TabsContent value="active" className="mt-4">
          <DisputesTable
            disputes={
              disputes?.filter(
                (d) => d.status === "sent" || d.status === "under_investigation"
              ) || []
            }
            isLoading={isLoading}
            onDelete={(id) => deleteDispute.mutate({ id })}
            onUpdateStatus={(id, status) =>
              updateDispute.mutate({ id, status: status as never })
            }
          />
        </TabsContent>
        <TabsContent value="successful" className="mt-4">
          <DisputesTable
            disputes={
              disputes?.filter((d) => d.status === "deleted") || []
            }
            isLoading={isLoading}
            onDelete={(id) => deleteDispute.mutate({ id })}
            onUpdateStatus={(id, status) =>
              updateDispute.mutate({ id, status: status as never })
            }
          />
        </TabsContent>
        <TabsContent value="closed" className="mt-4">
          <DisputesTable
            disputes={
              disputes?.filter(
                (d) =>
                  d.status === "closed" ||
                  d.status === "verified" ||
                  d.status === "no_response"
              ) || []
            }
            isLoading={isLoading}
            onDelete={(id) => deleteDispute.mutate({ id })}
            onUpdateStatus={(id, status) =>
              updateDispute.mutate({ id, status: status as never })
            }
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function DisputesTable({
  disputes,
  isLoading,
  onDelete,
  onUpdateStatus,
}: {
  disputes: Array<{
    id: number;
    bureau: string;
    letterType: string;
    status: string;
    disputeReason: string;
    roundNumber: number;
    sentDate: Date | null;
    responseDueDate: Date | null;
    createdAt: Date;
  }>;
  isLoading: boolean;
  onDelete: (id: number) => void;
  onUpdateStatus: (id: number, status: string) => void;
}) {
  if (isLoading) {
    return <div className="text-center py-12 text-slate-500">Loading...</div>;
  }

  if (disputes.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Shield className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-1">
            No Disputes Found
          </h3>
          <p className="text-sm text-slate-500 mb-4">
            Create your first dispute to start the credit repair process
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Account / Bureau</TableHead>
                <TableHead>Letter Type</TableHead>
                <TableHead>Round</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Sent Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {disputes.map((dispute) => {
                const config = statusConfig[dispute.status] || statusConfig.draft;
                const StatusIcon = config.icon;
                return (
                  <TableRow key={dispute.id}>
                    <TableCell>
                      <p className="text-sm font-medium capitalize">
                        {dispute.bureau}
                      </p>
                      <p className="text-xs text-slate-500 line-clamp-1 max-w-[200px]">
                        {dispute.disputeReason}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs capitalize">
                        {dispute.letterType.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium">
                        Round {dispute.roundNumber}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${config.color}`}
                      >
                        <StatusIcon className="w-3 h-3" />
                        {config.label}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm">
                      {dispute.sentDate
                        ? new Date(dispute.sentDate).toLocaleDateString()
                        : "—"}
                    </TableCell>
                    <TableCell>
                      {dispute.responseDueDate ? (
                        <span
                          className={`text-sm ${
                            new Date(dispute.responseDueDate) < new Date()
                              ? "text-red-600 font-medium"
                              : ""
                          }`}
                        >
                          {new Date(dispute.responseDueDate).toLocaleDateString()}
                        </span>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Link to="/letters">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <FileText className="w-4 h-4" />
                          </Button>
                        </Link>
                        {dispute.status === "draft" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() =>
                              onUpdateStatus(dispute.id, "sent")
                            }
                          >
                            <Send className="w-4 h-4 text-blue-600" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => onDelete(dispute.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { Link } from "react-router";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FileText,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "sonner";

export default function CreditReports() {
  const utils = trpc.useUtils();
  const { data: reports, isLoading } = trpc.creditReport.list.useQuery();
  const [selectedReport, setSelectedReport] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAccounts, setShowAccounts] = useState(false);
  const [formData, setFormData] = useState({
    reportDate: new Date().toISOString().split("T")[0],
    bureau: "equifax" as "equifax" | "experian" | "transunion",
    score: "",
    totalAccounts: "",
    negativeAccounts: "",
    inquiries: "",
    totalBalance: "",
  });

  const { data: reportWithAccounts } = trpc.creditReport.getWithAccounts.useQuery(
    { id: selectedReport! },
    { enabled: !!selectedReport }
  );

  const createReport = trpc.creditReport.create.useMutation({
    onSuccess: () => {
      utils.creditReport.list.invalidate();
      utils.creditReport.stats.invalidate();
      setShowAddForm(false);
      toast.success("Credit report added successfully");
      setFormData({
        reportDate: new Date().toISOString().split("T")[0],
        bureau: "equifax",
        score: "",
        totalAccounts: "",
        negativeAccounts: "",
        inquiries: "",
        totalBalance: "",
      });
    },
  });

  const deleteReport = trpc.creditReport.delete.useMutation({
    onSuccess: () => {
      utils.creditReport.list.invalidate();
      utils.creditReport.stats.invalidate();
      toast.success("Report deleted");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createReport.mutate({
      reportDate: formData.reportDate,
      bureau: formData.bureau,
      score: formData.score ? parseInt(formData.score) : undefined,
      totalAccounts: formData.totalAccounts
        ? parseInt(formData.totalAccounts)
        : undefined,
      negativeAccounts: formData.negativeAccounts
        ? parseInt(formData.negativeAccounts)
        : undefined,
      inquiries: formData.inquiries ? parseInt(formData.inquiries) : undefined,
      totalBalance: formData.totalBalance || undefined,
    });
  };

  const bureauColor = (bureau: string) => {
    switch (bureau) {
      case "equifax":
        return "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400";
      case "experian":
        return "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400";
      case "transunion":
        return "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400";
      default:
        return "bg-slate-50 text-slate-700";
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Credit Reports
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your credit reports and imported accounts
          </p>
        </div>
        <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700">
              <Plus className="w-4 h-4" />
              Add Report
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add New Credit Report</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reportDate">Report Date</Label>
                  <Input
                    id="reportDate"
                    type="date"
                    value={formData.reportDate}
                    onChange={(e) =>
                      setFormData({ ...formData, reportDate: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bureau">Bureau</Label>
                  <Select
                    value={formData.bureau}
                    onValueChange={(v: "equifax" | "experian" | "transunion") =>
                      setFormData({ ...formData, bureau: v })
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
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="score">Credit Score</Label>
                  <Input
                    id="score"
                    type="number"
                    placeholder="e.g. 720"
                    value={formData.score}
                    onChange={(e) =>
                      setFormData({ ...formData, score: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inquiries">Inquiries</Label>
                  <Input
                    id="inquiries"
                    type="number"
                    placeholder="0"
                    value={formData.inquiries}
                    onChange={(e) =>
                      setFormData({ ...formData, inquiries: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="totalAccounts">Total Accounts</Label>
                  <Input
                    id="totalAccounts"
                    type="number"
                    placeholder="0"
                    value={formData.totalAccounts}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        totalAccounts: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="negativeAccounts">Negative</Label>
                  <Input
                    id="negativeAccounts"
                    type="number"
                    placeholder="0"
                    value={formData.negativeAccounts}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        negativeAccounts: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="totalBalance">Total Balance</Label>
                  <Input
                    id="totalBalance"
                    type="text"
                    placeholder="$0.00"
                    value={formData.totalBalance}
                    onChange={(e) =>
                      setFormData({ ...formData, totalBalance: e.target.value })
                    }
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700"
                disabled={createReport.isPending}
              >
                {createReport.isPending ? "Adding..." : "Add Report"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Reports List */}
      {isLoading ? (
        <div className="text-center py-12 text-slate-500">Loading...</div>
      ) : reports && reports.length > 0 ? (
        <div className="space-y-3">
          {reports.map((report) => (
            <Card key={report.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  onClick={() => {
                    if (selectedReport === report.id) {
                      setSelectedReport(null);
                      setShowAccounts(false);
                    } else {
                      setSelectedReport(report.id);
                      setShowAccounts(true);
                    }
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-slate-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded-full ${bureauColor(
                            report.bureau
                          )}`}
                        >
                          {report.bureau.charAt(0).toUpperCase() +
                            report.bureau.slice(1)}
                        </span>
                        <span className="text-xs text-slate-400">
                          {new Date(report.reportDate).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white mt-1">
                        Score: {report.score || "N/A"} |{" "}
                        {report.totalAccounts || 0} accounts |{" "}
                        {report.negativeAccounts || 0} negative |{" "}
                        {report.inquiries || 0} inquiries
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteReport.mutate({ id: report.id });
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                    {selectedReport === report.id ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </div>

                {/* Accounts detail */}
                {showAccounts && selectedReport === report.id && (
                  <div className="border-t border-slate-200 dark:border-slate-700 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                        Accounts in this Report
                      </h3>
                      <Link to="/disputes">
                        <Button size="sm" variant="outline" className="gap-1">
                          <Plus className="w-3 h-3" />
                          Add Account & Dispute
                        </Button>
                      </Link>
                    </div>
                    {reportWithAccounts?.accounts &&
                    reportWithAccounts.accounts.length > 0 ? (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Account</TableHead>
                              <TableHead>Type</TableHead>
                              <TableHead>Balance</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Negative</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {reportWithAccounts.accounts.map((account) => (
                              <TableRow key={account.id}>
                                <TableCell className="font-medium text-sm">
                                  {account.accountName}
                                  {account.accountNumber && (
                                    <span className="text-xs text-slate-400 block">
                                      ...{account.accountNumber.slice(-4)}
                                    </span>
                                  )}
                                </TableCell>
                                <TableCell className="text-sm capitalize">
                                  {account.accountType.replace("_", " ")}
                                </TableCell>
                                <TableCell className="text-sm">
                                  {account.balance
                                    ? `$${Number(account.balance).toLocaleString()}`
                                    : "—"}
                                </TableCell>
                                <TableCell>
                                  <span
                                    className={`text-xs px-2 py-0.5 rounded-full ${
                                      account.status === "open"
                                        ? "bg-blue-50 text-blue-700"
                                        : account.status === "closed"
                                        ? "bg-slate-100 text-slate-600"
                                        : account.status === "collection"
                                        ? "bg-red-50 text-red-700"
                                        : "bg-amber-50 text-amber-700"
                                    }`}
                                  >
                                    {account.status}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  {account.isNegative ? (
                                    <div className="flex items-center gap-1 text-red-600">
                                      <AlertTriangle className="w-3.5 h-3.5" />
                                      <span className="text-xs">
                                        {account.negativeReason || "Yes"}
                                      </span>
                                    </div>
                                  ) : (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="text-center py-6 text-slate-500">
                        <p className="text-sm">
                          No accounts in this report yet
                        </p>
                        <Link to="/disputes">
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2 gap-1"
                          >
                            <Plus className="w-3 h-3" />
                            Add Your First Account
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-1">
              No Credit Reports Yet
            </h3>
            <p className="text-sm text-slate-500 mb-4">
              Start by adding your first credit report to begin tracking
            </p>
            <Button
              onClick={() => setShowAddForm(true)}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Report
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

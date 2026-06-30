import { useState } from "react";
import { trpc } from "@/providers/trpc";
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
import { Switch } from "@/components/ui/switch";
import {
  Building2,
  Plus,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Search,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

export default function Creditors() {
  const utils = trpc.useUtils();
  const { data: creditors, isLoading } = trpc.creditor.list.useQuery();
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    phone: "",
    fax: "",
    email: "",
    website: "",
    isCollectionAgency: false,
    originalCreditor: "",
    accountNumber: "",
    contactPerson: "",
    notes: "",
  });

  const createCreditor = trpc.creditor.create.useMutation({
    onSuccess: () => {
      utils.creditor.list.invalidate();
      setShowAddForm(false);
      toast.success("Creditor added");
      resetForm();
    },
  });

  const updateCreditor = trpc.creditor.update.useMutation({
    onSuccess: () => {
      utils.creditor.list.invalidate();
      setEditingId(null);
      toast.success("Creditor updated");
    },
  });

  const deleteCreditor = trpc.creditor.delete.useMutation({
    onSuccess: () => {
      utils.creditor.list.invalidate();
      toast.success("Creditor deleted");
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      phone: "",
      fax: "",
      email: "",
      website: "",
      isCollectionAgency: false,
      originalCreditor: "",
      accountNumber: "",
      contactPerson: "",
      notes: "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateCreditor.mutate({ id: editingId, ...formData });
    } else {
      createCreditor.mutate(formData);
    }
  };

  const startEdit = (creditor: NonNullable<typeof creditors>[0]) => {
    setFormData({
      name: creditor.name,
      address: creditor.address || "",
      city: creditor.city || "",
      state: creditor.state || "",
      zipCode: creditor.zipCode || "",
      phone: creditor.phone || "",
      fax: creditor.fax || "",
      email: creditor.email || "",
      website: creditor.website || "",
      isCollectionAgency: creditor.isCollectionAgency || false,
      originalCreditor: creditor.originalCreditor || "",
      accountNumber: creditor.accountNumber || "",
      contactPerson: creditor.contactPerson || "",
      notes: creditor.notes || "",
    });
    setEditingId(creditor.id);
    setShowAddForm(true);
  };

  const filteredCreditors = creditors?.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.originalCreditor?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.accountNumber?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Creditors & Furnishers
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage creditor contact information for disputes
          </p>
        </div>
        <Dialog
          open={showAddForm}
          onOpenChange={(open) => {
            setShowAddForm(open);
            if (!open) {
              setEditingId(null);
              resetForm();
            }
          }}
        >
          <DialogTrigger asChild>
            <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700">
              <Plus className="w-4 h-4" />
              Add Creditor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Edit Creditor" : "Add New Creditor"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactPerson">Contact Person</Label>
                  <Input
                    id="contactPerson"
                    value={formData.contactPerson}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contactPerson: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) =>
                      setFormData({ ...formData, state: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zipCode">ZIP</Label>
                  <Input
                    id="zipCode"
                    value={formData.zipCode}
                    onChange={(e) =>
                      setFormData({ ...formData, zipCode: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fax">Fax</Label>
                  <Input
                    id="fax"
                    value={formData.fax}
                    onChange={(e) =>
                      setFormData({ ...formData, fax: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={formData.website}
                    onChange={(e) =>
                      setFormData({ ...formData, website: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="originalCreditor">Original Creditor</Label>
                  <Input
                    id="originalCreditor"
                    value={formData.originalCreditor}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        originalCreditor: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accountNumber">Account Number</Label>
                  <Input
                    id="accountNumber"
                    value={formData.accountNumber}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        accountNumber: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  id="isCollectionAgency"
                  checked={formData.isCollectionAgency}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      isCollectionAgency: checked,
                    })
                  }
                />
                <Label htmlFor="isCollectionAgency">
                  This is a Collection Agency
                </Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Input
                  id="notes"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700"
                disabled={createCreditor.isPending || updateCreditor.isPending}
              >
                {editingId
                  ? updateCreditor.isPending
                    ? "Updating..."
                    : "Update Creditor"
                  : createCreditor.isPending
                  ? "Adding..."
                  : "Add Creditor"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Search creditors by name, original creditor, or account number..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Creditors List */}
      {isLoading ? (
        <div className="text-center py-12 text-slate-500">Loading...</div>
      ) : filteredCreditors && filteredCreditors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCreditors.map((creditor) => (
            <Card key={creditor.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-emerald-600" />
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                        {creditor.name}
                      </h3>
                    </div>
                    {creditor.isCollectionAgency && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-red-50 text-red-700 mt-1">
                        Collection Agency
                      </span>
                    )}
                    {creditor.originalCreditor && (
                      <p className="text-xs text-slate-500 mt-1">
                        Original Creditor: {creditor.originalCreditor}
                      </p>
                    )}
                    <div className="mt-2 space-y-1">
                      {creditor.address && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <MapPin className="w-3 h-3" />
                          {creditor.address}
                          {creditor.city && `, ${creditor.city}`}
                          {creditor.state && `, ${creditor.state}`}
                          {creditor.zipCode && ` ${creditor.zipCode}`}
                        </div>
                      )}
                      {creditor.phone && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <Phone className="w-3 h-3" />
                          {creditor.phone}
                        </div>
                      )}
                      {creditor.email && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <Mail className="w-3 h-3" />
                          {creditor.email}
                        </div>
                      )}
                    </div>
                    {creditor.notes && (
                      <p className="text-xs text-slate-400 mt-2 italic">
                        {creditor.notes}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-1 ml-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => startEdit(creditor)}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => deleteCreditor.mutate({ id: creditor.id })}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-1">
              No Creditors Added
            </h3>
            <p className="text-sm text-slate-500 mb-4">
              Add creditor contact information to use in your dispute letters
            </p>
            <Button
              onClick={() => setShowAddForm(true)}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Creditor
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

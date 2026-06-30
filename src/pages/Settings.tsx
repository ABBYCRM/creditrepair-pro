import { useState, useEffect } from "react";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Shield,
  Save,
  Info,
  BookOpen,
  Scale,
} from "lucide-react";
import { toast } from "sonner";

export default function Settings() {
  const { user } = useAuth();
  const utils = trpc.useUtils();

  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    dateOfBirth: "",
    ssnLastFour: "",
  });

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        city: user.city || "",
        state: user.state || "",
        zipCode: user.zipCode || "",
        dateOfBirth: user.dateOfBirth
          ? new Date(user.dateOfBirth).toISOString().split("T")[0]
          : "",
        ssnLastFour: user.ssnLastFour || "",
      });
    }
  }, [user]);

  const updateProfile = trpc.auth.updateProfile.useMutation({
    onSuccess: () => {
      utils.auth.me.invalidate();
      toast.success("Profile updated successfully");
    },
    onError: () => {
      toast.error("Failed to update profile");
    },
  });

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate({
      name: profileForm.name || undefined,
      email: profileForm.email || undefined,
      phone: profileForm.phone || undefined,
      address: profileForm.address || undefined,
      city: profileForm.city || undefined,
      state: profileForm.state || undefined,
      zipCode: profileForm.zipCode || undefined,
      dateOfBirth: profileForm.dateOfBirth || undefined,
      ssnLastFour: profileForm.ssnLastFour || undefined,
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Settings
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage your profile, preferences, and learn about credit repair
        </p>
      </div>

      <Tabs defaultValue="profile">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="profile" className="gap-2">
            <User className="w-4 h-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="education" className="gap-2">
            <BookOpen className="w-4 h-4" />
            Education
          </TabsTrigger>
          <TabsTrigger value="rights" className="gap-2">
            <Scale className="w-4 h-4" />
            Your Rights
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-emerald-600" />
                Personal Information
              </CardTitle>
              <CardDescription>
                This information is used to generate your dispute letters. Make
                sure it's accurate.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={profileForm.name}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          name: e.target.value,
                        })
                      }
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileForm.email}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          email: e.target.value,
                        })
                      }
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={profileForm.phone}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          phone: e.target.value,
                        })
                      }
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={profileForm.dateOfBirth}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          dateOfBirth: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Street Address</Label>
                  <Input
                    id="address"
                    value={profileForm.address}
                    onChange={(e) =>
                      setProfileForm({
                        ...profileForm,
                        address: e.target.value,
                      })
                    }
                    placeholder="123 Main Street"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={profileForm.city}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          city: e.target.value,
                        })
                      }
                      placeholder="New York"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={profileForm.state}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          state: e.target.value,
                        })
                      }
                      placeholder="NY"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">ZIP Code</Label>
                    <Input
                      id="zipCode"
                      value={profileForm.zipCode}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          zipCode: e.target.value,
                        })
                      }
                      placeholder="10001"
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="ssnLastFour">
                    SSN Last 4 Digits (optional, used in letters)
                  </Label>
                  <Input
                    id="ssnLastFour"
                    value={profileForm.ssnLastFour}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "").slice(0, 4);
                      setProfileForm({
                        ...profileForm,
                        ssnLastFour: val,
                      });
                    }}
                    placeholder="6789"
                    maxLength={4}
                  />
                  <p className="text-xs text-slate-500">
                    Only the last 4 digits are used in dispute letters for
                    identification purposes.
                  </p>
                </div>

                <Button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 gap-2"
                  disabled={updateProfile.isPending}
                >
                  <Save className="w-4 h-4" />
                  {updateProfile.isPending ? "Saving..." : "Save Profile"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Education Tab */}
        <TabsContent value="education" className="mt-6 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-600" />
                Credit Repair Education
              </CardTitle>
              <CardDescription>
                Learn the fundamentals of credit repair and how to use this
                platform effectively.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                {
                  title: "How Credit Repair Works",
                  content:
                    "Credit repair is the process of identifying and disputing inaccurate, unverifiable, or outdated information on your credit reports. Under the Fair Credit Reporting Act (FCRA), you have the right to dispute any information you believe is incorrect. Credit bureaus must investigate within 30 days (or 45 days in some cases) and remove information they cannot verify.",
                },
                {
                  title: "The Dispute Process Timeline",
                  content:
                    "1. Identify errors on your credit report\n2. File a dispute with the credit bureau(s)\n3. Bureau investigates within 30 days\n4. Bureau contacts the data furnisher\n5. You receive results of the investigation\n6. If verified, you can escalate with follow-up disputes\n7. If not verified, the item must be deleted\n\nMultiple rounds of disputes may be needed. Each round should use a different strategy.",
                },
                {
                  title: "Types of Dispute Letters",
                  content:
                    "General Dispute: Basic letter requesting investigation of errors.\n\nFCRA Section 609: Requests the credit bureau verify the source of information and provide original documentation. If they cannot verify, the item must be removed.\n\nFCRA Section 611: Follow-up letter asking for the method of verification used after a bureau claims an item was verified.\n\nFCRA Section 623: Direct dispute sent to the data furnisher (creditor/collector) rather than the bureau, requiring them to investigate.\n\nDebt Validation (FDCPA 809): Sent to debt collectors requiring them to prove you owe the debt before they can continue collection efforts.",
                },
                {
                  title: "Best Practices",
                  content:
                    "- Always send letters via certified mail with return receipt requested\n- Keep copies of everything you send\n- Never dispute accurate positive information\n- Space disputes 30-45 days apart\n- Follow up if you don't receive a response within 45 days\n- Check all three bureaus - they don't share information\n- Track statute of limitations on debts (varies by state, typically 3-7 years)\n- Document everything for potential legal action",
                },
                {
                  title: "What NOT to Do",
                  content:
                    "- Don't dispute accurate information hoping it will be removed\n- Don't use online dispute forms (waives some rights)\n- Don't admit to owing a debt when disputing\n- Don't make payments on old debts without validating first\n- Don't ignore responses from credit bureaus\n- Don't send disputes too frequently (can be marked frivolous)\n- Don't forget to follow up on disputes",
                },
              ].map((section, idx) => (
                <div key={idx} className="border rounded-lg p-4">
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                    {section.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-line">
                    {section.content}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rights Tab */}
        <TabsContent value="rights" className="mt-6 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-emerald-600" />
                Your Legal Rights
              </CardTitle>
              <CardDescription>
                Federal laws protect your rights as a consumer in credit
                reporting and debt collection.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                {
                  law: "Fair Credit Reporting Act (FCRA)",
                  description:
                    "The primary federal law governing credit reporting. Key rights include:",
                  rights: [
                    "Right to a free credit report annually from each bureau (AnnualCreditReport.com)",
                    "Right to dispute inaccurate or incomplete information",
                    "Credit bureaus must investigate within 30 days (45 days for certain disputes)",
                    "Right to know who has accessed your credit report",
                    "Right to have outdated negative information removed (typically 7 years, 10 for bankruptcy)",
                    "Right to place fraud alerts and credit freezes",
                    "Right to sue for damages (up to $1,000 statutory + actual damages + attorney fees) for willful non-compliance",
                    "Right to seek damages for negligent non-compliance",
                  ],
                },
                {
                  law: "Fair Debt Collection Practices Act (FDCPA)",
                  description:
                    "Protects consumers from abusive debt collection practices. Key rights include:",
                  rights: [
                    "Right to request debt validation within 30 days of first contact",
                    "Collector must cease collection until validation is provided",
                    "Right to demand collector stop contacting you (cease and desist)",
                    "Prohibition on harassment, threats, and abusive language",
                    "Prohibition on calling at unreasonable hours (before 8am or after 9pm)",
                    "Prohibition on contacting you at work if you request they stop",
                    "Prohibition on discussing your debt with third parties",
                    "Right to sue for violations ($1,000 statutory damages + actual damages + attorney fees)",
                  ],
                },
                {
                  law: "Credit Repair Organizations Act (CROA)",
                  description:
                    "Regulates credit repair companies. Key protections include:",
                  rights: [
                    "Prohibition on charging fees before services are performed",
                    "Requirement for a written contract with specific disclosures",
                    "Right to cancel within 3 business days without charge",
                    "Prohibition on making false claims about services",
                    "Prohibition on creating a new identity to hide bad credit",
                    "Requirement to provide Consumer Credit File Rights statement",
                  ],
                },
                {
                  law: "Statute of Limitations on Debt",
                  description:
                    "Each state has time limits for legal collection of debts:",
                  rights: [
                    "Once the statute expires, collectors cannot sue to collect",
                    "Making a payment can restart the clock in some states",
                    "Expired debts should not appear on credit reports after 7 years",
                    "Collectors must inform you if a debt is past the statute",
                    "Threatening to sue on a time-barred debt is an FDCPA violation",
                  ],
                },
              ].map((section, idx) => (
                <div key={idx} className="border rounded-lg p-4">
                  <h3 className="font-semibold text-emerald-700 dark:text-emerald-400 mb-1">
                    {section.law}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                    {section.description}
                  </p>
                  <ul className="space-y-1.5">
                    {section.rights.map((right, ridx) => (
                      <li
                        key={ridx}
                        className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300"
                      >
                        <Shield className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                        {right}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <h3 className="font-semibold text-amber-800 dark:text-amber-400 mb-2 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Important Disclaimer
                </h3>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  This application is a tool to help you exercise your legal
                  rights in credit repair. It does not provide legal advice. For
                  complex cases, large debts, or if you are being sued, consult
                  with a consumer rights attorney. You can file complaints with
                  the Consumer Financial Protection Bureau (CFPB) at
                  consumerfinance.gov if credit bureaus or collectors violate
                  your rights.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

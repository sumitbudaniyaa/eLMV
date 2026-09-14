import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
  Building2,
  Plus,
  Search,
  MapPin,
  Mail,
  Users,
  Eye,
  EyeOff,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export function GatcAgencyManagementPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [formError, setFormError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    agencyName: "",
    accreditationNumber: "",
    notificationRefNumber: "",
    authorizedScope: ["NON_AUTOMATIC_WEIGHING_INSTRUMENT"],
    validUntil: "2028-12-31T00:00:00.000Z",
    district: "Jaipur",
    state: "Rajasthan",
    address: "",
    adminName: "",
    adminEmail: "",
    adminPhone: "",
    adminPassword: "",
  });

  const { data: agencies = [], isLoading } = useQuery({
    queryKey: ["gatcAgenciesList"],
    queryFn: async () => {
      const res = await api.get("/admin/gatc-agencies");
      return res.data.data;
    },
  });

  const createAgencyMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await api.post("/admin/gatc-agencies", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gatcAgenciesList"] });
      setModalOpen(false);
      setFormData({
        agencyName: "",
        accreditationNumber: "",
        notificationRefNumber: "",
        authorizedScope: ["NON_AUTOMATIC_WEIGHING_INSTRUMENT"],
        validUntil: "2028-12-31T00:00:00.000Z",
        district: "Jaipur",
        state: "Rajasthan",
        address: "",
        adminName: "",
        adminEmail: "",
        adminPhone: "",
        adminPassword: "",
      });
      setFormError("");
    },
    onError: (err: any) => {
      setFormError(err.response?.data?.error?.message || "Failed to provision GATC Agency.");
    },
  });

  const filteredAgencies = agencies.filter((a: any) => {
    const q = search.toLowerCase();
    return (
      a.agencyName?.toLowerCase().includes(q) ||
      a.accreditationNumber?.toLowerCase().includes(q) ||
      a.district?.toLowerCase().includes(q) ||
      a.user?.name?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-lg border border-border bg-card shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-foreground">Government Approved Test Centres (GATC)</h1>
            <Badge variant="outline" className="text-[10px] font-semibold">
              {agencies.length} Accredited Agencies
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Institutional laboratory testing centers accredited under NABL guidelines and notified under Section 14 & Rule 14.
          </p>
        </div>

        <Button
          onClick={() => setModalOpen(true)}
          className="h-8 text-xs font-semibold shrink-0"
        >
          <Plus className="h-3.5 w-3.5 mr-1" />
          Provision GATC Agency
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search by agency name, NABL #, or district..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 text-xs font-mono"
          />
        </div>
      </div>

      {/* Agencies Table */}
      <Card className="shadow-2xs">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/40 text-muted-foreground font-medium border-b border-border">
                <tr>
                  <th className="p-3 font-medium">Agency & Lab Name</th>
                  <th className="p-3 font-medium">Accreditation Details</th>
                  <th className="p-3 font-medium">Authorized Scopes</th>
                  <th className="p-3 font-medium">Agency Head & Contact</th>
                  <th className="p-3 font-medium">Field Inspectors</th>
                  <th className="p-3 font-medium text-right">Validity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                      Loading accredited agencies...
                    </td>
                  </tr>
                ) : filteredAgencies.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                      No GATC agencies found.
                    </td>
                  </tr>
                ) : (
                  filteredAgencies.map((a: any) => (
                    <tr key={a.id} className="hover:bg-muted/20 transition-colors">
                      <td className="p-3 font-medium text-foreground">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                            <Building2 className="h-3.5 w-3.5" />
                          </div>
                          <div>
                            <p className="font-bold text-foreground leading-tight">{a.agencyName}</p>
                            <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                              <MapPin className="h-2.5 w-2.5" />
                              <span>{a.district}, {a.state}</span>
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 space-y-0.5">
                        <p className="font-mono font-semibold text-foreground">{a.accreditationNumber}</p>
                        {a.notificationRefNumber && (
                          <p className="text-[10px] text-muted-foreground">{a.notificationRefNumber}</p>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {a.authorizedScope?.map((s: string) => (
                            <Badge key={s} variant="outline" className="text-[9px] px-1 py-0 bg-muted/30">
                              {s.replace(/_/g, " ")}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="p-3 space-y-0.5">
                        <p className="font-medium text-foreground">{a.user?.name}</p>
                        <p className="text-muted-foreground text-[11px] flex items-center gap-1">
                          <Mail className="h-2.5 w-2.5" />
                          <span>{a.user?.email}</span>
                        </p>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1 font-mono">
                          <Users className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="font-bold text-foreground">{a._count?.inspectors || 0}</span>
                          <span className="text-[10px] text-muted-foreground">inspectors</span>
                        </div>
                      </td>
                      <td className="p-3 text-right">
                        <Badge variant="default" className="text-[10px] bg-emerald-600 font-mono">
                          Valid: {new Date(a.validUntil).toLocaleDateString()}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Provision GATC Agency Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold">Provision GATC Agency Account</DialogTitle>
            <DialogDescription className="text-xs">
              Register an institutional laboratory testing center and create its agency administrative credentials.
            </DialogDescription>
          </DialogHeader>

          {formError && (
            <div className="p-2.5 rounded bg-destructive/10 border border-destructive/30 text-destructive text-xs">
              {formError}
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              createAgencyMutation.mutate(formData);
            }}
            className="space-y-3 pt-2"
          >
            <div>
              <label className="text-xs font-semibold text-foreground">Agency / Laboratory Name *</label>
              <Input
                required
                placeholder="e.g. Apex Precision Metrology & Calibration Labs Ltd."
                value={formData.agencyName}
                onChange={(e) => setFormData({ ...formData, agencyName: e.target.value })}
                className="text-xs mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-semibold text-foreground">NABL Accreditation # *</label>
                <Input
                  required
                  placeholder="NABL-LM-RJ-2026-..."
                  value={formData.accreditationNumber}
                  onChange={(e) => setFormData({ ...formData, accreditationNumber: e.target.value })}
                  className="text-xs font-mono mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground">Gazette Notification Ref</label>
                <Input
                  placeholder="GOI-DOCA-LM/..."
                  value={formData.notificationRefNumber}
                  onChange={(e) => setFormData({ ...formData, notificationRefNumber: e.target.value })}
                  className="text-xs font-mono mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-semibold text-foreground">District *</label>
                <Input
                  required
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  className="text-xs mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground">State *</label>
                <Input
                  required
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="text-xs mt-1"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground">Laboratory Address *</label>
              <Input
                required
                placeholder="e.g. Plot 12, Sitapura Industrial Area"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="text-xs mt-1"
              />
            </div>

            <div className="border-t border-border pt-2">
              <p className="text-xs font-bold text-foreground mb-2">Agency Admin Login Credentials</p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-muted-foreground">Admin Head Name *</label>
                  <Input
                    required
                    placeholder="e.g. Dr. Vikram Seth"
                    value={formData.adminName}
                    onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                    className="text-xs mt-1"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-muted-foreground">Admin Email *</label>
                  <Input
                    required
                    type="email"
                    placeholder="gatc.lead@lab.org"
                    value={formData.adminEmail}
                    onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                    className="text-xs mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-2">
                <div>
                  <label className="text-[11px] text-muted-foreground">Admin Mobile *</label>
                  <Input
                    required
                    type="tel"
                    maxLength={10}
                    placeholder="10-digit mobile"
                    value={formData.adminPhone}
                    onChange={(e) => setFormData({ ...formData, adminPhone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                    className="text-xs mt-1"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-muted-foreground">Admin Password *</label>
                  <div className="relative mt-1">
                    <Input
                      required
                      type={showPassword ? "text" : "password"}
                      value={formData.adminPassword}
                      placeholder="Enter password (min. 8 characters)"
                      onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
                      className="text-xs pr-8"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 focus:outline-none"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setModalOpen(false)}
                className="text-xs h-8"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={createAgencyMutation.isPending}
                className="text-xs h-8 font-semibold"
              >
                {createAgencyMutation.isPending ? "Provisioning..." : "Provision GATC Agency"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

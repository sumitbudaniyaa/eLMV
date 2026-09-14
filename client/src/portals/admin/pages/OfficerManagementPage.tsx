import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
  UserCheck,
  Plus,
  Search,
  MapPin,
  Mail,
  Phone,
  Eye,
  EyeOff,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export function OfficerManagementPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [formError, setFormError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    badgeNumber: "",
    jurisdictionDistrict: "Jaipur",
    jurisdictionState: "Rajasthan",
    jurisdictionZone: "North Zone",
    officeAddress: "",
  });

  const { data: officers = [], isLoading } = useQuery({
    queryKey: ["officersList"],
    queryFn: async () => {
      const res = await api.get("/admin/officers");
      return res.data.data;
    },
  });

  const createOfficerMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await api.post("/admin/officers", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["officersList"] });
      setModalOpen(false);
      setFormData({
        name: "",
        email: "",
        phone: "",
        password: "",
        badgeNumber: "",
        jurisdictionDistrict: "Jaipur",
        jurisdictionState: "Rajasthan",
        jurisdictionZone: "North Zone",
        officeAddress: "",
      });
      setFormError("");
    },
    onError: (err: any) => {
      setFormError(err.response?.data?.error?.message || "Failed to provision officer.");
    },
  });

  const filteredOfficers = officers.filter((o: any) => {
    const q = search.toLowerCase();
    return (
      o.name?.toLowerCase().includes(q) ||
      o.officerProfile?.badgeNumber?.toLowerCase().includes(q) ||
      o.officerProfile?.jurisdictionDistrict?.toLowerCase().includes(q) ||
      o.email?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-lg border border-border bg-card shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-foreground">Legal Metrology Officers (LMO) Roster</h1>
            <Badge variant="outline" className="text-[10px] font-semibold">
              {officers.length} Active Officers
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Official statutory verification and enforcement officers appointed under Section 14 of the Legal Metrology Act, 2009.
          </p>
        </div>

        <Button
          onClick={() => setModalOpen(true)}
          className="h-8 text-xs font-semibold shrink-0"
        >
          <Plus className="h-3.5 w-3.5 mr-1" />
          Provision New Officer
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search by badge, name, or district..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 text-xs font-mono"
          />
        </div>
      </div>

      {/* Officers Table */}
      <Card className="shadow-2xs">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/40 text-muted-foreground font-medium border-b border-border">
                <tr>
                  <th className="p-3 font-medium">Badge Number</th>
                  <th className="p-3 font-medium">Officer Name</th>
                  <th className="p-3 font-medium">District & Jurisdiction</th>
                  <th className="p-3 font-medium">Contact Details</th>
                  <th className="p-3 font-medium">Status</th>
                  <th className="p-3 font-medium text-right">Throughput</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                      Loading registered officers...
                    </td>
                  </tr>
                ) : filteredOfficers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                      No officers found matching search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredOfficers.map((o: any) => (
                    <tr key={o.id} className="hover:bg-muted/20 transition-colors">
                      <td className="p-3 font-mono font-bold text-foreground">
                        {o.officerProfile?.badgeNumber || "PENDING"}
                      </td>
                      <td className="p-3 font-medium text-foreground">
                        <div className="flex items-center gap-1.5">
                          <UserCheck className="h-3.5 w-3.5 text-primary shrink-0" />
                          <span>{o.name}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <MapPin className="h-3 w-3 shrink-0" />
                          <span>{o.officerProfile?.jurisdictionDistrict}, {o.officerProfile?.jurisdictionState}</span>
                          {o.officerProfile?.jurisdictionZone && (
                            <span className="text-[10px] text-zinc-500">({o.officerProfile.jurisdictionZone})</span>
                          )}
                        </div>
                      </td>
                      <td className="p-3 space-y-0.5">
                        <p className="text-muted-foreground flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          <span>{o.email}</span>
                        </p>
                        <p className="text-muted-foreground flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          <span>{o.phone}</span>
                        </p>
                      </td>
                      <td className="p-3">
                        <Badge variant="default" className="text-[10px] bg-emerald-600">
                          Active Commission
                        </Badge>
                      </td>
                      <td className="p-3 text-right font-mono">
                        <span className="font-semibold text-foreground">{o._count?.inspections || 0}</span>
                        <span className="text-muted-foreground ml-1">inspections</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Provision Officer Modal Dialog */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold">Provision Legal Metrology Officer</DialogTitle>
            <DialogDescription className="text-xs">
              Appoint an official enforcement officer and assign territorial inspection jurisdiction.
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
              createOfficerMutation.mutate(formData);
            }}
            className="space-y-3 pt-2"
          >
            <div>
              <label className="text-xs font-semibold text-foreground">Officer Full Name *</label>
              <Input
                required
                placeholder="e.g. Inspector Sunita Verma"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="text-xs mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-semibold text-foreground">Official Email *</label>
                <Input
                  required
                  type="email"
                  placeholder="lmo.name@metrology.gov.in"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="text-xs mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground">Phone Number *</label>
                <Input
                  required
                  type="tel"
                  maxLength={10}
                  placeholder="10-digit mobile"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                  className="text-xs mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-semibold text-foreground">Statutory Badge # *</label>
                <Input
                  required
                  placeholder="e.g. RJ-LMO-2026-092"
                  value={formData.badgeNumber}
                  onChange={(e) => setFormData({ ...formData, badgeNumber: e.target.value })}
                  className="text-xs font-mono mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground">Password *</label>
                <div className="relative mt-1">
                  <Input
                    required
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    placeholder="Enter password (min. 8 characters)"
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-xs font-semibold text-foreground">District *</label>
                <Input
                  required
                  value={formData.jurisdictionDistrict}
                  onChange={(e) => setFormData({ ...formData, jurisdictionDistrict: e.target.value })}
                  className="text-xs mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground">State *</label>
                <Input
                  required
                  value={formData.jurisdictionState}
                  onChange={(e) => setFormData({ ...formData, jurisdictionState: e.target.value })}
                  className="text-xs mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground">Zone</label>
                <Input
                  value={formData.jurisdictionZone}
                  onChange={(e) => setFormData({ ...formData, jurisdictionZone: e.target.value })}
                  className="text-xs mt-1"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground">Sub-Divisional Office Address</label>
              <Input
                placeholder="e.g. Legal Metrology Bhavan, Station Road"
                value={formData.officeAddress}
                onChange={(e) => setFormData({ ...formData, officeAddress: e.target.value })}
                className="text-xs mt-1"
              />
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
                disabled={createOfficerMutation.isPending}
                className="text-xs h-8 font-semibold"
              >
                {createOfficerMutation.isPending ? "Provisioning..." : "Appoint & Save Officer"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

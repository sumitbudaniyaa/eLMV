import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import {
  UserCheck,
  Plus,
  Search,
  Mail,
  Phone,
  Briefcase,
  Eye,
  EyeOff,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export function GatcStaffPage() {
  const { user } = useAuth();
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
    employeeId: "",
    designation: "",
    qualificationRef: "",
  });

  const { data: inspectors = [], isLoading } = useQuery({
    queryKey: ["gatcInspectorsList"],
    queryFn: async () => {
      const res = await api.get("/gatc/inspectors");
      return res.data.data;
    },
  });

  const createInspectorMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await api.post("/gatc/inspectors", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gatcInspectorsList"] });
      setModalOpen(false);
      setFormData({
        name: "",
        email: "",
        phone: "",
        password: "",
        employeeId: "",
        designation: "",
        qualificationRef: "",
      });
      setFormError("");
    },
    onError: (err: any) => {
      setFormError(err.response?.data?.error?.message || "Failed to register field inspector.");
    },
  });

  const filtered = inspectors.filter((i: any) => {
    const q = search.toLowerCase();
    return (
      i.user?.name?.toLowerCase().includes(q) ||
      i.employeeId?.toLowerCase().includes(q) ||
      i.user?.email?.toLowerCase().includes(q) ||
      i.designation?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-lg border border-border bg-card shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-foreground">Field Inspectors & Testing Staff</h1>
            <Badge variant="outline" className="text-[10px] font-semibold">
              {inspectors.length} Registered Inspectors
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Technical calibration engineers authorized to conduct laboratory verification and on-site testing under {user?.gatcProfile?.agencyName || "this Agency"}.
          </p>
        </div>

        <Button
          onClick={() => setModalOpen(true)}
          className="h-8 text-xs font-semibold shrink-0"
        >
          <Plus className="h-3.5 w-3.5 mr-1" />
          Add Field Inspector
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search by name, employee ID, or designation..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 text-xs font-mono"
          />
        </div>
      </div>

      {/* Inspectors Table */}
      <Card className="shadow-2xs">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/40 text-muted-foreground font-medium border-b border-border">
                <tr>
                  <th className="p-3 font-medium">Staff ID</th>
                  <th className="p-3 font-medium">Inspector Name</th>
                  <th className="p-3 font-medium">Designation & Qualification</th>
                  <th className="p-3 font-medium">Contact</th>
                  <th className="p-3 font-medium">Status</th>
                  <th className="p-3 font-medium text-right">Tests Conducted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                      Loading staff roster...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                      No field inspectors registered yet. Click "Add Field Inspector" to provision testing staff.
                    </td>
                  </tr>
                ) : (
                  filtered.map((item: any) => (
                    <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                      <td className="p-3 font-mono font-bold text-foreground">
                        {item.employeeId}
                      </td>
                      <td className="p-3 font-medium text-foreground">
                        <div className="flex items-center gap-1.5">
                          <UserCheck className="h-3.5 w-3.5 text-primary shrink-0" />
                          <span>{item.user?.name}</span>
                        </div>
                      </td>
                      <td className="p-3 space-y-0.5">
                        <p className="text-foreground font-medium flex items-center gap-1">
                          <Briefcase className="h-3 w-3 text-muted-foreground" />
                          <span>{item.designation || "Testing Engineer"}</span>
                        </p>
                        {item.qualificationRef && (
                          <p className="text-[10px] text-muted-foreground">{item.qualificationRef}</p>
                        )}
                      </td>
                      <td className="p-3 space-y-0.5">
                        <p className="text-muted-foreground flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          <span>{item.user?.email}</span>
                        </p>
                        <p className="text-muted-foreground flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          <span>{item.user?.phone}</span>
                        </p>
                      </td>
                      <td className="p-3">
                        <Badge variant="default" className="text-[10px] bg-emerald-600">
                          Active Staff
                        </Badge>
                      </td>
                      <td className="p-3 text-right font-mono font-semibold text-foreground">
                        {item.user?._count?.inspections || 0}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add Field Inspector Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold">Register GATC Field Inspector</DialogTitle>
            <DialogDescription className="text-xs">
              Provision testing staff credentials. The inspector will be authorized to record observations under this Agency.
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
              createInspectorMutation.mutate(formData);
            }}
            className="space-y-3 pt-2"
          >
            <div>
              <label className="text-xs font-semibold text-foreground">Full Name *</label>
              <Input
                required
                placeholder="e.g. Rahul Verma"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="text-xs mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-semibold text-foreground">Staff / Employee ID *</label>
                <Input
                  required
                  placeholder="APEX-INSP-041-..."
                  value={formData.employeeId}
                  onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
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

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-semibold text-foreground">Email Address *</label>
                <Input
                  required
                  type="email"
                  placeholder="inspector@lab.org"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="text-xs mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground">Mobile Phone *</label>
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

            <div>
              <label className="text-xs font-semibold text-foreground">Technical Designation</label>
              <Input
                placeholder="Senior Calibration & Testing Engineer"
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                className="text-xs mt-1"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground">NABL / Metrology Qualification Ref</label>
              <Input
                placeholder="e.g. NABL-CAL-MET-2022-881"
                value={formData.qualificationRef}
                onChange={(e) => setFormData({ ...formData, qualificationRef: e.target.value })}
                className="text-xs font-mono mt-1"
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
                disabled={createInspectorMutation.isPending}
                className="text-xs h-8 font-semibold"
              >
                {createInspectorMutation.isPending ? "Creating Account..." : "Save Field Inspector"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

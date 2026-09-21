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
  Edit2,
  ShieldCheck,
  Scale,
  Gauge,
  Fuel,
  Ruler,
  FlaskConical,
  Compass,
  Check,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export const STATUTORY_GATC_SCOPES = [
  {
    id: "NON_AUTOMATIC_WEIGHING_INSTRUMENT",
    label: "Non-Automatic Weighing Instruments (NAWI)",
    category: "Weighing",
    icon: Scale,
    description: "Counter scales, platform balances, weighbridges, electronic precision balances",
  },
  {
    id: "AUTOMATIC_WEIGHING_INSTRUMENT",
    label: "Automatic Weighing Instruments (AWI)",
    category: "Weighing",
    icon: Gauge,
    description: "Belt weighers, automatic gravimetric filling instruments, catchweighers",
  },
  {
    id: "FUEL_DISPENSER",
    label: "Fuel & Flow Dispensers",
    category: "Flow & Volume",
    icon: Fuel,
    description: "Petrol/diesel dispensing units, CNG dispensers, mass flow meters",
  },
  {
    id: "STORAGE_TANK",
    label: "Storage Tanks & Vats",
    category: "Bulk Storage",
    icon: Building2,
    description: "Bulk petroleum storage tanks, calibration dipsticks, volumetric proving tanks",
  },
  {
    id: "LENGTH_MEASURE",
    label: "Length & Linear Measures",
    category: "Linear & Dimension",
    icon: Ruler,
    description: "Steel tape measures, meter bars, linear fabric counters",
  },
  {
    id: "CAPACITY_MEASURE",
    label: "Capacity Measures",
    category: "Liquid Volume",
    icon: FlaskConical,
    description: "Conical dispensing measures, cylindrical standard volumetric measures",
  },
  {
    id: "OTHER",
    label: "Other Specialized Measures",
    category: "Specialized",
    icon: Compass,
    description: "Taxi meters, sound meters, clinical thermometers & specialized instruments",
  },
];

function ScopeSelector({
  selectedScopes,
  onChange,
}: {
  selectedScopes: string[];
  onChange: (scopes: string[]) => void;
}) {
  const toggleScope = (scopeId: string) => {
    if (selectedScopes.includes(scopeId)) {
      onChange(selectedScopes.filter((s) => s !== scopeId));
    } else {
      onChange([...selectedScopes, scopeId]);
    }
  };

  const selectAll = () => {
    onChange(STATUTORY_GATC_SCOPES.map((s) => s.id));
  };

  const clearAll = () => {
    onChange([]);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
          <div>
            <label className="text-xs font-bold text-foreground">
              Authorized Statutory Scopes (Rule 14) *
            </label>
            <p className="text-[11px] text-muted-foreground">
              Select all instrument classes this testing laboratory is accredited and notified to calibrate.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 self-start sm:self-center">
          <Badge
            variant={selectedScopes.length > 0 ? "default" : "outline"}
            className={`text-[10px] font-mono py-0.5 px-2 ${
              selectedScopes.length > 0 ? "bg-primary text-primary-foreground" : "text-muted-foreground"
            }`}
          >
            {selectedScopes.length} of {STATUTORY_GATC_SCOPES.length} Selected
          </Badge>
          <div className="flex items-center gap-1.5 text-xs">
            <button
              type="button"
              onClick={selectAll}
              className="text-xs font-semibold text-primary hover:underline px-1.5 py-0.5 rounded hover:bg-primary/5 transition-colors"
            >
              Select All
            </button>
            <span className="text-muted-foreground/40">•</span>
            <button
              type="button"
              onClick={clearAll}
              className="text-xs font-medium text-muted-foreground hover:text-foreground px-1.5 py-0.5 rounded hover:bg-muted/40 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {STATUTORY_GATC_SCOPES.map((scope) => {
          const isSelected = selectedScopes.includes(scope.id);
          const Icon = scope.icon;
          return (
            <div
              key={scope.id}
              onClick={() => toggleScope(scope.id)}
              className={`group relative flex flex-col justify-between p-3.5 rounded-xl border text-left cursor-pointer transition-all duration-200 select-none ${
                isSelected
                  ? "border-[#0B2545] dark:border-primary bg-[#0B2545]/[0.04] dark:bg-primary/[0.12] shadow-xs ring-1 ring-[#0B2545]/30 dark:ring-primary/40"
                  : "border-slate-200 dark:border-border/80 bg-white dark:bg-card hover:border-slate-300 dark:hover:border-border hover:bg-slate-50/50 dark:hover:bg-muted/20"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? "bg-[#0B2545] dark:bg-primary text-white"
                          : "bg-slate-100 dark:bg-muted text-slate-500 dark:text-muted-foreground group-hover:text-foreground"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <Badge
                      variant="outline"
                      className="text-[9px] font-mono px-1.5 py-0 bg-background/60 truncate"
                    >
                      {scope.category}
                    </Badge>
                  </div>
                  <div
                    className={`h-5 w-5 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                      isSelected
                        ? "bg-[#0B2545] dark:bg-primary text-white shadow-2xs"
                        : "border-2 border-slate-300 dark:border-muted-foreground/30 group-hover:border-slate-400"
                    }`}
                  >
                    {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                  </div>
                </div>

                <p className={`text-xs font-bold leading-tight ${isSelected ? "text-[#0B2545] dark:text-foreground" : "text-slate-800 dark:text-foreground/90"}`}>
                  {scope.label}
                </p>
                <p className="text-[11px] text-muted-foreground leading-relaxed mt-1 line-clamp-2">
                  {scope.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {selectedScopes.length === 0 && (
        <div className="p-2.5 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-1.5">
          <span>⚠️ At least one authorized statutory scope must be selected for accreditation compliance.</span>
        </div>
      )}
    </div>
  );
}

export function GatcAgencyManagementPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [formError, setFormError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingAgency, setEditingAgency] = useState<any | null>(null);
  const [editFormError, setEditFormError] = useState("");
  const [editFormData, setEditFormData] = useState({
    agencyName: "",
    notificationRefNumber: "",
    authorizedScope: [] as string[],
    validUntil: "",
    district: "",
    state: "",
    address: "",
  });

  const [formData, setFormData] = useState({
    agencyName: "",
    accreditationNumber: "",
    notificationRefNumber: "",
    authorizedScope: [] as string[],
    validUntil: "",
    district: "",
    state: "",
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
        authorizedScope: [] as string[],
        validUntil: "",
        district: "",
        state: "",
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

  const updateAgencyMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof editFormData }) => {
      const res = await api.patch(`/admin/gatc-agencies/${id}`, {
        ...data,
        validUntil: new Date(data.validUntil).toISOString(),
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gatcAgenciesList"] });
      setEditModalOpen(false);
      setEditingAgency(null);
      setEditFormError("");
    },
    onError: (err: any) => {
      setEditFormError(err.response?.data?.error?.message || "Failed to update GATC Agency.");
    },
  });

  const openEditModal = (agency: any) => {
    setEditingAgency(agency);
    setEditFormData({
      agencyName: agency.agencyName || "",
      notificationRefNumber: agency.notificationRefNumber || "",
      authorizedScope: (agency.authorizedScope && agency.authorizedScope.length > 0)
        ? agency.authorizedScope
        : ["NON_AUTOMATIC_WEIGHING_INSTRUMENT"],
      validUntil: agency.validUntil
        ? new Date(agency.validUntil).toISOString().slice(0, 10)
        : "2028-12-31",
      district: agency.district || "",
      state: agency.state || "",
      address: agency.address || "",
    });
    setEditFormError("");
    setEditModalOpen(true);
  };

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
                  <th className="p-3 font-medium">Validity</th>
                  <th className="p-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
                      Loading accredited agencies...
                    </td>
                  </tr>
                ) : filteredAgencies.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
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
                      <td className="p-3">
                        <Badge variant="default" className="text-[10px] bg-emerald-600 font-mono">
                          Valid: {new Date(a.validUntil).toLocaleDateString()}
                        </Badge>
                      </td>
                      <td className="p-3 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditModal(a)}
                          className="h-7 text-xs font-semibold"
                        >
                          <Edit2 className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
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
      <Dialog
        open={modalOpen}
        onOpenChange={setModalOpen}
        className="max-w-3xl sm:max-w-4xl max-h-[92vh] overflow-y-auto p-6 sm:p-7"
      >
        <DialogContent className="space-y-5 p-0">
          <DialogHeader className="pb-3 border-b border-border/80">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                <Building2 className="h-4 w-4" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-foreground">
                  Provision GATC Agency Account
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Register an accredited institutional laboratory testing center and configure its Rule 14 statutory testing scopes and administrative access.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {formError && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-xs">
              {formError}
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (formData.authorizedScope.length === 0) {
                setFormError("At least one authorized statutory scope must be selected.");
                return;
              }
              createAgencyMutation.mutate(formData);
            }}
            className="space-y-6 pt-1"
          >
            {/* Section 1: Laboratory Identity & Accreditation Details */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-primary" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  1. Laboratory Identity & Accreditation
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div className="sm:col-span-2 md:col-span-2 space-y-1.5">
                  <label className="text-xs font-semibold text-foreground h-5 flex items-center truncate">
                    Agency / Laboratory Name *
                  </label>
                  <Input
                    required
                    placeholder="e.g. Apex Precision Metrology & Calibration Labs Ltd."
                    value={formData.agencyName}
                    onChange={(e) => setFormData({ ...formData, agencyName: e.target.value })}
                    className="text-xs h-9"
                  />
                </div>
                <div className="sm:col-span-2 md:col-span-2 space-y-1.5">
                  <label className="text-xs font-semibold text-foreground h-5 flex items-center truncate">
                    NABL Accreditation # *
                  </label>
                  <Input
                    required
                    placeholder="NABL-LM-RJ-2026-..."
                    value={formData.accreditationNumber}
                    onChange={(e) => setFormData({ ...formData, accreditationNumber: e.target.value })}
                    className="text-xs font-mono h-9"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground h-5 flex items-center truncate">
                    Gazette Ref
                  </label>
                  <Input
                    placeholder="GOI-DOCA-LM/..."
                    value={formData.notificationRefNumber}
                    onChange={(e) => setFormData({ ...formData, notificationRefNumber: e.target.value })}
                    className="text-xs font-mono h-9"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground h-5 flex items-center truncate">
                    Valid Until *
                  </label>
                  <Input
                    required
                    type="date"
                    value={formData.validUntil}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                    className="text-xs font-mono h-9"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground h-5 flex items-center truncate">
                    District *
                  </label>
                  <Input
                    required
                    placeholder="e.g. Jaipur"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    className="text-xs h-9"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground h-5 flex items-center truncate">
                    State *
                  </label>
                  <Input
                    required
                    placeholder="e.g. Rajasthan"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="text-xs h-9"
                  />
                </div>

                <div className="col-span-1 sm:col-span-2 md:col-span-4 space-y-1.5">
                  <label className="text-xs font-semibold text-foreground h-5 flex items-center truncate">
                    Laboratory Premises / Industrial Area Address *
                  </label>
                  <Input
                    required
                    placeholder="e.g. Plot 12, Phase II, Sitapura Industrial Area, Jaipur"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="text-xs h-9"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Authorized Statutory Testing Scopes (Cards) */}
            <div className="pt-2 border-t border-border/70">
              <div className="flex items-center gap-2 mb-3">
                <span className="h-2 w-2 rounded-full bg-primary" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  2. Authorized Statutory Testing Scopes
                </h3>
              </div>
              <ScopeSelector
                selectedScopes={formData.authorizedScope}
                onChange={(scopes) => setFormData({ ...formData, authorizedScope: scopes })}
              />
            </div>

            {/* Section 3: Agency Administrative Credentials */}
            <div className="pt-2 border-t border-border/70">
              <div className="flex items-center gap-2 mb-3">
                <span className="h-2 w-2 rounded-full bg-primary" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  3. Agency Head Administrative Credentials
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground h-5 flex items-center truncate">
                    Director / Head Name *
                  </label>
                  <Input
                    required
                    placeholder="e.g. Dr. Vikram Seth"
                    value={formData.adminName}
                    onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                    className="text-xs h-9"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground h-5 flex items-center truncate">
                    Official Email *
                  </label>
                  <Input
                    required
                    type="email"
                    placeholder="gatc.lead@lab.org"
                    value={formData.adminEmail}
                    onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                    className="text-xs h-9"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground h-5 flex items-center truncate">
                    Contact Mobile *
                  </label>
                  <Input
                    required
                    type="tel"
                    maxLength={10}
                    placeholder="10-digit mobile"
                    value={formData.adminPhone}
                    onChange={(e) => setFormData({ ...formData, adminPhone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                    className="text-xs h-9"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground h-5 flex items-center truncate">
                    Admin Password *
                  </label>
                  <div className="relative">
                    <Input
                      required
                      type={showPassword ? "text" : "password"}
                      value={formData.adminPassword}
                      placeholder="Min. 8 characters"
                      onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
                      className="text-xs h-9 pr-8"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 focus:outline-none"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/80">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setModalOpen(false)}
                className="text-xs h-9 px-4"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={createAgencyMutation.isPending}
                className="text-xs h-9 px-5 font-semibold"
              >
                {createAgencyMutation.isPending ? "Provisioning..." : "Provision GATC Agency"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit GATC Agency Modal */}
      <Dialog
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        className="max-w-3xl sm:max-w-4xl max-h-[92vh] overflow-y-auto p-6 sm:p-7"
      >
        <DialogContent className="space-y-5 p-0">
          <DialogHeader className="pb-3 border-b border-border/80">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                <Edit2 className="h-4 w-4" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-foreground">
                  Edit GATC Agency & Authorized Statutory Scopes
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Update statutory authorized scopes, accreditation validity, and laboratory facility details for {editingAgency?.agencyName}.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {editFormError && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-xs">
              {editFormError}
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (editFormData.authorizedScope.length === 0) {
                setEditFormError("At least one authorized statutory scope must be selected.");
                return;
              }
              if (editingAgency) {
                updateAgencyMutation.mutate({ id: editingAgency.id, data: editFormData });
              }
            }}
            className="space-y-6 pt-1"
          >
            {/* Section 1: Laboratory Details */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-primary" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  1. Laboratory Identity & Accreditation
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div className="sm:col-span-2 md:col-span-2 space-y-1.5">
                  <label className="text-xs font-semibold text-foreground h-5 flex items-center truncate">
                    Agency / Laboratory Name *
                  </label>
                  <Input
                    required
                    value={editFormData.agencyName}
                    onChange={(e) => setEditFormData({ ...editFormData, agencyName: e.target.value })}
                    className="text-xs h-9"
                  />
                </div>
                <div className="sm:col-span-2 md:col-span-2 space-y-1.5">
                  <label className="text-xs font-semibold text-foreground h-5 flex items-center truncate">
                    NABL Accreditation # (Read-only)
                  </label>
                  <Input
                    disabled
                    value={editingAgency?.accreditationNumber || ""}
                    className="text-xs font-mono h-9 bg-muted/50 cursor-not-allowed"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground h-5 flex items-center truncate">
                    Gazette Ref
                  </label>
                  <Input
                    placeholder="GOI-DOCA-LM/..."
                    value={editFormData.notificationRefNumber}
                    onChange={(e) => setEditFormData({ ...editFormData, notificationRefNumber: e.target.value })}
                    className="text-xs font-mono h-9"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground h-5 flex items-center truncate">
                    Valid Until *
                  </label>
                  <Input
                    required
                    type="date"
                    value={editFormData.validUntil}
                    onChange={(e) => setEditFormData({ ...editFormData, validUntil: e.target.value })}
                    className="text-xs font-mono h-9"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground h-5 flex items-center truncate">
                    District *
                  </label>
                  <Input
                    required
                    placeholder="e.g. Jaipur"
                    value={editFormData.district}
                    onChange={(e) => setEditFormData({ ...editFormData, district: e.target.value })}
                    className="text-xs h-9"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground h-5 flex items-center truncate">
                    State *
                  </label>
                  <Input
                    required
                    placeholder="e.g. Rajasthan"
                    value={editFormData.state}
                    onChange={(e) => setEditFormData({ ...editFormData, state: e.target.value })}
                    className="text-xs h-9"
                  />
                </div>

                <div className="col-span-1 sm:col-span-2 md:col-span-4 space-y-1.5">
                  <label className="text-xs font-semibold text-foreground h-5 flex items-center truncate">
                    Laboratory Premises / Address *
                  </label>
                  <Input
                    required
                    value={editFormData.address}
                    onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                    className="text-xs h-9"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Authorized Statutory Testing Scopes (Cards) */}
            <div className="pt-2 border-t border-border/70">
              <div className="flex items-center gap-2 mb-3">
                <span className="h-2 w-2 rounded-full bg-primary" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  2. Authorized Statutory Testing Scopes
                </h3>
              </div>
              <ScopeSelector
                selectedScopes={editFormData.authorizedScope}
                onChange={(scopes) => setEditFormData({ ...editFormData, authorizedScope: scopes })}
              />
            </div>

            {/* Modal Actions Footer */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/80">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEditModalOpen(false)}
                className="text-xs h-9 px-4"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={updateAgencyMutation.isPending}
                className="text-xs h-9 px-5 font-semibold"
              >
                {updateAgencyMutation.isPending ? "Saving Changes..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

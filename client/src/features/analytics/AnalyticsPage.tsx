import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { api } from "@/lib/api";
import { ApiResponse, Role } from "@sih/shared";
import { useAuth } from "@/context/AuthContext";
import { formatDate } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  BarChart3,
  Clock,
  AlertTriangle,
  Users,
  MapPin,
  Scale,
  ShieldCheck,
} from "lucide-react";

// Light solid semantic status colors
const PENDENCY_COLORS: Record<string, string> = {
  "< 7 days": "#71717a",     // zinc-500
  "7-15 days": "#0284c7",    // sky-600
  "15-30 days": "#d97706",   // amber-600
  "> 30 days": "#e11d48",    // rose-600
};

export function AnalyticsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();

  // 1. Turnaround Time Query (Scoped by role & user)
  const { data: tatData, isLoading: tatLoading } = useQuery({
    queryKey: ["analytics", "turnaround-time", user?.id],
    queryFn: async () => {
      const res = await api.get<ApiResponse<any>>("/analytics/turnaround-time");
      return res.data?.data;
    },
  });

  // 2. Pendency Trends Query (Scoped by role & user)
  const { data: pendencyData, isLoading: pendencyLoading } = useQuery({
    queryKey: ["analytics", "pendency-trends", user?.id],
    queryFn: async () => {
      const res = await api.get<ApiResponse<any[]>>("/analytics/pendency-trends");
      return res.data?.data;
    },
  });

  // 3. Regional / Category Compliance Query (Scoped by role & user)
  const { data: regionalData, isLoading: regionalLoading } = useQuery({
    queryKey: ["analytics", "regional", user?.id],
    queryFn: async () => {
      const res = await api.get<ApiResponse<any[]>>("/analytics/regional");
      return res.data?.data;
    },
  });

  // 4. Officer Workload (Admin sees all officers; LMO & GATC see their own performance)
  const { data: workloadData, isLoading: workloadLoading } = useQuery({
    queryKey: ["analytics", "officer-workload", user?.id],
    queryFn: async () => {
      const res = await api.get<ApiResponse<any[]>>("/analytics/officer-workload");
      return res.data?.data;
    },
    enabled: user?.role === Role.ADMIN || user?.role === Role.LMO || user?.role === Role.GATC_ADMIN || user?.role === Role.GATC_INSPECTOR,
  });

  // 5. Consumer Equipment Inventory Query (Consumer-only)
  const { data: instrumentsData, isLoading: instrumentsLoading } = useQuery({
    queryKey: ["instruments", "analytics-list", user?.id],
    queryFn: async () => {
      const res = await api.get<ApiResponse<any[]>>("/instruments?limit=50");
      return res.data?.data || [];
    },
    enabled: user?.role === Role.CONSUMER,
  });

  const isLoading = tatLoading || pendencyLoading || regionalLoading;

  // Role-specific view configurations
  const roleConfigs: Record<Role, any> = {
    [Role.ADMIN]: {
      title: t("analytics.title", { defaultValue: "Statewide Analytics & BI" }),
      badge: t("analytics.overview", { defaultValue: "Statewide Command Overview" }),
      subtitle: t("analytics.subtitle", {
        defaultValue:
          "Consolidated state-level metrics tracking verification turnaround times, aging pendency, regional district compliance, and officer workloads.",
      }),
      tatLabel: t("analytics.avgTat", { defaultValue: "Statewide Avg Turnaround Time" }),
      tatDesc: t("analytics.tatDesc", { defaultValue: "SLA Benchmark: 14 days" }),
      pendencyLabel: t("analytics.criticalPendency", { defaultValue: "Statewide Critical Pendency (>30d)" }),
      pendencyDesc: t("analytics.slaBreaches", { defaultValue: "Immediate statutory escalation" }),
      coverageLabel: t("analytics.activeDistricts", { defaultValue: "Monitored Jurisdictions" }),
      coverageDesc: t("analytics.districtCoverage", { defaultValue: "Active operational districts" }),
      agingChartTitle: t("analytics.agingTitle", { defaultValue: "Statewide Pendency Aging Trends" }),
      agingChartDesc: t("analytics.agingDesc", { defaultValue: "Distribution of active applications across SLA aging brackets." }),
      breakdownChartTitle: t("analytics.regionalTitle", { defaultValue: "Regional Compliance Performance" }),
      breakdownChartDesc: t("analytics.regionalDesc", { defaultValue: "Verification compliance index across operational districts." }),
      chartXAxisLabel: "District",
    },
    [Role.LMO]: {
      title: "Jurisdiction & Inspection Analytics",
      badge: `LMO Station • ${user?.officerProfile?.jurisdictionDistrict || "Jaipur"}`,
      subtitle: `Field inspection throughput, personal turnaround times, inspection queue aging, and equipment category compliance in ${user?.officerProfile?.jurisdictionDistrict || "Jaipur"}.`,
      tatLabel: "My Inspection Avg TAT",
      tatDesc: "Submission to statutory stamping",
      pendencyLabel: "My Urgent Inspection Queue (>30d)",
      pendencyDesc: "Assigned visits pending verification",
      coverageLabel: "Regulated Categories",
      coverageDesc: `Categories inspected in ${user?.officerProfile?.jurisdictionDistrict || "Jaipur"}`,
      agingChartTitle: "My Assigned Queue Aging Trends",
      agingChartDesc: "Aging breakdown of verification applications assigned to your inspection roster.",
      breakdownChartTitle: `Category Compliance (${user?.officerProfile?.jurisdictionDistrict || "Jaipur"})`,
      breakdownChartDesc: `Stamping compliance rate across equipment categories in your jurisdiction.`,
      chartXAxisLabel: "Category",
    },
    [Role.GATC_ADMIN]: {
      title: "Agency Testing & Calibration Analytics",
      badge: user?.gatcProfile?.accreditationNumber ? `GATC • ${user.gatcProfile.accreditationNumber}` : (user?.gatcProfile?.agencyName || "Apex Metrology GATC"),
      subtitle: "Testing throughput metrics for your accredited test centre, calibration turnaround times, bench queue aging, and equipment scope performance.",
      tatLabel: "Laboratory Testing Avg TAT",
      tatDesc: "Receipt to calibration report",
      pendencyLabel: "Testing Bench Pendency (>30d)",
      pendencyDesc: "Batches awaiting accuracy testing",
      coverageLabel: "Accredited Equipment Scopes",
      coverageDesc: "Categories authorized for calibration",
      agingChartTitle: "Laboratory Testing Queue Aging",
      agingChartDesc: "Aging breakdown of testing batches assigned to your laboratory bench.",
      breakdownChartTitle: "Testing Compliance by Scope",
      breakdownChartDesc: "Verification pass rate and test volume across accredited equipment scopes.",
      chartXAxisLabel: "Scope",
    },
    [Role.GATC_INSPECTOR]: {
      title: "Field Testing & Inspection Analytics",
      badge: user?.gatcInspectorProfile ? `GATC • ${user.gatcInspectorProfile.employeeId}` : "GATC Field Inspector",
      subtitle: "Field inspection throughput, test turnaround times, assigned batches, and metrological calibration quality.",
      tatLabel: "My Testing Avg TAT",
      tatDesc: "Assignment to test report",
      pendencyLabel: "My Urgent Queue (>30d)",
      pendencyDesc: "Assigned batches pending testing",
      coverageLabel: "Assigned Categories",
      coverageDesc: "Equipment categories tested",
      agingChartTitle: "My Assigned Queue Aging Trends",
      agingChartDesc: "Aging breakdown of testing tasks assigned to your roster.",
      breakdownChartTitle: "Testing Compliance by Scope",
      breakdownChartDesc: "Calibration pass rate across assigned equipment.",
      chartXAxisLabel: "Scope",
    },
    [Role.CONSUMER]: {
      title: "Commercial Trader Compliance Analytics",
      badge: user?.stakeholderProfile?.businessName || "Commercial Establishment",
      subtitle: "Personal compliance overview for your commercial establishment, statutory verification turnaround times, pendency tracking, and equipment stamping health.",
      tatLabel: "My Verification Avg TAT",
      tatDesc: "Average statutory processing duration",
      pendencyLabel: "My Overdue Applications (>30d)",
      pendencyDesc: "Submitted applications awaiting officer inspection",
      coverageLabel: "Registered Equipment Categories",
      coverageDesc: "Commercial weighing and measuring devices",
      agingChartTitle: "My Applications Aging Trends",
      agingChartDesc: "Current processing timeline of your submitted verification applications.",
      breakdownChartTitle: "My Equipment Compliance by Category",
      breakdownChartDesc: "Statutory verification and valid stamping rate of your registered instruments.",
      chartXAxisLabel: "Category",
    },
  };

  const activeRole = (user?.role as Role) || Role.CONSUMER;
  const roleConfig = roleConfigs[activeRole] || roleConfigs[Role.CONSUMER];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div className="space-y-1">
          <div className="flex items-center space-x-2.5">
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              {roleConfig.title}
            </h1>
            <Badge variant="outline" className="text-xs font-normal text-muted-foreground">
              {roleConfig.badge}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            {roleConfig.subtitle}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Skeleton className="h-28 rounded-lg" />
          <Skeleton className="h-28 rounded-lg" />
          <Skeleton className="h-28 rounded-lg" />
        </div>
      ) : (
        /* Top 3 KPI Cards (Tailored per role) */
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border border-border/80 shadow-xs bg-card">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  {roleConfig.tatLabel}
                </span>
                <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center text-muted-foreground shrink-0">
                  <Clock className="h-4 w-4" />
                </div>
              </div>
              <div className="flex items-baseline space-x-2 pt-1">
                <span className="text-2xl font-bold text-foreground tracking-tight">
                  {tatData?.averageTotalDays ?? 0}
                </span>
                <span className="text-xs text-muted-foreground">{t("analytics.days", { defaultValue: "days" })}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {roleConfig.tatDesc}
              </p>
            </CardContent>
          </Card>

          <Card className="border border-border/80 shadow-xs bg-card">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  {roleConfig.pendencyLabel}
                </span>
                <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center text-muted-foreground shrink-0">
                  <AlertTriangle className="h-4 w-4" />
                </div>
              </div>
              <div className="flex items-baseline space-x-2 pt-1">
                <span className="text-2xl font-bold text-foreground tracking-tight">
                  {pendencyData?.find((b: any) => b.bucket === "> 30 days")?.count ?? 0}
                </span>
                <span className="text-xs text-muted-foreground">
                  {t("dashboard.actionNeeded", { defaultValue: "Action Needed" })}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {roleConfig.pendencyDesc}
              </p>
            </CardContent>
          </Card>

          <Card className="border border-border/80 shadow-xs bg-card">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  {roleConfig.coverageLabel}
                </span>
                <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center text-muted-foreground shrink-0">
                  {user?.role === Role.CONSUMER ? (
                    <Scale className="h-4 w-4" />
                  ) : user?.role === Role.ADMIN ? (
                    <MapPin className="h-4 w-4" />
                  ) : (
                    <ShieldCheck className="h-4 w-4" />
                  )}
                </div>
              </div>
              <div className="flex items-baseline space-x-2 pt-1">
                <span className="text-2xl font-bold text-foreground tracking-tight">
                  {regionalData?.length ?? 0}
                </span>
                <span className="text-xs text-muted-foreground">
                  {user?.role === Role.CONSUMER
                    ? "Categories"
                    : user?.role === Role.ADMIN
                    ? "Districts"
                    : "Scopes"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {roleConfig.coverageDesc}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts Grid (Tailored per role) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Pendency Aging Buckets */}
        <Card className="border border-border shadow-xs bg-card">
          <CardHeader className="pb-3 border-b border-border">
            <CardTitle className="text-sm font-semibold flex items-center">
              <BarChart3 className="h-4 w-4 mr-2 text-muted-foreground" />
              {roleConfig.agingChartTitle}
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              {roleConfig.agingChartDesc}
            </CardDescription>
          </CardHeader>

          <CardContent className="p-4 sm:p-5">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pendencyData || []} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="2 2" stroke="currentColor" className="opacity-10" />
                  <XAxis dataKey="bucket" tick={{ fontSize: 11, fill: "currentColor" }} className="text-muted-foreground" />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "currentColor" }} className="text-muted-foreground" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(0, 0, 0, 0.9)",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      borderRadius: "6px",
                      color: "#ffffff",
                      fontSize: "11px",
                    }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {(pendencyData || []).map((entry: any, index: number) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PENDENCY_COLORS[entry.bucket] || "#18181b"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Chart 2: Regional / Category Compliance */}
        <Card className="border border-border shadow-xs bg-card">
          <CardHeader className="pb-3 border-b border-border">
            <CardTitle className="text-sm font-semibold flex items-center">
              {user?.role === Role.CONSUMER ? (
                <Scale className="h-4 w-4 mr-2 text-muted-foreground" />
              ) : (
                <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
              )}
              {roleConfig.breakdownChartTitle}
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              {roleConfig.breakdownChartDesc}
            </CardDescription>
          </CardHeader>

          <CardContent className="p-4 sm:p-5">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={regionalData || []} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="2 2" stroke="currentColor" className="opacity-10" />
                  <XAxis dataKey="district" tick={{ fontSize: 11, fill: "currentColor" }} className="text-muted-foreground" />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "currentColor" }} className="text-muted-foreground" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(0, 0, 0, 0.9)",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      borderRadius: "6px",
                      color: "#ffffff",
                      fontSize: "11px",
                    }}
                    formatter={(value: any) => [`${value}%`, "Compliance Rate"]}
                  />
                  <Bar dataKey="complianceRate" fill="#15803d" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Role-Specific Bottom Data Section */}

      {/* 1. Admin: Statewide Officer & Lab Workload Matrix */}
      {user?.role === Role.ADMIN && (
        <Card className="border border-border shadow-xs bg-card">
          <CardHeader className="pb-3 border-b border-border">
            <CardTitle className="text-sm font-semibold flex items-center">
              <Users className="h-4 w-4 mr-2 text-muted-foreground" />
              {t("analytics.workloadTitle", { defaultValue: "Statewide Officer & Lab Workload Matrix" })}
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              {t("analytics.workloadDesc", { defaultValue: "Field inspection throughput and quality metrics across all registered enforcement officers and test centres." })}
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0">
            {workloadLoading ? (
              <div className="p-4">
                <Skeleton className="h-28 w-full" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("analytics.officerName", { defaultValue: "Officer / Lab Name" })}</TableHead>
                    <TableHead>{t("common.role", { defaultValue: "Role" })}</TableHead>
                    <TableHead>{t("analytics.inspectionsCompleted", { defaultValue: "Inspections Conducted" })}</TableHead>
                    <TableHead>Passed</TableHead>
                    <TableHead>Failed / Rejected</TableHead>
                    <TableHead>{t("analytics.rejectionRate", { defaultValue: "Rejection Rate" })}</TableHead>
                    <TableHead className="text-right">{t("analytics.activePipeline", { defaultValue: "Active Pipeline" })}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(workloadData || []).map((off: any) => (
                    <TableRow key={off.officerId} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-semibold text-foreground">{off.officerName}</TableCell>
                      <TableCell className="text-[11px] text-muted-foreground">{off.role}</TableCell>
                      <TableCell className="font-mono">{off.completedInspections}</TableCell>
                      <TableCell className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">{off.passedInspections}</TableCell>
                      <TableCell className="font-mono text-rose-600 dark:text-rose-400 font-semibold">{off.failedInspections}</TableCell>
                      <TableCell className="font-mono">{off.rejectionRate}%</TableCell>
                      <TableCell className="text-right font-mono text-foreground font-bold">{off.pendingAssigned}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* 2. LMO / GATC: Personal Inspection & Verification Record */}
      {user && (user.role === Role.LMO || user.role === Role.GATC_ADMIN || user.role === Role.GATC_INSPECTOR) && (
        <Card className="border border-border shadow-xs bg-card">
          <CardHeader className="pb-3 border-b border-border">
            <CardTitle className="text-sm font-semibold flex items-center">
              <ShieldCheck className="h-4 w-4 mr-2 text-muted-foreground" />
              {user.role === Role.LMO
                ? "My Field Inspection & Quality Record"
                : "Laboratory Testing & Calibration Record"}
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              {user.role === Role.LMO
                ? `Personal throughput, stamping accuracy, and assigned queue metrics for ${user.name}.`
                : `Laboratory test volume, calibration accuracy, and bench queue metrics for ${user.name}.`}
            </CardDescription>
          </CardHeader>

          <CardContent className="p-5">
            {workloadLoading ? (
              <Skeleton className="h-24 w-full" />
            ) : workloadData && workloadData.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-center">
                <div className="p-3.5 bg-muted/40 rounded-lg border border-border/60">
                  <p className="text-xs text-muted-foreground font-medium">
                    {user.role === Role.LMO ? "Inspections Conducted" : "Tests Completed"}
                  </p>
                  <p className="text-2xl font-bold font-mono mt-1 text-foreground">
                    {workloadData[0].completedInspections}
                  </p>
                </div>
                <div className="p-3.5 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-lg border border-emerald-200 dark:border-emerald-800/40">
                  <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                    Passed / Stamped
                  </p>
                  <p className="text-2xl font-bold font-mono mt-1 text-emerald-600 dark:text-emerald-400">
                    {workloadData[0].passedInspections}
                  </p>
                </div>
                <div className="p-3.5 bg-rose-50/50 dark:bg-rose-950/20 rounded-lg border border-rose-200 dark:border-rose-800/40">
                  <p className="text-xs text-rose-700 dark:text-rose-400 font-medium">
                    Failed / Rejected
                  </p>
                  <p className="text-2xl font-bold font-mono mt-1 text-rose-600 dark:text-rose-400">
                    {workloadData[0].failedInspections}
                  </p>
                </div>
                <div className="p-3.5 bg-muted/40 rounded-lg border border-border/60">
                  <p className="text-xs text-muted-foreground font-medium">Rejection Rate</p>
                  <p className="text-2xl font-bold font-mono mt-1 text-foreground">
                    {workloadData[0].rejectionRate}%
                  </p>
                </div>
                <div className="p-3.5 bg-sky-50/50 dark:bg-sky-950/20 rounded-lg border border-sky-200 dark:border-sky-800/40 col-span-2 sm:col-span-1">
                  <p className="text-xs text-sky-700 dark:text-sky-400 font-medium">Active Queue</p>
                  <p className="text-2xl font-bold font-mono mt-1 text-sky-600 dark:text-sky-400">
                    {workloadData[0].pendingAssigned}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-4">No inspection records logged yet.</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* 3. Consumer: Commercial Equipment Stamping Registry */}
      {user?.role === Role.CONSUMER && (
        <Card className="border border-border shadow-xs bg-card">
          <CardHeader className="pb-3 border-b border-border">
            <CardTitle className="text-sm font-semibold flex items-center">
              <Scale className="h-4 w-4 mr-2 text-muted-foreground" />
              My Commercial Equipment Stamping Registry
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Live verification compliance status and certificate validity of your registered instruments.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0">
            {instrumentsLoading ? (
              <div className="p-4">
                <Skeleton className="h-28 w-full" />
              </div>
            ) : instrumentsData && instrumentsData.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Make & Model</TableHead>
                    <TableHead>Serial Number</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Last Verified</TableHead>
                    <TableHead className="text-right">Stamping Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {instrumentsData.map((inst: any) => {
                    const isVerified = inst.nextDueAt && new Date(inst.nextDueAt) >= new Date();
                    const isDueSoon =
                      isVerified &&
                      new Date(inst.nextDueAt).getTime() - Date.now() < 86400000 * 30;
                    return (
                      <TableRow key={inst.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="font-semibold text-foreground">
                          {inst.make} {inst.model}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {inst.serialNumber}
                        </TableCell>
                        <TableCell className="text-xs">{inst.category}</TableCell>
                        <TableCell className="font-mono text-xs">
                          {inst.capacity} {inst.unit}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {inst.lastVerifiedAt ? formatDate(inst.lastVerifiedAt) : "Pending Stamping"}
                        </TableCell>
                        <TableCell className="text-right">
                          {isDueSoon ? (
                            <Badge
                              variant="outline"
                              className="text-[11px] border-amber-300 bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-300"
                            >
                              Due Soon
                            </Badge>
                          ) : isVerified ? (
                            <Badge
                              variant="outline"
                              className="text-[11px] border-emerald-300 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300"
                            >
                              Active Stamped
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="text-[11px] border-rose-300 bg-rose-50 text-rose-900 dark:bg-rose-950/40 dark:text-rose-300"
                            >
                              Unverified / Due
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-6">
                No commercial instruments registered yet.
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

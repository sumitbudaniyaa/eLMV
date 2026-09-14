import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api } from "@/lib/api";
import { ApiResponse, Role, ApplicationStatus } from "@sih/shared";
import { useAuth } from "@/context/AuthContext";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Scale,
  FileText,
  Award,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  TrendingUp,
  Plus,
  ClipboardCheck,
  FlaskConical,
  Building2,
  Users,
} from "lucide-react";

export function DashboardPage() {
  const { t } = useTranslation();
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["dashboard", "summary"],
    queryFn: async () => {
      const res = await api.get<ApiResponse<any>>("/dashboard/summary");
      return res.data?.data;
    },
  });

  const stats = data?.stats || {};

  return (
    <div className="space-y-6">
      {/* 1. HERO HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6 pt-1">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center space-x-2.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              {user?.role === Role.CONSUMER && t("dashboard.traderTitle")}
              {user?.role === Role.LMO && t("dashboard.officerTitle")}
              {(user?.role === Role.GATC_ADMIN || user?.role === Role.GATC_INSPECTOR) && t("dashboard.labTitle")}
              {user?.role === Role.ADMIN && t("dashboard.adminTitle")}
            </h1>
            <Badge variant="outline" className="text-xs font-normal text-muted-foreground py-0.5 px-2">
              {user?.role ? (t(`roles.${user.role}`, { defaultValue: user.role }) as string) : ""}
            </Badge>
          </div>

          <p className="text-xs text-muted-foreground truncate">
            {user?.role === Role.CONSUMER && (
              <>
                {user?.stakeholderProfile?.businessName || user?.name} • {user?.stakeholderProfile?.district || "Jaipur, Rajasthan"}
              </>
            )}
            {user?.role === Role.LMO && (
              <>
                {user?.name} • {t("dashboard.officerSubtitle")}
              </>
            )}
            {(user?.role === Role.GATC_ADMIN || user?.role === Role.GATC_INSPECTOR) && (
              <>
                {user?.gatcProfile?.agencyName || user?.gatcInspectorProfile?.gatcAgency?.agencyName || "Apex Metrology GATC"} • {t("dashboard.labSubtitle")}
              </>
            )}
            {user?.role === Role.ADMIN && (
              <>
                {user?.name} • {t("dashboard.adminSubtitle")}
              </>
            )}
          </p>
        </div>

        {/* Quick Action CTAs */}
        <div className="flex items-center gap-2.5 shrink-0">
          {user?.role === Role.CONSUMER && (
            <>
              <Link to="/applications">
                <Button size="sm" className="h-8 text-xs font-bold bg-[#0B2545] hover:bg-[#133966] text-white shadow-xs rounded-lg transition-all">
                  <Plus className="h-3.5 w-3.5 mr-1.5" />
                  {t("dashboard.newApplication")}
                </Button>
              </Link>
              <Link to="/instruments">
                <Button variant="outline" size="sm" className="h-8 text-xs font-semibold rounded-lg border-border/80 hover:bg-slate-100">
                  <Scale className="h-3.5 w-3.5 mr-1.5 text-[#0B2545]" />
                  {t("dashboard.instruments")}
                </Button>
              </Link>
            </>
          )}

          {user?.role === Role.LMO && (
            <Link to="/applications">
              <Button size="sm" className="h-8 text-xs font-semibold shadow-xs">
                <ClipboardCheck className="h-3.5 w-3.5 mr-1.5" />
                {t("dashboard.assignedQueue")} ({stats.pendingInspections ?? 0})
              </Button>
            </Link>
          )}

          {(user?.role === Role.GATC_ADMIN || user?.role === Role.GATC_INSPECTOR) && (
            <Link to="/applications">
              <Button size="sm" className="h-8 text-xs font-semibold shadow-xs">
                <FlaskConical className="h-3.5 w-3.5 mr-1.5" />
                {t("dashboard.labQueue")} ({stats.pendingInspections ?? 0})
              </Button>
            </Link>
          )}

          {user?.role === Role.ADMIN && (
            <Link to="/analytics">
              <Button size="sm" className="h-8 text-xs font-semibold shadow-xs">
                <TrendingUp className="h-3.5 w-3.5 mr-1.5" />
                {t("dashboard.analyticsPerformance")}
              </Button>
            </Link>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-28 rounded-lg" />
          <Skeleton className="h-28 rounded-lg" />
          <Skeleton className="h-28 rounded-lg" />
          <Skeleton className="h-28 rounded-lg" />
        </div>
      ) : (
        <>
          {/* ========================================================================= */}
          {/* 1. COMMERCIAL TRADER / CONSUMER DASHBOARD VIEW                           */}
          {/* ========================================================================= */}
          {user?.role === Role.CONSUMER && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border border-border/80 shadow-xs bg-white dark:bg-card rounded-xl">
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-muted-foreground">
                        {t("dashboard.registeredInstruments")}
                      </span>
                      <div className="h-9 w-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 flex items-center justify-center shrink-0 shadow-2xs">
                        <Scale className="h-4 w-4" />
                      </div>
                    </div>
                    <div className="flex items-baseline justify-between pt-1">
                      <span className="text-2xl font-black text-[#0B2545] dark:text-slate-100 tracking-tight font-mono">
                        {stats.totalInstruments ?? 0}
                      </span>
                      <span className="text-[11px] text-muted-foreground font-medium">{t("dashboard.totalAssets")}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-border/80 shadow-xs bg-white dark:bg-card rounded-xl">
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-muted-foreground">
                        {t("dashboard.activeCertificates")}
                      </span>
                      <div className="h-9 w-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center shrink-0 shadow-2xs">
                        <Award className="h-4 w-4" />
                      </div>
                    </div>
                    <div className="flex items-baseline justify-between pt-1">
                      <span className="text-2xl font-black text-emerald-700 dark:text-emerald-400 tracking-tight font-mono">
                        {stats.activeCertificates ?? 0}
                      </span>
                      <span className="text-[11px] text-muted-foreground font-medium">{t("dashboard.stamped")}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-border/80 shadow-xs bg-white dark:bg-card rounded-xl">
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-muted-foreground">
                        {t("dashboard.pendingApplications")}
                      </span>
                      <div className="h-9 w-9 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 flex items-center justify-center shrink-0 shadow-2xs">
                        <FileText className="h-4 w-4" />
                      </div>
                    </div>
                    <div className="flex items-baseline justify-between pt-1">
                      <span className="text-2xl font-black text-amber-700 dark:text-amber-400 tracking-tight font-mono">
                        {stats.pendingApplications ?? 0}
                      </span>
                      <span className="text-[11px] text-muted-foreground font-medium">{t("dashboard.inProgress")}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-border/80 shadow-xs bg-white dark:bg-card rounded-xl">
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-muted-foreground">
                        {t("dashboard.expiringSoon")}
                      </span>
                      <div className="h-9 w-9 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 flex items-center justify-center shrink-0 shadow-2xs">
                        <AlertTriangle className="h-4 w-4" />
                      </div>
                    </div>
                    <div className="flex items-baseline justify-between pt-1">
                      <span className="text-2xl font-black text-rose-700 dark:text-rose-400 tracking-tight font-mono">
                        {stats.expiringSoonCount ?? 0}
                      </span>
                      <span className="text-[11px] text-muted-foreground font-medium">{t("dashboard.actionNeeded")}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Expiring Soon Instruments Table */}
              {(data?.expiringInstruments?.length ?? 0) > 0 ? (
                <div className="rounded-xl border border-amber-300 dark:border-amber-800/60 bg-amber-50/70 dark:bg-amber-950/30 p-5 space-y-4 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-4 w-4 text-amber-700 dark:text-amber-400" />
                      <h3 className="text-xs sm:text-sm font-bold text-amber-950 dark:text-amber-200">
                        {t("dashboard.section24AlertTitle")}
                      </h3>
                    </div>
                    <Badge variant="inspected" size="sm">
                      {t("dashboard.section24AlertBadge")}
                    </Badge>
                  </div>
                  <p className="text-xs text-amber-900 dark:text-amber-300 leading-relaxed">
                    {t("dashboard.section24AlertDesc")}
                  </p>
                  <div className="border border-slate-200 dark:border-border rounded-lg bg-white dark:bg-card overflow-hidden shadow-xs">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t("dashboard.table.serialNumber")}</TableHead>
                          <TableHead>{t("dashboard.table.makeModel")}</TableHead>
                          <TableHead>{t("dashboard.table.capacity")}</TableHead>
                          <TableHead>{t("dashboard.table.nextDueDate")}</TableHead>
                          <TableHead className="text-right">{t("dashboard.table.action")}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.expiringInstruments.map((inst: any) => (
                          <TableRow key={inst.id}>
                            <TableCell className="font-mono font-bold">{inst.serialNumber}</TableCell>
                            <TableCell>{inst.make} ({inst.model})</TableCell>
                            <TableCell>{inst.capacity} {inst.unit}</TableCell>
                            <TableCell className="font-bold text-amber-600 dark:text-amber-400 font-mono">
                              {formatDate(inst.nextDueAt)}
                            </TableCell>
                            <TableCell className="text-right">
                              <Link to={`/applications?instrumentId=${inst.id}`}>
                                <Button size="sm" className="h-7 text-xs font-semibold bg-[#0B2545] hover:bg-[#133966] text-white shadow-xs">
                                  {t("dashboard.applyRenewal")}
                                </Button>
                              </Link>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-border/70 p-5 bg-card flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    <div>
                      <h4 className="text-xs font-bold text-foreground">{t("dashboard.allCertificatesUpToDate")}</h4>
                      <p className="text-[11px] text-muted-foreground">{t("dashboard.allCertificatesUpToDateDesc")}</p>
                    </div>
                  </div>
                  <Link to="/instruments">
                    <Button variant="outline" size="sm" className="h-7 text-xs">
                      {t("dashboard.viewMyInstruments")}
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* 2. LEGAL METROLOGY OFFICER (LMO) DASHBOARD VIEW                          */}
          {/* ========================================================================= */}
          {user?.role === Role.LMO && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border border-border/80 shadow-xs bg-card">
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">
                        {t("dashboard.inspectionQueue")}
                      </span>
                      <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center text-muted-foreground shrink-0">
                        <ClipboardCheck className="h-4 w-4" />
                      </div>
                    </div>
                    <div className="flex items-baseline justify-between pt-1">
                      <span className="text-2xl font-bold text-foreground tracking-tight">
                        {stats.pendingInspections ?? 0}
                      </span>
                      <span className="text-xs text-muted-foreground">{t("dashboard.pendingInspection")}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-border/80 shadow-xs bg-card">
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">
                        {t("dashboard.scheduledVisits")}
                      </span>
                      <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center text-muted-foreground shrink-0">
                        <Calendar className="h-4 w-4" />
                      </div>
                    </div>
                    <div className="flex items-baseline justify-between pt-1">
                      <span className="text-2xl font-bold text-foreground tracking-tight">
                        {stats.scheduledUpcomingCount ?? 0}
                      </span>
                      <span className="text-xs text-muted-foreground">{t("dashboard.upcoming")}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-border/80 shadow-xs bg-card">
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">
                        {t("dashboard.inspectionsConducted")}
                      </span>
                      <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center text-muted-foreground shrink-0">
                        <CheckCircle2 className="h-4 w-4" />
                      </div>
                    </div>
                    <div className="flex items-baseline justify-between pt-1">
                      <span className="text-2xl font-bold text-foreground tracking-tight">
                        {stats.completedInspections ?? 0}
                      </span>
                      <span className="text-xs text-muted-foreground">{t("dashboard.completed")}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-border/80 shadow-xs bg-card">
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">
                        {t("dashboard.certificatesIssued")}
                      </span>
                      <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center text-muted-foreground shrink-0">
                        <Award className="h-4 w-4" />
                      </div>
                    </div>
                    <div className="flex items-baseline justify-between pt-1">
                      <span className="text-2xl font-bold text-foreground tracking-tight">
                        {stats.certifiedCount ?? 0}
                      </span>
                      <span className="text-xs text-muted-foreground">{t("dashboard.active")}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Upcoming Scheduled Inspections */}
              <Card>
                <CardHeader className="pb-3 border-b border-border/80">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xs sm:text-sm font-bold flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        {t("dashboard.scheduleTitle")}
                      </CardTitle>
                      <CardDescription className="text-xs text-muted-foreground mt-0.5">
                        {t("dashboard.scheduleDesc")}
                      </CardDescription>
                    </div>
                    <Link to="/applications">
                      <Button variant="outline" size="sm" className="h-7 text-xs">
                        {t("dashboard.openFullQueue")}
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("dashboard.table.scheduledDate")}</TableHead>
                        <TableHead>{t("dashboard.table.applicationNumber")}</TableHead>
                        <TableHead>{t("dashboard.table.instrument")}</TableHead>
                        <TableHead>{t("dashboard.table.applicantShop")}</TableHead>
                        <TableHead>{t("dashboard.table.location")}</TableHead>
                        <TableHead className="text-right">{t("dashboard.table.action")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(data?.upcomingSchedule || []).length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-6 text-xs text-muted-foreground">
                            {t("dashboard.noVisits")}
                          </TableCell>
                        </TableRow>
                      ) : (
                        data.upcomingSchedule.map((visit: any) => (
                          <TableRow key={visit.id} className="hover:bg-muted/30 transition-colors">
                            <TableCell className="font-semibold text-foreground font-mono">
                              {formatDate(visit.scheduledDate)}
                            </TableCell>
                            <TableCell className="font-mono font-medium">{visit.applicationNumber}</TableCell>
                            <TableCell>
                              <span className="font-medium text-foreground">{visit.instrument?.serialNumber}</span>
                              <span className="block text-[10px] text-muted-foreground">{visit.instrument?.make} ({visit.instrument?.capacity} {visit.instrument?.unit})</span>
                            </TableCell>
                            <TableCell>
                              <span className="font-medium text-foreground">{visit.applicant?.name}</span>
                              <span className="block text-[10px] text-muted-foreground font-mono">{visit.applicant?.phone}</span>
                            </TableCell>
                            <TableCell className="text-muted-foreground">{visit.instrument?.district}</TableCell>
                            <TableCell className="text-right">
                              <Link to="/applications">
                                <Button size="sm" className="h-7 text-xs font-semibold">
                                  <ClipboardCheck className="h-3 w-3 mr-1" />
                                  {t("dashboard.inspectMpe")}
                                </Button>
                              </Link>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 3. GOVERNMENT APPROVED TEST CENTRE (GATC) DASHBOARD VIEW                  */}
          {/* ========================================================================= */}
          {(user?.role === Role.GATC_ADMIN || user?.role === Role.GATC_INSPECTOR) && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border border-border/80 shadow-xs bg-card">
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">
                        {t("dashboard.testingQueue")}
                      </span>
                      <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center text-muted-foreground shrink-0">
                        <FlaskConical className="h-4 w-4" />
                      </div>
                    </div>
                    <div className="flex items-baseline justify-between pt-1">
                      <span className="text-2xl font-bold text-foreground tracking-tight">
                        {stats.pendingInspections ?? 0}
                      </span>
                      <span className="text-xs text-muted-foreground">{t("dashboard.inProgress")}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-border/80 shadow-xs bg-card">
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">
                        {t("dashboard.calibrationsCompleted")}
                      </span>
                      <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center text-muted-foreground shrink-0">
                        <CheckCircle2 className="h-4 w-4" />
                      </div>
                    </div>
                    <div className="flex items-baseline justify-between pt-1">
                      <span className="text-2xl font-bold text-foreground tracking-tight">
                        {stats.completedInspections ?? 0}
                      </span>
                      <span className="text-xs text-muted-foreground">{t("dashboard.completed")}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-border/80 shadow-xs bg-card">
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">
                        {t("dashboard.authorizedScope")}
                      </span>
                      <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center text-muted-foreground shrink-0">
                        <Award className="h-4 w-4" />
                      </div>
                    </div>
                    <div className="flex items-baseline justify-between pt-1">
                      <span className="text-base font-bold text-foreground tracking-tight">
                        NAWI / Flow Meters
                      </span>
                      <span className="text-xs text-muted-foreground font-mono">NABL-041</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-border/80 shadow-xs bg-card">
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">
                        {t("dashboard.scheduledBatches")}
                      </span>
                      <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center text-muted-foreground shrink-0">
                        <Calendar className="h-4 w-4" />
                      </div>
                    </div>
                    <div className="flex items-baseline justify-between pt-1">
                      <span className="text-2xl font-bold text-foreground tracking-tight">
                        {stats.scheduledUpcomingCount ?? 0}
                      </span>
                      <span className="text-xs text-muted-foreground">{t("dashboard.upcoming")}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* GATC Laboratory Testing Queue */}
              <Card>
                <CardHeader className="pb-3 border-b border-border/80">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xs sm:text-sm font-bold flex items-center">
                        <FlaskConical className="h-4 w-4 mr-2 text-muted-foreground" />
                        {t("dashboard.labQueueTitle")}
                      </CardTitle>
                      <CardDescription className="text-xs text-muted-foreground mt-0.5">
                        {t("dashboard.labQueueDesc")}
                      </CardDescription>
                    </div>
                    <Link to="/applications">
                      <Button variant="outline" size="sm" className="h-7 text-xs">
                        {t("dashboard.viewTestingQueue")}
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("dashboard.table.receiptDate")}</TableHead>
                        <TableHead>{t("dashboard.table.applicationNumber")}</TableHead>
                        <TableHead>{t("dashboard.table.deviceSerial")}</TableHead>
                        <TableHead>{t("dashboard.table.submittedBy")}</TableHead>
                        <TableHead>{t("dashboard.table.category")}</TableHead>
                        <TableHead className="text-right">{t("dashboard.table.action")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(data?.upcomingSchedule || []).length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-6 text-xs text-muted-foreground">
                            {t("dashboard.noDevices")}
                          </TableCell>
                        </TableRow>
                      ) : (
                        data.upcomingSchedule.map((visit: any) => (
                          <TableRow key={visit.id} className="hover:bg-muted/30 transition-colors">
                            <TableCell className="font-semibold text-foreground font-mono">
                              {formatDate(visit.scheduledDate)}
                            </TableCell>
                            <TableCell className="font-mono">{visit.applicationNumber}</TableCell>
                            <TableCell>{visit.instrument?.serialNumber}</TableCell>
                            <TableCell>{visit.applicant?.name}</TableCell>
                            <TableCell className="text-muted-foreground">{visit.instrument?.type?.replace(/_/g, " ")}</TableCell>
                            <TableCell className="text-right">
                              <Link to="/applications">
                                <Button size="sm" className="h-7 text-xs font-semibold">
                                  <FlaskConical className="h-3 w-3 mr-1" />
                                  {t("dashboard.performTest")}
                                </Button>
                              </Link>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 4. CONTROLLER / ADMINISTRATOR DASHBOARD VIEW                             */}
          {/* ========================================================================= */}
          {user?.role === Role.ADMIN && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border border-border/80 shadow-xs bg-card">
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">
                        {t("dashboard.totalInstruments")}
                      </span>
                      <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center text-muted-foreground shrink-0">
                        <Building2 className="h-4 w-4" />
                      </div>
                    </div>
                    <div className="flex items-baseline justify-between pt-1">
                      <span className="text-2xl font-bold text-foreground tracking-tight">
                        {stats.totalInstruments ?? 0}
                      </span>
                      <span className="text-xs text-muted-foreground">{t("dashboard.registered")}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-border/80 shadow-xs bg-card">
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">
                        {t("dashboard.totalApplications")}
                      </span>
                      <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center text-muted-foreground shrink-0">
                        <FileText className="h-4 w-4" />
                      </div>
                    </div>
                    <div className="flex items-baseline justify-between pt-1">
                      <span className="text-2xl font-bold text-foreground tracking-tight">
                        {stats.totalApplications ?? 0}
                      </span>
                      <span className="text-xs text-muted-foreground">{t("dashboard.allTime")}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-border/80 shadow-xs bg-card">
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">
                        {t("dashboard.activeCertificates")}
                      </span>
                      <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center text-muted-foreground shrink-0">
                        <Award className="h-4 w-4" />
                      </div>
                    </div>
                    <div className="flex items-baseline justify-between pt-1">
                      <span className="text-2xl font-bold text-foreground tracking-tight">
                        {stats.activeCertificates ?? 0}
                      </span>
                      <span className="text-xs text-muted-foreground">{t("dashboard.stamped")}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-border/80 shadow-xs bg-card">
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">
                        {t("dashboard.feeRevenue")}
                      </span>
                      <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center text-muted-foreground shrink-0">
                        <TrendingUp className="h-4 w-4" />
                      </div>
                    </div>
                    <div className="flex items-baseline justify-between pt-1">
                      <span className="text-2xl font-bold text-foreground tracking-tight">
                        ₹{stats.statutoryRevenue?.toLocaleString("en-IN") ?? 0}
                      </span>
                      <span className="text-xs text-muted-foreground">{t("dashboard.treasuryReceipts")}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Status Breakdown Grid */}
              <Card className="border border-border shadow-xs bg-card">
                <CardHeader className="pb-3 border-b border-border">
                  <CardTitle className="text-sm font-semibold">
                    {t("dashboard.statusDistributionTitle")}
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    {t("dashboard.statusDistributionDesc")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-5">
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    {Object.values(ApplicationStatus).map((st) => (
                      <div
                        key={st}
                        className="rounded-lg border border-border p-3 bg-muted/40 text-center space-y-1"
                      >
                        <span className="text-[11px] text-muted-foreground uppercase font-medium block">
                          {t(`status.${st}`, st.replace(/_/g, " "))}
                        </span>
                        <span className="text-xl font-bold text-foreground block">
                          {stats.statusCounts?.[st] ?? 0}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick links to Admin controls */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Link to="/instruments" className="block">
                  <Card className="hover:border-foreground/30 transition-colors p-4 space-y-1 border border-border shadow-xs">
                    <span className="text-xs font-semibold text-foreground flex items-center">
                      <Building2 className="h-4 w-4 mr-1.5 text-muted-foreground" />
                      {t("dashboard.allRegisteredInstruments")}
                    </span>
                    <p className="text-xs text-muted-foreground">
                      {t("dashboard.allRegisteredInstrumentsDesc")}
                    </p>
                  </Card>
                </Link>

                <Link to="/analytics" className="block">
                  <Card className="hover:border-foreground/30 transition-colors p-4 space-y-1 border border-border shadow-xs">
                    <span className="text-xs font-semibold text-foreground flex items-center">
                      <TrendingUp className="h-4 w-4 mr-1.5 text-muted-foreground" />
                      {t("dashboard.analyticsPerformance")}
                    </span>
                    <p className="text-xs text-muted-foreground">
                      {t("dashboard.analyticsPerformanceDesc")}
                    </p>
                  </Card>
                </Link>

                <Link to="/audit" className="block">
                  <Card className="hover:border-foreground/30 transition-colors p-4 space-y-1 border border-border shadow-xs">
                    <span className="text-xs font-semibold text-foreground flex items-center">
                      <Users className="h-4 w-4 mr-1.5 text-muted-foreground" />
                      {t("dashboard.regulatoryAuditLog")}
                    </span>
                    <p className="text-xs text-muted-foreground">
                      {t("dashboard.regulatoryAuditLogDesc")}
                    </p>
                  </Card>
                </Link>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

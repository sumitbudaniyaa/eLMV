import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { api } from "@/lib/api";
import { ApiResponse, ApplicationStatus, Role, InstrumentType } from "@sih/shared";
import { useAuth } from "@/context/AuthContext";
import { formatDate, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { SubmitApplicationDialog } from "./SubmitApplicationDialog";
import { ScheduleInspectionDialog } from "./ScheduleInspectionDialog";
import { RecordInspectionDialog } from "../inspections/RecordInspectionDialog";
import { InspectionDetailsDialog } from "../inspections/InspectionDetailsDialog";
import { SignConfirmationDialog } from "./SignConfirmationDialog";
import { CertificateDialog } from "@/components/common/CertificateDialog";
import {
  FileText,
  Plus,
  Search,
  Calendar,
  ClipboardCheck,
  Award,
  Filter,
  X,
  ArrowRight,
  Loader2,
  ShieldCheck,
  Scale,
} from "lucide-react";

export const INSTRUMENT_TYPE_LABELS: Record<InstrumentType, string> = {
  [InstrumentType.NON_AUTOMATIC_WEIGHING_INSTRUMENT]: "Non-Automatic Weighing (NAWI)",
  [InstrumentType.AUTOMATIC_WEIGHING_INSTRUMENT]: "Automatic Weighing (AWI)",
  [InstrumentType.FUEL_DISPENSER]: "Fuel & Flow Dispensers",
  [InstrumentType.STORAGE_TANK]: "Storage Tanks & Vats",
  [InstrumentType.LENGTH_MEASURE]: "Length & Linear Measures",
  [InstrumentType.CAPACITY_MEASURE]: "Capacity Measures",
  [InstrumentType.OTHER]: "Other Specialized Measures",
};

export function ApplicationListPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [issuingId, setIssuingId] = useState<string | null>(null);

  // Dialog states for officer workflows
  const [scheduleTarget, setScheduleTarget] = useState<any | null>(null);
  const [inspectionTarget, setInspectionTarget] = useState<any | null>(null);
  const [viewCertNumber, setViewCertNumber] = useState<string | null>(null);
  const [inspectionDetailsTarget, setInspectionDetailsTarget] = useState<any | null>(null);
  const [signConfirmTarget, setSignConfirmTarget] = useState<any | null>(null);

  const gatcScopes: string[] =
    user?.role === Role.GATC_ADMIN
      ? user?.gatcProfile?.authorizedScope || ["NON_AUTOMATIC_WEIGHING_INSTRUMENT"]
      : user?.role === Role.GATC_INSPECTOR
      ? (user?.gatcInspectorProfile?.authorizedScope?.length > 0
          ? user.gatcInspectorProfile.authorizedScope
          : user?.gatcInspectorProfile?.gatcAgency?.authorizedScope || ["NON_AUTOMATIC_WEIGHING_INSTRUMENT"])
      : [];

  const handleIssueCertificate = async (app: any) => {
    try {
      setIssuingId(app.id);
      const res = await api.post("/certificates/issue", { applicationId: app.id });
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      queryClient.invalidateQueries({ queryKey: ["fieldApplications"] });
      queryClient.invalidateQueries({ queryKey: ["certificates"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["consumerDashboard"] });

      const newCertNum = res.data?.data?.certificateNumber;
      if (newCertNum) {
        setViewCertNumber(newCertNum);
      }
    } catch (err: any) {
      console.error("Failed to issue certificate:", err);
      alert(err?.response?.data?.error?.message || "Failed to issue certificate.");
    } finally {
      setIssuingId(null);
    }
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ["applications", search, statusFilter, typeFilter],
    queryFn: async () => {
      const params: any = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (typeFilter) params.instrumentType = typeFilter;
      const res = await api.get<ApiResponse<any[]>>("/applications", { params });
      return res.data;
    },
  });

  const applications = data?.data || [];

  const getStatusBadgeVariant = (status: ApplicationStatus) => {
    switch (status) {
      case ApplicationStatus.SUBMITTED:
        return "submitted";
      case ApplicationStatus.SCHEDULED:
        return "scheduled";
      case ApplicationStatus.INSPECTED:
        return "inspected";
      case ApplicationStatus.CERTIFIED:
        return "certified";
      case ApplicationStatus.REJECTED:
        return "rejected";
      case ApplicationStatus.EXPIRED:
        return "expired";
      default:
        return "default";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-5">
        <div className="space-y-1">
          <div className="flex items-center space-x-2.5">
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              {t("applications.title")}
            </h1>
            <Badge variant="outline" className="font-mono text-[10px] py-0.5">
              {t("applications.recordsBadge", { count: applications.length })}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            {t("applications.subtitle")}
          </p>
        </div>

        {user?.role === Role.CONSUMER && (
          <Button
            size="sm"
            onClick={() => setIsSubmitOpen(true)}
            className="h-8 text-xs font-semibold shrink-0 bg-[#0B2545] hover:bg-[#0B2545]/90 text-white shadow-xs"
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            {t("applications.newApplication")}
          </Button>
        )}
      </div>

      {/* Verification Lifecycle Stepper */}
      <Card className="p-3 sm:p-4 border border-border/80 shadow-xs bg-white dark:bg-card rounded-xl">
        {/* Desktop View: Horizontal Connected Flow */}
        <div className="hidden md:flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <div className="h-6 w-6 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold text-xs shrink-0">
              1
            </div>
            <div className="min-w-0">
              <span className="font-semibold text-foreground block truncate">{t("applications.step1Title")}</span>
              <span className="text-[11px] text-muted-foreground block truncate">{t("applications.step1Desc")}</span>
            </div>
          </div>

          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />

          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <div className="h-6 w-6 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold text-xs shrink-0">
              2
            </div>
            <div className="min-w-0">
              <span className="font-semibold text-foreground block truncate">{t("applications.step2Title")}</span>
              <span className="text-[11px] text-muted-foreground block truncate">{t("applications.step2Desc")}</span>
            </div>
          </div>

          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />

          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <div className="h-6 w-6 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold text-xs shrink-0">
              3
            </div>
            <div className="min-w-0">
              <span className="font-semibold text-foreground block truncate">{t("applications.step3Title")}</span>
              <span className="text-[11px] text-muted-foreground block truncate">{t("applications.step3Desc")}</span>
            </div>
          </div>

          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />

          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <div className="h-6 w-6 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold text-xs shrink-0">
              4
            </div>
            <div className="min-w-0">
              <span className="font-semibold text-foreground block truncate">{t("applications.step4Title")}</span>
              <span className="text-[11px] text-muted-foreground block truncate">{t("applications.step4Desc")}</span>
            </div>
          </div>
        </div>

        {/* Mobile View: Clean 2x2 Connected Grid */}
        <div className="grid grid-cols-2 gap-2 md:hidden">
          <div className="p-2.5 rounded-lg border border-border/70 bg-muted/20 flex items-start space-x-2.5">
            <span className="h-5 w-5 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
              1
            </span>
            <div className="min-w-0">
              <p className="font-semibold text-xs text-foreground leading-tight truncate">{t("applications.step1Title")}</p>
              <p className="text-[10px] text-muted-foreground leading-snug mt-0.5 line-clamp-2">{t("applications.step1Desc")}</p>
            </div>
          </div>

          <div className="p-2.5 rounded-lg border border-border/70 bg-muted/20 flex items-start space-x-2.5">
            <span className="h-5 w-5 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
              2
            </span>
            <div className="min-w-0">
              <p className="font-semibold text-xs text-foreground leading-tight truncate">{t("applications.step2Title")}</p>
              <p className="text-[10px] text-muted-foreground leading-snug mt-0.5 line-clamp-2">{t("applications.step2Desc")}</p>
            </div>
          </div>

          <div className="p-2.5 rounded-lg border border-border/70 bg-muted/20 flex items-start space-x-2.5">
            <span className="h-5 w-5 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
              3
            </span>
            <div className="min-w-0">
              <p className="font-semibold text-xs text-foreground leading-tight truncate">{t("applications.step3Title")}</p>
              <p className="text-[10px] text-muted-foreground leading-snug mt-0.5 line-clamp-2">{t("applications.step3Desc")}</p>
            </div>
          </div>

          <div className="p-2.5 rounded-lg border border-border/70 bg-muted/20 flex items-start space-x-2.5">
            <span className="h-5 w-5 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
              4
            </span>
            <div className="min-w-0">
              <p className="font-semibold text-xs text-foreground leading-tight truncate">{t("applications.step4Title")}</p>
              <p className="text-[10px] text-muted-foreground leading-snug mt-0.5 line-clamp-2">{t("applications.step4Desc")}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* GATC Statutory Scope Restriction Notice */}
      {(user?.role === Role.GATC_ADMIN || user?.role === Role.GATC_INSPECTOR) && (
        <div className="p-3.5 rounded-xl border border-primary/20 bg-primary/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Statutory Scope Restricted Testing Queue</p>
              <p className="text-[11px] text-muted-foreground">
                Showing applications strictly matching your authorized institutional testing scopes under Rule 14.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-1">
            {gatcScopes.map((scope) => (
              <Badge key={scope} variant="outline" className="text-[10px] bg-background/80 font-mono">
                {scope.replace(/_/g, " ")}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Filters Toolbar */}
      <Card className="p-3.5 sm:p-4 bg-muted/20 border-border/80 rounded-2xl shadow-2xs space-y-3">
        <div className="flex flex-col lg:flex-row items-center gap-3">
          <div className="relative flex-1 w-full flex items-center">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 z-10">
              <Search className="h-4 w-4 text-slate-400 shrink-0" />
            </div>
            <Input
              placeholder={t("applications.searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-10 h-11 text-sm bg-white dark:bg-card rounded-xl border-slate-200 dark:border-border text-foreground transition-all duration-300 ease-out focus:ring-4 focus:ring-[#0B2545]/15 dark:focus:ring-primary/20 focus:border-[#0B2545] dark:focus:border-primary"
            />
            {search && (
              <div className="absolute inset-y-0 right-0 flex items-center pr-2.5 z-10">
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-foreground hover:bg-slate-100 dark:hover:bg-muted transition-colors"
                  title="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full lg:w-auto">
            {/* Instrument Type Filter */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Scale className="h-4 w-4 text-slate-400 shrink-0 hidden sm:block" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="h-11 rounded-xl border border-slate-200 dark:border-border bg-white dark:bg-card px-3.5 text-sm w-full sm:w-60 shadow-2xs outline-none transition-all duration-300 ease-out focus:outline-none focus:border-[#0B2545] dark:focus:border-primary focus:ring-4 focus:ring-[#0B2545]/15 dark:focus:ring-primary/20 font-medium text-slate-800 dark:text-foreground cursor-pointer"
              >
                <option value="" className="bg-white dark:bg-card text-foreground">
                  {t("applications.allInstrumentTypes", { defaultValue: "All Instrument Types" })}
                </option>
                {Object.values(InstrumentType).map((itype) => (
                  <option key={itype} value={itype} className="bg-white dark:bg-card text-foreground">
                    {INSTRUMENT_TYPE_LABELS[itype] || itype.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="h-4 w-4 text-slate-400 shrink-0 hidden sm:block" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-11 rounded-xl border border-slate-200 dark:border-border bg-white dark:bg-card px-3.5 text-sm w-full sm:w-52 shadow-2xs outline-none transition-all duration-300 ease-out focus:outline-none focus:border-[#0B2545] dark:focus:border-primary focus:ring-4 focus:ring-[#0B2545]/15 dark:focus:ring-primary/20 font-medium text-slate-800 dark:text-foreground cursor-pointer"
              >
                <option value="" className="bg-white dark:bg-card text-foreground">{t("applications.allStatuses")}</option>
                {Object.values(ApplicationStatus).map((st) => (
                  <option key={st} value={st} className="bg-white dark:bg-card text-foreground">
                    {t(`status.${st}`, st)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Active Filter Badges */}
        {(search || statusFilter || typeFilter) && (
          <div className="flex items-center flex-wrap gap-2 pt-2 border-t border-border/60 text-xs">
            <span className="text-muted-foreground font-medium">Active filters:</span>
            {typeFilter && (
              <Badge variant="secondary" className="gap-1.5 py-1 px-2.5 font-normal inline-flex items-center">
                <Scale className="h-3 w-3 text-muted-foreground shrink-0" />
                <span>{INSTRUMENT_TYPE_LABELS[typeFilter as InstrumentType] || typeFilter}</span>
                <button
                  onClick={() => setTypeFilter("")}
                  className="hover:text-foreground ml-0.5 inline-flex items-center"
                  title="Remove type filter"
                >
                  <X className="h-3 w-3 shrink-0" />
                </button>
              </Badge>
            )}
            {statusFilter && (
              <Badge variant="secondary" className="gap-1.5 py-1 px-2.5 font-normal inline-flex items-center">
                <Filter className="h-3 w-3 text-muted-foreground shrink-0" />
                <span>{t(`status.${statusFilter}`, statusFilter)}</span>
                <button
                  onClick={() => setStatusFilter("")}
                  className="hover:text-foreground ml-0.5 inline-flex items-center"
                  title="Remove status filter"
                >
                  <X className="h-3 w-3 shrink-0" />
                </button>
              </Badge>
            )}
            {search && (
              <Badge variant="secondary" className="gap-1.5 py-1 px-2.5 font-normal inline-flex items-center">
                <Search className="h-3 w-3 text-muted-foreground shrink-0" />
                <span>"{search}"</span>
                <button
                  onClick={() => setSearch("")}
                  className="hover:text-foreground ml-0.5 inline-flex items-center"
                  title="Clear search"
                >
                  <X className="h-3 w-3 shrink-0" />
                </button>
              </Badge>
            )}
            <button
              onClick={() => {
                setSearch("");
                setStatusFilter("");
                setTypeFilter("");
              }}
              className="text-xs font-semibold text-primary hover:underline ml-auto"
            >
              Reset all
            </button>
          </div>
        )}
      </Card>

      {/* Content State */}
      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-10 w-full rounded-md" />
          <Skeleton className="h-14 w-full rounded-md" />
          <Skeleton className="h-14 w-full rounded-md" />
          <Skeleton className="h-14 w-full rounded-md" />
        </div>
      ) : isError ? (
        <div className="p-8 border border-destructive/40 bg-destructive/10 rounded-xl text-xs text-destructive text-center">
          {t("applications.errorLoading")}
        </div>
      ) : applications.length === 0 ? (
        <EmptyState
          icon={FileText}
          title={t("applications.emptyTitle")}
          description={
            search || statusFilter || typeFilter
              ? t("applications.emptyFilterDesc")
              : t("applications.emptyNoRecordsDesc")
          }
          action={
            search || statusFilter || typeFilter ? (
              <Button
                size="sm"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("");
                  setTypeFilter("");
                }}
                className="h-8 text-xs font-semibold"
              >
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                {t("applications.clearFilters")}
              </Button>
            ) : user?.role === Role.CONSUMER ? (
              <Button
                size="sm"
                onClick={() => setIsSubmitOpen(true)}
                className="h-8 text-xs font-semibold shrink-0 bg-[#0B2545] hover:bg-[#0B2545]/90 text-white shadow-xs"
              >
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                {t("applications.submitNew")}
              </Button>
            ) : null
          }
        />
      ) : (
        <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-2xs">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("applications.table.applicationNumber")}</TableHead>
                <TableHead>{t("applications.table.instrument")}</TableHead>
                <TableHead>{t("applications.table.applicant")}</TableHead>
                <TableHead>{t("applications.table.type")}</TableHead>
                <TableHead>{t("applications.table.status")}</TableHead>
                <TableHead>{t("applications.table.scheduledDate")}</TableHead>
                <TableHead>{t("applications.table.assignedOfficer")}</TableHead>
                <TableHead className="text-right">{t("applications.table.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((app) => (
                <TableRow
                  key={app.id}
                  className={cn(
                    "hover:bg-muted/30 transition-colors cursor-pointer",
                    app.status === ApplicationStatus.INSPECTED && "bg-amber-500/5 hover:bg-amber-500/10"
                  )}
                  onClick={() => {
                    if (app.inspectionRecord || app.status === ApplicationStatus.INSPECTED || app.status === ApplicationStatus.CERTIFIED) {
                      setInspectionDetailsTarget(app);
                    }
                  }}
                >
                  <TableCell className="font-mono font-bold text-foreground">
                    <div className="flex items-center gap-2">
                      <span>{app.applicationNumber}</span>
                      {(app.inspectionRecord || app.status === ApplicationStatus.INSPECTED) && (
                        <span className="text-[10px] text-primary/80 font-normal hover:underline" title="Click to view inspection details">
                          (Inspection)
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-semibold text-foreground leading-tight">
                        {app.instrument?.serialNumber}
                      </span>
                      {app.instrument?.type && (
                        <Badge variant="outline" className="text-[9px] px-1 py-0 bg-muted/40 font-mono">
                          {app.instrument.type.replace(/_/g, " ")}
                        </Badge>
                      )}
                    </div>
                    <span className="text-[11px] text-muted-foreground block">
                      {app.instrument?.make} ({app.instrument?.capacity} {app.instrument?.unit})
                    </span>
                  </TableCell>
                  <TableCell className="text-xs">
                    <span className="font-medium text-foreground block">
                      {app.applicant?.name}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {app.applicant?.phone}
                    </span>
                  </TableCell>
                  <TableCell className="text-[11px] text-muted-foreground">
                    {app.type}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(app.status)}>
                      {app.status === ApplicationStatus.INSPECTED
                        ? (t("status.AWAITING_SIGNATURE", { defaultValue: "Awaiting Signature" }) as string)
                        : (t(`status.${app.status}`, { defaultValue: app.status }) as string)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs font-mono">
                    {app.scheduledDate ? formatDate(app.scheduledDate) : "—"}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {app.assignedOfficer?.name || t("applications.table.unassigned")}
                  </TableCell>
                  <TableCell className="text-right space-x-1.5">
                    {/* Role-based actions */}
                    {(user?.role === Role.LMO ||
                      user?.role === Role.GATC_ADMIN ||
                      user?.role === Role.GATC_INSPECTOR ||
                      user?.role === Role.ADMIN) && (
                      <>
                        {app.status === ApplicationStatus.SUBMITTED && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs font-medium px-2.5 shadow-2xs inline-flex items-center gap-1.5 whitespace-nowrap"
                            onClick={(e) => {
                              e.stopPropagation();
                              setScheduleTarget(app);
                            }}
                          >
                            <Calendar className="h-3 w-3 shrink-0" />
                            <span>{t("applications.table.schedule")}</span>
                          </Button>
                        )}
                        {app.status === ApplicationStatus.SCHEDULED && (
                          <Button
                            variant="default"
                            size="sm"
                            className="h-7 text-xs font-semibold px-2.5 shadow-xs inline-flex items-center gap-1.5 whitespace-nowrap"
                            onClick={(e) => {
                              e.stopPropagation();
                              setInspectionTarget(app);
                            }}
                          >
                            <ClipboardCheck className="h-3 w-3 shrink-0" />
                            <span>{t("applications.table.inspect")}</span>
                          </Button>
                        )}
                        {app.status === ApplicationStatus.INSPECTED && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs font-medium px-2 shadow-2xs border-slate-300 dark:border-border text-foreground hover:bg-muted inline-flex items-center gap-1 whitespace-nowrap"
                              onClick={(e) => {
                                e.stopPropagation();
                                setInspectionDetailsTarget(app);
                              }}
                              title="Review on-site inspection measurements and photos"
                            >
                              <FileText className="h-3 w-3 shrink-0 text-muted-foreground" />
                              <span>Review</span>
                            </Button>
                            {(user?.role === Role.ADMIN || user?.role === Role.GATC_ADMIN) && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs font-semibold px-2.5 shadow-2xs border-amber-500/50 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/30 inline-flex items-center gap-1.5 whitespace-nowrap"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSignConfirmTarget(app);
                                }}
                                disabled={issuingId === app.id}
                              >
                                {issuingId === app.id ? (
                                  <Loader2 className="h-3 w-3 animate-spin shrink-0" />
                                ) : (
                                  <ShieldCheck className="h-3 w-3 text-amber-600 shrink-0" />
                                )}
                                <span>{t("applications.table.digitallySign", { defaultValue: "Digitally Sign & Issue" })}</span>
                              </Button>
                            )}
                          </>
                        )}
                      </>
                    )}

                    {app.status === ApplicationStatus.CERTIFIED && app.certificate?.certificateNumber && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs font-normal px-2 text-muted-foreground hover:text-foreground inline-flex items-center gap-1 whitespace-nowrap"
                          onClick={(e) => {
                            e.stopPropagation();
                            setInspectionDetailsTarget(app);
                          }}
                          title="View on-site inspection audit record"
                        >
                          <FileText className="h-3 w-3 shrink-0" />
                          <span>Audit</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs font-medium px-2.5 shadow-2xs border-emerald-500/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 inline-flex items-center gap-1.5 whitespace-nowrap"
                          onClick={(e) => {
                            e.stopPropagation();
                            setViewCertNumber(app.certificate.certificateNumber);
                          }}
                        >
                          <Award className="h-3 w-3 shrink-0" />
                          <span>{t("applications.table.certificate")}</span>
                        </Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Dialogs */}
      {user?.role === Role.CONSUMER && (
        <SubmitApplicationDialog open={isSubmitOpen} onOpenChange={setIsSubmitOpen} />
      )}

      {scheduleTarget && (
        <ScheduleInspectionDialog
          open={!!scheduleTarget}
          onOpenChange={(open) => !open && setScheduleTarget(null)}
          applicationId={scheduleTarget.id}
          applicationNumber={scheduleTarget.applicationNumber}
        />
      )}

      {inspectionTarget && (
        <RecordInspectionDialog
          open={!!inspectionTarget}
          onOpenChange={(open) => !open && setInspectionTarget(null)}
          applicationId={inspectionTarget.id}
          applicationNumber={inspectionTarget.applicationNumber}
          instrumentSerialNumber={inspectionTarget.instrument?.serialNumber || ""}
        />
      )}

      {inspectionDetailsTarget && (
        <InspectionDetailsDialog
          open={!!inspectionDetailsTarget}
          onOpenChange={(open) => !open && setInspectionDetailsTarget(null)}
          application={inspectionDetailsTarget}
          canSign={
            user?.role === Role.ADMIN ||
            user?.role === Role.GATC_ADMIN
          }
          onSignClick={(app) => {
            setInspectionDetailsTarget(null);
            setSignConfirmTarget(app);
          }}
          onViewCertificate={(certNum) => {
            setInspectionDetailsTarget(null);
            setViewCertNumber(certNum);
          }}
        />
      )}

      {signConfirmTarget && (
        <SignConfirmationDialog
          open={!!signConfirmTarget}
          onOpenChange={(open) => !open && setSignConfirmTarget(null)}
          application={signConfirmTarget}
          isSigning={issuingId === signConfirmTarget.id}
          onConfirm={async () => {
            await handleIssueCertificate(signConfirmTarget);
            setSignConfirmTarget(null);
          }}
        />
      )}

      <CertificateDialog
        certificateNumber={viewCertNumber}
        open={!!viewCertNumber}
        onOpenChange={(open) => !open && setViewCertNumber(null)}
      />
    </div>
  );
}

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { CertificateDialog } from "@/components/common/CertificateDialog";
import {
  ClipboardCheck,
  CheckCircle2,
  Clock,
  MapPin,
  Building,
  Phone,
  Scale,
  Calendar,
  Play,
  Search,
  QrCode,
  XCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { RecordInspectionDialog } from "@/features/inspections/RecordInspectionDialog";
import { ApplicationStatus } from "@sih/shared";

export function FieldRosterPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<"scheduled" | "certified" | "all">("scheduled");
  const [search, setSearch] = useState("");
  const [inspectionTarget, setInspectionTarget] = useState<{
    id: string;
    number: string;
    serial: string;
  } | null>(null);
  const [viewCertNumber, setViewCertNumber] = useState<string | null>(null);

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ["fieldApplications"],
    queryFn: async () => {
      const res = await api.get("/applications");
      return res.data.data;
    },
  });

  const scheduledApps = applications.filter(
    (a: any) => a.status === ApplicationStatus.SCHEDULED || a.status === ApplicationStatus.SUBMITTED
  );
  const certifiedApps = applications.filter(
    (a: any) => a.status === ApplicationStatus.CERTIFIED
  );

  const currentList =
    activeTab === "scheduled"
      ? scheduledApps
      : activeTab === "certified"
      ? certifiedApps
      : applications;

  const filtered = currentList.filter((a: any) => {
    const q = search.toLowerCase();
    return (
      a.applicationNumber?.toLowerCase().includes(q) ||
      a.instrument?.serialNumber?.toLowerCase().includes(q) ||
      a.applicant?.name?.toLowerCase().includes(q) ||
      a.instrument?.district?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Roster KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="shadow-2xs border-sky-200 dark:border-sky-900/60 bg-sky-50/30 dark:bg-sky-950/20">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-sky-950 dark:text-sky-300 font-semibold">{t("roster.todayVisits", { defaultValue: "Today's Visits" })}</span>
              <Clock className="h-4 w-4 text-sky-600" />
            </div>
            <p className="text-2xl font-bold font-mono text-sky-700 dark:text-sky-400">
              {scheduledApps.length}
            </p>
            <p className="text-[11px] text-muted-foreground">{t("roster.pendingInspection", { defaultValue: "Pending inspection" })}</p>
          </CardContent>
        </Card>

        <Card className="shadow-2xs border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/30 dark:bg-emerald-950/20">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-emerald-950 dark:text-emerald-300 font-semibold">{t("roster.certified", { defaultValue: "Certified" })}</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-bold font-mono text-emerald-600">
              {certifiedApps.length}
            </p>
            <p className="text-[11px] text-muted-foreground">{t("roster.digitallySignedStamped", { defaultValue: "Digitally signed & stamped" })}</p>
          </CardContent>
        </Card>

        <Card className="shadow-2xs">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-medium">{t("roster.totalPipeline", { defaultValue: "Total Pipeline" })}</span>
              <ClipboardCheck className="h-4 w-4 text-zinc-500" />
            </div>
            <p className="text-2xl font-bold font-mono text-foreground">
              {applications.length}
            </p>
            <p className="text-[11px] text-muted-foreground">{t("roster.assignedRoster", { defaultValue: "Assigned roster" })}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter & View Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-md bg-muted/40 border border-border overflow-x-auto">
          <button
            onClick={() => setActiveTab("scheduled")}
            className={`px-3 py-1 text-xs rounded font-semibold whitespace-nowrap transition-colors ${
              activeTab === "scheduled"
                ? "bg-card text-foreground shadow-2xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t("roster.pendingVisits", { defaultValue: "Pending Visits" })} ({scheduledApps.length})
          </button>
          <button
            onClick={() => setActiveTab("certified")}
            className={`px-3 py-1 text-xs rounded font-semibold whitespace-nowrap transition-colors ${
              activeTab === "certified"
                ? "bg-card text-foreground shadow-2xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t("roster.certifiedStampedTab", { defaultValue: "Certified & Stamped" })} ({certifiedApps.length})
          </button>
          <button
            onClick={() => setActiveTab("all")}
            className={`px-3 py-1 text-xs rounded font-semibold whitespace-nowrap transition-colors ${
              activeTab === "all"
                ? "bg-card text-foreground shadow-2xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t("roster.allTab", { defaultValue: "All" })} ({applications.length})
          </button>
        </div>

        {/* Search */}
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder={t("roster.searchPlaceholder", { defaultValue: "Search by serial or applicant..." })}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 text-xs font-mono"
          />
        </div>
      </div>

      {/* Roster Cards List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-muted-foreground border rounded-lg bg-card">
            {t("roster.loading", { defaultValue: "Loading assigned inspection roster..." })}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground border rounded-lg bg-card">
            {t("roster.noVisits", { defaultValue: "No inspection visits found for this filter." })}
          </div>
        ) : (
          filtered.map((app: any) => (
            <Card
              key={app.id}
              className="shadow-2xs transition-all hover:border-zinc-400 dark:hover:border-zinc-700"
            >
              <CardContent className="p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Left Details */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-foreground">
                        {app.applicationNumber}
                      </span>
                      <Badge
                        variant={
                          app.status === ApplicationStatus.SCHEDULED
                            ? "scheduled"
                            : app.status === ApplicationStatus.CERTIFIED
                            ? "certified"
                            : app.status === ApplicationStatus.REJECTED
                            ? "rejected"
                            : "secondary"
                        }
                        className="text-[10px]"
                      >
                        {t(`status.${app.status}`, { defaultValue: app.status })}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground font-medium">
                        {app.type === "NEW"
                          ? t("applicationType.NEW", { defaultValue: "New Verification" })
                          : t("applicationType.RE_VERIFICATION", { defaultValue: "Periodic Re-Verification" })}
                      </span>
                    </div>

                    {/* Instrument Specs */}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                      <div className="flex items-center gap-1.5 font-mono font-semibold text-foreground">
                        <Scale className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span>SN: {app.instrument?.serialNumber}</span>
                      </div>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-foreground">{app.instrument?.make}</span>
                      <span className="text-muted-foreground">({app.instrument?.model})</span>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-zinc-600 dark:text-zinc-400">
                        {t("instrument.capacity", { defaultValue: "Cap" })}: {app.instrument?.capacity} {app.instrument?.unit} ({app.instrument?.accuracyClass})
                      </span>
                    </div>

                    {/* Establishment & Address */}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5 font-medium text-foreground">
                        <Building className="h-3 w-3 text-muted-foreground shrink-0" />
                        <span>{app.applicant?.name}</span>
                      </div>
                      <span>•</span>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
                        <span>{app.instrument?.district}, {app.instrument?.state}</span>
                      </div>
                      {app.applicant?.phone && (
                        <>
                          <span>•</span>
                          <div className="flex items-center gap-1.5">
                            <Phone className="h-3 w-3 text-muted-foreground shrink-0" />
                            <span>{app.applicant.phone}</span>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Scheduled Date */}
                    {app.scheduledDate && (
                      <p className="text-[11px] text-sky-700 dark:text-sky-400 font-medium inline-flex items-center gap-1.5">
                        <Calendar className="h-3 w-3 shrink-0" />
                        <span>{t("roster.pendingVisits", { defaultValue: "Visit Appointment" })}: {new Date(app.scheduledDate).toLocaleString()}</span>
                      </p>
                    )}
                  </div>

                  {/* Right Action Button */}
                  <div className="flex items-center sm:self-center shrink-0 gap-2">
                    {app.status === ApplicationStatus.SCHEDULED || app.status === ApplicationStatus.SUBMITTED ? (
                      <Button
                        size="sm"
                        onClick={() =>
                          setInspectionTarget({
                            id: app.id,
                            number: app.applicationNumber,
                            serial: app.instrument?.serialNumber,
                          })
                        }
                        className="w-full sm:w-auto h-9 text-xs font-semibold"
                      >
                        <Play className="h-3.5 w-3.5 mr-1.5 fill-current" />
                        {t("roster.recordMpe", { defaultValue: "Start MPE Test" })}
                      </Button>
                    ) : app.status === ApplicationStatus.CERTIFIED ? (
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className="text-xs px-2.5 py-1 text-emerald-700 border-emerald-300 bg-emerald-50 dark:bg-emerald-950/30 font-medium inline-flex items-center gap-1.5 whitespace-nowrap"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                          <span>{t("roster.certifiedStampedTab", { defaultValue: "Certified & Stamped" })}</span>
                        </Badge>
                        {app.certificate?.certificateNumber && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs font-semibold shadow-2xs hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 inline-flex items-center gap-1.5 whitespace-nowrap"
                            onClick={() => setViewCertNumber(app.certificate.certificateNumber)}
                          >
                            <QrCode className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                            <span>{t("roster.viewCertificate", { defaultValue: "View Certificate" })}</span>
                          </Button>
                        )}
                      </div>
                    ) : app.status === ApplicationStatus.REJECTED ? (
                      <Badge
                        variant="outline"
                        className="text-xs px-2.5 py-1 text-rose-700 border-rose-300 bg-rose-50 dark:bg-rose-950/30 font-medium inline-flex items-center gap-1.5 whitespace-nowrap"
                      >
                        <XCircle className="h-3.5 w-3.5 text-rose-600 shrink-0" />
                        <span>{t("status.REJECTED", { defaultValue: "Rejected (Exceeds MPE)" })}</span>
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs px-2.5 py-1 text-muted-foreground border-border whitespace-nowrap inline-flex items-center">
                        <span>{t(`status.${app.status}`, { defaultValue: app.status })}</span>
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Verification Dialog Modal */}
      {inspectionTarget && (
        <RecordInspectionDialog
          open={!!inspectionTarget}
          onOpenChange={(open) => !open && setInspectionTarget(null)}
          applicationId={inspectionTarget.id}
          applicationNumber={inspectionTarget.number}
          instrumentSerialNumber={inspectionTarget.serial}
        />
      )}

      {/* Certificate Viewer Modal */}
      <CertificateDialog
        certificateNumber={viewCertNumber}
        open={!!viewCertNumber}
        onOpenChange={(open) => !open && setViewCertNumber(null)}
      />
    </div>
  );
}

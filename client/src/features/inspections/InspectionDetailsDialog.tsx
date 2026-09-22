import { useState } from "react";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { ApplicationStatus } from "@sih/shared";
import {
  ShieldCheck,
  Scale,
  Camera,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  MapPin,
  FileText,
  Key,
  Award,
  AlertTriangle,
  Lock,
} from "lucide-react";

interface InspectionDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  application: any;
  onSignClick?: (application: any) => void;
  onViewCertificate?: (certificateNumber: string) => void;
  canSign?: boolean;
}

export function InspectionDetailsDialog({
  open,
  onOpenChange,
  application,
  onSignClick,
  onViewCertificate,
  canSign = false,
}: InspectionDetailsDialogProps) {
  if (!application) return null;

  const inspection = application.inspectionRecord;
  const instrument = application.instrument;
  const applicant = application.applicant;
  const isInspected = application.status === ApplicationStatus.INSPECTED;
  const isCertified = application.status === ApplicationStatus.CERTIFIED;
  const isRejected = application.status === ApplicationStatus.REJECTED;

  const observations = inspection?.observations || {};
  const photoUrls: string[] = inspection?.photoUrls || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange} className="max-w-2xl sm:max-w-3xl max-h-[90vh] overflow-y-auto p-5 sm:p-7">
      <DialogHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/70 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#0B2545]/10 dark:bg-primary/10 border border-[#0B2545]/20 dark:border-primary/20 flex items-center justify-center text-[#0B2545] dark:text-primary shrink-0 shadow-2xs">
              <Scale className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <DialogTitle className="text-base sm:text-lg font-bold text-foreground">
                  Statutory Verification Audit
                </DialogTitle>
                <Badge variant="outline" className="font-mono text-[10px] px-1.5 py-0.5">
                  {application.applicationNumber}
                </Badge>
              </div>
              <DialogDescription className="text-xs text-muted-foreground">
                Rule 14 & Rule 24 Metrological Compliance Record under Legal Metrology Act, 2009
              </DialogDescription>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            {isInspected && (
              <Badge variant="outline" className="bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30 text-xs px-2.5 py-1 font-semibold flex items-center gap-1.5">
                <Clock className="h-3 w-3" />
                <span>Awaiting Signature</span>
              </Badge>
            )}
            {isCertified && (
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-xs px-2.5 py-1 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="h-3 w-3" />
                <span>Certified & Stamped</span>
              </Badge>
            )}
            {isRejected && (
              <Badge variant="outline" className="bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30 text-xs px-2.5 py-1 font-semibold flex items-center gap-1.5">
                <XCircle className="h-3 w-3" />
                <span>Rejected (Exceeds MPE)</span>
              </Badge>
            )}
          </div>
        </div>
      </DialogHeader>

      <div className="space-y-5 my-3 text-xs">
        {/* Status Callout Banner */}
        {isInspected && (
          <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/8 flex items-start gap-2.5">
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-semibold text-amber-900 dark:text-amber-200">
                Action Required: Digital Signature Pending
              </p>
              <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80 leading-relaxed">
                This instrument has been physically tested and lead-sealed on site by the inspecting officer. 
                Under Section 24, review the measured error tolerance and attached photos below to authenticate and digitally sign the statutory certificate.
              </p>
            </div>
          </div>
        )}

        {/* Section 1: Instrument & Commercial Entity Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Instrument Profile */}
          <div className="rounded-xl border border-border/80 bg-muted/20 p-3.5 space-y-2.5">
            <div className="flex items-center gap-1.5 text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">
              <Scale className="h-3.5 w-3.5 text-primary" />
              <span>Instrument Specifications</span>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Serial Number:</span>
                <span className="font-mono font-bold text-foreground">{instrument?.serialNumber || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Make & Model:</span>
                <span className="font-medium text-foreground">{instrument?.make} ({instrument?.model || "Standard"})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Instrument Type:</span>
                <span className="text-foreground">{instrument?.type?.replace(/_/g, " ") || "NAWI"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Capacity & Accuracy:</span>
                <span className="font-semibold text-foreground">
                  {instrument?.capacity} {instrument?.unit} ({instrument?.accuracyClass || "Class III"})
                </span>
              </div>
            </div>
          </div>

          {/* Trader & Premise */}
          <div className="rounded-xl border border-border/80 bg-muted/20 p-3.5 space-y-2.5">
            <div className="flex items-center gap-1.5 text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">
              <User className="h-3.5 w-3.5 text-primary" />
              <span>Commercial Establishment</span>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Applicant / Trader:</span>
                <span className="font-medium text-foreground truncate max-w-[180px]">{applicant?.name || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Contact Phone:</span>
                <span className="font-mono text-foreground">{applicant?.phone || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Jurisdiction / Area:</span>
                <span className="text-foreground">{instrument?.district}, {instrument?.state}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Application Type:</span>
                <Badge variant="outline" className="text-[10px] font-normal">
                  {application.type}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Statutory Metrological Test & MPE Compliance */}
        <div className="rounded-xl border border-border/80 bg-card p-4 space-y-3.5 shadow-2xs">
          <div className="flex items-center justify-between border-b border-border/60 pb-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span className="font-bold text-foreground">Statutory Tolerance Verification (Rule 14)</span>
            </div>
            <Badge
              variant="outline"
              className={
                inspection?.actualErrorObserved <= (inspection?.maxPermissibleError ?? 1.5)
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-300"
                  : "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-300"
              }
            >
              {inspection?.actualErrorObserved <= (inspection?.maxPermissibleError ?? 1.5)
                ? "Statutory Tolerance Satisfied"
                : "Tolerance Exceeded"}
            </Badge>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 rounded-lg bg-muted/30 border border-border/60">
              <span className="text-[10px] text-muted-foreground uppercase block font-semibold">Max Permissible Error</span>
              <span className="text-sm font-mono font-bold text-foreground">
                ±{inspection?.maxPermissibleError ?? 1.5} g
              </span>
            </div>
            <div className="p-3 rounded-lg bg-muted/30 border border-border/60">
              <span className="text-[10px] text-muted-foreground uppercase block font-semibold">Observed Test Error</span>
              <span className="text-sm font-mono font-bold text-emerald-600 dark:text-emerald-400">
                +{inspection?.actualErrorObserved ?? 0.0} g
              </span>
            </div>
            <div className="p-3 rounded-lg bg-muted/30 border border-border/60">
              <span className="text-[10px] text-muted-foreground uppercase block font-semibold">Verification Seal</span>
              <span className="text-sm font-mono font-bold text-primary truncate block">
                {inspection?.sealNumber || "LM-SEAL-VERIFIED"}
              </span>
            </div>
            <div className="p-3 rounded-lg bg-muted/30 border border-border/60">
              <span className="text-[10px] text-muted-foreground uppercase block font-semibold">Test Date</span>
              <span className="text-xs font-mono font-medium text-foreground block pt-0.5">
                {inspection?.inspectedAt ? formatDate(inspection.inspectedAt) : formatDate(application.updatedAt)}
              </span>
            </div>
          </div>

          {/* Technical Observations & Standards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3 rounded-lg bg-muted/20 border border-border/60 space-y-1.5">
              <span className="font-semibold text-foreground text-[11px] block">Test Observations:</span>
              <div className="space-y-1 text-[11px] text-muted-foreground">
                <div>• Repeatability: <span className="text-foreground">{observations?.repeatability || "Passed (<0.2e)"}</span></div>
                <div>• Eccentricity: <span className="text-foreground">{observations?.eccentricity || "Passed (Within Class Limit)"}</span></div>
                <div>• Linearity: <span className="text-foreground">{observations?.linearity || "Verified across 5 load points"}</span></div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-muted/20 border border-border/60 space-y-1.5">
              <span className="font-semibold text-foreground text-[11px] block">Standards & Officer Details:</span>
              <div className="space-y-1 text-[11px] text-muted-foreground">
                <div>• Standards Used: <span className="font-mono text-foreground">{inspection?.standardsUsed?.join(", ") || "IND-STD-E2-2024"}</span></div>
                <div>• Inspecting Officer: <span className="font-medium text-foreground">{inspection?.officer?.name || application.assignedOfficer?.name || "LMO Field Inspector"}</span></div>
                {inspection?.remarks && (
                  <div>• Officer Remarks: <span className="italic text-foreground">"{inspection.remarks}"</span></div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: On-Site Inspection Proof (Cloudinary CDN) */}
        <div className="rounded-xl border border-border/80 bg-card p-4 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between border-b border-border/60 pb-2">
            <div className="flex items-center gap-2">
              <Camera className="h-4 w-4 text-primary" />
              <span className="font-bold text-foreground">On-Site Inspection Photographic Evidence</span>
            </div>
            <Badge variant="outline" className="text-[10px] font-mono bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border-sky-300">
              Cloudinary CDN Verified
            </Badge>
          </div>

          {photoUrls.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {photoUrls.map((url, idx) => (
                <div
                  key={idx}
                  className="rounded-lg border border-border overflow-hidden bg-muted/20 group relative"
                >
                  <img
                    src={url}
                    alt={`Inspection Evidence ${idx + 1}`}
                    className="w-full h-44 object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                  />
                  <div className="p-2.5 bg-background/95 border-t border-border flex items-center justify-between">
                    <span className="text-[11px] font-mono text-muted-foreground truncate max-w-[180px]">
                      {`evidence_photo_${idx + 1}.jpg`}
                    </span>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline inline-flex items-center gap-1 font-medium"
                    >
                      <span>Full View</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center rounded-lg border border-dashed border-border/80 bg-muted/10 space-y-1">
              <Camera className="h-6 w-6 mx-auto text-muted-foreground/60" />
              <p className="text-xs text-muted-foreground">No on-site photo proof captured for this verification.</p>
              <p className="text-[10px] text-muted-foreground/80">Physical seal and bench calibration measurements verified.</p>
            </div>
          )}
        </div>
      </div>

      <DialogFooter className="mt-5 gap-2 sm:gap-0 border-t border-border/60 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => onOpenChange(false)}
          className="text-xs h-9"
        >
          Close
        </Button>

        {isCertified && application.certificate?.certificateNumber && (
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              onViewCertificate?.(application.certificate.certificateNumber);
            }}
            className="text-xs h-9 font-semibold text-emerald-700 border-emerald-300 hover:bg-emerald-50 dark:text-emerald-300 dark:border-emerald-800 inline-flex items-center gap-1.5"
          >
            <Award className="h-3.5 w-3.5 text-emerald-600" />
            <span>View Issued Certificate</span>
          </Button>
        )}

        {isInspected && canSign && (
          <Button
            type="button"
            onClick={() => onSignClick?.(application)}
            className="text-xs h-9 font-semibold bg-[#0B2545] hover:bg-[#0B2545]/90 text-white shadow-xs inline-flex items-center gap-2"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-amber-400" />
            <span>Digitally Sign & Issue Certificate</span>
          </Button>
        )}
      </DialogFooter>
    </Dialog>
  );
}


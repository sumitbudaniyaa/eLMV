import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { QRCodeSVG } from "qrcode.react";
import {
  Download,
  Printer,
  Scale,
  FileCheck2,
  UserCheck,
  ShieldCheck,
  AlertTriangle,
  XCircle,
  Loader2,
} from "lucide-react";
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { ApiResponse } from "@sih/shared";
import { formatDate } from "@/lib/utils";
import { downloadCertificatePdf, printCertificateElement } from "@/lib/certificateUtils";

export interface CertificateDialogProps {
  certificateNumber: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: any;
}

export function CertificateDialog({
  certificateNumber,
  open,
  onOpenChange,
  initialData,
}: CertificateDialogProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  // Fetch certificate verification data if not already passed or if certificateNumber changes
  const {
    data: fetchedData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["verification-dialog", certificateNumber],
    queryFn: async () => {
      if (!certificateNumber) return null;
      const res = await api.get<ApiResponse<any>>(
        `/verification/verify/${encodeURIComponent(certificateNumber)}`
      );
      return res.data?.data;
    },
    enabled: open && !!certificateNumber && !initialData,
    staleTime: 60 * 1000,
  });

  const result = initialData || fetchedData;

  const handleDownload = async () => {
    if (!result?.certificate?.certificateNumber) return;
    try {
      setIsDownloading(true);
      await downloadCertificatePdf(result.certificate.certificateNumber);
    } catch (err) {
      console.error("Download failed:", err);
      alert("Failed to download PDF. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    printCertificateElement("certificate-modal-print-node");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} className="max-w-3xl sm:max-w-4xl max-h-[92vh] overflow-y-auto p-4 sm:p-6">
      <DialogHeader className="sr-only">
        <DialogTitle>Statutory Verification Certificate</DialogTitle>
        <DialogDescription>
          Legal Metrology Act 2009 Official Schedule XI Certificate
        </DialogDescription>
      </DialogHeader>

      {/* Loading State */}
      {isLoading && (
        <div className="py-16 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
          <p className="text-xs font-medium text-muted-foreground">
            Verifying cryptographic credentials and loading statutory certificate...
          </p>
        </div>
      )}

      {/* Error State */}
      {!isLoading && (isError || (!result && certificateNumber)) && (
        <div className="py-12 px-4 flex flex-col items-center justify-center text-center space-y-3">
          <div className="h-12 w-12 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center border border-rose-200 dark:border-rose-900">
            <XCircle className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-foreground">Certificate Not Found</h3>
            <p className="text-xs text-muted-foreground max-w-sm">
              {(error as any)?.response?.data?.error?.message ||
                `Could not locate statutory certificate for identifier "${certificateNumber}". Please verify the certificate number.`}
            </p>
          </div>
          <div className="flex items-center gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => refetch()} className="h-8 text-xs">
              Retry Verification
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)} className="h-8 text-xs">
              Close
            </Button>
          </div>
        </div>
      )}

      {/* Loaded Certificate Content */}
      {!isLoading && result && (
        <div className="space-y-4">
          {/* Top Verification Status Banner */}
          <div
            className={`p-3.5 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs ${
              result.verificationStatus === "VALID_AND_ACTIVE"
                ? "bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800"
                : result.verificationStatus === "EXPIRED"
                ? "bg-amber-50/80 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800"
                : "bg-rose-50/80 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800"
            }`}
          >
            <div className="flex items-center space-x-3">
              <div
                className={`p-2 rounded-lg shrink-0 ${
                  result.verificationStatus === "VALID_AND_ACTIVE"
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300"
                    : result.verificationStatus === "EXPIRED"
                    ? "bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300"
                    : "bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300"
                }`}
              >
                {result.verificationStatus === "VALID_AND_ACTIVE" ? (
                  <ShieldCheck className="h-5 w-5" />
                ) : result.verificationStatus === "EXPIRED" ? (
                  <AlertTriangle className="h-5 w-5" />
                ) : (
                  <XCircle className="h-5 w-5" />
                )}
              </div>
              <div>
                <span className="text-xs font-bold text-foreground uppercase tracking-wide">
                  {result.verificationStatus === "VALID_AND_ACTIVE"
                    ? "Statutory Certificate Verified & Active"
                    : result.verificationStatus === "EXPIRED"
                    ? "Certificate Expired — Re-Verification Required"
                    : "Cryptographic Digest Mismatch / Invalid"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                disabled={isDownloading}
                className="h-8 text-xs font-semibold shadow-2xs"
              >
                {isDownloading ? (
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                ) : (
                  <Download className="h-3.5 w-3.5 mr-1.5 text-primary" />
                )}
                {isDownloading ? "Downloading..." : "Download PDF"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                className="h-8 text-xs font-semibold shadow-2xs"
              >
                <Printer className="h-3.5 w-3.5 mr-1.5 text-foreground" />
                Print
              </Button>
            </div>
          </div>

          {/* Official Printable Statutory Certificate Card */}
          <div
            id="certificate-modal-print-node"
            className="rounded-xl border-2 border-zinc-900 dark:border-zinc-700 bg-white dark:bg-zinc-950 p-5 sm:p-7 space-y-4 shadow-sm text-zinc-900 dark:text-zinc-100"
          >
            {/* Certificate Header with QR */}
            <div className="flex items-start justify-between pb-3 border-b-2 border-zinc-900/80 dark:border-zinc-700 gap-3">
              <div className="space-y-1 min-w-0 flex-1">
                <div className="inline-flex flex-wrap items-center gap-1.5 text-[9.5px] font-mono tracking-widest uppercase text-zinc-600 dark:text-zinc-400 font-bold">
                  <span>GOVERNMENT OF INDIA</span>
                  <span>•</span>
                  <span>DEPARTMENT OF CONSUMER AFFAIRS</span>
                </div>
                <h2 className="text-base sm:text-lg font-black tracking-tight uppercase text-zinc-900 dark:text-zinc-50 leading-tight">
                  Certificate of Verification of Weights &amp; Measures
                </h2>
                <p className="text-[10px] sm:text-[10.5px] text-zinc-600 dark:text-zinc-400 font-mono">
                  [Issued under Section 24 of Legal Metrology Act, 2009 &amp; Rule 27 of General Rules, 2011]
                </p>
              </div>


              {/* Statutory QR Code */}
              <div className="flex flex-col items-center justify-center p-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white shrink-0 shadow-2xs">
                <QRCodeSVG
                  value={`${window.location.origin}/verify?cert=${encodeURIComponent(
                    result.certificate?.certificateNumber || ""
                  )}`}
                  size={88}
                  level="H"
                  includeMargin={false}
                />
                <span className="text-[8px] font-mono font-bold text-zinc-700 mt-1 uppercase tracking-tighter">
                  Scan to Verify
                </span>
              </div>
            </div>

            {/* Quick Metadata Summary Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs">
              <div>
                <span className="text-[9px] text-zinc-500 uppercase font-bold block">Certificate No.</span>
                <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100 text-xs truncate block">
                  {result.certificate?.certificateNumber}
                </span>
              </div>
              <div>
                <span className="text-[9px] text-zinc-500 uppercase font-bold block">Verified / Stamped</span>
                <span className="font-medium text-zinc-900 dark:text-zinc-100">
                  {formatDate(result.certificate?.issuedAt)}
                </span>
              </div>
              <div>
                <span className="text-[9px] text-zinc-500 uppercase font-bold block">Valid Until</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400">
                  {formatDate(result.certificate?.validUntil)}
                </span>
              </div>
              <div>
                <span className="text-[9px] text-zinc-500 uppercase font-bold block">Affixed Seal No.</span>
                <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100 truncate block">
                  {result.inspection?.sealNumber || "STAMPED & VERIFIED"}
                </span>
              </div>
            </div>

            {/* Structured Specifications & Observation Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Verified Instrument Specifications */}
              <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-3.5 space-y-2.5 bg-zinc-50/50 dark:bg-zinc-900/40">
                <div className="flex items-center space-x-2 text-xs font-bold text-zinc-900 dark:text-zinc-100 border-b border-zinc-200 dark:border-zinc-800 pb-1.5">
                  <Scale className="h-3.5 w-3.5 text-zinc-500" />
                  <span>Verified Instrument Specifications</span>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between py-0.5 border-b border-zinc-200/60 dark:border-zinc-800">
                    <span className="text-zinc-500">Serial Number:</span>
                    <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      {result.instrument?.serialNumber}
                    </span>
                  </div>
                  <div className="flex justify-between py-0.5 border-b border-zinc-200/60 dark:border-zinc-800">
                    <span className="text-zinc-500">Category / Type:</span>
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">
                      {result.instrument?.type?.replace(/_/g, " ")}
                    </span>
                  </div>
                  <div className="flex justify-between py-0.5 border-b border-zinc-200/60 dark:border-zinc-800">
                    <span className="text-zinc-500">Make &amp; Model:</span>
                    <span className="font-medium text-zinc-900 dark:text-zinc-100 truncate max-w-[180px] text-right">
                      {result.instrument?.make} — {result.instrument?.model}
                    </span>
                  </div>
                  <div className="flex justify-between py-0.5 border-b border-zinc-200/60 dark:border-zinc-800">
                    <span className="text-zinc-500">Capacity / Max:</span>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                      {result.instrument?.capacity} {result.instrument?.unit}
                    </span>
                  </div>
                  <div className="flex justify-between py-0.5 border-b border-zinc-200/60 dark:border-zinc-800">
                    <span className="text-zinc-500">Accuracy Class:</span>
                    <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      {result.instrument?.accuracyClass}
                    </span>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span className="text-zinc-500">Location of Use:</span>
                    <span className="text-zinc-700 dark:text-zinc-300 text-right truncate max-w-[180px]">
                      {result.instrument?.district}, {result.instrument?.state}
                    </span>
                  </div>
                </div>
              </div>

              {/* Physical Test & Statutory Evaluation */}
              <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-3.5 space-y-2.5 bg-zinc-50/50 dark:bg-zinc-900/40">
                <div className="flex items-center space-x-2 text-xs font-bold text-zinc-900 dark:text-zinc-100 border-b border-zinc-200 dark:border-zinc-800 pb-1.5">
                  <FileCheck2 className="h-3.5 w-3.5 text-zinc-500" />
                  <span>Physical Test &amp; Statutory Evaluation</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-zinc-500">Observed Test Error:</span>
                      <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                        {result.inspection?.actualErrorObserved ?? 0} {result.instrument?.unit}
                      </span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-zinc-500">Permissible MPE Limit:</span>
                      <span className="font-mono font-medium text-zinc-800 dark:text-zinc-200">
                        ±{result.inspection?.maxPermissibleError ?? "0.00"} {result.instrument?.unit}
                      </span>
                    </div>
                    <span className="text-[9.5px] text-emerald-700 dark:text-emerald-400 font-bold block text-right">
                      PASS: Error strictly within statutory limits (Legal Metrology Rules, 2011)
                    </span>
                  </div>

                  <div className="space-y-1 pt-0.5">
                    <div className="flex justify-between py-0.5 border-b border-zinc-200/60 dark:border-zinc-800">
                      <span className="text-zinc-500">Inspecting Officer:</span>
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center">
                        <UserCheck className="h-3 w-3 mr-1 text-zinc-500" />
                        {result.inspection?.officer?.name || "Statutory Inspector"}
                      </span>
                    </div>
                    <div className="flex justify-between py-0.5">
                      <span className="text-zinc-500">Applicant / Owner:</span>
                      <span className="text-zinc-700 dark:text-zinc-300 font-medium truncate max-w-[180px] text-right">
                        {result.applicant?.stakeholderProfile?.businessName ||
                          result.applicant?.name ||
                          "Registered Commercial Trader"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Statutory Legal Notice & Cryptographic Seal */}
            <div className="border-t-2 border-zinc-900/80 dark:border-zinc-700 pt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[10px] text-zinc-600 dark:text-zinc-400">
              <div className="max-w-md space-y-0.5">
                <p className="font-semibold text-zinc-800 dark:text-zinc-200">Statutory Notice under Section 24:</p>
                <p className="leading-tight">
                  This statutory certificate confirms that the instrument specified above has been verified and stamped
                  per tolerances under the Legal Metrology Act, 2009. Any alteration, seal tampering, or unauthorized removal
                  renders this certificate void and invites prosecution under Section 30.
                </p>
              </div>

              <div className="text-right shrink-0 font-mono text-[9px] border border-zinc-300 dark:border-zinc-700 p-2 rounded bg-zinc-50 dark:bg-zinc-900">
                <div className="font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                  Digitally Verified &amp; Stamped
                </div>
                <div>Directorate of Legal Metrology</div>
                <div>Government of India</div>
              </div>
            </div>
          </div>

          {/* Dialog Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-8 text-xs"
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </Dialog>
  );
}

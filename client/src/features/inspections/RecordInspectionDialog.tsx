import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { api } from "@/lib/api";
import { createInspectionSchema, CreateInspectionInput, InspectionResult } from "@sih/shared";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Camera, X, ShieldCheck } from "lucide-react";

interface RecordInspectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  applicationId: string;
  applicationNumber: string;
  instrumentSerialNumber: string;
}

export function RecordInspectionDialog({
  open,
  onOpenChange,
  applicationId,
  applicationNumber,
  instrumentSerialNumber,
}: RecordInspectionDialogProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoName, setPhotoName] = useState<string>("");
  const [showUrlInput, setShowUrlInput] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateInspectionInput>({
    resolver: zodResolver(createInspectionSchema),
    defaultValues: {
      applicationId,
      result: InspectionResult.PASSED,
      maxPermissibleError: "" as any,
      actualErrorObserved: "" as any,
      standardsUsed: [],
      photoUrls: [],
      sealNumber: "",
      remarks: "",
      observations: {
        repeatability: "",
        eccentricity: "",
        linearity: "",
      },
    },
  });

  // Reset form values on open
  useEffect(() => {
    if (open) {
      setValue("applicationId", applicationId);
      setValue("sealNumber", "");
    }
  }, [open, applicationId, setValue]);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoName(file.name);
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      setPhotoPreview(dataUrl);
      setValue("photoUrls", [dataUrl]);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setPhotoPreview(null);
    setPhotoName("");
    setValue("photoUrls", []);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const mpe = watch("maxPermissibleError") || 1.5;
  const actualError = watch("actualErrorObserved") || 0;
  const isPassed = actualError <= mpe;

  const mutation = useMutation({
    mutationFn: async (data: CreateInspectionInput) => {
      let finalPhotoUrls: string[] = [];
      if (photoPreview && photoPreview.startsWith("data:")) {
        try {
          const uploadRes = await api.post("/inspections/upload-photo", {
            imageBase64: photoPreview,
            filename: `insp-${applicationNumber}-${Date.now()}`,
          });
          if (uploadRes.data?.data?.url) {
            finalPhotoUrls = [uploadRes.data.data.url];
          }
        } catch (uploadErr) {
          console.warn("Direct web Cloudinary upload failed; forwarding base64 payload:", uploadErr);
          finalPhotoUrls = [photoPreview];
        }
      } else if (data.photoUrls && data.photoUrls.length > 0) {
        finalPhotoUrls = data.photoUrls;
      }

      const payload = {
        ...data,
        applicationId,
        result: isPassed ? InspectionResult.PASSED : InspectionResult.FAILED,
        photoUrls: finalPhotoUrls,
      };
      const res = await api.post("/inspections", payload);
      return res.data;
    },
    onSuccess: () => {
      // Invalidate all query caches across Field, Admin, and Consumer portals
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      queryClient.invalidateQueries({ queryKey: ["fieldApplications"] });
      queryClient.invalidateQueries({ queryKey: ["certificates"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["consumerDashboard"] });
      reset();
      setPhotoPreview(null);
      setPhotoName("");
      setShowUrlInput(false);
      onOpenChange(false);
    },
  });

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setPhotoPreview(null);
      setPhotoName("");
      setShowUrlInput(false);
      reset();
    }
    onOpenChange(newOpen);
  };

  const onSubmit = (data: CreateInspectionInput) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogHeader>
        <DialogTitle>{t("dialogs.recordInspection.title")}</DialogTitle>
        <DialogDescription>
          {t("dialogs.recordInspection.desc")} <span className="font-mono font-semibold">{applicationNumber}</span> ({t("dialogs.recordInspection.serial")}: <span className="font-mono font-semibold">{instrumentSerialNumber}</span>).
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="maxPermissibleError">{t("dialogs.recordInspection.mpe")}</Label>
            <Input
              id="maxPermissibleError"
              type="number"
              step="any"
              placeholder="e.g. 1.5"
              className="mt-1"
              {...register("maxPermissibleError", { valueAsNumber: true })}
            />
            {errors.maxPermissibleError && (
              <p className="mt-1 text-[11px] text-destructive">{errors.maxPermissibleError.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="actualErrorObserved">{t("dialogs.recordInspection.actualError")}</Label>
            <Input
              id="actualErrorObserved"
              type="number"
              step="any"
              placeholder="e.g. 0.5"
              className="mt-1"
              {...register("actualErrorObserved", { valueAsNumber: true })}
            />
            {errors.actualErrorObserved && (
              <p className="mt-1 text-[11px] text-destructive">{errors.actualErrorObserved.message}</p>
            )}
          </div>
        </div>

        {/* Dynamic Compliance Evaluation Banner */}
        <div
          className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-colors ${
            isPassed
              ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300"
              : "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60 text-rose-800 dark:text-rose-300"
          }`}
        >
          <div className="flex items-center space-x-2">
            {isPassed ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
            <div>
              <p className="font-semibold">
                {isPassed ? t("dialogs.recordInspection.passedStatutory") : t("dialogs.recordInspection.failedStatutory")}
              </p>
              <p className="text-[10px] opacity-80">
                {isPassed
                  ? t("dialogs.recordInspection.passedDesc", { error: actualError, mpe })
                  : t("dialogs.recordInspection.failedDesc", { error: actualError, mpe })}
              </p>
            </div>
          </div>
          <Badge variant={isPassed ? "certified" : "rejected"}>
            {isPassed ? t("dialogs.recordInspection.passedBadge") : t("dialogs.recordInspection.failedBadge")}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="sealNumber">{t("dialogs.recordInspection.sealNumber")}</Label>
            <Input id="sealNumber" placeholder={t("dialogs.recordInspection.sealPlaceholder", { defaultValue: "e.g. LM-SEAL-894210" })} className="mt-1" {...register("sealNumber")} />
          </div>
          <div>
            <Label htmlFor="standard">{t("dialogs.recordInspection.standards")}</Label>
            <Input
              id="standard"
              placeholder="e.g. STD-WT-E2-0041"
              className="mt-1"
              onChange={(e) => setValue("standardsUsed", [e.target.value])}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="photoFileInput" className="text-xs font-semibold text-foreground">
              {t("dialogs.recordInspection.photoTitle")}
            </Label>
            <button
              type="button"
              onClick={() => setShowUrlInput(!showUrlInput)}
              className="text-[11px] text-muted-foreground hover:text-foreground underline transition-colors"
            >
              {t("dialogs.recordInspection.photoOrUrl")}
            </button>
          </div>

          <input
            ref={fileInputRef}
            id="photoFileInput"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoSelect}
          />

          {photoPreview ? (
            <div className="flex items-center justify-between rounded-md border border-border bg-muted/30 p-2.5">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <img
                  src={photoPreview}
                  alt="Verification Site Preview"
                  className="h-10 w-10 shrink-0 rounded object-cover border border-border"
                />
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-foreground">{photoName || "site_photo.jpg"}</p>
                  <p className="text-[10px] text-muted-foreground">Ready for submission with inspection record</p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemovePhoto}
                className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                title={t("dialogs.recordInspection.photoRemove")}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="flex cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-border bg-muted/20 p-3.5 transition-colors hover:bg-muted/40 hover:border-zinc-400 dark:hover:border-zinc-600"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-background border border-border text-muted-foreground mb-1 shadow-2xs">
                <Camera className="h-3.5 w-3.5" />
              </div>
              <p className="text-xs font-medium text-foreground">{t("dialogs.recordInspection.photoUpload")}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5 text-center">{t("dialogs.recordInspection.photoUploadDesc")}</p>
            </div>
          )}

          {showUrlInput && (
            <div className="pt-1">
              <Input
                id="photoUrl"
                placeholder="https://assets.metrology.gov.in/inspections/..."
                className="text-xs font-mono"
                onChange={(e) => {
                  const val = e.target.value.trim();
                  if (val) {
                    setValue("photoUrls", [val]);
                    setPhotoPreview(val);
                  } else {
                    setValue("photoUrls", []);
                    setPhotoPreview(null);
                  }
                }}
              />
            </div>
          )}
        </div>

        <div>
          <Label htmlFor="remarks">{t("dialogs.recordInspection.remarks")}</Label>
          <textarea
            id="remarks"
            rows={2}
            placeholder={t("dialogs.recordInspection.remarksPlaceholder", { defaultValue: "e.g. Tested across capacity range. Verification seal affixed." })}
            className="mt-1 flex w-full rounded-xl border border-input bg-background dark:bg-card px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            {...register("remarks")}
          />
        </div>

        {isPassed ? (
          <div className="flex items-start space-x-2.5 p-3 rounded-md bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 text-emerald-900 dark:text-emerald-200">
            <ShieldCheck className="h-4 w-4 mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <div className="space-y-0.5">
              <p className="text-xs font-semibold">
                {t("dialogs.recordInspection.autoSignNoticeTitle", "Automatic Digital Signing & Certification")}
              </p>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-300 leading-relaxed">
                {t(
                  "dialogs.recordInspection.autoSignNoticeDesc",
                  "Statutory MPE tolerance verified. Submitting will record inspection and immediately generate an official ECDSA NIST P-256 digitally signed certificate."
                )}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-start space-x-2.5 p-3 rounded-md bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/50 text-rose-900 dark:text-rose-200">
            <XCircle className="h-4 w-4 mt-0.5 shrink-0 text-rose-600 dark:text-rose-400" />
            <div className="space-y-0.5">
              <p className="text-xs font-semibold">
                {t("dialogs.recordInspection.failedNoticeTitle", "Statutory MPE Exceeded")}
              </p>
              <p className="text-[11px] text-rose-700 dark:text-rose-300 leading-relaxed">
                {t(
                  "dialogs.recordInspection.failedNoticeDesc",
                  "Observed error exceeds permissible limits. Submitting will record rejection and notify the applicant to recalibrate under the Legal Metrology Act."
                )}
              </p>
            </div>
          </div>
        )}

        {mutation.isError && (
          <p className="text-xs text-destructive">
            {(mutation.error as any)?.response?.data?.error?.message || "Failed to record inspection."}
          </p>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            {t("dialogs.recordInspection.cancel")}
          </Button>
          <Button
            type="submit"
            size="sm"
            variant={isPassed ? "default" : "destructive"}
            disabled={isSubmitting || mutation.isPending}
            className={isPassed ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""}
          >
            {mutation.isPending ? (
              isPassed ? (
                t("dialogs.recordInspection.submittingPassed", "Signing & Issuing Certificate...")
              ) : (
                t("dialogs.recordInspection.submitting", "Submitting...")
              )
            ) : isPassed ? (
              <>
                <ShieldCheck className="h-3.5 w-3.5 mr-1.5" />
                {t("dialogs.recordInspection.submitPassed", "Verify, Sign & Issue Certificate")}
              </>
            ) : (
              t("dialogs.recordInspection.submitFailed", "Record Rejection")
            )}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}

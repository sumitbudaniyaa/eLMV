import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { api } from "@/lib/api";
import { createApplicationSchema, CreateApplicationInput, ApplicationType, ApiResponse } from "@sih/shared";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";

interface SubmitApplicationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preselectedInstrumentId?: string;
}

export function SubmitApplicationDialog({
  open,
  onOpenChange,
  preselectedInstrumentId,
}: SubmitApplicationDialogProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { data: instrumentsData } = useQuery({
    queryKey: ["instruments"],
    queryFn: async () => {
      const res = await api.get<ApiResponse<any[]>>("/instruments");
      return res.data;
    },
    enabled: open,
  });

  const instruments = instrumentsData?.data || [];

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateApplicationInput>({
    resolver: zodResolver(createApplicationSchema),
    defaultValues: {
      instrumentId: preselectedInstrumentId || "",
      type: ApplicationType.NEW,
      remarks: "",
    },
  });

  useEffect(() => {
    if (open && preselectedInstrumentId) {
      setValue("instrumentId", preselectedInstrumentId);
    }
  }, [open, preselectedInstrumentId, setValue]);

  const selectedInstrumentId = watch("instrumentId") || preselectedInstrumentId;
  const selectedInstrument = instruments.find((i) => i.id === selectedInstrumentId);

  const mutation = useMutation({
    mutationFn: async (data: CreateApplicationInput) => {
      const res = await api.post("/applications", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      reset();
      onOpenChange(false);
    },
  });

  const onSubmit = (data: CreateApplicationInput) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>{t("dialogs.submitApplication.title")}</DialogTitle>
        <DialogDescription>
          {t("dialogs.submitApplication.desc")}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="instrumentId" className="text-xs font-semibold text-slate-800 dark:text-foreground">
            {t("dialogs.submitApplication.selectInstrument")}
          </Label>
          <select
            id="instrumentId"
            className="mt-1 flex h-9 w-full rounded-xl border border-slate-200 dark:border-border bg-white dark:bg-card px-3 py-1 text-xs font-medium text-slate-800 dark:text-foreground focus:outline-none focus:ring-2 focus:ring-[#0B2545]/20 dark:focus:ring-primary/20 focus:border-[#0B2545] dark:focus:border-primary transition-all"
            {...register("instrumentId")}
          >
            <option value="" className="bg-white dark:bg-card text-foreground">{t("dialogs.submitApplication.chooseInstrument")}</option>
            {instruments.map((inst) => (
              <option key={inst.id} value={inst.id} className="bg-white dark:bg-card text-foreground">
                {inst.serialNumber} — {inst.make} ({inst.capacity} {inst.unit})
              </option>
            ))}
          </select>
          {errors.instrumentId && (
            <p className="mt-1 text-[11px] text-rose-600 dark:text-rose-400">{errors.instrumentId.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="type" className="text-xs font-semibold text-slate-800 dark:text-foreground">
            {t("dialogs.submitApplication.type")}
          </Label>
          <select
            id="type"
            className="mt-1 flex h-9 w-full rounded-xl border border-slate-200 dark:border-border bg-white dark:bg-card px-3 py-1 text-xs font-medium text-slate-800 dark:text-foreground focus:outline-none focus:ring-2 focus:ring-[#0B2545]/20 dark:focus:ring-primary/20 focus:border-[#0B2545] dark:focus:border-primary transition-all"
            {...register("type")}
          >
            <option value={ApplicationType.NEW} className="bg-white dark:bg-card text-foreground">{t("dialogs.submitApplication.newVerification")}</option>
            <option value={ApplicationType.RE_VERIFICATION} className="bg-white dark:bg-card text-foreground">{t("dialogs.submitApplication.reVerification")}</option>
          </select>
        </div>

        <div>
          <Label htmlFor="remarks" className="text-xs font-semibold text-slate-800 dark:text-foreground">
            {t("dialogs.submitApplication.remarks")}
          </Label>
          <textarea
            id="remarks"
            rows={2}
            placeholder={t("dialogs.submitApplication.remarksPlaceholder")}
            className="mt-1 flex w-full rounded-xl border border-slate-200 dark:border-border bg-white dark:bg-card px-3 py-2 text-xs font-medium text-slate-800 dark:text-foreground placeholder:text-slate-400 dark:placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#0B2545]/20 dark:focus:ring-primary/20 focus:border-[#0B2545] dark:focus:border-primary transition-all"
            {...register("remarks")}
          />
        </div>

        {/* Dynamic Statutory Fee Summary */}
        <div className="border border-slate-200 dark:border-border rounded-xl p-3.5 bg-slate-50 dark:bg-muted/30 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-slate-600 dark:text-muted-foreground font-medium">{t("dialogs.submitApplication.statutoryFee")}</span>
            <span className="font-black text-[#0B2545] dark:text-primary text-sm">
              ₹{selectedInstrument?.type === "FUEL_DISPENSER" ? "2,000.00" : "400.00"}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-muted-foreground mt-1 leading-normal">
            {t("dialogs.submitApplication.feeNote")}
          </p>
        </div>

        {mutation.isError && (
          <div className="flex items-center space-x-2 rounded-xl border border-rose-200 dark:border-rose-800/60 bg-rose-50 dark:bg-rose-950/40 p-3 text-xs text-rose-700 dark:text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
            <span>{(mutation.error as any)?.response?.data?.error?.message || "Failed to submit application."}</span>
          </div>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-xl h-9 px-4 text-xs font-semibold text-slate-700 dark:text-foreground hover:bg-slate-100 dark:hover:bg-muted border border-slate-200 dark:border-border transition-colors"
          >
            {t("dialogs.submitApplication.cancel")}
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || mutation.isPending}
            className="bg-[#0B2545] hover:bg-[#133966] text-white dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90 font-bold rounded-xl h-9 px-4 text-xs shadow-sm hover:shadow transition-all"
          >
            {mutation.isPending ? t("dialogs.submitApplication.submitting") : t("dialogs.submitApplication.submit")}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}

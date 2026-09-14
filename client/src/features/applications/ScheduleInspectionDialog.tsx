import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { api } from "@/lib/api";
import { scheduleApplicationSchema, ScheduleApplicationInput } from "@sih/shared";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";

interface ScheduleInspectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  applicationId: string;
  applicationNumber: string;
}

export function ScheduleInspectionDialog({
  open,
  onOpenChange,
  applicationId,
  applicationNumber,
}: ScheduleInspectionDialogProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const defaultDate = new Date(Date.now() + 86400000 * 2);
  const pad = (n: number) => String(n).padStart(2, "0");
  const localDefaultDateTime = `${defaultDate.getFullYear()}-${pad(defaultDate.getMonth() + 1)}-${pad(defaultDate.getDate())}T${pad(defaultDate.getHours())}:${pad(defaultDate.getMinutes())}`;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ScheduleApplicationInput>({
    resolver: zodResolver(scheduleApplicationSchema),
    defaultValues: {
      scheduledDate: localDefaultDateTime,
      remarks: "Site inspection scheduled for physical verification and stamping.",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: ScheduleApplicationInput) => {
      const res = await api.patch(`/applications/${applicationId}/schedule`, {
        scheduledDate: new Date(data.scheduledDate).toISOString(),
        remarks: data.remarks,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      reset();
      onOpenChange(false);
    },
  });

  const onSubmit = (data: ScheduleApplicationInput) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>{t("dialogs.scheduleInspection.title")}</DialogTitle>
        <DialogDescription>
          {t("dialogs.scheduleInspection.desc")} <span className="font-mono font-bold text-[#0B2545] dark:text-primary">{applicationNumber}</span>.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="scheduledDate" className="text-xs font-semibold text-slate-800 dark:text-foreground">
            {t("dialogs.scheduleInspection.dateTime")}
          </Label>
          <Input
            id="scheduledDate"
            type="datetime-local"
            className="mt-1 h-9 rounded-xl border border-slate-200 dark:border-border bg-white dark:bg-card text-xs font-medium text-slate-800 dark:text-foreground focus:outline-none focus:ring-2 focus:ring-[#0B2545]/20 dark:focus:ring-primary/20 focus:border-[#0B2545] dark:focus:border-primary transition-all"
            {...register("scheduledDate")}
          />
          {errors.scheduledDate && (
            <p className="mt-1 text-[11px] text-rose-600 dark:text-rose-400">{errors.scheduledDate.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="remarks" className="text-xs font-semibold text-slate-800 dark:text-foreground">
            {t("dialogs.scheduleInspection.instructions")}
          </Label>
          <textarea
            id="remarks"
            rows={3}
            className="mt-1 flex w-full rounded-xl border border-slate-200 dark:border-border bg-white dark:bg-card px-3 py-2 text-xs font-medium text-slate-800 dark:text-foreground placeholder:text-slate-400 dark:placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#0B2545]/20 dark:focus:ring-primary/20 focus:border-[#0B2545] dark:focus:border-primary transition-all"
            {...register("remarks")}
          />
        </div>

        {mutation.isError && (
          <div className="flex items-center space-x-2 rounded-xl border border-rose-200 dark:border-rose-800/60 bg-rose-50 dark:bg-rose-950/40 p-3 text-xs text-rose-700 dark:text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
            <span>{(mutation.error as any)?.response?.data?.error?.message || "Failed to schedule inspection."}</span>
          </div>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-xl h-9 px-4 text-xs font-semibold text-slate-700 dark:text-foreground hover:bg-slate-100 dark:hover:bg-muted border border-slate-200 dark:border-border transition-colors"
          >
            {t("dialogs.scheduleInspection.cancel")}
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || mutation.isPending}
            className="bg-[#0B2545] hover:bg-[#133966] text-white dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90 font-bold rounded-xl h-9 px-4 text-xs shadow-sm hover:shadow transition-all"
          >
            {mutation.isPending ? t("dialogs.scheduleInspection.submitting") : t("dialogs.scheduleInspection.submit")}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}

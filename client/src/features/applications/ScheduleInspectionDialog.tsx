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

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ScheduleApplicationInput>({
    resolver: zodResolver(scheduleApplicationSchema),
    defaultValues: {
      scheduledDate: "",
      remarks: "",
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
      queryClient.invalidateQueries({ queryKey: ["fieldApplications"] });
      reset();
      onOpenChange(false);
    },
  });

  const onSubmit = (data: ScheduleApplicationInput) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogHeader>
          <DialogTitle>{t("dialogs.scheduleInspection.title")}</DialogTitle>
          <DialogDescription>
            {t("dialogs.scheduleInspection.description", { applicationNumber })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="scheduledDate">
              {t("dialogs.scheduleInspection.scheduledDate")}
            </Label>
            <Input
              id="scheduledDate"
              type="datetime-local"
              min={new Date().toISOString().slice(0, 16)}
              {...register("scheduledDate")}
            />
            {errors.scheduledDate && (
              <p className="text-xs text-destructive">
                {errors.scheduledDate.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="remarks">
              {t("dialogs.scheduleInspection.remarks")}
            </Label>
            <textarea
              id="remarks"
              rows={3}
              className="mt-1 flex w-full rounded-md border border-input bg-background px-3 py-2 text-xs font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
              placeholder={t("dialogs.scheduleInspection.remarksPlaceholder")}
              {...register("remarks")}
            />
            {errors.remarks && (
              <p className="text-xs text-destructive">
                {errors.remarks.message}
              </p>
            )}
          </div>

          {mutation.isError && (
            <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-md">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>
                {(mutation.error as any)?.response?.data?.message ||
                  t("common.error")}
              </span>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-9 px-4 text-xs font-semibold"
          >
            {t("dialogs.scheduleInspection.cancel")}
          </Button>
          <Button
            type="submit"
            variant="default"
            disabled={isSubmitting || mutation.isPending}
            className="h-9 px-4 text-xs font-semibold shadow-xs"
          >
            {mutation.isPending ? t("dialogs.scheduleInspection.submitting") : t("dialogs.scheduleInspection.submit")}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}

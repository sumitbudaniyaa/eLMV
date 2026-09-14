import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { createInstrumentSchema, CreateInstrumentInput, InstrumentType, STANDARD_MEASURING_UNITS } from "@sih/shared";
import { useTranslation } from "react-i18next";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";

interface RegisterInstrumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RegisterInstrumentDialog({ open, onOpenChange }: RegisterInstrumentDialogProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateInstrumentInput>({
    resolver: zodResolver(createInstrumentSchema),
    defaultValues: {
      type: InstrumentType.NON_AUTOMATIC_WEIGHING_INSTRUMENT,
      category: "NAWI-ClassIII",
      make: "",
      model: "",
      serialNumber: "",
      capacity: 30,
      unit: "kg",
      accuracyClass: "Class III",
      verificationInterval: 12,
      installationAddress: "",
      district: "Bengaluru Urban",
      state: "Karnataka",
      pincode: "560001",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: CreateInstrumentInput) => {
      const res = await api.post("/instruments", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instruments"] });
      reset();
      onOpenChange(false);
    },
  });

  const onSubmit = (data: CreateInstrumentInput) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>{t("dialogs.registerInstrument.title")}</DialogTitle>
        <DialogDescription>
          {t("dialogs.registerInstrument.desc")}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5 max-h-[70vh] overflow-y-auto pr-1">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="type" className="text-xs font-semibold text-slate-800 dark:text-foreground">
              {t("dialogs.registerInstrument.instrumentType")}
            </Label>
            <select
              id="type"
              className="mt-1 flex h-9 w-full rounded-xl border border-slate-200 dark:border-border bg-white dark:bg-card px-3 py-1 text-xs font-medium text-slate-800 dark:text-foreground focus:outline-none focus:ring-2 focus:ring-[#0B2545]/20 dark:focus:ring-primary/20 focus:border-[#0B2545] dark:focus:border-primary transition-all"
              {...register("type")}
            >
              {Object.values(InstrumentType).map((tVal) => (
                <option key={tVal} value={tVal} className="bg-white dark:bg-card text-foreground">
                  {tVal.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="category" className="text-xs font-semibold text-slate-800 dark:text-foreground">
              {t("dialogs.registerInstrument.categoryCode")}
            </Label>
            <Input
              id="category"
              placeholder="e.g. NAWI-ClassIII"
              className="mt-1 h-9 rounded-xl border border-slate-200 dark:border-border bg-white dark:bg-card text-xs font-medium text-slate-800 dark:text-foreground placeholder:text-slate-400 dark:placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#0B2545]/20 dark:focus:ring-primary/20 focus:border-[#0B2545] dark:focus:border-primary transition-all"
              {...register("category")}
            />
            {errors.category && <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1">{errors.category.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="make" className="text-xs font-semibold text-slate-800 dark:text-foreground">
              {t("dialogs.registerInstrument.make")}
            </Label>
            <Input
              id="make"
              placeholder="e.g. Essae-Teraoka"
              className="mt-1 h-9 rounded-xl border border-slate-200 dark:border-border bg-white dark:bg-card text-xs font-medium text-slate-800 dark:text-foreground placeholder:text-slate-400 dark:placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#0B2545]/20 dark:focus:ring-primary/20 focus:border-[#0B2545] dark:focus:border-primary transition-all"
              {...register("make")}
            />
            {errors.make && <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1">{errors.make.message}</p>}
          </div>

          <div>
            <Label htmlFor="model" className="text-xs font-semibold text-slate-800 dark:text-foreground">
              {t("dialogs.registerInstrument.model")}
            </Label>
            <Input
              id="model"
              placeholder="e.g. DS-252"
              className="mt-1 h-9 rounded-xl border border-slate-200 dark:border-border bg-white dark:bg-card text-xs font-medium text-slate-800 dark:text-foreground placeholder:text-slate-400 dark:placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#0B2545]/20 dark:focus:ring-primary/20 focus:border-[#0B2545] dark:focus:border-primary transition-all"
              {...register("model")}
            />
            {errors.model && <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1">{errors.model.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-1">
            <Label htmlFor="serialNumber" className="text-xs font-semibold text-slate-800 dark:text-foreground">
              {t("dialogs.registerInstrument.serialNumber")}
            </Label>
            <Input
              id="serialNumber"
              placeholder="e.g. SN-89421"
              className="mt-1 h-9 rounded-xl border border-slate-200 dark:border-border bg-white dark:bg-card text-xs font-medium text-slate-800 dark:text-foreground placeholder:text-slate-400 dark:placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#0B2545]/20 dark:focus:ring-primary/20 focus:border-[#0B2545] dark:focus:border-primary transition-all"
              {...register("serialNumber")}
            />
            {errors.serialNumber && <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1">{errors.serialNumber.message}</p>}
          </div>

          <div>
            <Label htmlFor="capacity" className="text-xs font-semibold text-slate-800 dark:text-foreground">
              {t("dialogs.registerInstrument.capacity")}
            </Label>
            <Input
              id="capacity"
              type="number"
              step="any"
              className="mt-1 h-9 rounded-xl border border-slate-200 dark:border-border bg-white dark:bg-card text-xs font-medium text-slate-800 dark:text-foreground focus:outline-none focus:ring-2 focus:ring-[#0B2545]/20 dark:focus:ring-primary/20 focus:border-[#0B2545] dark:focus:border-primary transition-all"
              {...register("capacity", { valueAsNumber: true })}
            />
            {errors.capacity && <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1">{errors.capacity.message}</p>}
          </div>

          <div>
            <Label htmlFor="unit" className="text-xs font-semibold text-slate-800 dark:text-foreground">
              {t("dialogs.registerInstrument.unit")}
            </Label>
            <select
              id="unit"
              className="mt-1 flex h-9 w-full rounded-xl border border-slate-200 dark:border-border bg-white dark:bg-card px-3 py-1 text-xs font-medium text-slate-800 dark:text-foreground focus:outline-none focus:ring-2 focus:ring-[#0B2545]/20 dark:focus:ring-primary/20 focus:border-[#0B2545] dark:focus:border-primary transition-all"
              {...register("unit")}
            >
              {STANDARD_MEASURING_UNITS.map((u) => (
                <option key={u} value={u} className="bg-white dark:bg-card text-foreground">
                  {u}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="accuracyClass" className="text-xs font-semibold text-slate-800 dark:text-foreground">
              {t("dialogs.registerInstrument.accuracyClass")}
            </Label>
            <select
              id="accuracyClass"
              className="mt-1 flex h-9 w-full rounded-xl border border-slate-200 dark:border-border bg-white dark:bg-card px-3 py-1 text-xs font-medium text-slate-800 dark:text-foreground focus:outline-none focus:ring-2 focus:ring-[#0B2545]/20 dark:focus:ring-primary/20 focus:border-[#0B2545] dark:focus:border-primary transition-all"
              {...register("accuracyClass")}
            >
              <option value="Class I" className="bg-white dark:bg-card text-foreground">Class I (Special)</option>
              <option value="Class II" className="bg-white dark:bg-card text-foreground">Class II (High)</option>
              <option value="Class III" className="bg-white dark:bg-card text-foreground">Class III (Medium)</option>
              <option value="Class IIII" className="bg-white dark:bg-card text-foreground">Class IIII (Ordinary)</option>
            </select>
          </div>

          <div>
            <Label htmlFor="verificationInterval" className="text-xs font-semibold text-slate-800 dark:text-foreground">
              {t("dialogs.registerInstrument.interval")}
            </Label>
            <Input
              id="verificationInterval"
              type="number"
              className="mt-1 h-9 rounded-xl border border-slate-200 dark:border-border bg-white dark:bg-card text-xs font-medium text-slate-800 dark:text-foreground focus:outline-none focus:ring-2 focus:ring-[#0B2545]/20 dark:focus:ring-primary/20 focus:border-[#0B2545] dark:focus:border-primary transition-all"
              {...register("verificationInterval", { valueAsNumber: true })}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="installationAddress" className="text-xs font-semibold text-slate-800 dark:text-foreground">
            {t("dialogs.registerInstrument.installationAddress")}
          </Label>
          <Input
            id="installationAddress"
            placeholder={t("dialogs.registerInstrument.addressPlaceholder")}
            className="mt-1 h-9 rounded-xl border border-slate-200 dark:border-border bg-white dark:bg-card text-xs font-medium text-slate-800 dark:text-foreground placeholder:text-slate-400 dark:placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#0B2545]/20 dark:focus:ring-primary/20 focus:border-[#0B2545] dark:focus:border-primary transition-all"
            {...register("installationAddress")}
          />
          {errors.installationAddress && <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1">{errors.installationAddress.message}</p>}
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label htmlFor="district" className="text-xs font-semibold text-slate-800 dark:text-foreground">
              {t("dialogs.registerInstrument.district")}
            </Label>
            <Input
              id="district"
              className="mt-1 h-9 rounded-xl border border-slate-200 dark:border-border bg-white dark:bg-card text-xs font-medium text-slate-800 dark:text-foreground focus:outline-none focus:ring-2 focus:ring-[#0B2545]/20 dark:focus:ring-primary/20 focus:border-[#0B2545] dark:focus:border-primary transition-all"
              {...register("district")}
            />
          </div>
          <div>
            <Label htmlFor="state" className="text-xs font-semibold text-slate-800 dark:text-foreground">
              {t("dialogs.registerInstrument.state")}
            </Label>
            <Input
              id="state"
              className="mt-1 h-9 rounded-xl border border-slate-200 dark:border-border bg-white dark:bg-card text-xs font-medium text-slate-800 dark:text-foreground focus:outline-none focus:ring-2 focus:ring-[#0B2545]/20 dark:focus:ring-primary/20 focus:border-[#0B2545] dark:focus:border-primary transition-all"
              {...register("state")}
            />
          </div>
          <div>
            <Label htmlFor="pincode" className="text-xs font-semibold text-slate-800 dark:text-foreground">
              {t("dialogs.registerInstrument.pincode")}
            </Label>
            <Input
              id="pincode"
              className="mt-1 h-9 rounded-xl border border-slate-200 dark:border-border bg-white dark:bg-card text-xs font-medium text-slate-800 dark:text-foreground focus:outline-none focus:ring-2 focus:ring-[#0B2545]/20 dark:focus:ring-primary/20 focus:border-[#0B2545] dark:focus:border-primary transition-all"
              {...register("pincode")}
            />
            {errors.pincode && <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1">{errors.pincode.message}</p>}
          </div>
        </div>

        {mutation.isError && (
          <div className="flex items-center space-x-2 rounded-xl border border-rose-200 dark:border-rose-800/60 bg-rose-50 dark:bg-rose-950/40 p-3 text-xs text-rose-700 dark:text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
            <span>{(mutation.error as any)?.response?.data?.error?.message || "Failed to register instrument."}</span>
          </div>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-xl h-9 px-4 text-xs font-semibold text-slate-700 dark:text-foreground hover:bg-slate-100 dark:hover:bg-muted border border-slate-200 dark:border-border transition-colors"
          >
            {t("dialogs.registerInstrument.cancel")}
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || mutation.isPending}
            className="bg-[#0B2545] hover:bg-[#133966] text-white dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90 font-bold rounded-xl h-9 px-4 text-xs shadow-sm hover:shadow transition-all"
          >
            {mutation.isPending ? t("dialogs.registerInstrument.submitting") : t("dialogs.registerInstrument.submit")}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}

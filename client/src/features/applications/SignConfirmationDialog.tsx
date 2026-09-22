import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Loader2, CheckCircle2 } from "lucide-react";

interface SignConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  application: any;
  onConfirm: () => Promise<void>;
  isSigning: boolean;
}

export function SignConfirmationDialog({
  open,
  onOpenChange,
  application,
  onConfirm,
  isSigning,
}: SignConfirmationDialogProps) {
  if (!application) return null;

  const inspection = application.inspectionRecord;
  const instrument = application.instrument;
  const applicant = application.applicant;

  return (
    <Dialog open={open} onOpenChange={(val) => !isSigning && onOpenChange(val)} className="max-w-xl p-6 sm:p-7">
      <DialogHeader>
        <div>
          <DialogTitle className="text-lg font-bold tracking-tight text-foreground">
            Affix Statutory Digital Signature
          </DialogTitle>
          <DialogDescription className="text-xs">
            Official Certificate Authentication under Section 24, Legal Metrology Act, 2009
          </DialogDescription>
        </div>
      </DialogHeader>

      <div className="space-y-4 my-2 text-xs">
        {/* Verification Summary Card */}
        <div className="rounded-xl border border-border/80 bg-muted/25 p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
            <span className="text-muted-foreground font-medium">Application Reference</span>
            <span className="font-mono font-bold text-foreground text-sm">
              {application.applicationNumber}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-0.5">
            <div>
              <span className="text-muted-foreground block text-[11px]">Instrument Serial</span>
              <span className="font-mono font-bold text-foreground">
                {instrument?.serialNumber || "—"}
              </span>
              <span className="text-[10px] text-muted-foreground block">
                {instrument?.make} {instrument?.model}
              </span>
            </div>

            <div>
              <span className="text-muted-foreground block text-[11px]">Commercial Trader</span>
              <span className="font-semibold text-foreground truncate block">
                {applicant?.name || "—"}
              </span>
              <span className="text-[10px] text-muted-foreground font-mono block">
                {applicant?.phone || "—"}
              </span>
            </div>

            <div>
              <span className="text-muted-foreground block text-[11px]">Applied Seal Number</span>
              <span className="font-mono font-bold text-primary">
                {inspection?.sealNumber || "LM-SEAL-VERIFIED"}
              </span>
            </div>

            <div>
              <span className="text-muted-foreground block text-[11px]">Tolerance Test Result</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 shrink-0" />
                <span>Passed (Err: {inspection?.actualErrorObserved ?? 0}g)</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <DialogFooter className="mt-5 gap-2 sm:gap-0">
        <Button
          type="button"
          variant="outline"
          onClick={() => onOpenChange(false)}
          disabled={isSigning}
          className="text-xs h-9"
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={onConfirm}
          disabled={isSigning}
          className="text-xs h-9 font-semibold bg-[#0B2545] hover:bg-[#0B2545]/90 text-white shadow-xs inline-flex items-center gap-2"
        >
          {isSigning ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>Affixing Digital Signature...</span>
            </>
          ) : (
            <>
              <ShieldCheck className="h-3.5 w-3.5 text-amber-400" />
              <span>Confirm & Affix Digital Signature</span>
            </>
          )}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}


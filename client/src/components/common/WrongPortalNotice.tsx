import { useAuth } from "@/context/AuthContext";
import { PortalType, getPortalBaseUrl } from "@/lib/subdomain";
import { ShieldAlert, ArrowRight, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WrongPortalNoticeProps {
  currentPortal: PortalType;
  requiredPortal: PortalType;
  portalTitle: string;
}

export function WrongPortalNotice({
  currentPortal,
  requiredPortal,
  portalTitle,
}: WrongPortalNoticeProps) {
  const { user, logout } = useAuth();

  const handleGoToPortal = () => {
    window.location.href = getPortalBaseUrl(requiredPortal);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full border border-border/80 rounded-xl bg-card p-6 shadow-sm space-y-4 text-center">
        <div className="mx-auto h-12 w-12 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
          <ShieldAlert className="h-6 w-6" />
        </div>

        <div className="space-y-1">
          <h2 className="text-base font-bold tracking-tight text-foreground">
            Portal Access Notice
          </h2>
          <p className="text-xs text-muted-foreground">
            You are signed in as <span className="font-semibold text-foreground">{user?.name}</span> ({user?.role}).
          </p>
        </div>

        <div className="p-3.5 rounded-lg bg-muted/40 border border-border/60 text-xs text-muted-foreground text-left space-y-1">
          <p className="font-medium text-foreground">Designated Workplace:</p>
          <p>
            Your account is assigned to the <strong className="text-foreground">{portalTitle}</strong>. 
            You are currently accessing the <strong className="capitalize">{currentPortal}</strong> application.
          </p>
        </div>

        <div className="flex flex-col gap-2 pt-2">
          <Button onClick={handleGoToPortal} className="w-full text-xs font-semibold h-9">
            <span>Switch to {portalTitle}</span>
            <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => logout()}
            className="w-full text-xs text-muted-foreground hover:text-destructive h-8"
          >
            <LogOut className="h-3.5 w-3.5 mr-1.5" />
            <span>Sign Out</span>
          </Button>
        </div>
      </div>
    </div>
  );
}


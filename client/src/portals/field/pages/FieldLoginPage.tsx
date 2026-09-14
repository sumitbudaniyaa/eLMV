import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import { loginSchema, LoginInput } from "@sih/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  ClipboardCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  FlaskConical,
  ShieldAlert,
  UserCheck,
} from "lucide-react";

export function FieldLoginPage() {
  const { i18n } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [authError, setAuthError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const isHindi = (i18n.resolvedLanguage || i18n.language || "en").toLowerCase().startsWith("hi");

  const from = (location.state as any)?.from?.pathname || "/roster";

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginInput) => {
    try {
      setAuthError(null);
      await login(data);
      navigate(from, { replace: true });
    } catch (err: any) {
      setAuthError(
        err.response?.data?.error?.message ||
        err.message ||
        (isHindi ? "अमान्य क्रेडेंशियल। कृपया पुनः प्रयास करें।" : "Invalid credentials. Please try again.")
      );
    }
  };

  const handleFillDemo = (email: string, pass: string) => {
    setValue("email", email, { shouldValidate: true });
    setValue("password", pass, { shouldValidate: true });
    setAuthError(null);
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      <Card className="border border-border shadow-xs bg-card rounded-xl">
        <CardHeader className="space-y-2 text-center pb-4 border-b border-border/60">
          <div className="h-11 w-11 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center mx-auto shadow-2xs">
            <ClipboardCheck className="h-6 w-6" />
          </div>

          <div>
            <CardTitle className="text-xl font-bold tracking-tight text-foreground">
              {isHindi ? "फील्ड अधिकारी एवं निरीक्षक साइन इन" : "Field Officer & Inspector Sign In"}
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              {isHindi
                ? "विधिक मापविज्ञान अधिकारी (LMO) एवं जीएटीसी प्रयोगशाला निरीक्षकों हेतु अधिकृत पहुंच"
                : "Official access for Legal Metrology Officers (LMO) & GATC Testing Field Inspectors"}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-4">
          {/* Quick-fill Persona Pills for Rapid Testing */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block">
              {isHindi ? "त्वरित चयन (निरीक्षक डेमो खाता)" : "Quick Fill (Inspector Demo)"}
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleFillDemo("lmo.jaipur@metrology.gov.in", "Password@123")}
                className="text-left p-2 rounded-lg border border-border/80 hover:border-sky-500/50 hover:bg-muted/50 transition-colors text-xs"
              >
                <div className="font-semibold text-foreground flex items-center gap-1">
                  <UserCheck className="h-3 w-3 text-sky-600" />
                  <span>State LMO</span>
                </div>
                <div className="text-[10px] text-muted-foreground font-mono truncate">
                  lmo.jaipur@met...
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleFillDemo("inspector@apex-metrology.com", "Password@123")}
                className="text-left p-2 rounded-lg border border-border/80 hover:border-sky-500/50 hover:bg-muted/50 transition-colors text-xs"
              >
                <div className="font-semibold text-foreground flex items-center gap-1">
                  <FlaskConical className="h-3 w-3 text-emerald-600" />
                  <span>GATC Inspector</span>
                </div>
                <div className="text-[10px] text-muted-foreground font-mono truncate">
                  inspector@apex...
                </div>
              </button>
            </div>
          </div>

          {/* Error Message */}
          {authError && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-start space-x-2 animate-in fade-in">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="field-email" className="text-xs font-semibold text-foreground">
                {isHindi ? "अधिकारी / निरीक्षक ईमेल पता" : "Officer / Inspector Official Email"}
              </Label>
              <div className="relative">
                <Mail className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <Input
                  id="field-email"
                  type="email"
                  placeholder="lmo.jaipur@metrology.gov.in"
                  className="pl-9 text-xs h-10 border-input bg-background"
                  autoComplete="email"
                  disabled={isSubmitting}
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <p className="text-[11px] text-destructive font-medium">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="field-password" className="text-xs font-semibold text-foreground">
                {isHindi ? "पासवर्ड" : "Password"}
              </Label>
              <div className="relative">
                <Lock className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <Input
                  id="field-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-9 pr-9 text-xs h-10 border-input bg-background"
                  autoComplete="current-password"
                  disabled={isSubmitting}
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-[11px] text-destructive font-medium">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-10 font-semibold text-xs shadow-xs bg-sky-600 hover:bg-sky-700 text-white transition-colors"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? (isHindi ? "सत्यापन हो रहा है..." : "Authenticating...")
                : (isHindi ? "निरीक्षण सूट में साइन इन करें" : "Sign In to Inspection Suite")}
            </Button>
          </form>

          {/* Statutory Notice */}
          <div className="rounded-lg border border-border/80 bg-muted/40 p-3 text-[11px] text-muted-foreground leading-relaxed flex items-start gap-2">
            <ShieldAlert className="h-4 w-4 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
            <span>
              {isHindi
                ? "वैधानिक प्रवर्तन कंसोल। सभी फील्ड निरीक्षण, डिजिटल मुद्रांकन एवं अंशांकन रिकॉर्ड विधिक मापविज्ञान अधिनियम, 2009 के अंतर्गत कानूनी रूप से बाध्यकारी हैं।"
                : "Statutory Enforcement Suite. All field verification observations, digital stamps, and calibration logs are legally binding under the Legal Metrology Act, 2009."}
            </span>
          </div>

          {/* Public Verification Link */}
          <div className="pt-2 text-center">
            <Link
              to="/verify"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <span>{isHindi ? "उपकरण क्यूआर / प्रमाणपत्र जांचें" : "Need to verify a device QR or certificate?"}</span>
              <span className="font-semibold text-sky-600 dark:text-sky-400 underline underline-offset-4">
                {isHindi ? "सार्वजनिक सत्यापन" : "Public Verification"} &rarr;
              </span>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

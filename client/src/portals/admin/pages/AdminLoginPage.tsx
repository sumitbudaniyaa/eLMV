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
  ShieldCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Building2,
  CheckCircle2,
} from "lucide-react";

export function AdminLoginPage() {
  const { i18n } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [authError, setAuthError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const isHindi = (i18n.resolvedLanguage || i18n.language || "en").toLowerCase().startsWith("hi");

  const from = (location.state as any)?.from?.pathname || "/dashboard";

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
          <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto shadow-2xs">
            <ShieldCheck className="h-6 w-6" />
          </div>

          <div>
            <CardTitle className="text-xl font-bold tracking-tight text-foreground">
              {isHindi ? "प्रशासक एवं एजेंसी साइन इन" : "Administrator & Agency Sign In"}
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              {isHindi
                ? "राज्य नियंत्रक, जीएटीसी एजेंसी प्रशासक एवं नामित अधिकारियों हेतु आधिकारिक पहुंच"
                : "Official access for State Controllers, GATC Agency Admins & Regulatory Officers"}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-4">
          {/* Quick-fill Persona Pills for Rapid Testing */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block">
              {isHindi ? "त्वरित चयन (डेमो खाता)" : "Quick Fill (Officer Demo)"}
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleFillDemo("admin@metrology.gov.in", "Password@123")}
                className="text-left p-2 rounded-lg border border-border/80 hover:border-primary/50 hover:bg-muted/50 transition-colors text-xs"
              >
                <div className="font-semibold text-foreground flex items-center gap-1">
                  <Building2 className="h-3 w-3 text-primary" />
                  <span>State Admin</span>
                </div>
                <div className="text-[10px] text-muted-foreground font-mono truncate">
                  admin@metrology.gov.in
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleFillDemo("lab.admin@apex-metrology.com", "Password@123")}
                className="text-left p-2 rounded-lg border border-border/80 hover:border-primary/50 hover:bg-muted/50 transition-colors text-xs"
              >
                <div className="font-semibold text-foreground flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3 text-sky-600" />
                  <span>GATC Admin</span>
                </div>
                <div className="text-[10px] text-muted-foreground font-mono truncate">
                  lab.admin@apex...
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
              <Label htmlFor="admin-email" className="text-xs font-semibold text-foreground">
                {isHindi ? "आधिकारिक ईमेल पता" : "Official Department / Lab Email"}
              </Label>
              <div className="relative">
                <Mail className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <Input
                  id="admin-email"
                  type="email"
                  placeholder="admin@metrology.gov.in"
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
              <Label htmlFor="admin-password" className="text-xs font-semibold text-foreground">
                {isHindi ? "पासवर्ड" : "Password"}
              </Label>
              <div className="relative">
                <Lock className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <Input
                  id="admin-password"
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
              className="w-full h-10 font-semibold text-xs shadow-xs bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? (isHindi ? "प्रमाणीकरण हो रहा है..." : "Authenticating...")
                : (isHindi ? "नियामक कंसोल में साइन इन करें" : "Sign In to Regulatory Console")}
            </Button>
          </form>

          {/* Statutory IT Act Advisory */}
          <div className="rounded-lg border border-border/80 bg-muted/40 p-3 text-[11px] text-muted-foreground leading-relaxed flex items-start gap-2">
            <ShieldCheck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <span>
              {isHindi
                ? "वैधानिक सरकारी कंसोल। अनधिकृत पहुंच प्रयास आईटी अधिनियम, 2000 की धारा 43 और 66 के तहत निगरानी और दर्ज किए जाते हैं।"
                : "Statutory Government Console. Unauthorized access attempts are monitored, logged, and prosecutable under Sections 43 & 66 of the Information Technology Act, 2000."}
            </span>
          </div>

          {/* Public Verification Link */}
          <div className="pt-2 text-center">
            <Link
              to="/verify"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <span>{isHindi ? "उपकरण प्रमाणपत्र सत्यापित करें" : "Looking to verify a device certificate?"}</span>
              <span className="font-semibold text-primary underline underline-offset-4">
                {isHindi ? "सत्यापन पोर्टल" : "Public Verification"} &rarr;
              </span>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

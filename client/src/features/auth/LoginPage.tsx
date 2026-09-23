import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import { loginSchema, LoginInput, Role } from "@sih/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, ArrowRight, Eye, EyeOff } from "lucide-react";

export function LoginPage() {
  const { t, i18n } = useTranslation();
  const { login, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [authError, setAuthError] = useState<string | null>(
    (location.state as any)?.authError || null
  );
  const [showPassword, setShowPassword] = useState(false);

  const isHindi = (i18n.resolvedLanguage || i18n.language || "en").toLowerCase().startsWith("hi");
  const invalidCredentialsMsg = isHindi
    ? "अमान्य क्रेडेंशियल। कृपया पुनः प्रयास करें।"
    : "Invalid credentials. Please try again.";

  const from = (location.state as any)?.from?.pathname || "/dashboard";

  const {
    register,
    handleSubmit,
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
      const loggedUser = await login(data);
      if (loggedUser.role !== Role.CONSUMER) {
        await logout();
        setAuthError(invalidCredentialsMsg);
        return;
      }
      navigate(from, { replace: true });
    } catch (err: any) {
      setAuthError(
        err.response?.data?.error?.message ||
        err.message ||
        invalidCredentialsMsg
      );
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto space-y-5">
      {/* Brand Header */}
      <div className="text-center space-y-1">
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#0B2545]">
          {t("auth.loginHeading", { defaultValue: "Trader Sign In" })}
        </h1>
        <p className="text-xs text-muted-foreground">
          {t("auth.loginSubtitle")}
        </p>
      </div>

      {/* Login Card */}
      <Card className="border border-slate-200 shadow-sm bg-white rounded-2xl overflow-hidden">
        <CardContent className="p-6 space-y-4">
          {authError && (
            <div className="flex items-center space-x-2 rounded-lg border border-destructive/40 bg-destructive/10 p-2.5 mb-2 text-xs text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold text-slate-800">
                {t("auth.email")}
              </Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="name@example.com"
                className="h-9 text-xs rounded-lg"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-[11px] text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-semibold text-slate-800">
                {t("auth.password")}
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="h-9 text-xs rounded-lg pr-10"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 focus:outline-none transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-[11px] text-destructive">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-9 text-xs font-bold bg-[#0B2545] hover:bg-[#133966] text-white shadow-xs rounded-xl transition-all"
            >
              {isSubmitting ? (
                t("common.loading")
              ) : (
                <>
                  {t("auth.signInButton")}
                  <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Footer Navigation */}
      <div className="text-center space-y-2.5 text-xs text-muted-foreground">
        <p>
          {t("auth.noAccount")}{" "}
          <Link
            to="/register"
            className="text-[#0B2545] font-bold hover:underline underline-offset-4"
          >
            {t("auth.registerLink")}
          </Link>
        </p>
      </div>
    </div>
  );
}


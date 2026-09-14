import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import { loginSchema, LoginInput, Role } from "@sih/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, AlertCircle } from "lucide-react";

export function FieldLoginPage() {
  const { i18n } = useTranslation();
  const { login, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [authError, setAuthError] = useState<string | null>(
    (location.state as any)?.authError || null
  );
  const [showPassword, setShowPassword] = useState(false);

  const isHindi = (i18n.resolvedLanguage || i18n.language || "en").toLowerCase().startsWith("hi");

  const from = (location.state as any)?.from?.pathname || "/roster";

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
      if (loggedUser.role !== Role.LMO && loggedUser.role !== Role.GATC_INSPECTOR) {
        await logout();
        setAuthError(
          isHindi
            ? "अमान्य क्रेडेंशियल। कृपया पुनः प्रयास करें।"
            : "Invalid credentials. Please try again."
        );
        return;
      }
      navigate(from, { replace: true });
    } catch (err: any) {
      setAuthError(
        err.response?.data?.error?.message ||
        err.message ||
        (isHindi ? "अमान्य क्रेडेंशियल। कृपया पुनः प्रयास करें।" : "Invalid credentials. Please try again.")
      );
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      <Card className="border border-border shadow-xs bg-card rounded-xl">
        <CardHeader className="text-center pb-2 space-y-2">
          <div className="flex items-center justify-center space-x-2.5">
            <img
              src="/emblem.jpeg"
              alt="Logo"
              className="h-9 w-auto object-contain"
              onError={(e) => {
                (e.currentTarget as HTMLElement).style.display = "none";
              }}
            />
            <span className="text-2xl font-black tracking-tight text-foreground">
              eLMV
            </span>
          </div>
          <CardTitle className="text-lg font-bold tracking-tight text-foreground">
            {isHindi ? "साइन इन" : "Sign In"}
          </CardTitle>
        </CardHeader>

        <CardContent className="p-6 pt-2 space-y-4">
          {authError && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-start space-x-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="field-email" className="text-xs font-semibold text-foreground">
                {isHindi ? "ईमेल पता" : "Email"}
              </Label>
              <Input
                id="field-email"
                type="email"
                placeholder="name@example.com"
                className="text-xs h-10 border-input bg-background"
                autoComplete="email"
                disabled={isSubmitting}
                {...register("email")}
              />
              {errors.email && (
                <p className="text-[11px] text-destructive font-medium">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="field-password" className="text-xs font-semibold text-foreground">
                {isHindi ? "पासवर्ड" : "Password"}
              </Label>
              <div className="relative">
                <Input
                  id="field-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pr-9 text-xs h-10 border-input bg-background"
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
              className="w-full h-10 font-semibold text-xs shadow-xs"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? (isHindi ? "प्रमाणीकरण हो रहा है..." : "Signing in...")
                : (isHindi ? "साइन इन" : "Sign In")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

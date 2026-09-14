import React from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "react-i18next";
import {
  ClipboardCheck,
  LogOut,
  Languages,
  Sun,
  Moon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function FieldLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const [isDark, setIsDark] = React.useState(() =>
    document.documentElement.classList.contains("dark")
  );

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme_mode", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme_mode", "light");
    }
  };

  const toggleLanguage = () => {
    const next = i18n.language === "en" ? "hi" : "en";
    i18n.changeLanguage(next);
    localStorage.setItem("preferred_language", next);
  };

  const isGatcInspector = !!user?.gatcInspectorProfile;
  const badgeLabel = isGatcInspector
    ? `ID: ${user?.gatcInspectorProfile?.employeeId || "STAFF"} • ${user?.gatcInspectorProfile?.gatcAgency?.agencyName || "GATC Lab"}`
    : `Badge: ${user?.officerProfile?.badgeNumber || "RJ-LMO"} • ${user?.officerProfile?.jurisdictionDistrict || "Jaipur"}`;

  const navItems = [
    { label: "Inspection Roster", path: "/roster", icon: ClipboardCheck },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Top Header Shell */}
      <header className="sticky top-0 z-40 h-14 border-b border-border bg-card/95 backdrop-blur px-4 sm:px-6 flex items-center justify-between">
        {/* Brand & Field Station Details */}
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight">eLMV</span>
              <Badge variant="outline" className="text-[9px] px-1.5 py-0 font-bold uppercase bg-primary/10 border-primary/20 text-primary">
                {isGatcInspector ? "GATC TESTING SUITE" : "LMO ENFORCEMENT STATION"}
              </Badge>
            </div>
            <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5 truncate max-w-xs sm:max-w-md">
              <span className="font-medium text-foreground">{user?.name}</span>
              <span>•</span>
              <span className="font-mono">{badgeLabel}</span>
            </p>
          </div>
        </div>

        {/* Right Tools */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLanguage}
            className="h-8 px-2 text-xs font-medium"
            title="Switch Language"
          >
            <Languages className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
            <span>{i18n.language === "en" ? "हिन्दी" : "EN"}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="h-8 w-8 p-0"
            title="Toggle Theme"
          >
            {isDark ? <Sun className="h-3.5 w-3.5 text-zinc-300" /> : <Moon className="h-3.5 w-3.5 text-zinc-600" />}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={async () => {
              await logout();
              navigate("/login");
            }}
            className="h-8 px-2 text-xs text-muted-foreground hover:text-destructive"
            title="Sign Out"
          >
            <LogOut className="h-3.5 w-3.5 sm:mr-1" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </header>

      {/* Subnav Tab Bar (Optimized for Mobile Touch) */}
      <div className="border-b border-border bg-card px-4 flex items-center gap-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = location.pathname === item.path || (item.path === "/roster" && (location.pathname === "/" || location.pathname === "/field/roster"));
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-1.5 px-3 py-2 border-b-2 text-xs font-medium transition-colors ${
                active
                  ? "border-primary text-foreground font-semibold"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Main Viewport */}
      <main className="flex-1 p-4 sm:p-6 max-w-5xl mx-auto w-full">
        <Outlet />
      </main>

      {/* Touch Bottom Bar for Quick Navigation */}
      <footer className="h-12 border-t border-border bg-card px-4 flex items-center justify-between text-[11px] text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Field Verification Engine Active (NIST P-256)</span>
        </div>
        <div>
          <span>Govt. of India Legal Metrology</span>
        </div>
      </footer>
    </div>
  );
}

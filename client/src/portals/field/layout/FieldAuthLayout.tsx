import { useState, useEffect } from "react";
import { Link, Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Sun, Moon, Globe, ClipboardCheck } from "lucide-react";

export function FieldAuthLayout() {
  const { t, i18n } = useTranslation();

  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem("theme_mode") === "dark";
  });

  useEffect(() => {
    if (localStorage.getItem("theme")) {
      localStorage.removeItem("theme");
    }
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme_mode", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme_mode", "light");
    }
  }, [isDark]);

  const isHindi = (i18n.resolvedLanguage || i18n.language || "en").toLowerCase().startsWith("hi");

  const toggleLanguage = () => {
    const nextLang = isHindi ? "en" : "hi";
    i18n.changeLanguage(nextLang);
    localStorage.setItem("i18nextLng", nextLang);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans antialiased selection:bg-sky-500/20">
      {/* 1. OFFICIAL TOP BAR - Aligned with Field AppShell TopBar (h-14) */}
      <header className="h-14 border-b border-border sticky top-0 z-20 bg-card shrink-0">
        <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          {/* Brand & Portal Identity */}
          <div className="flex items-center space-x-3 min-w-0">
            <Link to="/" className="flex items-center space-x-2.5 shrink-0 group">
              <img
                src="/emblem.jpeg"
                alt="State Emblem of India"
                className="h-8 w-auto object-contain"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = "none";
                }}
              />
              <span className="text-lg font-black tracking-tight text-foreground">
                eLMV
              </span>
            </Link>

            <span className="text-border">|</span>

            <div className="flex items-center space-x-2 truncate">
              <span className="text-xs sm:text-sm font-semibold text-foreground truncate">
                {isHindi ? "फील्ड संचालन एवं निरीक्षण सूट" : "Field Operations & Inspection Suite"}
              </span>
              <Badge
                variant="outline"
                className="hidden sm:inline-flex text-[10px] font-bold tracking-wider uppercase bg-sky-500/10 border-sky-500/20 text-sky-600 dark:text-sky-400 py-0.5 px-2"
              >
                <ClipboardCheck className="h-3 w-3 mr-1" />
                INSPECTOR CONSOLE
              </Badge>
            </div>
          </div>

          {/* Right Utility Actions */}
          <div className="flex items-center space-x-2 shrink-0">
            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="px-2.5 py-1 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center space-x-1.5 border border-border"
              title={isHindi ? "Switch to English" : "हिन्दी में देखें"}
            >
              <Globe className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
              <span>{isHindi ? "English" : "हिन्दी"}</span>
            </button>

            {/* Dark / Light Mode Toggle */}
            <button
              onClick={() => setIsDark(!isDark)}
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors border border-border"
              aria-label="Toggle theme"
              title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDark ? (
                <Sun className="h-4 w-4 text-amber-500" />
              ) : (
                <Moon className="h-4 w-4 text-slate-700" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* 2. MAIN CONTENT WRAPPER */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>

      {/* 3. OFFICIAL STATUTORY FOOTER - Matching Field AppShell Footer */}
      <footer className="h-14 border-t border-border px-4 sm:px-6 flex items-center text-[11px] text-muted-foreground bg-card shrink-0">
        <div className="w-full max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1 sm:gap-2">
          <span>
            {t("common.appName")} &copy; 2026 &bull; {isHindi ? "विधिक मापविज्ञान प्रवर्तन" : "Legal Metrology Field Enforcement"}
          </span>
          <span className="font-mono text-[10px]">
            {t("common.statutoryFooter")}
          </span>
        </div>
      </footer>
    </div>
  );
}

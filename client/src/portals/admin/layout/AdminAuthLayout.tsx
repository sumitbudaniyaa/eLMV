import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Sun, Moon, Globe } from "lucide-react";

export function AdminAuthLayout() {
  const { i18n } = useTranslation();

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
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4 relative font-sans antialiased">
      {/* Separate Language & Theme Controls in Top-Right */}
      <div className="fixed top-4 right-4 flex items-center space-x-2 z-50">
        <button
          onClick={toggleLanguage}
          className="px-2.5 py-1 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center space-x-1.5 border border-border bg-card shadow-2xs"
          title={isHindi ? "Switch to English" : "हिन्दी में देखें"}
        >
          <Globe className="h-3.5 w-3.5 text-primary" />
          <span>{isHindi ? "English" : "हिन्दी"}</span>
        </button>

        <button
          onClick={() => setIsDark(!isDark)}
          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors border border-border bg-card shadow-2xs"
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

      {/* Main Content */}
      <Outlet />
    </div>
  );
}

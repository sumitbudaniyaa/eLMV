import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

interface AppShellProps {
  children?: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { t } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Default theme is explicitly light
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

  return (
    <div className="h-screen bg-background text-foreground flex font-sans antialiased overflow-hidden">
      {/* Responsive Collapsible Sidebar */}
      <Sidebar
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Page Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <TopBar
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          isDark={isDark}
          onToggleTheme={() => setIsDark(!isDark)}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children || <Outlet />}
        </main>

        {/* Official Statutory Footer — Height aligned with sidebar footer */}
        <footer className="no-print h-14 border-t border-border px-6 flex items-center text-[11px] text-muted-foreground bg-card shrink-0">
          <div className="w-full max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1 sm:gap-2">
            <span>
              {t("common.appName")} &copy; 2026
            </span>
            <span className="font-mono text-[10px]">
              {t("common.statutoryFooter")}
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}


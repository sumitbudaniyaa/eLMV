import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GlobalSearchDialog } from "./GlobalSearchDialog";
import { CertificateDialog } from "@/components/common/CertificateDialog";
import {
  Menu,
  Sun,
  Moon,
  Globe,
  Search,
  ChevronRight,
  User,
} from "lucide-react";

interface TopBarProps {
  onToggleMobileMenu: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

export function TopBar({ onToggleMobileMenu, isDark, onToggleTheme }: TopBarProps) {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [viewCertNumber, setViewCertNumber] = useState<string | null>(null);

  const isHindi = (i18n.resolvedLanguage || i18n.language || "en").toLowerCase().startsWith("hi");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const toggleLanguage = () => {
    const nextLang = isHindi ? "en" : "hi";
    i18n.changeLanguage(nextLang);
    localStorage.setItem("i18nextLng", nextLang);
  };

  // Generate breadcrumb items
  const pathParts = location.pathname.split("/").filter(Boolean);
  const breadcrumbs = pathParts.map((part, index) => {
    const href = "/" + pathParts.slice(0, index + 1).join("/");
    const label = part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, " ");
    return { href, label, isLast: index === pathParts.length - 1 };
  });

  return (
    <header className="h-14 border-b border-border sticky top-0 z-20 bg-card shrink-0">
      <div className="h-full px-4 sm:px-6 flex items-center justify-between">
        {/* Left: Mobile hamburger & Breadcrumbs */}
        <div className="flex items-center space-x-3 min-w-0">
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground shrink-0"
            aria-label="Open menu"
          >
            <Menu className="h-4 w-4" />
          </button>

          {/* Breadcrumbs */}
          <nav className="hidden sm:flex items-center space-x-1.5 text-xs text-muted-foreground truncate">
            <Link
              to="/"
              className="hover:text-foreground transition-colors font-semibold shrink-0"
            >
              eLMV
            </Link>
            {breadcrumbs.length > 0 && (
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
            )}
            {breadcrumbs.map((crumb, idx) => (
              <div key={crumb.href} className="flex items-center space-x-1.5 min-w-0">
                {crumb.isLast ? (
                  <span className="font-semibold text-foreground truncate">
                    {crumb.label}
                  </span>
                ) : (
                  <Link
                    to={crumb.href}
                    className="hover:text-foreground transition-colors truncate"
                  >
                    {crumb.label}
                  </Link>
                )}
                {idx < breadcrumbs.length - 1 && (
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
                )}
              </div>
            ))}
          </nav>
        </div>

        {/* Center: In-App Global Omnisearch (Command Palette ⌘K) */}
        <div className="hidden md:flex items-center flex-1 max-w-sm lg:max-w-md mx-4 lg:mx-8">
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            className="w-full flex items-center justify-between px-3 h-8 rounded-md border border-border bg-muted/40 hover:bg-muted/70 hover:border-zinc-300 dark:hover:border-zinc-700 text-xs text-muted-foreground transition-all shadow-2xs group cursor-pointer"
          >
            <div className="flex items-center space-x-2 truncate">
              <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground group-hover:text-foreground transition-colors" />
              <span className="truncate">
                {isHindi
                  ? "उपकरण, आवेदन, क्रमांक या पृष्ठ खोजें..."
                  : "Search instruments, serials, applications, pages..."}
              </span>
            </div>
            <kbd className="hidden sm:inline-flex h-5 items-center gap-0.5 rounded border border-border bg-card px-1.5 font-mono text-[10px] font-medium text-muted-foreground shadow-2xs">
              <span className="text-xs">⌘</span>K
            </kbd>
          </button>
        </div>

        {/* Right: Controls & User Profile */}
        <div className="flex items-center space-x-2 shrink-0">
          {/* Quick Search shortcut for mobile */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSearchOpen(true)}
            className="h-8 w-8 md:hidden text-muted-foreground hover:text-foreground"
            title="Search App"
          >
            <Search className="h-4 w-4" />
          </Button>

          {/* Bilingual Switcher */}
          <Button
            variant="outline"
            size="sm"
            onClick={toggleLanguage}
            className="h-8 px-2.5 text-xs font-medium border-border shadow-2xs"
            title={isHindi ? "Switch to English" : "हिंदी में बदलें"}
          >
            <Globe className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
            {isHindi ? "English" : "हिन्दी"}
          </Button>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleTheme}
            className="h-8 w-8 rounded-md"
            title="Toggle Theme"
          >
            {isDark ? (
              <Sun className="h-4 w-4 text-amber-500" />
            ) : (
              <Moon className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>

          {/* User Status / Login */}
          {isAuthenticated && user ? (
            <div className="hidden md:flex items-center space-x-2 pl-2 border-l border-border">
              <Link to="/settings" title="Account Settings & Credentials">
                <Badge variant="outline" className="text-xs font-normal text-muted-foreground hover:text-foreground hover:border-slate-400 py-0.5 px-2 cursor-pointer transition-colors">
                  {user.role}
                </Badge>
              </Link>
            </div>
          ) : (
            <div className="flex items-center space-x-1.5 pl-2 border-l border-border">
              <Link to="/login">
                <Button size="sm" className="h-8 text-xs shadow-xs">
                  <User className="h-3.5 w-3.5 mr-1" />
                  {t("nav.login")}
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Global In-App Search Dialog */}
      <GlobalSearchDialog
        open={isSearchOpen}
        onOpenChange={setIsSearchOpen}
        onToggleTheme={onToggleTheme}
        isDark={isDark}
        onSelectCertificate={(certNumber) => {
          setIsSearchOpen(false);
          setViewCertNumber(certNumber);
        }}
      />

      {/* In-Page Statutory Certificate Modal */}
      <CertificateDialog
        certificateNumber={viewCertNumber}
        open={!!viewCertNumber}
        onOpenChange={(open) => !open && setViewCertNumber(null)}
      />
    </header>
  );
}


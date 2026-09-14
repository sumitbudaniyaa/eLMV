import { useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "react-i18next";
import {
  Home,
  LayoutDashboard,
  Scale,
  FileText,
  LogOut,
  Globe,
  Building2,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function ConsumerLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const isHindi = (i18n.resolvedLanguage || i18n.language || "en").toLowerCase().startsWith("hi");

  // Strictly enforce clean daylight mode matching the landing page
  useEffect(() => {
    document.documentElement.classList.remove("dark");
    localStorage.setItem("theme_mode", "light");
  }, []);

  const toggleLanguage = () => {
    const nextLang = isHindi ? "en" : "hi";
    i18n.changeLanguage(nextLang);
    localStorage.setItem("i18nextLng", nextLang);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const navItems = [
    { label: isHindi ? "मुख्य पृष्ठ" : "Portal Home", path: "/", icon: Home, isExternalHome: true },
    { label: isHindi ? "डैशबोर्ड" : "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { label: isHindi ? "मेरे उपकरण" : "My Instruments", path: "/instruments", icon: Scale },
    { label: isHindi ? "सत्यापन आवेदन" : "Applications", path: "/applications", icon: FileText },
    { label: isHindi ? "खाता सेटिंग्स" : "Settings", path: "/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50 text-foreground font-sans selection:bg-amber-500 selection:text-white transition-colors duration-150">
      {/* 1. TRICOLOR TOP NATIONAL STRIP WITH SUBTLE SHEEN */}
      <div className="w-full flex h-1 shadow-xs">
        <div className="w-1/3 bg-[#FF9933]" />
        <div className="w-1/3 bg-white" />
        <div className="w-1/3 bg-[#138808]" />
      </div>

      {/* 2. TOP UTILITY & GOVERNMENT ATTRIBUTION STRIP */}
      <div className="bg-slate-100/90 backdrop-blur-md border-b border-border/80 text-[11px] sm:text-xs py-1.5 px-4 sm:px-8 transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center space-x-2 text-muted-foreground truncate">
            <span className="font-bold text-slate-800 tracking-wide">
              {t("consumerLanding.topStrip.govtOfIndia")}
            </span>
            <span className="hidden md:inline text-muted-foreground/50">•</span>
            <span className="hidden md:inline truncate text-slate-600 font-medium">
              {t("consumerLanding.topStrip.ministry")}
            </span>
          </div>

          <div className="flex items-center space-x-2.5 shrink-0">
            {/* Language Switcher with Modern Pill */}
            <button
              type="button"
              onClick={toggleLanguage}
              className="flex items-center space-x-1.5 font-semibold px-2.5 py-1 rounded-full border border-border/90 bg-white hover:bg-slate-50 text-foreground transition-all duration-200 shadow-2xs hover:shadow-xs active:scale-95"
            >
              <Globe className="h-3.5 w-3.5 text-primary" />
              <span>{isHindi ? "English" : "हिन्दी"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. OFFICIAL BRANDING & MINISTRY HEADER */}
      <header className="bg-white/95 backdrop-blur-md border-b border-border shadow-xs relative z-20 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5 sm:py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Left: State Emblem of India + Portal Name */}
          <Link to="/dashboard" className="flex items-center space-x-3.5 sm:space-x-4 group">
            <div className="p-1 rounded-xl bg-slate-50 border border-slate-200/80 shadow-2xs">
              <img
                src="/emblem.jpeg"
                alt="State Emblem of India"
                className="h-12 sm:h-13 w-auto object-contain drop-shadow-xs"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = "none";
                }}
              />
            </div>
            <div className="border-l border-slate-200 pl-3.5 sm:pl-4">
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg md:text-xl font-black text-[#0B2545] tracking-tight leading-tight">
                  {t("consumerLanding.header.portalTitle", {
                    defaultValue: isHindi
                      ? "eLMV — राष्ट्रीय ऑनलाइन सत्यापन एवं मुद्रांकन पोर्टल"
                      : "eLMV — National Verification & Stamping Portal",
                  })}
                </h1>
              </div>
              <p className="text-[11px] sm:text-xs text-muted-foreground font-medium leading-tight">
                {t("consumerLanding.header.portalSubtitle", {
                  defaultValue: isHindi
                    ? "विधिक मापविज्ञान अधिनियम, 2009 (2010 का अधिनियम सं. 1) के अंतर्गत वैधानिक पोर्टल"
                    : "Statutory Portal under the Legal Metrology Act, 2009 (Act No. 1 of 2010)",
                })}
              </p>
            </div>
          </Link>

          {/* Right: Authenticated Trader Profile Pill & Logout */}
          <div className="flex items-center space-x-3 shrink-0">
            <Link
              to="/settings"
              className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-slate-200/80 bg-slate-50/80 hover:bg-slate-100/90 hover:border-slate-300 transition-all cursor-pointer group"
              title={isHindi ? "खाता सेटिंग्स एवं क्रेडेंशियल्स" : "Manage Account Credentials"}
            >
              <div className="h-8 w-8 rounded-lg bg-[#0B2545] group-hover:bg-[#133966] text-white flex items-center justify-center font-bold text-xs shadow-xs transition-colors">
                {user?.name?.[0]?.toUpperCase() || "T"}
              </div>
              <div className="text-left leading-tight pr-1">
                <p className="text-xs font-bold text-slate-900 group-hover:text-primary truncate max-w-[160px] transition-colors">
                  {user?.name}
                </p>
                <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Building2 className="h-2.5 w-2.5 text-slate-500 shrink-0" />
                  <span className="truncate max-w-[140px]">
                    {user?.stakeholderProfile?.businessName || "Commercial Establishment"}
                  </span>
                </p>
              </div>
            </Link>

            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="h-9 px-3.5 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200 rounded-lg transition-colors shadow-2xs"
              title="Sign Out"
            >
              <LogOut className="h-3.5 w-3.5 mr-1.5" />
              <span>{isHindi ? "लॉग आउट" : "Sign Out"}</span>
            </Button>
          </div>
        </div>
      </header>

      {/* 4. PRIMARY HORIZONTAL GOVERNMENT NAVIGATION BAR */}
      <nav
        aria-label="Portal Navigation"
        className="sticky top-0 z-40 bg-[#0B1E3B] text-white shadow-md border-b border-[#14315c]/80 transition-colors"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between overflow-x-auto text-xs font-medium scrollbar-none">
          <div className="flex items-center space-x-1 sm:space-x-1.5 py-0 shrink-0">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.isExternalHome
                ? false
                : location.pathname === item.path ||
                  (item.path !== "/dashboard" && location.pathname.startsWith(item.path));

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3.5 py-3 transition-all border-b-2 flex items-center gap-1.5 shrink-0 font-medium text-xs ${
                    isActive
                      ? "text-white bg-white/10 border-amber-400"
                      : "text-slate-200 hover:text-white hover:bg-white/10 border-transparent hover:border-sky-400"
                  }`}
                >
                  <Icon className={`h-3.5 w-3.5 ${isActive ? "text-amber-400" : "text-slate-300"}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Right: Section 24 Statutory Advisory Note */}
          <div className="hidden lg:flex items-center text-[11px] text-amber-300/90 font-medium">
            <span>⚖️ {isHindi ? "विधिक मापविज्ञान अधिनियम, 2009 • धारा 24 अनुपालन" : "Legal Metrology Act, 2009 • Section 24 Mandatory"}</span>
          </div>
        </div>
      </nav>

      {/* 5. MAIN PORTAL VIEWPORT */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-8 py-6 sm:py-8 space-y-6">
        <Outlet />
      </main>
    </div>
  );
}

import { useEffect } from "react";
import { Link, Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Globe, ArrowLeft } from "lucide-react";

export function AuthLayout() {
  const { t, i18n } = useTranslation();

  // Strictly enforce clean daylight mode matching the landing page
  useEffect(() => {
    document.documentElement.classList.remove("dark");
    localStorage.setItem("theme_mode", "light");
  }, []);

  const isHindi = (i18n.resolvedLanguage || i18n.language || "en").toLowerCase().startsWith("hi");

  const toggleLanguage = () => {
    const nextLang = isHindi ? "en" : "hi";
    i18n.changeLanguage(nextLang);
    localStorage.setItem("i18nextLng", nextLang);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans antialiased selection:bg-amber-100 selection:text-slate-900">
      {/* 1. TRICOLOR TOP NATIONAL STRIP */}
      <div className="w-full h-1 sm:h-1.5 flex flex-row shrink-0 sticky top-0 z-50">
        <div className="flex-1 bg-[#FF9933]" />
        <div className="flex-1 bg-[#FFFFFF]" />
        <div className="flex-1 bg-[#138808]" />
      </div>

      {/* 2. TOP UTILITY STRIP */}
      <div className="bg-[#0B1E3B] text-slate-200 text-[11px] sm:text-xs py-1.5 px-4 sm:px-8 border-b border-[#14315c]/80 relative z-30 transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3 text-slate-300">
            <span className="font-semibold tracking-wide text-white">भारत सरकार</span>
            <span className="text-slate-400">|</span>
            <span className="font-semibold tracking-wide text-slate-200">GOVERNMENT OF INDIA</span>
            <span className="hidden sm:inline text-slate-400">|</span>
            <span className="hidden sm:inline text-slate-300">
              {isHindi
                ? "उपभोक्ता मामले विभाग"
                : "Department of Consumer Affairs"}
            </span>
          </div>

          <div className="flex items-center space-x-3">
            {/* Language Switcher Pill */}
            <button
              onClick={toggleLanguage}
              className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 flex items-center space-x-1.5 transition-all shadow-2xs"
              title={isHindi ? "Switch to English" : "हिन्दी में देखें"}
            >
              <Globe className="h-3 w-3 text-amber-400" />
              <span>{isHindi ? "English" : "हिन्दी"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. OFFICIAL BRANDING HEADER */}
      <header className="bg-white/95 backdrop-blur-md border-b border-border shadow-xs relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 sm:py-3.5 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3.5 sm:space-x-4 group">
            <div className="p-1 rounded-xl bg-slate-50 border border-slate-200/80 shadow-2xs">
              <img
                src="/emblem.jpeg"
                alt="State Emblem of India"
                className="h-10 sm:h-12 w-auto object-contain drop-shadow-xs"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = "none";
                }}
              />
            </div>
            <div className="border-l border-slate-200 pl-3.5 sm:pl-4">
              <h1 className="text-base sm:text-lg font-black text-[#0B2545] tracking-tight leading-tight">
                {t("consumerLanding.header.portalTitle", {
                  defaultValue: isHindi
                    ? "eLMV — राष्ट्रीय ऑनलाइन सत्यापन एवं मुद्रांकन पोर्टल"
                    : "eLMV — National Verification & Stamping Portal",
                })}
              </h1>
              <p className="text-[11px] sm:text-xs text-muted-foreground font-medium leading-tight">
                {t("consumerLanding.header.portalSubtitle", {
                  defaultValue: isHindi
                    ? "विधिक मापविज्ञान अधिनियम, 2009 (2010 का अधिनियम सं. 1) के अंतर्गत वैधानिक पोर्टल"
                    : "Statutory Portal under the Legal Metrology Act, 2009 (Act No. 1 of 2010)",
                })}
              </p>
            </div>
          </Link>

          {/* Return to Portal Home Link */}
          <Link
            to="/"
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-[#0B2545] px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors border border-slate-200/80"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{isHindi ? "मुख्य पृष्ठ पर लौटें" : "Back to Home"}</span>
            <span className="sm:hidden">{isHindi ? "मुख्य पृष्ठ" : "Home"}</span>
          </Link>
        </div>
      </header>

      {/* 4. MAIN CONTENT AREA */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md my-4">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

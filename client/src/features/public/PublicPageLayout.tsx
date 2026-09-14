import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Globe,
  ArrowLeft,
  ChevronRight,
  FileText,
  ShieldCheck,
  HelpCircle,
  Building,
} from "lucide-react";

interface PublicPageLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  activePath?: string;
}

export function PublicPageLayout({
  title,
  subtitle,
  children,
  activePath,
}: PublicPageLayoutProps) {
  const { t, i18n } = useTranslation();

  // Enforce daylight theme consistency for public documents
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const isHindi = (i18n.resolvedLanguage || i18n.language || "en").toLowerCase().startsWith("hi");

  const toggleLanguage = () => {
    const nextLang = isHindi ? "en" : "hi";
    i18n.changeLanguage(nextLang);
    localStorage.setItem("i18nextLng", nextLang);
  };

  const navLinks = [
    { path: "/policies", label: t("consumerLanding.footer.links.privacy", { defaultValue: "Website Policies" }), icon: ShieldCheck },
    { path: "/terms", label: t("consumerLanding.footer.links.terms", { defaultValue: "Terms & Conditions" }), icon: FileText },
    { path: "/help", label: t("consumerLanding.footer.links.help", { defaultValue: "Help & FAQs" }), icon: HelpCircle },
    { path: "/contact", label: t("consumerLanding.footer.links.contact", { defaultValue: "Contact Us" }), icon: Building },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans antialiased selection:bg-amber-100 selection:text-slate-900">
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
              {isHindi ? "उपभोक्ता मामले विभाग" : "Department of Consumer Affairs"}
            </span>
          </div>

          <div className="flex items-center space-x-3">
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
      <header className="bg-white/95 dark:bg-card/95 backdrop-blur-md border-b border-border shadow-xs relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3.5 sm:space-x-4 group">
            <div className="p-1 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-border shadow-2xs">
              <img
                src="/emblem.jpeg"
                alt="State Emblem of India"
                className="h-10 sm:h-12 w-auto object-contain drop-shadow-xs"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = "none";
                }}
              />
            </div>
            <div className="border-l border-slate-200 dark:border-border pl-3.5 sm:pl-4">
              <h1 className="text-base sm:text-lg font-black text-[#0B2545] dark:text-primary tracking-tight leading-tight">
                {isHindi
                  ? "eLMV — राष्ट्रीय ऑनलाइन सत्यापन एवं मुद्रांकन पोर्टल"
                  : "eLMV — National Verification & Stamping Portal"}
              </h1>
              <p className="text-[11px] sm:text-xs text-muted-foreground font-medium leading-tight">
                {isHindi
                  ? "विधिक मापविज्ञान अधिनियम, 2009 (2010 का अधिनियम सं. 1) के अंतर्गत वैधानिक पोर्टल"
                  : "Statutory Portal under the Legal Metrology Act, 2009 (Act No. 1 of 2010)"}
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-[#0B2545] dark:hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200/80 dark:border-border"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{isHindi ? "मुख्य पृष्ठ पर लौटें" : "Back to Home"}</span>
              <span className="sm:hidden">{isHindi ? "मुख्य पृष्ठ" : "Home"}</span>
            </Link>
          </div>
        </div>

        {/* Navigation Strip */}
        <div className="border-t border-border/70 bg-slate-50/70 dark:bg-card/50 overflow-x-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = activePath === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-2 text-xs font-medium border-b-2 whitespace-nowrap flex items-center gap-1.5 transition-all ${
                    isActive
                      ? "border-[#0B2545] dark:border-primary text-[#0B2545] dark:text-primary font-bold bg-white dark:bg-slate-900"
                      : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </header>

      {/* 4. PAGE TITLE HERO */}
      <section className="bg-gradient-to-b from-white dark:from-card to-slate-50/50 dark:to-background border-b border-border py-8 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto space-y-2">
          <div className="flex items-center space-x-1.5 text-xs text-muted-foreground">
            <Link to="/" className="hover:underline hover:text-foreground">
              {isHindi ? "मुख्य पृष्ठ" : "Home"}
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground font-medium">{title}</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-[#0B2545] dark:text-primary tracking-tight">
                  {title}
                </h1>
              </div>
              {subtitle && (
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-3xl leading-relaxed">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 5. MAIN BODY CONTENT */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-8 py-8">
        {children}
      </main>

      {/* 6. STATUTORY OFFICIAL FOOTER */}
      <footer className="bg-[#071326] text-slate-300 border-t-2 border-amber-500/40 pt-12 pb-8 px-4 sm:px-8 text-xs mt-auto">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            <div className="md:col-span-7 space-y-3">
              <div className="flex items-center space-x-3.5">
                <img
                  src="/emblem.jpeg"
                  alt="Emblem of India"
                  className="h-10 w-auto object-contain brightness-110 shrink-0"
                />
                <div>
                  <h3 className="font-bold text-sm text-white">
                    {t("consumerLanding.footer.ministryTitle", {
                      defaultValue: "Department of Consumer Affairs • Legal Metrology Division",
                    })}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {t("consumerLanding.footer.govtTitle", {
                      defaultValue: "Ministry of Consumer Affairs, Food and Public Distribution, Government of India",
                    })}
                  </p>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed max-w-xl font-normal">
                {t("consumerLanding.footer.disclaimer", {
                  defaultValue: "This official portal is developed to ensure fairness, transparency, and consumer protection in commercial trade across India. All digital certificates issued are cryptographically signed under ECDSA NIST P-256.",
                })}
              </p>
            </div>

            <div className="md:col-span-5 flex flex-col md:items-end space-y-4">
              {/* Digital India Brand Mark on Right */}
              <div className="p-1.5 px-3 rounded-xl bg-white shadow-2xs inline-flex items-center justify-center">
                <img
                  src="/digi-india.png"
                  alt="Digital India"
                  className="h-8 w-auto object-contain"
                />
              </div>

              <div className="space-y-2 md:text-right">
                <h4 className="font-bold text-white text-xs uppercase tracking-wider">
                  {isHindi ? "सहायता एवं हेल्पलाइन" : "Support & Helpline"}
                </h4>
                <div className="flex items-center md:justify-end gap-2 text-xs whitespace-nowrap">
                  <span className="text-slate-400">
                    {isHindi
                      ? "राष्ट्रीय उपभोक्ता टोल-फ्री हेल्पलाइन:"
                      : "National Consumer Toll-Free Helpline:"}
                  </span>
                  <span className="inline-block px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 font-mono font-bold text-amber-400 text-xs shadow-inner shrink-0">
                    1915
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 pt-0.5">
                  {isHindi
                    ? "कार्य समय: प्रातः 09:30 से सायं 05:30 (सोम-शनि, राजपत्रित अवकाशों को छोड़कर)"
                    : "Operating Hours: 09:30 AM to 05:30 PM (Mon-Sat, except Gazetted Holidays)"}
                </p>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
            <div className="flex flex-wrap items-center gap-4 font-medium">
              <Link to="/policies" className="hover:text-slate-300 transition-colors">
                {t("consumerLanding.footer.links.privacy", { defaultValue: "Website Policies" })}
              </Link>
              <span>•</span>
              <Link to="/terms" className="hover:text-slate-300 transition-colors">
                {t("consumerLanding.footer.links.terms", { defaultValue: "Terms & Conditions" })}
              </Link>
              <span>•</span>
              <Link to="/help" className="hover:text-slate-300 transition-colors">
                {t("consumerLanding.footer.links.help", { defaultValue: "Help & FAQs" })}
              </Link>
              <span>•</span>
              <Link to="/contact" className="hover:text-slate-300 transition-colors">
                {t("consumerLanding.footer.links.contact", { defaultValue: "Contact Us" })}
              </Link>
            </div>
            <p className="font-mono text-[10px]">{t("consumerLanding.footer.copyright", { defaultValue: "© 2026 Legal Metrology Division, Government of India. All rights reserved." })}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

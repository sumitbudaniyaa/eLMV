import { useState, useEffect, useId } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { ApiResponse } from "@sih/shared";
import { CertificateDialog } from "@/components/common/CertificateDialog";
import {
  ShieldCheck,
  Scale,
  FileCheck2,
  Award,
  Search,
  ArrowRight,
  Globe,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Building2,
  Calculator,
  PhoneCall,
  FileText,
  ChevronRight,
  Shield,
  Loader2,
  XCircle,
  Check,
  Quote,
} from "lucide-react";

interface TrackedApplication {
  applicationNumber: string;
  status: string;
  type: string;
  submittedAt: string;
  scheduledDate?: string | null;
  feeAmount: number;
  feePaid: boolean;
  rejectionReason?: string | null;
  instrument?: {
    category: string;
    make: string;
    model: string;
    serialNumber: string;
    capacity: number;
    unit: string;
    accuracyClass: string;
  };
  certificate?: {
    certificateNumber: string;
    issuedAt: string;
    validUntil: string;
    qrToken?: string;
  } | null;
  inspectionRecord?: {
    inspectedAt: string;
    result: string;
    sealNumber?: string | null;
  } | null;
  assignedOfficer?: {
    name: string;
    role: string;
  } | null;
}

// Statutory Fee Schedules under Legal Metrology (General) Rules, 2011 (Schedule XII / Rule 14)
const STATUTORY_CATEGORIES = [
  {
    id: "nawi_class_ii",
    labelEn: "NAWI Class II (High Precision / Jewel / Gold)",
    labelHi: "अ-स्वचालित तोल उपकरण वर्ग II (उच्च परिशुद्धता / आभूषण)",
    capacities: [
      { label: "Up to 500 g", fee: 400, interval: "12 Months (वार्षिक)", sla: "7 Working Days" },
      { label: "500 g to 5 kg", fee: 500, interval: "12 Months (वार्षिक)", sla: "7 Working Days" },
      { label: "Above 5 kg", fee: 800, interval: "12 Months (वार्षिक)", sla: "7 Working Days" },
    ],
  },
  {
    id: "nawi_class_iii",
    labelEn: "NAWI Class III (Commercial Retail Counter Scale)",
    labelHi: "अ-स्वचालित तोल उपकरण वर्ग III (व्यावसायिक काउंटर तराजू)",
    capacities: [
      { label: "Up to 50 kg (Standard Retail)", fee: 200, interval: "12 Months (वार्षिक)", sla: "5 Working Days" },
      { label: "50 kg to 200 kg (Platform)", fee: 300, interval: "12 Months (वार्षिक)", sla: "7 Working Days" },
      { label: "200 kg to 1 tonne (Industrial)", fee: 600, interval: "12 Months (वार्षिक)", sla: "7 Working Days" },
    ],
  },
  {
    id: "weighbridge",
    labelEn: "Electronic Weighbridge (धर्मकांटा / भारी वाहन)",
    labelHi: "इलेक्ट्रॉनिक वे-ब्रिज (धर्मकांटा / भारी वाहन तोल)",
    capacities: [
      { label: "Up to 30 Tonnes", fee: 2500, interval: "12 Months (वार्षिक)", sla: "10 Working Days" },
      { label: "30 Tonnes to 60 Tonnes", fee: 4000, interval: "12 Months (वार्षिक)", sla: "10 Working Days" },
      { label: "Above 60 Tonnes (up to 100t)", fee: 5000, interval: "12 Months (वार्षिक)", sla: "14 Working Days" },
    ],
  },
  {
    id: "fuel_dispenser",
    labelEn: "Fuel Dispensing Unit (Petrol / Diesel / CNG Pump)",
    labelHi: "ईंधन वितरण इकाई (पेट्रोल / डीजल / सीएनजी नोजल)",
    capacities: [
      { label: "Single Nozzle Dispenser", fee: 1500, interval: "12 Months (वार्षिक)", sla: "7 Working Days" },
      { label: "Multi-Product Dual Nozzle Dispenser", fee: 2500, interval: "12 Months (वार्षिक)", sla: "7 Working Days" },
      { label: "High-Flow Flowmeter (> 100 L/min)", fee: 3500, interval: "12 Months (वार्षिक)", sla: "10 Working Days" },
    ],
  },
  {
    id: "auto_weighing",
    labelEn: "Automatic Weighing Instrument (Conveyor / Checkweigher)",
    labelHi: "स्वचालित तोल उपकरण (कन्वेयर / चेकवेअर)",
    capacities: [
      { label: "Catchweigher / Checkweigher", fee: 1000, interval: "12 Months (वार्षिक)", sla: "7 Working Days" },
      { label: "Continuous Totaliser (Belt Weigher)", fee: 2000, interval: "12 Months (वार्षिक)", sla: "10 Working Days" },
    ],
  },
  {
    id: "storage_tank",
    labelEn: "Storage Tank / Vertical Petroleum Tank",
    labelHi: "भंडारण टैंक / ऊर्ध्वाधर पेट्रोलियम टैंक (कैलिब्रेशन)",
    capacities: [
      { label: "Up to 100 kL", fee: 5000, interval: "60 Months (5 वर्ष)", sla: "14 Working Days" },
      { label: "100 kL to 500 kL", fee: 10000, interval: "60 Months (5 वर्ष)", sla: "21 Working Days" },
    ],
  },
];

export function ConsumerLandingPage() {
  const { t, i18n } = useTranslation();
  const { user, isAuthenticated, logout } = useAuth();

  // Strictly enforce official Government light theme on the public landing page
  useEffect(() => {
    document.documentElement.classList.remove("dark");
    localStorage.setItem("theme_mode", "light");
  }, []);

  const isHindi = (i18n.resolvedLanguage || i18n.language || "en").toLowerCase().startsWith("hi");
  const toggleLanguage = () => {
    const next = isHindi ? "en" : "hi";
    i18n.changeLanguage(next);
    localStorage.setItem("i18nextLng", next);
  };

  // Live Application Tracker State
  const [trackInput, setTrackInput] = useState("");
  const [isTracking, setIsTracking] = useState(false);
  const [trackedApp, setTrackedApp] = useState<TrackedApplication | null>(null);
  const [trackError, setTrackError] = useState<string | null>(null);
  const [viewCertNumber, setViewCertNumber] = useState<string | null>(null);

  // Fee Calculator State
  const [selectedCatId, setSelectedCatId] = useState(STATUTORY_CATEGORIES[1].id);
  const selectedCategory = STATUTORY_CATEGORIES.find((c) => c.id === selectedCatId) || STATUTORY_CATEGORIES[0];
  const [selectedCapacityIndex, setSelectedCapacityIndex] = useState(0);
  const selectedCapacity = selectedCategory.capacities[selectedCapacityIndex] || selectedCategory.capacities[0];

  const categorySelectId = useId();
  const capacitySelectId = useId();

  // Reset capacity selection when category changes
  useEffect(() => {
    setSelectedCapacityIndex(0);
  }, [selectedCatId]);

  // Handle Track Application Submission
  const handleTrackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNum = trackInput.trim();
    if (!cleanNum) return;

    setIsTracking(true);
    setTrackError(null);
    setTrackedApp(null);

    try {
      const res = await api.get<ApiResponse<TrackedApplication>>(`/verification/track/${encodeURIComponent(cleanNum)}`);
      if (res.data?.success && res.data?.data) {
        setTrackedApp(res.data.data);
      } else {
        setTrackError(cleanNum);
      }
    } catch {
      setTrackError(cleanNum);
    } finally {
      setIsTracking(false);
    }
  };

  // Calculate status milestone index
  const getMilestoneIndex = (status?: string) => {
    if (!status) return 0;
    switch (status) {
      case "SUBMITTED":
        return 0;
      case "SCHEDULED":
        return 1;
      case "INSPECTED":
        return 2;
      case "CERTIFIED":
        return 3;
      case "REJECTED":
        return -1;
      default:
        return 0;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-foreground font-sans antialiased flex flex-col selection:bg-amber-500 selection:text-white">
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
              <Globe className="h-3 w-3 text-primary" />
              <span>{isHindi ? "English" : "हिन्दी"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. OFFICIAL BRANDING & MINISTRY HEADER */}
      <header className="bg-white/95 backdrop-blur-md border-b border-border shadow-xs relative z-20 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5 sm:py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Left: State Emblem of India + Portal Name */}
          <div className="flex items-center space-x-3.5 sm:space-x-4">
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
              <h1 className="text-base sm:text-lg md:text-xl font-black text-slate-950 tracking-tight leading-tight">
                {t("consumerLanding.header.portalTitle")}
              </h1>
              <p className="text-[11px] sm:text-xs text-muted-foreground font-medium leading-tight">
                {t("consumerLanding.header.portalSubtitle")}
              </p>
            </div>
          </div>

          {/* Right: Context-aware Auth Action */}
          <div className="flex items-center space-x-3 shrink-0">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-2">
                <Link to="/dashboard">
                  <Button size="sm" className="h-9 px-4 text-xs font-bold shadow-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all hover:shadow-md">
                    <Building2 className="h-3.5 w-3.5 mr-1.5" />
                    {t("consumerLanding.header.myDashboard")}
                    <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={logout}
                  className="h-9 px-3 text-xs text-muted-foreground hover:text-foreground rounded-lg transition-colors"
                >
                  {t("consumerLanding.header.logout")}
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link to="/login">
                  <Button
                    size="sm"
                    className="h-9 px-4 text-xs font-bold bg-[#0B2545] hover:bg-[#133966] text-white shadow-xs rounded-lg transition-all hover:shadow-md"
                  >
                    {t("consumerLanding.header.traderLogin")}
                    <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="outline" size="sm" className="h-9 px-3.5 text-xs font-semibold rounded-lg hover:bg-slate-100 transition-colors">
                    {t("consumerLanding.header.register")}
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 4. PRIMARY HORIZONTAL GOVERNMENT NAVIGATION BAR */}
      <nav aria-label="Portal Primary Navigation" className="sticky top-0 z-40 bg-[#0B1E3B]/95 backdrop-blur-md text-white shadow-md border-b border-[#14315c]/80 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between overflow-x-auto text-xs font-medium scrollbar-none">
          <div className="flex items-center space-x-1 sm:space-x-1.5 py-0 shrink-0">
            <a
              href="#hero"
              className="px-3.5 py-3 font-medium text-white hover:bg-white/10 transition-all border-b-2 border-amber-400 flex items-center gap-1.5"
            >
              <span>{t("consumerLanding.nav.home")}</span>
            </a>
            <a
              href="#about"
              className="px-3.5 py-3 text-slate-200 hover:text-white hover:bg-white/10 transition-all border-b-2 border-transparent hover:border-sky-400"
            >
              {t("consumerLanding.nav.aboutUs")}
            </a>
            <a
              href="#services"
              className="px-3.5 py-3 text-slate-200 hover:text-white hover:bg-white/10 transition-all border-b-2 border-transparent hover:border-sky-400"
            >
              {t("consumerLanding.nav.services")}
            </a>
            <a
              href="#track"
              className="px-3.5 py-3 text-slate-200 hover:text-white hover:bg-white/10 transition-all border-b-2 border-transparent hover:border-amber-400 flex items-center gap-1.5"
            >
              <Search className="h-3 w-3 text-amber-400" />
              <span>{t("consumerLanding.nav.trackApp")}</span>
            </a>
            <a
              href="#calculator"
              className="px-3 py-3 text-slate-200 hover:text-white hover:bg-white/10 transition-all border-b-2 border-transparent hover:border-sky-400 flex items-center gap-1.5"
            >
              <Calculator className="h-3 w-3 text-sky-400" />
              <span>{t("consumerLanding.nav.feeCalculator")}</span>
            </a>
            <a
              href="#act"
              className="px-3 py-3 text-slate-200 hover:text-white hover:bg-white/10 transition-all border-b-2 border-transparent hover:border-rose-400"
            >
              {t("consumerLanding.nav.section24")}
            </a>
          </div>
        </div>
      </nav>

      {/* 5. PREMIER HERO BANNER — EFFORTLESS CERTIFICATION & INSTANT VERIFICATION */}
      <section
        id="hero"
        aria-label="National Verification and Certification"
        className="relative overflow-hidden bg-[#F8FAFC] text-slate-900 border-b border-slate-200"
      >
        <div className="py-14 sm:py-20 px-4 sm:px-8">
          <div className="max-w-7xl mx-auto space-y-8 sm:space-y-10">
            {/* Top Text, CTAs & Visual Service Illustration */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
              {/* Left Column: Title & Description */}
              <div className="lg:col-span-7 space-y-5 sm:space-y-6">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-[#0B2545]">
                  {t("consumerLanding.hero.title")}
                </h1>

                <p className="text-sm sm:text-base md:text-lg text-slate-700 leading-relaxed max-w-3xl font-normal">
                  {t("consumerLanding.hero.desc")}
                </p>
              </div>

              {/* Right Column: Relevant Legal Metrology Service Image */}
              <div className="lg:col-span-5 flex justify-center lg:justify-end">
                <div className="w-full max-w-sm sm:max-w-md lg:max-w-full rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200/90 bg-white shadow-sm">
                  <img
                    src="/metrology-hero.jpg"
                    alt="Legal Metrology Precision Verification & Certification"
                    className="w-full h-auto object-cover sm:object-contain block"
                    loading="eager"
                  />
                </div>
              </div>
            </div>

            {/* Dual Core Pillars: 1. Easy to Get Certified | 2. Easily Verified */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 pt-2">
              {/* Pillar 1: How Easy It Is To Get Certified */}
              <div className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center font-bold">
                    <FileCheck2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-slate-900">
                      {t("consumerLanding.hero.card1Title")}
                    </h2>
                    <span className="text-[11px] text-amber-700 font-semibold">Streamlined Trader Workflow</span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  {t("consumerLanding.hero.card1Desc")}
                </p>

                <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-700">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{t("consumerLanding.hero.card1Step1")}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{t("consumerLanding.hero.card1Step2")}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{t("consumerLanding.hero.card1Step3")}</span>
                  </div>
                </div>
              </div>

              {/* Pillar 2: How Easily It Can Be Verified */}
              <div className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center font-bold">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-slate-900">
                      {t("consumerLanding.hero.card2Title")}
                    </h2>
                    <span className="text-[11px] text-emerald-700 font-semibold">Public Transparency & Trust</span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  {t("consumerLanding.hero.card2Desc")}
                </p>

                <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-700">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{t("consumerLanding.hero.card2Step1")}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{t("consumerLanding.hero.card2Step2")}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{t("consumerLanding.hero.card2Step3")}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Statutory Standards Footnote Bar */}
            <div className="pt-4 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-600 border-t border-slate-200">
              <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  <span>ECDSA NIST P-256 PKI Signatures</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Legal Metrology (General) Rules, 2011</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Schedule XII Standardized Statutory Fees</span>
                </div>
              </div>

              <a href="#services" className="text-primary hover:underline font-semibold flex items-center gap-1">
                {t("consumerLanding.hero.allServicesBtn")} &rarr;
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 6. STATUTORY ADVISORY TICKER (CONTINUOUS RUNNING MARQUEE) */}
      <div className="bg-amber-50 border-b border-amber-200 px-4 sm:px-8 py-2.5 text-xs overflow-hidden">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <Badge className="bg-red-600 hover:bg-red-700 text-white text-[10px] font-extrabold uppercase shrink-0 tracking-wider shadow-xs rounded-full px-2.5 py-0.5 z-10 inline-flex items-center gap-1.5 whitespace-nowrap">
            <AlertTriangle className="h-3 w-3 shrink-0" />
            <span>{t("consumerLanding.hero.tickerLabel")}</span>
          </Badge>
          <div className="overflow-hidden flex-1 relative">
            <div className="animate-ticker cursor-default">
              <span className="font-semibold text-amber-950 pr-12 inline-flex items-center gap-3">
                <span>{t("consumerLanding.hero.tickerText")}</span>
                <span className="text-amber-600/60 font-bold">•</span>
              </span>
              <span className="font-semibold text-amber-950 pr-12 inline-flex items-center gap-3" aria-hidden="true">
                <span>{t("consumerLanding.hero.tickerText")}</span>
                <span className="text-amber-600/60 font-bold">•</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 7. LEADERSHIP & "ABOUT LEGAL METROLOGY DIVISION" SECTION */}
      <section id="about" className="py-16 sm:py-20 px-4 sm:px-8 bg-white border-b border-border transition-colors">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          {/* Left Column: Minister / Leadership Card */}
          <div className="lg:col-span-4">
            <Card className="border border-border bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200">
              <div className="p-6 flex flex-col items-center text-center space-y-4">
                <div className="relative">
                  <img
                    src="/pj.jpeg"
                    alt={t("consumerLanding.leadership.ministerName")}
                    className="w-48 h-56 sm:w-52 sm:h-60 object-cover object-top rounded-xl shadow-sm border border-border bg-white"
                    onError={(e) => {
                      const target = e.currentTarget;
                      target.src = "/emblem.jpeg";
                      target.className = "w-36 h-36 object-contain p-2";
                    }}
                  />
                </div>

                <div className="space-y-1.5 pt-1">
                  <h3 className="text-lg font-bold text-foreground tracking-tight">
                    {t("consumerLanding.leadership.ministerName")}
                  </h3>
                  <p className="text-xs font-bold text-primary">
                    {t("consumerLanding.leadership.ministerDesignation")}
                  </p>
                  <p className="text-[11px] text-muted-foreground font-medium">
                    {t("consumerLanding.leadership.ministry")}
                  </p>
                  <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                    {t("consumerLanding.leadership.govt")}
                  </p>
                </div>

                <div className="pt-3 border-t border-border/80 w-full text-left relative">
                  <Quote className="h-4 w-4 text-amber-500/40 mb-1" />
                  <p className="text-xs italic text-muted-foreground leading-relaxed">
                    "{t("consumerLanding.leadership.quote")}"
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column: "About eLMV / Legal Metrology Division" */}
          <div className="lg:col-span-8 space-y-6">
            <div className="space-y-2.5">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-foreground tracking-tight">
                {t("consumerLanding.aboutElmv.title")}
              </h2>
              {/* Clean solid Navy Accent Line */}
              <div className="h-1 w-20 bg-[#0B2545] rounded-full" />
            </div>

            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed font-normal">
              {t("consumerLanding.aboutElmv.desc")}
            </p>

            {/* 3 Statutory Strategic Pillars with Bento Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-5 rounded-2xl border border-border/90 bg-slate-50/70 space-y-2.5 hover:shadow-md hover:border-primary/40 transition-all duration-300">
                <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-extrabold text-sm shadow-2xs">
                  01
                </div>
                <h4 className="text-xs font-bold text-foreground">
                  {t("consumerLanding.aboutElmv.pillar1Title")}
                </h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {t("consumerLanding.aboutElmv.pillar1Desc")}
                </p>
              </div>

              <div className="p-5 rounded-2xl border border-border/90 bg-slate-50/70 space-y-2.5 hover:shadow-md hover:border-emerald-500/40 transition-all duration-300">
                <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-extrabold text-sm shadow-2xs">
                  02
                </div>
                <h4 className="text-xs font-bold text-foreground">
                  {t("consumerLanding.aboutElmv.pillar2Title")}
                </h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {t("consumerLanding.aboutElmv.pillar2Desc")}
                </p>
              </div>

              <div className="p-5 rounded-2xl border border-border/90 bg-slate-50/70 space-y-2.5 hover:shadow-md hover:border-sky-500/40 transition-all duration-300">
                <div className="h-9 w-9 rounded-xl bg-sky-500/10 text-sky-600 flex items-center justify-center font-extrabold text-sm shadow-2xs">
                  03
                </div>
                <h4 className="text-xs font-bold text-foreground">
                  {t("consumerLanding.aboutElmv.pillar3Title")}
                </h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {t("consumerLanding.aboutElmv.pillar3Desc")}
                </p>
              </div>
            </div>

            <div className="pt-3 flex flex-wrap items-center gap-3.5">
              <a href="#act">
                <Button size="sm" className="h-10 px-5 text-xs font-bold bg-[#0B2545] hover:bg-[#133966] text-white rounded-xl shadow-xs transition-all hover:shadow-md">
                  {t("consumerLanding.aboutElmv.learnMore")}
                  <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                </Button>
              </a>
              <a href="#services">
                <Button variant="outline" size="sm" className="h-10 px-5 text-xs font-semibold rounded-xl hover:bg-slate-100 transition-colors">
                  Explore Citizen Services
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 8. CITIZEN & TRADER SERVICES GRID */}
      <section id="services" className="py-16 sm:py-20 px-4 sm:px-8 max-w-7xl mx-auto w-full space-y-10">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <h2 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
            {t("consumerLanding.services.sectionTitle")}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto">
            {t("consumerLanding.services.sectionSubtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: Track Application */}
          <Card className="border border-border/80 shadow-xs hover:shadow-md transition-all duration-300 hover:border-blue-500/50 group bg-card rounded-2xl overflow-hidden">
            <CardContent className="p-6 sm:p-7 flex flex-col justify-between h-full space-y-5">
              <div className="space-y-3.5">
                <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                  <Search className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                  {t("consumerLanding.services.track.title")}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {t("consumerLanding.services.track.desc")}
                </p>
              </div>
              <a href="#track">
                <Button variant="outline" size="sm" className="w-full text-xs font-semibold justify-between rounded-xl group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all">
                  <span>{t("consumerLanding.services.track.action")}</span>
                  <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </a>
            </CardContent>
          </Card>

          {/* Card 2: Consumer Helpline & Grievances */}
          <Card className="border border-border/80 shadow-xs hover:shadow-md transition-all duration-300 hover:border-emerald-500/50 group bg-card rounded-2xl overflow-hidden">
            <CardContent className="p-6 sm:p-7 flex flex-col justify-between h-full space-y-5">
              <div className="space-y-3.5">
                <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                  <PhoneCall className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-foreground group-hover:text-emerald-600 transition-colors">
                  {t("consumerLanding.services.helpdesk.title")}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {t("consumerLanding.services.helpdesk.desc")}
                </p>
              </div>
              <a href="#contact">
                <Button variant="outline" size="sm" className="w-full text-xs font-semibold justify-between rounded-xl group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600 transition-all">
                  <span>{t("consumerLanding.services.helpdesk.action")}</span>
                  <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </a>
            </CardContent>
          </Card>

          {/* Card 3: Apply for Stamping */}
          <Card className="border border-border/80 shadow-xs hover:shadow-md transition-all duration-300 hover:border-amber-500/50 group bg-card rounded-2xl overflow-hidden">
            <CardContent className="p-6 sm:p-7 flex flex-col justify-between h-full space-y-5">
              <div className="space-y-3.5">
                <div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                  <FileText className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-foreground group-hover:text-amber-600 transition-colors">
                  {t("consumerLanding.services.apply.title")}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {t("consumerLanding.services.apply.desc")}
                </p>
              </div>
              <Link to={isAuthenticated ? "/applications" : "/login"}>
                <Button variant="outline" size="sm" className="w-full text-xs font-semibold justify-between rounded-xl group-hover:bg-amber-600 group-hover:text-white group-hover:border-amber-600 transition-all">
                  <span>{t("consumerLanding.services.apply.action")}</span>
                  <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Card 4: Device Registry */}
          <Card className="border border-border/80 shadow-xs hover:shadow-md transition-all duration-300 hover:border-purple-500/50 group bg-card rounded-2xl overflow-hidden">
            <CardContent className="p-6 sm:p-7 flex flex-col justify-between h-full space-y-5">
              <div className="space-y-3.5">
                <div className="h-12 w-12 rounded-2xl bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                  <Scale className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-foreground group-hover:text-purple-600 transition-colors">
                  {t("consumerLanding.services.register.title")}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {t("consumerLanding.services.register.desc")}
                </p>
              </div>
              <Link to={isAuthenticated ? "/instruments" : "/login"}>
                <Button variant="outline" size="sm" className="w-full text-xs font-semibold justify-between rounded-xl group-hover:bg-purple-600 group-hover:text-white group-hover:border-purple-600 transition-all">
                  <span>{t("consumerLanding.services.register.action")}</span>
                  <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Card 5: Statutory Fee Calculator */}
          <Card className="border border-border/80 shadow-xs hover:shadow-md transition-all duration-300 hover:border-sky-500/50 group bg-card rounded-2xl overflow-hidden">
            <CardContent className="p-6 sm:p-7 flex flex-col justify-between h-full space-y-5">
              <div className="space-y-3.5">
                <div className="h-12 w-12 rounded-2xl bg-sky-50 text-sky-700 border border-sky-200 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                  <Calculator className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-foreground group-hover:text-sky-600 transition-colors">
                  {t("consumerLanding.services.feeCalc.title")}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {t("consumerLanding.services.feeCalc.desc")}
                </p>
              </div>
              <a href="#calculator">
                <Button variant="outline" size="sm" className="w-full text-xs font-semibold justify-between rounded-xl group-hover:bg-sky-600 group-hover:text-white group-hover:border-sky-600 transition-all">
                  <span>{t("consumerLanding.services.feeCalc.action")}</span>
                  <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </a>
            </CardContent>
          </Card>

          {/* Card 6: Section 24 Guide */}
          <Card className="border border-border/80 shadow-xs hover:shadow-md transition-all duration-300 hover:border-rose-500/50 group bg-card rounded-2xl overflow-hidden">
            <CardContent className="p-6 sm:p-7 flex flex-col justify-between h-full space-y-5">
              <div className="space-y-3.5">
                <div className="h-12 w-12 rounded-2xl bg-rose-50 text-rose-700 border border-rose-200 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                  <Shield className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-foreground group-hover:text-rose-600 transition-colors">
                  {t("consumerLanding.services.compliance.title")}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {t("consumerLanding.services.compliance.desc")}
                </p>
              </div>
              <a href="#act">
                <Button variant="outline" size="sm" className="w-full text-xs font-semibold justify-between rounded-xl group-hover:bg-rose-600 group-hover:text-white group-hover:border-rose-600 transition-all">
                  <span>{t("consumerLanding.services.compliance.action")}</span>
                  <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </a>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 9. INTERACTIVE FEATURE: LIVE APPLICATION TRACKER */}
      <section id="track" className="py-16 sm:py-20 px-4 sm:px-8 bg-slate-100/70 border-y border-border transition-colors">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
              {t("consumerLanding.tracker.title")}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
              {t("consumerLanding.tracker.subtitle")}
            </p>
          </div>

          {/* Search Box Terminal Card */}
          <Card className="border border-border/80 shadow-md bg-card rounded-2xl overflow-hidden">
            <CardContent className="p-6 sm:p-7 space-y-3">
              <form onSubmit={handleTrackSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="relative flex-1 flex items-center">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 z-10">
                    <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                  </div>
                  <Input
                    placeholder={t("consumerLanding.tracker.inputPlaceholder")}
                    value={trackInput}
                    onChange={(e) => setTrackInput(e.target.value)}
                    className="pl-10 h-11 sm:h-11 w-full text-xs sm:text-sm font-mono bg-background rounded-xl border-border focus:border-primary shadow-xs"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isTracking}
                  className="h-11 sm:h-11 px-6 text-xs sm:text-sm font-bold bg-[#0B2545] hover:bg-[#133966] text-white rounded-xl shadow-xs transition-all shrink-0 flex items-center justify-center gap-2"
                >
                  {isTracking ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>{t("common.loading")}</span>
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4" />
                      <span>{t("consumerLanding.tracker.trackBtn")}</span>
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Error display */}
          {trackError && (
            <Card className="border-red-300 bg-red-50 text-red-900 rounded-2xl shadow-sm">
              <CardContent className="p-4 sm:p-5 flex items-center space-x-3.5">
                <XCircle className="h-5 w-5 text-red-600 shrink-0" />
                <div className="text-xs sm:text-sm">
                  <span className="font-bold">
                    {t("consumerLanding.tracker.notFound")}: {trackError}
                  </span>
                  <p className="text-muted-foreground mt-0.5 text-xs">
                    {t("consumerLanding.tracker.checkNumber")}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tracked Progression Card */}
          {trackedApp && (
            <Card className="border border-border/80 shadow-xl bg-card rounded-2xl overflow-hidden transition-all duration-300">
              <div className="bg-[#0B1E3B] text-white px-6 py-4 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-mono tracking-wider">Application Reference</span>
                  <span className="font-mono font-bold text-base text-amber-400">{trackedApp.applicationNumber}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Badge className="bg-emerald-600 text-white text-[11px] font-bold rounded-full px-3 py-0.5">
                    {trackedApp.status}
                  </Badge>
                  <span className="text-slate-400 text-[11px]">Submitted {formatDate(trackedApp.submittedAt)}</span>
                </div>
              </div>

              <CardContent className="p-6 sm:p-8 space-y-7">
                {/* 4-Stage Visual Progression Stepper with Connected Lines */}
                <div className="relative py-3">
                  <div className="relative">
                    {/* Background Track */}
                    <div className="absolute top-[18px] left-[12.5%] right-[12.5%] h-1 bg-slate-200 -translate-y-1/2 rounded-full z-0" />
                    
                    {/* Active Filled Track */}
                    {(() => {
                      const currentIdx = getMilestoneIndex(trackedApp.status);
                      const clampedIdx = Math.min(Math.max(currentIdx, 0), 3);
                      const fillPercent = (clampedIdx / 3) * 75;
                      return (
                        <div
                          className="absolute top-[18px] left-[12.5%] h-1 bg-emerald-600 -translate-y-1/2 rounded-full z-0 transition-all duration-500"
                          style={{ width: `${fillPercent}%` }}
                        />
                      );
                    })()}

                    <div className="relative z-10 grid grid-cols-4 gap-2 text-center">
                      {[
                        { key: "SUBMITTED", label: t("consumerLanding.tracker.stepSubmitted"), index: 0 },
                        { key: "SCHEDULED", label: t("consumerLanding.tracker.stepScheduled"), index: 1 },
                        { key: "INSPECTED", label: t("consumerLanding.tracker.stepInspected"), index: 2 },
                        { key: "CERTIFIED", label: t("consumerLanding.tracker.stepCertified"), index: 3 },
                      ].map((step) => {
                        const currentIdx = getMilestoneIndex(trackedApp.status);
                        const isCompleted = currentIdx >= step.index;
                        const isCurrent = currentIdx === step.index;

                        return (
                          <div key={step.key} className="space-y-2 flex flex-col items-center">
                            <div
                              className={`h-9 w-9 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                                isCompleted
                                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20"
                                  : isCurrent
                                  ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {isCompleted ? <Check className="h-4 w-4" /> : step.index + 1}
                            </div>
                            <span
                              className={`text-[11px] leading-tight font-medium ${
                                isCompleted || isCurrent ? "text-foreground font-semibold" : "text-muted-foreground"
                              }`}
                            >
                              {step.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Details Grid with Bento Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-border text-xs">
                  {/* Instrument Info */}
                  <div className="space-y-2.5 p-4 rounded-xl border border-border/80 bg-muted/40">
                    <h4 className="font-bold text-foreground flex items-center gap-2 text-xs">
                      <Scale className="h-4 w-4 text-primary" />
                      {t("consumerLanding.tracker.instrumentInfo")}
                    </h4>
                    {trackedApp.instrument ? (
                      <div className="space-y-1.5 text-muted-foreground">
                        <div className="flex justify-between">
                          <span>{t("consumerLanding.tracker.category")}:</span>
                          <span className="font-medium text-foreground">{trackedApp.instrument.category}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>{t("consumerLanding.tracker.makeModel")}:</span>
                          <span className="font-medium text-foreground">{trackedApp.instrument.make} {trackedApp.instrument.model}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>{t("consumerLanding.tracker.serial")}:</span>
                          <span className="font-mono font-medium text-foreground">{trackedApp.instrument.serialNumber}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>{t("consumerLanding.tracker.capacity")}:</span>
                          <span className="font-medium text-foreground">{trackedApp.instrument.capacity} {trackedApp.instrument.unit} ({trackedApp.instrument.accuracyClass})</span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Registered Instrument</span>
                    )}
                  </div>

                  {/* Inspection & Certificate Info */}
                  <div className="space-y-2.5 p-4 rounded-xl border border-border/80 bg-muted/40">
                    <h4 className="font-bold text-foreground flex items-center gap-2 text-xs">
                      <ShieldCheck className="h-4 w-4 text-emerald-600" />
                      {t("consumerLanding.tracker.inspectionInfo")}
                    </h4>
                    <div className="space-y-1.5 text-muted-foreground">
                      <div className="flex justify-between">
                        <span>{t("consumerLanding.tracker.officer")}:</span>
                        <span className="font-medium text-foreground">
                          {trackedApp.assignedOfficer ? trackedApp.assignedOfficer.name : "Assigned under Jurisdiction"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>{t("consumerLanding.tracker.scheduledDate")}:</span>
                        <span className="font-medium text-foreground">
                          {trackedApp.scheduledDate ? formatDate(trackedApp.scheduledDate) : "To be scheduled"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>{t("consumerLanding.tracker.seal")}:</span>
                        <span className="font-mono font-medium text-emerald-600">
                          {trackedApp.inspectionRecord?.sealNumber || "Pending inspection"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>{t("consumerLanding.tracker.feeStatus")}:</span>
                        <span className="font-bold text-emerald-600">
                          ₹{trackedApp.feeAmount} ({trackedApp.feePaid ? t("consumerLanding.tracker.paid") : t("consumerLanding.tracker.pending")})
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Certificate Details if Certified */}
                {trackedApp.certificate && (
                  <div className="p-4 rounded-xl border border-emerald-300 bg-emerald-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                    <div className="flex items-center space-x-3">
                      <FileCheck2 className="h-6 w-6 text-emerald-600 shrink-0" />
                      <div>
                        <span className="text-xs sm:text-sm font-bold text-emerald-950 block">
                          Certificate Issued: {trackedApp.certificate.certificateNumber}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          Valid until {formatDate(trackedApp.certificate.validUntil)} • Cryptographically Signed &amp; Sealed
                        </span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs font-semibold bg-white border-emerald-400 text-emerald-800 hover:bg-emerald-100/60 shadow-2xs shrink-0 inline-flex items-center gap-1.5 whitespace-nowrap"
                      onClick={() => setViewCertNumber(trackedApp.certificate!.certificateNumber)}
                    >
                      <Award className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      <span>View Certificate</span>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* 10. STATUTORY FEE CALCULATOR (SCHEDULE XII) */}
      <section id="calculator" className="py-16 sm:py-20 px-4 sm:px-8 max-w-7xl mx-auto w-full space-y-10">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <h2 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
            {t("consumerLanding.feeCalculator.title")}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-lg mx-auto">
            {t("consumerLanding.feeCalculator.subtitle")}
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="border border-border/80 shadow-xl bg-card rounded-2xl overflow-hidden">
            <CardContent className="p-6 sm:p-8 space-y-7">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Category Dropdown */}
                <div className="space-y-2">
                  <label htmlFor={categorySelectId} className="text-xs font-bold text-foreground">
                    {t("consumerLanding.feeCalculator.categoryLabel")}
                  </label>
                  <select
                    id={categorySelectId}
                    value={selectedCatId}
                    onChange={(e) => setSelectedCatId(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl border border-input bg-background text-xs sm:text-sm text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary shadow-2xs font-medium"
                  >
                    {STATUTORY_CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {isHindi ? cat.labelHi : cat.labelEn}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Capacity Dropdown */}
                <div className="space-y-2">
                  <label htmlFor={capacitySelectId} className="text-xs font-bold text-foreground">
                    {t("consumerLanding.feeCalculator.capacityLabel")}
                  </label>
                  <select
                    id={capacitySelectId}
                    value={selectedCapacityIndex}
                    onChange={(e) => setSelectedCapacityIndex(Number(e.target.value))}
                    className="w-full h-11 px-3.5 rounded-xl border border-input bg-background text-xs sm:text-sm text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary shadow-2xs font-medium"
                  >
                    {selectedCategory.capacities.map((cap, idx) => (
                      <option key={idx} value={idx}>
                        {cap.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Calculated Results Banner */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 grid grid-cols-1 sm:grid-cols-3 gap-5 text-center sm:text-left">
                <div className="space-y-1">
                  <span className="text-[11px] uppercase font-bold text-muted-foreground block tracking-wider">
                    {t("consumerLanding.feeCalculator.calculatedFee")}
                  </span>
                  <span className="text-3xl sm:text-4xl font-black text-primary font-mono tracking-tight">
                    ₹{selectedCapacity.fee.toLocaleString("en-IN")}.00
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] uppercase font-bold text-muted-foreground block tracking-wider">
                    {t("consumerLanding.feeCalculator.interval")}
                  </span>
                  <span className="text-sm sm:text-base font-bold text-foreground flex items-center justify-center sm:justify-start gap-1.5">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    {selectedCapacity.interval}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] uppercase font-bold text-muted-foreground block tracking-wider">
                    {t("consumerLanding.feeCalculator.sla")}
                  </span>
                  <span className="text-sm sm:text-base font-bold text-emerald-600 flex items-center justify-center sm:justify-start gap-1.5">
                    <CheckCircle2 className="h-4 w-4" />
                    {selectedCapacity.sla}
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-muted-foreground text-center font-medium">
                ⚖️ {t("consumerLanding.feeCalculator.statutoryNote")}
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 11. SECTION 24 & SECTION 30 STATUTORY GUIDELINES */}
      <section id="act" className="py-16 sm:py-20 px-4 sm:px-8 bg-slate-100/70 border-t border-border transition-colors">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
              {t("consumerLanding.section24.title")}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Section 24 */}
            <Card className="border border-border/80 shadow-md bg-card rounded-2xl overflow-hidden">
              <CardContent className="p-6 sm:p-7 space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 shadow-inner">
                    <Scale className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-foreground">
                    {t("consumerLanding.section24.sec24Title")}
                  </h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed italic border-l-2 border-primary/60 pl-3.5">
                  "{t("consumerLanding.section24.sec24Text")}"
                </p>
              </CardContent>
            </Card>

            {/* Section 30 */}
            <Card className="border border-red-200 shadow-md bg-card rounded-2xl overflow-hidden">
              <CardContent className="p-6 sm:p-7 space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-xl bg-red-500/10 text-red-600 shadow-inner">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-foreground">
                    {t("consumerLanding.section24.sec30Title")}
                  </h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed italic border-l-2 border-red-500/60 pl-3.5">
                  "{t("consumerLanding.section24.sec30Text")}"
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* 12. OFFICIAL GOVERNMENT STATUTORY FOOTER */}
      <footer id="contact" className="bg-[#071326] text-slate-300 border-t-2 border-amber-500/40 pt-14 pb-10 px-4 sm:px-8 text-xs">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* Emblem & Ministry Info */}
            <div className="md:col-span-7 space-y-4">
              <div className="flex items-center space-x-3.5">
                <img
                  src="/emblem.jpeg"
                  alt="Emblem of India"
                  className="h-12 w-auto object-contain brightness-110 shrink-0"
                />
                <div>
                  <h3 className="font-bold text-sm text-white">
                    {t("consumerLanding.footer.ministryTitle")}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {t("consumerLanding.footer.govtTitle")}
                  </p>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed max-w-xl font-normal">
                {t("consumerLanding.footer.disclaimer")}
              </p>
            </div>

            {/* Helpline, Support & Digital India */}
            <div className="md:col-span-5 flex flex-col md:items-end space-y-4">
              {/* Digital India Brand Mark on Right */}
              <div className="p-1.5 px-3 rounded-xl bg-white shadow-2xs inline-flex items-center justify-center">
                <img
                  src="/digi-india.png"
                  alt="Digital India"
                  className="h-9 w-auto object-contain"
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

          {/* Bottom links & Copyright */}
          <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
            <div className="flex flex-wrap items-center gap-4 font-medium">
              <Link to="/policies" className="hover:text-slate-300 transition-colors">
                {t("consumerLanding.footer.links.privacy")}
              </Link>
              <span>•</span>
              <Link to="/terms" className="hover:text-slate-300 transition-colors">
                {t("consumerLanding.footer.links.terms")}
              </Link>
              <span>•</span>
              <Link to="/help" className="hover:text-slate-300 transition-colors">
                {t("consumerLanding.footer.links.help")}
              </Link>
              <span>•</span>
              <Link to="/contact" className="hover:text-slate-300 transition-colors">
                {t("consumerLanding.footer.links.contact")}
              </Link>
            </div>
            <p className="font-mono text-[10px]">{t("consumerLanding.footer.copyright")}</p>
          </div>
        </div>
      </footer>

      {/* Statutory Certificate Viewer Modal */}
      <CertificateDialog
        certificateNumber={viewCertNumber}
        open={!!viewCertNumber}
        onOpenChange={(open) => !open && setViewCertNumber(null)}
      />
    </div>
  );
}

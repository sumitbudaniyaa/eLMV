import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Role } from "@sih/shared";
import {
  Search,
  X,
  LayoutDashboard,
  Scale,
  FileText,
  BarChart3,
  History,
  ShieldCheck,
  PlusCircle,
  Sun,
  Moon,
  Globe,
  Award,
  ArrowRight,
  Loader2,
  Sparkles,
  Settings,
} from "lucide-react";

interface GlobalSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onToggleTheme?: () => void;
  isDark?: boolean;
}

export function GlobalSearchDialog({
  open,
  onOpenChange,
  onToggleTheme,
  isDark,
}: GlobalSearchDialogProps) {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const isHindi = (i18n.resolvedLanguage || i18n.language || "en").toLowerCase().startsWith("hi");

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      setQuery("");
    }
  }, [open]);

  // Live query for instruments matching search term
  const { data: instruments = [], isLoading: isLoadingInstruments } = useQuery({
    queryKey: ["global-search-instruments", query],
    queryFn: async () => {
      if (!query.trim() || query.trim().length < 2) return [];
      try {
        const res = await api.get("/instruments", {
          params: { search: query.trim(), limit: 5 },
        });
        return res.data?.data || [];
      } catch {
        return [];
      }
    },
    enabled: query.trim().length >= 2,
  });

  // Live query for applications matching search term
  const { data: applications = [], isLoading: isLoadingApplications } = useQuery({
    queryKey: ["global-search-applications", query],
    queryFn: async () => {
      if (!query.trim() || query.trim().length < 2) return [];
      try {
        const res = await api.get("/applications", {
          params: { search: query.trim(), limit: 5 },
        });
        return res.data?.data || [];
      } catch {
        return [];
      }
    },
    enabled: query.trim().length >= 2,
  });

  const handleSelect = (path: string) => {
    onOpenChange(false);
    navigate(path);
  };

  const handleAction = (actionFn: () => void) => {
    actionFn();
    onOpenChange(false);
  };

  if (!open) return null;

  const normalizedQuery = query.toLowerCase().trim();

  // Static App Pages / Modules
  const appPages = [
    {
      title: isHindi ? "डैशबोर्ड" : "Operational Dashboard",
      desc: isHindi ? "प्रणाली अवलोकन, लंबित कार्य, अनुपालन स्थिति" : "System overview, workload queue, and Section 24 compliance KPIs",
      path: "/dashboard",
      icon: LayoutDashboard,
      keywords: ["dashboard", "home", "stats", "kpi", "overview", "डैशबोर्ड"],
    },
    {
      title: isHindi ? "उपकरण पंजीयन" : "Instruments Registry",
      desc: isHindi ? "पंजीकृत वजन एवं माप उपकरण, क्रमांक, सत्यापन स्थिति" : "Registered commercial weighing and measuring devices, serials, calibration status",
      path: "/instruments",
      icon: Scale,
      keywords: ["instruments", "scale", "devices", "weighbridge", "meter", "उपकरण"],
    },
    {
      title: isHindi ? "सत्यापन आवेदन" : "Verification Applications",
      desc: isHindi ? "सत्यापन जीवनचक्र: आवेदन, निर्धारण, निरीक्षण, और प्रमाणन" : "Statutory verification lifecycle: submission, inspection scheduling, and certification",
      path: "/applications",
      icon: FileText,
      keywords: ["applications", "apply", "verification", "schedule", "inspect", "आवेदन"],
    },
    {
      title: isHindi ? "विश्लेषण एवं प्रदर्शन" : "Analytics & Performance",
      desc: isHindi ? "औसत टर्नअराउंड समय, क्षेत्रीय अनुपालन, अधिकारी कार्यभार" : "Turnaround times (TAT), aging pendency, regional compliance rates, and officer workloads",
      path: "/analytics",
      icon: BarChart3,
      keywords: ["analytics", "performance", "tat", "reports", "charts", "विश्लेषण"],
    },
    {
      title: isHindi ? "वैधानिक ऑडिट लेजर" : "Regulatory Audit Ledger",
      desc: isHindi ? "धारा 24 लेजर, अपरिवर्तनीय सुरक्षा लॉग, अधिकारी गतिविधियां" : "Section 24 statutory change logs, tamper records, and cryptographic audit trail",
      path: "/audit",
      icon: History,
      keywords: ["audit", "logs", "ledger", "security", "tamper", "लेजर"],
    },
    {
      title: isHindi ? "सार्वजनिक सत्यापन पोर्टल" : "Public Verification Portal",
      desc: isHindi ? "सार्वजनिक क्यूआर कोड स्कैनर और प्रमाण पत्र सत्यता जांच" : "Public QR code validator and cryptographic certificate authentication portal",
      path: "/verify",
      icon: ShieldCheck,
      keywords: ["verify", "qr", "certificate", "public", "scanner", "सत्यापन"],
    },
    {
      title: isHindi ? "खाता सेटिंग्स एवं क्रेडेंशियल्स" : "Account Settings & Credentials",
      desc: isHindi ? "व्यक्तिगत प्रोफ़ाइल, पासवर्ड परिवर्तन, संपर्क फ़ोन प्रबंधन" : "Update personal profile, phone number, and change password",
      path: "/settings",
      icon: Settings,
      keywords: ["settings", "profile", "password", "credentials", "phone", "name", "सेटिंग्स", "पासवर्ड"],
    },
  ];

  const matchedPages = normalizedQuery
    ? appPages.filter(
        (p) =>
          p.title.toLowerCase().includes(normalizedQuery) ||
          p.desc.toLowerCase().includes(normalizedQuery) ||
          p.keywords.some((k) => k.includes(normalizedQuery))
      )
    : appPages;

  // Quick In-App Actions
  const quickActions = [
    ...(user?.role === Role.CONSUMER || user?.role === Role.ADMIN
      ? [
          {
            title: isHindi ? "नया उपकरण पंजीकृत करें" : "Register New Instrument",
            desc: isHindi ? "वाणिज्यिक उपयोग हेतु नया उपकरण जोड़ें" : "Add a commercial weighing or measuring device to your registry",
            icon: PlusCircle,
            action: () => handleSelect("/instruments"),
            keywords: ["new instrument", "add scale", "register", "उपकरण"],
          },
          {
            title: isHindi ? "नया सत्यापन आवेदन जमा करें" : "Submit Verification Application",
            desc: isHindi ? "आवधिक पुन: सत्यापन या नए प्रमाणीकरण हेतु आवेदन करें" : "Apply for periodic re-verification under Section 24",
            icon: Award,
            action: () => handleSelect("/applications"),
            keywords: ["new application", "apply", "submit", "आवेदन"],
          },
        ]
      : []),
    {
      title: isHindi ? "Switch to English" : "हिन्दी में बदलें",
      desc: isHindi ? "Change application language to English" : "एप्लिकेशन भाषा को हिन्दी में बदलें",
      icon: Globe,
      action: () => {
        const next = isHindi ? "en" : "hi";
        i18n.changeLanguage(next);
        localStorage.setItem("i18nextLng", next);
      },
      keywords: ["language", "hindi", "english", "भाषा", "हिन्दी"],
    },
    ...(onToggleTheme
      ? [
          {
            title: isDark ? "Switch to Light Mode" : "Switch to Dark Mode",
            desc: isDark ? "High-contrast daylight theme" : "Low-glare night theme",
            icon: isDark ? Sun : Moon,
            action: onToggleTheme,
            keywords: ["theme", "dark", "light", "mode", "रंग"],
          },
        ]
      : []),
  ];

  const matchedActions = normalizedQuery
    ? quickActions.filter(
        (a) =>
          a.title.toLowerCase().includes(normalizedQuery) ||
          a.desc.toLowerCase().includes(normalizedQuery) ||
          a.keywords.some((k) => k.includes(normalizedQuery))
      )
    : quickActions;

  const hasMatches =
    matchedPages.length > 0 ||
    instruments.length > 0 ||
    applications.length > 0 ||
    matchedActions.length > 0;

  const isCertLookup =
    normalizedQuery.startsWith("lm-") ||
    normalizedQuery.includes("cert") ||
    /^\d{4,}/.test(normalizedQuery);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={() => onOpenChange(false)}
      />

      {/* Modal Dialog */}
      <div className="relative z-50 w-full max-w-xl rounded-xl border border-border bg-card shadow-2xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150 flex flex-col max-h-[80vh]">
        {/* Top Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-border bg-muted/20">
          <Search className="h-4 w-4 text-muted-foreground mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              isHindi
                ? "उपकरण, क्रमांक, आवेदन, पृष्ठ या कार्रवाई खोजें..."
                : "Search anything across the app: serials, applications, pages..."
            }
            className="w-full bg-transparent border-none text-base sm:text-sm text-foreground placeholder:text-xs placeholder:text-muted-foreground focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="p-1 text-muted-foreground hover:text-foreground rounded-md transition-colors mr-1"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            ESC
          </kbd>
        </div>

        {/* Scrollable Results */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4 text-xs">
          {/* Direct Certificate Lookup Shortcut if query looks like certificate number */}
          {isCertLookup && (
            <div className="pb-1">
              <div
                onClick={() => handleSelect(`/verify?cert=${encodeURIComponent(query.trim())}`)}
                className="flex items-center justify-between p-2.5 rounded-lg border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 hover:bg-emerald-100/50 dark:hover:bg-emerald-950/40 cursor-pointer transition-colors"
              >
                <div className="flex items-center space-x-2.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <div>
                    <span className="font-semibold text-foreground">
                      {isHindi ? "प्रमाणपत्र सत्यापन खोलें:" : "Direct Certificate Verification:"}{" "}
                      <span className="font-mono text-emerald-700 dark:text-emerald-300">
                        {query.trim()}
                      </span>
                    </span>
                    <p className="text-[11px] text-muted-foreground">
                      {isHindi
                        ? "इस प्रमाणपत्र का डिजिटल हस्ताक्षर और सत्यापन विवरण जांचें"
                        : "Verify cryptographic digital signature and statutory details"}
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              </div>
            </div>
          )}

          {/* Instruments Live Search Results */}
          {instruments.length > 0 && (
            <div className="space-y-1">
              <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-bold flex items-center justify-between">
                <span className="flex items-center">
                  <Scale className="h-3 w-3 mr-1 text-muted-foreground" />
                  {isHindi ? "उपकरण (पंजीयन)" : "Instruments"}
                </span>
                {isLoadingInstruments && <Loader2 className="h-3 w-3 animate-spin" />}
              </div>
              <div className="space-y-1">
                {instruments.map((inst: any) => (
                  <div
                    key={inst.id}
                    onClick={() =>
                      handleSelect(`/instruments?search=${encodeURIComponent(inst.serialNumber)}`)
                    }
                    className="flex items-center justify-between p-2 rounded-md hover:bg-muted/60 cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <div className="h-7 w-7 rounded-md bg-muted flex items-center justify-center shrink-0">
                        <Scale className="h-3.5 w-3.5 text-foreground" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center space-x-1.5 truncate">
                          <span className="font-mono font-semibold text-foreground text-xs truncate">
                            {inst.serialNumber}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono shrink-0">
                            {inst.type?.replace(/_/g, " ")}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {inst.make} {inst.model} • {inst.capacity} {inst.unit} • {inst.district}, {inst.state}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Applications Live Search Results */}
          {applications.length > 0 && (
            <div className="space-y-1">
              <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-bold flex items-center justify-between">
                <span className="flex items-center">
                  <FileText className="h-3 w-3 mr-1 text-muted-foreground" />
                  {isHindi ? "सत्यापन आवेदन" : "Applications"}
                </span>
                {isLoadingApplications && <Loader2 className="h-3 w-3 animate-spin" />}
              </div>
              <div className="space-y-1">
                {applications.map((app: any) => (
                  <div
                    key={app.id}
                    onClick={() =>
                      handleSelect(
                        `/applications?search=${encodeURIComponent(app.applicationNumber)}`
                      )
                    }
                    className="flex items-center justify-between p-2 rounded-md hover:bg-muted/60 cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <div className="h-7 w-7 rounded-md bg-muted flex items-center justify-center shrink-0">
                        <FileText className="h-3.5 w-3.5 text-foreground" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center space-x-1.5 truncate">
                          <span className="font-mono font-semibold text-foreground text-xs truncate">
                            {app.applicationNumber}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded border border-border bg-card font-mono text-foreground font-medium shrink-0">
                            {app.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {app.instrument?.make} {app.instrument?.model} ({app.instrument?.serialNumber}) • {app.type}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* App Navigation Pages */}
          {matchedPages.length > 0 && (
            <div className="space-y-1">
              <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-bold">
                {isHindi ? "नेविगेशन एवं पृष्ठ" : "Navigation & Pages"}
              </div>
              <div className="space-y-1">
                {matchedPages.map((page) => {
                  const Icon = page.icon;
                  return (
                    <div
                      key={page.path}
                      onClick={() => handleSelect(page.path)}
                      className="flex items-center justify-between p-2 rounded-md hover:bg-muted/60 cursor-pointer transition-colors group"
                    >
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <div className="h-7 w-7 rounded-md bg-muted flex items-center justify-center shrink-0">
                          <Icon className="h-3.5 w-3.5 text-foreground" />
                        </div>
                        <div className="min-w-0">
                          <span className="font-medium text-foreground text-xs block truncate">
                            {page.title}
                          </span>
                          <p className="text-[11px] text-muted-foreground truncate">
                            {page.desc}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2" />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quick In-App Actions */}
          {matchedActions.length > 0 && (
            <div className="space-y-1">
              <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-bold">
                {isHindi ? "त्वरित कार्रवाई" : "Quick Actions"}
              </div>
              <div className="space-y-1">
                {matchedActions.map((act, i) => {
                  const Icon = act.icon;
                  return (
                    <div
                      key={i}
                      onClick={() => handleAction(act.action)}
                      className="flex items-center justify-between p-2 rounded-md hover:bg-muted/60 cursor-pointer transition-colors group"
                    >
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <div className="h-7 w-7 rounded-md bg-muted flex items-center justify-center shrink-0">
                          <Icon className="h-3.5 w-3.5 text-foreground" />
                        </div>
                        <div className="min-w-0">
                          <span className="font-medium text-foreground text-xs block truncate">
                            {act.title}
                          </span>
                          <p className="text-[11px] text-muted-foreground truncate">
                            {act.desc}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2" />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Empty State */}
          {!hasMatches && !isCertLookup && (
            <div className="p-8 text-center space-y-2">
              <Search className="h-8 w-8 text-muted-foreground/50 mx-auto" />
              <p className="text-xs font-semibold text-foreground">
                {isHindi ? "कोई परिणाम नहीं मिला" : "No results found"}
              </p>
              <p className="text-[11px] text-muted-foreground max-w-xs mx-auto">
                {isHindi
                  ? `"${query}" के लिए कोई उपकरण, आवेदन या पृष्ठ नहीं मिला। कृपया क्रमांक या मेक से खोजें।`
                  : `No instruments, applications, or pages matching "${query}". Try searching by serial number, make, or page name.`}
              </p>
            </div>
          )}
        </div>

        {/* Footer Hint */}
        <div className="px-4 py-2 border-t border-border bg-muted/20 flex items-center justify-between text-[11px] text-muted-foreground">
          <div className="flex items-center space-x-1.5">
            <Sparkles className="h-3 w-3 text-amber-500" />
            <span>Search live instruments, applications, and system actions</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="hidden sm:inline">Press</span>
            <kbd className="h-4 px-1 rounded border border-border bg-card font-mono text-[9px]">ESC</kbd>
            <span className="hidden sm:inline">to close</span>
          </div>
        </div>
      </div>
    </div>
  );
}

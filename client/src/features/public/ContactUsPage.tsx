import { useState } from "react";
import { useTranslation } from "react-i18next";
import { PublicPageLayout } from "./PublicPageLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Building,
  Phone,
  Mail,
  MapPin,
  Check,
  Copy,
  ShieldCheck,
} from "lucide-react";

export function ContactUsPage() {
  const { i18n } = useTranslation();
  const isHindi = (i18n.resolvedLanguage || i18n.language || "en").toLowerCase().startsWith("hi");

  const [copied, setCopied] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText("support-elmv@gov.in");
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <PublicPageLayout
      title={isHindi ? "संपर्क एवं प्रशासनिक निर्देशिका" : "Contact Us & Administrative Directory"}
      subtitle={
        isHindi
          ? "विधिक मापविज्ञान निदेशालय, राष्ट्रीय उपभोक्ता हेल्पलाइन, राज्य प्रवर्तन प्रकोष्ठ और शिकायत निवारण अधिकारियों से संपर्क करें।"
          : "Reach the Directorate of Legal Metrology, National Consumer Helpline, State Enforcement Cells, and Grievance Officers."
      }
      activePath="/contact"
    >
      <div className="space-y-8 max-w-5xl mx-auto">
        {/* Top 3 Quick Coordinates Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border border-border/80 shadow-xs bg-white dark:bg-card">
            <CardContent className="p-5 space-y-2.5">
              <div className="h-9 w-9 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 flex items-center justify-center shrink-0 shadow-2xs">
                <Phone className="h-4 w-4" />
              </div>
              <div>
                <span className="text-xs text-muted-foreground font-medium block">
                  {isHindi ? "राष्ट्रीय टोल-फ्री हेल्पलाइन" : "National Toll-Free Helpline"}
                </span>
                <span className="text-lg font-bold font-mono text-foreground">1915</span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                {isHindi
                  ? "कार्य समय: प्रातः 09:30 – सायं 05:30 (सोम-शनि, अवकाश छोड़कर)"
                  : "Operating 09:30 AM – 05:30 PM (Mon-Sat, except Gazetted Holidays)"}
              </p>
            </CardContent>
          </Card>

          <Card className="border border-border/80 shadow-xs bg-white dark:bg-card">
            <CardContent className="p-5 space-y-2.5">
              <div className="h-9 w-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 shadow-2xs">
                <Mail className="h-4 w-4" />
              </div>
              <div>
                <span className="text-xs text-muted-foreground font-medium block">
                  {isHindi ? "आधिकारिक इलेक्ट्रॉनिक डाक" : "Official Electronic Mail"}
                </span>
                <span className="text-sm font-bold font-mono text-foreground">support-elmv@gov.in</span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                {isHindi
                  ? "विधिक मापविज्ञान प्रभाग: legal-metrology@nic.in"
                  : "Legal Metrology Division: legal-metrology@nic.in"}
              </p>
            </CardContent>
          </Card>

          <Card className="border border-border/80 shadow-xs bg-white dark:bg-card">
            <CardContent className="p-5 space-y-2.5">
              <div className="h-9 w-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center shrink-0 shadow-2xs">
                <Building className="h-4 w-4" />
              </div>
              <div>
                <span className="text-xs text-muted-foreground font-medium block">
                  {isHindi ? "केंद्रीय मुख्यालय" : "Central Headquarters"}
                </span>
                <span className="text-sm font-bold text-foreground">
                  {isHindi ? "कृषि भवन, नई दिल्ली" : "Krishi Bhawan, New Delhi"}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                {isHindi
                  ? "उपभोक्ता मामले, खाद्य और सार्वजनिक वितरण मंत्रालय"
                  : "Ministry of Consumer Affairs, Food & Public Distribution"}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Administrative Directory & Physical Location */}
          <div className="lg:col-span-6 space-y-6">
            <Card className="border border-border/80 shadow-xs">
              <CardContent className="p-6 space-y-5">
                <div className="border-b border-border pb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-[#0B2545] dark:text-primary" />
                    <h3 className="text-sm font-bold text-foreground">
                      {isHindi ? "केंद्रीय मापविज्ञान निदेशालय विवरण" : "Central Metrology Directorate Coordinates"}
                    </h3>
                  </div>
                  <Badge variant="outline" className="text-[10px]">
                    {isHindi ? "मुख्यालय" : "Headquarters"}
                  </Badge>
                </div>

                <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  <p>
                    <strong>
                      {isHindi ? "विधिक मापविज्ञान निदेशालय" : "Directorate of Legal Metrology"}
                    </strong>
                    <br />
                    {isHindi
                      ? "उपभोक्ता मामले विभाग, भारत सरकार"
                      : "Department of Consumer Affairs, Government of India"}
                    <br />
                    {isHindi
                      ? "कमरा नं. 461, कृषि भवन, डॉ. राजेंद्र प्रसाद रोड,"
                      : "Room No. 461, Krishi Bhawan, Dr. Rajendra Prasad Road,"}
                    <br />
                    {isHindi ? "नई दिल्ली – 110001, भारत।" : "New Delhi – 110001, India."}
                  </p>

                  <div className="pt-2 border-t border-border/60 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground">
                        {isHindi ? "केंद्रीय EPABX एक्सचेंज:" : "Central EPABX Exchange:"}
                      </span>
                      <span className="font-mono text-muted-foreground">+91-11-23389489</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground">
                        {isHindi ? "राष्ट्रीय मापविज्ञान नियंत्रण कक्ष:" : "National Metrology Control Room:"}
                      </span>
                      <span className="font-mono text-muted-foreground">+91-11-23382405</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground">
                        {isHindi ? "शिकायत निवारण अधिकारी:" : "Grievance Officer:"}
                      </span>
                      <span className="font-mono text-muted-foreground">dir-lm@nic.in</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Regional Enforcement Cells Accordion Info */}
            <Card className="border border-border/80 shadow-xs">
              <CardContent className="p-6 space-y-4">
                <div className="border-b border-border pb-3 flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  <h3 className="text-sm font-bold text-foreground">
                    {isHindi ? "राज्य मापविज्ञान प्रवर्तन प्रकोष्ठ" : "State Metrology Enforcement Cells"}
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-border space-y-1">
                    <span className="font-bold text-foreground block">
                      {isHindi ? "राजस्थान मापविज्ञान मंडल" : "Rajasthan Metrology Circle"}
                    </span>
                    <p className="text-[11px] text-muted-foreground">
                      {isHindi ? "उद्योग भवन, तिलक मार्ग, जयपुर – 302005" : "Udyog Bhawan, Tilak Marg, Jaipur – 302005"}
                    </p>
                    <p className="text-[10px] font-mono text-slate-500">controller-lm.raj@gov.in</p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-border space-y-1">
                    <span className="font-bold text-foreground block">
                      {isHindi ? "दिल्ली राज्य मापविज्ञान मंडल" : "Delhi State Metrology Circle"}
                    </span>
                    <p className="text-[11px] text-muted-foreground">
                      {isHindi
                        ? "सी-ब्लॉक, विकास भवन, आई.पी. एस्टेट, नई दिल्ली – 110002"
                        : "C-Block, Vikas Bhawan, I.P. Estate, New Delhi – 110002"}
                    </p>
                    <p className="text-[10px] font-mono text-slate-500">controller-lm.delhi@gov.in</p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-border space-y-1">
                    <span className="font-bold text-foreground block">
                      {isHindi ? "महाराष्ट्र मापविज्ञान मंडल" : "Maharashtra Metrology Circle"}
                    </span>
                    <p className="text-[11px] text-muted-foreground">
                      {isHindi
                        ? "डीडी बिल्डिंग, ओल्ड कस्टम्स हाउस, फोर्ट, मुंबई – 400001"
                        : "DD Building, Old Customs House, Fort, Mumbai – 400001"}
                    </p>
                    <p className="text-[10px] font-mono text-slate-500">controller-lm.mah@gov.in</p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-border space-y-1">
                    <span className="font-bold text-foreground block">
                      {isHindi ? "गुजरात मापविज्ञान मंडल" : "Gujarat Metrology Circle"}
                    </span>
                    <p className="text-[11px] text-muted-foreground">
                      {isHindi
                        ? "ब्लॉक सं. 14, डॉ. जीवराज मेहता भवन, गांधीनगर – 382010"
                        : "Block No. 14, Dr. Jivraj Mehta Bhavan, Gandhinagar – 382010"}
                    </p>
                    <p className="text-[10px] font-mono text-slate-500">controller-lm.guj@gov.in</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Simple, Official Email Us Section */}
          <div className="lg:col-span-6 space-y-6">
            <Card className="border border-border/80 shadow-xs bg-white dark:bg-card">
              <CardContent className="p-6 sm:p-8 space-y-6">
                <div className="border-b border-border pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 shadow-2xs">
                      <Mail className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-foreground">
                        {isHindi ? "आधिकारिक इलेक्ट्रॉनिक डाक सहायता" : "Official Electronic Mail Support"}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {isHindi
                          ? "विधिक मापविज्ञान सहायता प्रभाग"
                          : "Legal Metrology Helpdesk & Support Desk"}
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  {isHindi
                    ? "सत्यापन, पोर्टल पहुंच, समय-सारणी या विधिक मापविज्ञान से संबंधित किसी भी प्रश्न हेतु हमें सीधे ईमेल भेजें।"
                    : "For verification scheduling, portal access, technical assistance, or general legal metrology inquiries, write directly to our official support team."}
                </p>

                {/* Email Address Display Box */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-border flex items-center justify-between gap-3">
                  <div className="space-y-0.5 min-w-0">
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
                      {isHindi ? "आधिकारिक ईमेल आईडी" : "Official Support Email"}
                    </span>
                    <span className="font-mono text-sm font-bold text-[#0B2545] dark:text-slate-200 truncate block">
                      support-elmv@gov.in
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyEmail}
                    className="inline-flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 hover:text-foreground font-medium px-3 py-1.5 rounded-lg border border-border bg-white dark:bg-card hover:bg-slate-50 dark:hover:bg-slate-800 shadow-2xs transition-colors shrink-0 cursor-pointer"
                    title={isHindi ? "ईमेल पता कॉपी करें" : "Copy email address"}
                  >
                    {copied ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                        <span className="text-emerald-600 font-semibold">{isHindi ? "कॉपी हो गया!" : "Copied!"}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5 shrink-0" />
                        <span>{isHindi ? "कॉपी करें" : "Copy"}</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Simple Primary "Email Us" Button */}
                <a
                  href="mailto:support-elmv@gov.in?subject=eLMV%20Legal%20Metrology%20Inquiry"
                  className="w-full bg-[#0B2545] hover:bg-[#133966] text-white text-sm font-bold h-11 rounded-xl shadow-xs inline-flex items-center justify-center gap-2 transition-all hover:shadow-md cursor-pointer"
                >
                  <Mail className="h-4 w-4 shrink-0" />
                  <span>{isHindi ? "हमें ईमेल भेजें" : "Email Us"}</span>
                </a>

                {/* Operating SLA / Turnaround Note */}
                <div className="pt-2 border-t border-border/70 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>{isHindi ? "कार्य समय: प्रातः 09:30 से सायं 05:30" : "Working Hours: 09:30 AM to 05:30 PM"}</span>
                  <span className="text-slate-400">{isHindi ? "सोमवार - शनिवार" : "Monday – Saturday"}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PublicPageLayout>
  );
}



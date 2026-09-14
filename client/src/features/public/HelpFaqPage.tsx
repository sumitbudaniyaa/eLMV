import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { PublicPageLayout } from "./PublicPageLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, ChevronDown, ChevronUp, HelpCircle, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface FAQItem {
  id: string;
  category: "general" | "traders" | "inspection" | "gatc" | "qr";
  questionEn: string;
  questionHi: string;
  answerEn: string;
  answerHi: string;
}

const FAQS: FAQItem[] = [
  {
    id: "faq-1",
    category: "general",
    questionEn: "What is Section 24 mandatory verification and stamping?",
    questionHi: "धारा 24 अनिवार्य सत्यापन एवं मुद्रांकन (Stamping) क्या है?",
    answerEn:
      "Under Section 24 of the Legal Metrology Act, 2009, every weighing or measuring instrument used in commercial transactions, industrial trade, or consumer protection must be verified against working standards and stamped before being put into service. Verification ensures accurate calibration within statutory Maximum Permissible Error (MPE) limits.",
    answerHi:
      "विधिक मापविज्ञान अधिनियम, 2009 की धारा 24 के अंतर्गत, वाणिज्यिक लेनदेन, औद्योगिक व्यापार या उपभोक्ता संरक्षण में उपयोग किए जाने वाले प्रत्येक वजन या मापने वाले उपकरण को सेवा में लगाने से पहले कार्य मानकों के विरुद्ध सत्यापित और मुद्रांकित किया जाना अनिवार्य है। सत्यापन यह सुनिश्चित करता है कि अंशांकन वैधानिक अधिकतम अनुमेय त्रुटि (MPE) सीमाओं के भीतर सटीक है।",
  },
  {
    id: "faq-2",
    category: "general",
    questionEn: "How long is a legal metrology verification certificate valid?",
    questionHi: "विधिक मापविज्ञान सत्यापन प्रमाणपत्र कब तक मान्य रहता है?",
    answerEn:
      "The statutory validity period is defined by the Legal Metrology (General) Rules, 2011. Typically, standard weighing instruments (counter scales, platform balances, weighbridges) require annual re-verification (every 12 months). Certain bulk storage vessels and volumetric dipsticks are verified on a 24-month cycle.",
    answerHi:
      "वैधानिक वैधता अवधि विधिक मापविज्ञान (सामान्य) नियम, 2011 द्वारा निर्धारित है। आम तौर पर, मानक वजन उपकरणों (काउंटर तराजू, प्लेटफॉर्म बैलेंस, वे-ब्रिज) को वार्षिक पुनः सत्यापन (प्रत्येक 12 महीने) की आवश्यकता होती है। कुछ थोक भंडारण टैंकों एवं आयतनात्मक डिपस्टिक का सत्यापन 24 महीने के चक्र पर किया जाता है।",
  },
  {
    id: "faq-3",
    category: "traders",
    questionEn: "How do I register a new weighing device on the portal?",
    questionHi: "मैं पोर्टल पर एक नया वजन उपकरण कैसे पंजीकृत करूं?",
    answerEn:
      "1. Sign up or log into your Trader / Commercial Business Account. 2. Navigate to 'My Instruments' and click 'Register Instrument'. 3. Enter the device serial number, make, model, capacity, accuracy class, and shop address. 4. Once saved in your registry, click 'Apply for Stamping' to submit a Section 24 application.",
    answerHi:
      "1. अपने व्यापारी / वाणिज्यिक व्यापार खाते में साइन अप करें या लॉगिन करें। 2. 'मेरे उपकरण' (My Instruments) पर जाएं और 'उपकरण पंजीकृत करें' पर क्लिक करें। 3. उपकरण क्रम संख्या, मेक, मॉडल, क्षमता, यथार्थता वर्ग और दुकान का पता दर्ज करें। 4. अपनी रजिस्ट्री में सहेजे जाने के बाद, धारा 24 आवेदन जमा करने के लिए 'मुद्रांकन हेतु आवेदन करें' पर क्लिक करें।",
  },
  {
    id: "faq-4",
    category: "traders",
    questionEn: "How is the government statutory verification fee calculated?",
    questionHi: "सरकारी वैधानिक सत्यापन शुल्क की गणना कैसे की जाती है?",
    answerEn:
      "Statutory fees are computed automatically in accordance with Schedule XI of the General Rules, 2011, based on the instrument type, capacity, and accuracy class (Class I, II, III, or IV). For example, a 50 kg Class III electronic balance incurs ₹200 verification fee, whereas a 60-tonne weighbridge incurs ₹5,000.",
    answerHi:
      "वैधानिक शुल्क की गणना उपकरण के प्रकार, क्षमता एवं यथार्थता वर्ग (वर्ग I, II, III, या IV) के आधार पर सामान्य नियम, 2011 की अनुसूची XI के अनुसार स्वचालित रूप से की जाती है। उदाहरण के लिए, 50 किग्रा वर्ग III इलेक्ट्रॉनिक तराजू पर ₹200 सत्यापन शुल्क लगता है, जबकि 60-टन वे-ब्रिज पर ₹5,000 शुल्क लगता है।",
  },
  {
    id: "faq-5",
    category: "inspection",
    questionEn: "What happens during on-site inspection by the LMO?",
    questionHi: "विधिक मापविज्ञान अधिकारी (LMO) द्वारा ऑन-साइट निरीक्षण के दौरान क्या होता है?",
    answerEn:
      "A designated Legal Metrology Officer (LMO) visits your registered commercial premises with traceable standard test weights. The officer performs eccentricity, repeatability, and maximum capacity tests to ensure the observed deviation is within statutory MPE limits. Upon passing, the officer digitally signs the certificate and applies the physical tamper-evident seal.",
    answerHi:
      "नामित विधिक मापविज्ञान अधिकारी (LMO) मानक परीक्षण बाटों के साथ आपके पंजीकृत वाणिज्यिक परिसर का दौरा करते हैं। अधिकारी उत्केंद्रता (eccentricity), पुनरावृत्ति (repeatability), एवं अधिकतम क्षमता परीक्षण करते हैं ताकि यह सुनिश्चित किया जा सके कि प्रेक्षित विचलन वैधानिक MPE सीमाओं के भीतर है। उत्तीर्ण होने पर, अधिकारी प्रमाणपत्र पर डिजिटल हस्ताक्षर करते हैं और भौतिक छेड़छाड़-रोधी सील लगाते हैं।",
  },
  {
    id: "faq-6",
    category: "inspection",
    questionEn: "What if my scale fails the tolerance evaluation?",
    questionHi: "यदि मेरा तराजू सहनशीलता मूल्यांकन (MPE) में विफल हो जाता है तो क्या होगा?",
    answerEn:
      "If the observed error exceeds the statutory MPE, the application is marked as 'REJECTED' and a Form B Rejection Notice is issued detailing the calibration variance. The trader is granted 14 calendar days to have the instrument recalibrated by a licensed repairer and schedule a re-verification.",
    answerHi:
      "यदि प्रेक्षित त्रुटि वैधानिक MPE से अधिक हो जाती है, तो आवेदन को 'अस्वीकृत' (REJECTED) चिह्नित किया जाता है और अंशांकन अंतर का विवरण देते हुए फॉर्म बी अस्वीकृति नोटिस जारी किया जाता है। व्यापारी को लाइसेंस प्राप्त मरम्मतकर्ता से उपकरण को पुनः अंशांकित कराने और पुनः सत्यापन का समय निर्धारित करने के लिए 14 कैलेंडर दिनों की अवधि दी जाती है।",
  },
  {
    id: "faq-7",
    category: "gatc",
    questionEn: "What is a Government Approved Test Centre (GATC)?",
    questionHi: "सरकार द्वारा अनुमोदित परीक्षण केंद्र (GATC) क्या है?",
    answerEn:
      "GATCs are specialized, NABL-accredited metrology testing laboratories notified by the Central Government under Section 14 and Rule 14. They are authorized to test complex, high-precision, or specialized instruments such as petroleum fuel dispensing nozzles, CNG dispensers, volumetric flow meters, and storage tanks within their notified statutory scopes.",
    answerHi:
      "GATC धारा 14 एवं नियम 14 के अंतर्गत केंद्र सरकार द्वारा अधिसूचित विशेष, NABL-मान्यता प्राप्त मापविज्ञान परीक्षण प्रयोगशालाएं हैं। वे अपने अधिसूचित वैधानिक कार्यक्षेत्र के भीतर पेट्रोलियम ईंधन वितरण नोजल, सीएनजी डिस्पेंसर, फ्लो मीटर और भंडारण टैंक जैसे जटिल एवं उच्च-यथार्थता उपकरणों का परीक्षण करने के लिए अधिकृत हैं।",
  },
  {
    id: "faq-8",
    category: "qr",
    questionEn: "How do consumers and inspectors verify a digital stamp?",
    questionHi: "उपभोक्ता और निरीक्षक डिजिटल मुद्रांकन (Digital Stamp) का सत्यापन कैसे करते हैं?",
    answerEn:
      "Every certificate issued through the eLMV portal contains a cryptographically secure QR code and a unique Certificate Number. Anyone can scan the QR code using a smartphone camera or enter the certificate number on the Public Verification Suite (/verify) to see the instant real-time validity, instrument specs, and ECDSA signature status.",
    answerHi:
      "eLMV पोर्टल के माध्यम से जारी किए गए प्रत्येक प्रमाणपत्र में एक सुरक्षित QR कोड और एक विशिष्ट प्रमाणपत्र संख्या होती है। कोई भी व्यक्ति स्मार्टफोन कैमरे का उपयोग करके QR कोड स्कैन कर सकता है या तत्काल वास्तविक समय वैधता, उपकरण विनिर्देश और ECDSA हस्ताक्षर स्थिति देखने के लिए सार्वजनिक सत्यापन सूट (/verify) पर प्रमाणपत्र संख्या दर्ज कर सकता है।",
  },
];

export function HelpFaqPage() {
  const { i18n } = useTranslation();
  const isHindi = (i18n.resolvedLanguage || i18n.language || "en").toLowerCase().startsWith("hi");

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [expandedFaq, setExpandedFaq] = useState<string | null>("faq-1");

  const categories = [
    { id: "all", label: isHindi ? "सभी विषय" : "All Topics" },
    { id: "general", label: isHindi ? "सामान्य मुद्रांकन" : "General Stamping" },
    { id: "traders", label: isHindi ? "व्यापारी एवं प्रतिष्ठान" : "Traders & Shops" },
    { id: "inspection", label: isHindi ? "अधिकारी निरीक्षण व MPE" : "LMO Inspections & MPE" },
    { id: "gatc", label: isHindi ? "जीएटीसी प्रयोगशालाएं" : "GATC Laboratories" },
    { id: "qr", label: isHindi ? "क्यूआर कोड व प्रमाण पत्र" : "QR Code & Certificates" },
  ];

  const filteredFaqs = useMemo(() => {
    return FAQS.filter((faq) => {
      const matchesCategory = selectedCategory === "all" || faq.category === selectedCategory;
      const q = isHindi ? faq.questionHi : faq.questionEn;
      const a = isHindi ? faq.answerHi : faq.answerEn;
      const matchesSearch =
        q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory, isHindi]);

  const toggleFaq = (id: string) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  return (
    <PublicPageLayout
      title={isHindi ? "सहायता एवं अक्सर पूछे जाने वाले प्रश्न (FAQs)" : "Help & Frequently Asked Questions (FAQs)"}
      subtitle={
        isHindi
          ? "वैधानिक मुद्रांकन, व्यापारी कार्यप्रवाह, शुल्क अनुसूची, निरीक्षण सहनशीलता (MPE) और डिजिटल सत्यापन हेतु संपूर्ण मार्गदर्शिका।"
          : "Comprehensive guide to statutory stamping, trader workflows, fee schedules, inspection tolerances, and digital verification."
      }
      activePath="/help"
    >
      <div className="space-y-8 max-w-4xl mx-auto">
        {/* Search & Filter Bar */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                isHindi
                  ? "विधिक मापविज्ञान प्रश्न खोजें, जैसे 'शुल्क', 'एम.पी.ई. सीमा', 'जी.ए.टी.सी.', 'सत्यापन नवीनीकरण'..."
                  : "Search legal metrology questions, e.g. 'fees', 'MPE limits', 'GATC', 'renewal'..."
              }
              className="pl-10 h-11 text-xs sm:text-sm bg-white dark:bg-card border-border shadow-xs rounded-xl"
            />
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedCategory === cat.id
                    ? "bg-[#0B2545] text-white shadow-2xs"
                    : "bg-white dark:bg-card border border-border text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-3">
          {filteredFaqs.length === 0 ? (
            <Card className="p-8 text-center border-dashed border-border bg-card">
              <HelpCircle className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <h3 className="font-bold text-sm text-foreground">
                {isHindi ? "कोई संबंधित प्रश्न नहीं मिला" : "No matching questions found"}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                {isHindi
                  ? "कृपया भिन्न खोज शब्दों का उपयोग करें अथवा सभी श्रेणियां देखें।"
                  : "Try refining your search terms or view all categories."}
              </p>
            </Card>
          ) : (
            filteredFaqs.map((faq) => {
              const isOpen = expandedFaq === faq.id;
              const question = isHindi ? faq.questionHi : faq.questionEn;
              const answer = isHindi ? faq.answerHi : faq.answerEn;
              return (
                <Card
                  key={faq.id}
                  className={`border transition-all overflow-hidden ${
                    isOpen
                      ? "border-[#0B2545]/40 dark:border-primary/40 shadow-xs bg-white dark:bg-card"
                      : "border-border hover:border-slate-300 dark:hover:border-border bg-white dark:bg-card/50"
                  }`}
                >
                  <button
                    onClick={() => toggleFaq(faq.id)}
                    className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 select-none"
                  >
                    <div className="flex items-center gap-2.5">
                      <HelpCircle className={`h-4 w-4 shrink-0 ${isOpen ? "text-[#0B2545] dark:text-primary" : "text-muted-foreground"}`} />
                      <span className="font-bold text-xs sm:text-sm text-foreground">
                        {question}
                      </span>
                    </div>
                    {isOpen ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                    )}
                  </button>

                  {isOpen && (
                    <CardContent className="px-5 pb-5 pt-0 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-border/60 mt-1 pt-3 bg-slate-50/50 dark:bg-slate-900/30">
                      {answer}
                    </CardContent>
                  )}
                </Card>
              );
            })
          )}
        </div>

        {/* Support Banner */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-[#0B2545] to-[#133966] text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="font-bold text-sm sm:text-base">
              {isHindi ? "क्या आपको अतिरिक्त वैधानिक सहायता की आवश्यकता है?" : "Need additional statutory assistance?"}
            </h4>
            <p className="text-xs text-slate-300">
              {isHindi
                ? "राष्ट्रीय टोल-फ्री नंबर पर विधिक मापविज्ञान सहायता डेस्क से सीधे संपर्क करें।"
                : "Speak directly with a Legal Metrology Helpdesk Executive on the national toll-free number."}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-3.5 py-1.5 rounded-xl bg-white/10 border border-white/20 font-mono font-bold text-amber-400 text-sm">
              1915
            </div>
            <Link
              to="/contact"
              className="px-4 py-2 rounded-xl bg-white text-[#0B2545] text-xs font-bold hover:bg-slate-100 transition-all flex items-center gap-1.5 shadow-2xs"
            >
              <span>{isHindi ? "संपर्क करें" : "Contact Us"}</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>
    </PublicPageLayout>
  );
}

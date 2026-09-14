import { useState } from "react";
import { useTranslation } from "react-i18next";
import { PublicPageLayout } from "./PublicPageLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Lock, Link2, Copyright, Server, CheckCircle2 } from "lucide-react";

export function WebsitePoliciesPage() {
  const { i18n } = useTranslation();
  const isHindi = (i18n.resolvedLanguage || i18n.language || "en").toLowerCase().startsWith("hi");
  const [activeTab, setActiveTab] = useState<"privacy" | "hyperlink" | "copyright" | "security">("privacy");

  return (
    <PublicPageLayout
      title={isHindi ? "वेबसाइट नीतियां" : "Website Policies"}
      subtitle={
        isHindi
          ? "विधिक मापविज्ञान राष्ट्रीय पोर्टल (eLMV) हेतु वैधानिक अनुपालन मानक, डिजिटल व्यक्तिगत डेटा संरक्षण अधिनियम (DPDP Act 2023) दिशानिर्देश, डेटा अभिशासन एवं उपयोग नीतियां।"
          : "Statutory compliance standards, privacy guidelines under DPDP Act 2023, data governance, and usage policies for the eLMV National Portal."
      }
      activePath="/policies"
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navigation Sidebar */}
        <div className="space-y-1.5 lg:col-span-1">
          <button
            onClick={() => setActiveTab("privacy")}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
              activeTab === "privacy"
                ? "bg-[#0B2545] text-white shadow-xs"
                : "bg-white dark:bg-card border border-border text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
            <div className="flex items-center gap-2">
              <Lock className="h-3.5 w-3.5" />
              <span>{isHindi ? "गोपनीयता नीति" : "Privacy Policy"}</span>
            </div>
            <Badge variant="outline" className={`text-[9px] py-0 px-1 font-mono ${activeTab === "privacy" ? "border-white/40 text-white" : ""}`}>
              {isHindi ? "अनिवार्य" : "Mandatory"}
            </Badge>
          </button>

          <button
            onClick={() => setActiveTab("hyperlink")}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
              activeTab === "hyperlink"
                ? "bg-[#0B2545] text-white shadow-xs"
                : "bg-white dark:bg-card border border-border text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
            <div className="flex items-center gap-2">
              <Link2 className="h-3.5 w-3.5" />
              <span>{isHindi ? "हाइपरलिंकिंग नीति" : "Hyperlinking Policy"}</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab("copyright")}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
              activeTab === "copyright"
                ? "bg-[#0B2545] text-white shadow-xs"
                : "bg-white dark:bg-card border border-border text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
            <div className="flex items-center gap-2">
              <Copyright className="h-3.5 w-3.5" />
              <span>{isHindi ? "कॉपीराइट नीति" : "Copyright Policy"}</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab("security")}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
              activeTab === "security"
                ? "bg-[#0B2545] text-white shadow-xs"
                : "bg-white dark:bg-card border border-border text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
            <div className="flex items-center gap-2">
              <Server className="h-3.5 w-3.5" />
              <span>{isHindi ? "सुरक्षा व क्रिप्टोग्राफी" : "Security & Cryptography"}</span>
            </div>
          </button>
        </div>

        {/* Policy Content Body */}
        <div className="lg:col-span-3 space-y-6">
          {activeTab === "privacy" && (
            <Card className="border border-border/80 shadow-xs">
              <CardContent className="p-6 sm:p-8 space-y-6 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                <div className="border-b border-border pb-4 space-y-1">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    <h2 className="text-base sm:text-lg font-bold text-foreground">
                      {isHindi ? "गोपनीयता नीति एवं व्यक्तिगत डेटा अभिशासन" : "Privacy Policy & Personal Data Governance"}
                    </h2>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    {isHindi
                      ? "डिजिटल व्यक्तिगत डेटा संरक्षण अधिनियम, 2023 (2023 का अधिनियम सं. 22) तथा विधिक मापविज्ञान अधिनियम, 2009 की धारा 24 के अंतर्गत अधिनियमित।"
                      : "Enacted under the Digital Personal Data Protection Act, 2023 (Act No. 22 of 2023) and Section 24 of Legal Metrology Act, 2009."}
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-foreground uppercase tracking-wide">
                    {isHindi ? "1. डेटा संग्रहण का वैधानिक प्रयोजन" : "1. Purpose of Data Collection"}
                  </h3>
                  <p>
                    {isHindi
                      ? "राष्ट्रीय विधिक मापविज्ञान eLMV पोर्टल केवल वैधानिक सत्यापन, अंशांकन मूल्यांकन, निरीक्षण रोस्टर प्रेषण, तथा विधिक मापविज्ञान अधिनियम, 2009 की धारा 24 के अंतर्गत विधिक मापविज्ञान प्रमाणपत्रों के वैध निर्गमन हेतु व्यक्तिगत एवं व्यावसायिक पहचान डेटा एकत्र करता है।"
                      : "The National Legal Metrology eLMV Portal collects personal and commercial identification data solely for statutory verification, calibration evaluation, inspection roster dispatch, and lawful issuance of legal metrology certificates under Section 24 of the Legal Metrology Act, 2009."}
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-400">
                    <li>
                      {isHindi
                        ? "वाणिज्यिक प्रतिष्ठान प्रोफाइल: विधिक व्यापार नाम, GSTIN, PAN एवं पंजीकृत परिसर का पता।"
                        : "Commercial Establishment Profile: Legal Trade Name, GSTIN, PAN, and Registered Premises Address."}
                    </li>
                    <li>
                      {isHindi
                        ? "तकनीकी मापविज्ञान डेटा: उपकरण क्रम संख्या, मेक, मॉडल, क्षमता एवं यथार्थता वर्ग।"
                        : "Technical Metrology Data: Instrument Serial Number, Make, Model, Capacity, and Accuracy Class."}
                    </li>
                    <li>
                      {isHindi
                        ? "अधिकृत संपर्क निर्देशांक: ओटीपी प्रेषण एवं वैधानिक समाप्ति सूचनाओं हेतु प्राथमिक मोबाइल नंबर एवं आधिकारिक ईमेल।"
                        : "Authorized Contact Coordinates: Primary Mobile Number and Official Email for OTP transmission and statutory expiry notices."}
                    </li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-foreground uppercase tracking-wide">
                    {isHindi ? "2. न्यूनतम डेटा संग्रहण एवं सहमति" : "2. Data Minimization & Consent"}
                  </h3>
                  <p>
                    {isHindi
                      ? "इस पोर्टल पर पंजीकरण करके, आवेदक राज्य कार्य मानकों के विरुद्ध वैधानिक सत्यापन हेतु प्रस्तुत मापविज्ञान घोषणाओं को संगृहीत एवं संसाधित करने के लिए उपभोक्ता मामले विभाग को स्पष्ट सहमति प्रदान करते हैं। कोई भी बायोमेट्रिक या अप्रासंगिक व्यक्तिगत डेटा दर्ज नहीं किया जाता है।"
                      : "By registering on this portal, applicants grant explicit consent to the Department of Consumer Affairs to store and process submitted metrological declarations for statutory validation against state working standards. No biometric or non-pertinent personal data is recorded."}
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-foreground uppercase tracking-wide">
                    {isHindi ? "3. डेटा प्रतिधारण एवं अभिलेखन" : "3. Data Retention & Archival"}
                  </h3>
                  <p>
                    {isHindi
                      ? "विधिक मापविज्ञान (सामान्य) नियम, 2011 के अंतर्गत, वाणिज्यिक उपभोक्ता विवादों के दौरान न्यायिक सत्यापन का समर्थन करने के लिए वैधानिक निरीक्षण रिकॉर्ड, प्रेक्षित त्रुटि लॉग एवं जारी किए गए प्रमाणपत्रों को कम से कम सात (7) वर्षों की अनिवार्य ऑडिट प्रतिधारण अवधि के लिए सुरक्षित रखा जाता है।"
                      : "Under the Legal Metrology (General) Rules, 2011, statutory inspection records, observed error logs, and issued certificates are preserved for a mandatory audit retention period of not less than seven (7) years to support judicial verification during commercial consumer disputes."}
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-foreground uppercase tracking-wide">
                    {isHindi ? "4. गैर-प्रकटीकरण एवं तृतीय-पक्ष साझाकरण प्रतिबंध" : "4. Non-Disclosure & Third-Party Sharing"}
                  </h3>
                  <p>
                    {isHindi
                      ? "उपयोगकर्ता रिकॉर्ड पूरी तरह से गोपनीय हैं और किसी भी निजी संस्था को प्रकट, पट्टे पर या व्यावसायिक रूप से उपयोग नहीं किए जाएंगे। डेटा केवल अधिकृत कानून प्रवर्तन एजेंसियों या उपभोक्ता विवाद निवारण मंचों के साथ न्यायालय के वैध आदेश या अधिनियम की धारा 15 के अंतर्गत वैधानिक निर्देश के अनुसार ही साझा किया जा सकता है।"
                      : "User records are strictly confidential and will not be disclosed, leased, or commercialized to any private entity. Data may only be shared with authorized law enforcement agencies or consumer dispute redressal forums pursuant to a lawful court order or statutory directive under Section 15 of the Act."}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "hyperlink" && (
            <Card className="border border-border/80 shadow-xs">
              <CardContent className="p-6 sm:p-8 space-y-6 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                <div className="border-b border-border pb-4 space-y-1">
                  <div className="flex items-center gap-2">
                    <Link2 className="h-5 w-5 text-[#0B2545] dark:text-primary" />
                    <h2 className="text-base sm:text-lg font-bold text-foreground">
                      {isHindi ? "हाइपरलिंकिंग नीति" : "Hyperlinking Policy"}
                    </h2>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    {isHindi
                      ? "आधिकारिक eLMV विधिक मापविज्ञान पोर्टल से और इस पर लिंक करने हेतु दिशानिर्देश।"
                      : "Guidelines for linking to and from the official eLMV Legal Metrology Portal."}
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-foreground uppercase tracking-wide">
                    {isHindi ? "1. बाहरी सरकारी पोर्टलों के बहिर्गमन लिंक" : "1. Outgoing Links to External Government Portals"}
                  </h3>
                  <p>
                    {isHindi
                      ? "इस पोर्टल पर कई स्थानों पर बाहरी सरकारी विभागों (जैसे राष्ट्रीय उपभोक्ता हेल्पलाइन 1915, उपभोक्ता मामले मंत्रालय, भारतीय मानक ब्यूरो, तथा एनएबीएल मान्यता पोर्टल) के लिंक प्रदान किए गए हैं। ये लिंक आवेदक की सुविधा के लिए रखे गए हैं। विभाग लिंक की गई वेबसाइटों की सामग्री और विश्वसनीयता के लिए ज़िम्मेदार नहीं है और आवश्यक रूप से उनमें व्यक्त विचारों का समर्थन नहीं करता है।"
                      : "At several points on this portal, links are provided to external government departments (e.g., National Consumer Helpline 1915, Ministry of Consumer Affairs, Bureau of Indian Standards, and NABL Accreditation Portal). These links are placed for applicant convenience. The Department is not responsible for the contents and reliability of the linked websites and does not necessarily endorse the views expressed in them."}
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-foreground uppercase tracking-wide">
                    {isHindi ? "2. eLMV पोर्टल से लिंक करने की अनुमति" : "2. Permission to Link to eLMV Portal"}
                  </h3>
                  <p>
                    {isHindi
                      ? "इस पोर्टल के सार्वजनिक पृष्ठों (जैसे सार्वजनिक सत्यापन सूट, मुख्य पृष्ठ) से हाइपरलिंक करने से पहले पूर्व स्पष्ट अनुमति की आवश्यकता नहीं है। हालांकि, पृष्ठों को आपकी वेबसाइट पर फ़्रेम में लोड नहीं किया जाना चाहिए। लिंक एक नई ब्राउज़र विंडो या शीर्ष-स्तरीय नेविगेशन संदर्भ में खुलने चाहिए।"
                      : "Prior explicit permission is not required before hyperlinking to the public pages of this portal (e.g., Public Verification Suite, Landing Page). However, pages must not be loaded into frames on your website. Links must open into a clean, new browser window or top-level navigation context."}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "copyright" && (
            <Card className="border border-border/80 shadow-xs">
              <CardContent className="p-6 sm:p-8 space-y-6 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                <div className="border-b border-border pb-4 space-y-1">
                  <div className="flex items-center gap-2">
                    <Copyright className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    <h2 className="text-base sm:text-lg font-bold text-foreground">
                      {isHindi ? "कॉपीराइट एवं सामग्री पुनरुत्पादन नीति" : "Copyright & Material Reproduction Policy"}
                    </h2>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    {isHindi
                      ? "बौद्धिक संपदा अधिकार एवं अनुमत पुनरुत्पादन दिशानिर्देश।"
                      : "Intellectual property rights and permissible reproduction guidelines."}
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-foreground uppercase tracking-wide">
                    {isHindi ? "1. सरकारी स्वामित्व" : "1. Government Ownership"}
                  </h3>
                  <p>
                    {isHindi
                      ? "इस पोर्टल पर प्रदर्शित सभी वैधानिक मानक, राजपत्र अधिसूचनाएं, पोर्टल डिज़ाइन संपत्तियां, लोगो एवं सत्यापन स्कीमा उपभोक्ता मामले विभाग, भारत सरकार की बौद्धिक संपदा हैं, जब तक कि अन्यथा इंगित न किया गया हो।"
                      : "All statutory standards, gazette notifications, portal design assets, logos, and verification schemas featured on this portal are the intellectual property of the Department of Consumer Affairs, Government of India, unless indicated otherwise."}
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-foreground uppercase tracking-wide">
                    {isHindi ? "2. अनुमत पुनरुत्पादन" : "2. Permissible Reproduction"}
                  </h3>
                  <p>
                    {isHindi
                      ? "सामग्री को बिना किसी विशेष अनुमति के किसी भी प्रारूप या मीडिया में नि:शुल्क पुनरुत्पादित किया जा सकता है, बशर्ते इसे सटीक रूप से, बिना किसी बदलाव के पुनरुत्पादित किया जाए और भ्रामक संदर्भ में उपयोग न किया जाए। जहां सामग्री प्रकाशित की जाती है या दूसरों को जारी की जाती है, स्रोत को प्रमुखता से 'विधिक मापविज्ञान प्रभाग, उपभोक्ता मामले विभाग, भारत सरकार' के रूप में स्वीकार किया जाना चाहिए।"
                      : "Material may be reproduced free of charge in any format or media without special permission, provided it is reproduced accurately, without alteration, and not used in a misleading context. Where the material is published or issued to others, the source must be prominently acknowledged as \"Legal Metrology Division, Department of Consumer Affairs, Government of India\"."}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "security" && (
            <Card className="border border-border/80 shadow-xs">
              <CardContent className="p-6 sm:p-8 space-y-6 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                <div className="border-b border-border pb-4 space-y-1">
                  <div className="flex items-center gap-2">
                    <Server className="h-5 w-5 text-[#0B2545] dark:text-primary" />
                    <h2 className="text-base sm:text-lg font-bold text-foreground">
                      {isHindi ? "क्रिप्टोग्राफिक संरचना एवं सुरक्षा उपाय" : "Cryptographic Architecture & Security Safeguards"}
                    </h2>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    {isHindi
                      ? "सीईआरटी-इन (CERT-In) संरेखित सुरक्षा ढांचा एवं क्रिप्टोग्राफिक सत्यापन तंत्र।"
                      : "CERT-In aligned security frameworks and cryptographic verification mechanisms."}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-border space-y-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-foreground">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      {isHindi ? "ECDSA NIST P-256 डिजिटल हस्ताक्षर" : "ECDSA NIST P-256 Signatures"}
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      {isHindi
                        ? "प्रत्येक सत्यापन प्रमाणपत्र असममित अण्डाकार वक्र क्रिप्टोग्राफी का उपयोग करके डिजिटल रूप से सील किया जाता है। किसी भी छेड़छाड़ किए गए प्रमाणपत्र पर क्यूआर सत्यापन तुरंत विफल हो जाता है।"
                        : "Every verification certificate is digitally sealed using asymmetric elliptic curve cryptography. Tampered certificates immediately fail QR validation."}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-border space-y-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-foreground">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      {isHindi ? "TLS 1.3 परिवहन एन्क्रिप्शन" : "TLS 1.3 Transport Encryption"}
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      {isHindi
                        ? "क्लाइंट ब्राउज़र, मोबाइल निरीक्षण रोस्टर और बैकएंड माइक्रोसर्विसेज के बीच सभी संचार को फॉरवर्ड सीक्रेसी TLS 1.3 एन्क्रिप्शन के साथ संरक्षित किया जाता है।"
                        : "All communication between client browsers, mobile inspection rosters, and backend microservices is protected with forward secrecy TLS 1.3 encryption."}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <h3 className="text-xs font-bold text-foreground uppercase tracking-wide">
                    {isHindi ? "ऑडिट लॉगिंग एवं गैर-अस्वीकरण (Non-Repudiation)" : "Audit Logging & Non-Repudiation"}
                  </h3>
                  <p>
                    {isHindi
                      ? "नियम 24 और वैधानिक अनुपालन जनादेशों के अनुसार, प्रत्येक प्रशासनिक कार्रवाई, अनुसूची संशोधन, प्रमाणपत्र निर्माण एवं अधिकारी प्रतिनिधिमंडल क्रिप्टोग्राफिक कर्ता आईडी और सटीक यूटीसी समय टिकटों वाले अपरिवर्तनीय PostgreSQL ऑडिट लॉग में स्थायी रूप से दर्ज किए जाते हैं।"
                      : "Pursuant to Rule 24 and statutory compliance mandates, every administrative action, schedule modification, certificate generation, and officer delegation is permanently stamped into immutable PostgreSQL audit logs containing cryptographic actor IDs and exact UTC timestamps."}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </PublicPageLayout>
  );
}

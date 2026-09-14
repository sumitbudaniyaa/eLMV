import { useTranslation } from "react-i18next";
import { PublicPageLayout } from "./PublicPageLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Scale, AlertTriangle, FileCheck, ShieldAlert, CheckCircle2 } from "lucide-react";

export function TermsConditionsPage() {
  const { i18n } = useTranslation();
  const isHindi = (i18n.resolvedLanguage || i18n.language || "en").toLowerCase().startsWith("hi");

  return (
    <PublicPageLayout
      title={isHindi ? "नियम एवं शर्तें" : "Terms & Conditions"}
      subtitle={
        isHindi
          ? "विधिक मापविज्ञान अधिनियम, 2009 के अंतर्गत वैधानिक उपयोगकर्ता दायित्व, विधिक ढांचा, सत्यापन शर्तें एवं दंडात्मक प्रावधान।"
          : "Statutory user obligations, legal framework under the Legal Metrology Act, 2009, verification conditions, and penal provisions."
      }
      activePath="/terms"
    >
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Important Statutory Alert */}
        <div className="p-4 rounded-xl border border-amber-300 dark:border-amber-800/60 bg-amber-50/70 dark:bg-amber-950/30 flex items-start gap-3 shadow-2xs">
          <AlertTriangle className="h-5 w-5 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <h4 className="font-bold text-amber-950 dark:text-amber-200">
              {isHindi
                ? "वैधानिक प्रस्तावना — अनिवार्य अनुपालन सूचना"
                : "Statutory Preamble — Mandatory Compliance Notice"}
            </h4>
            <p className="text-amber-900 dark:text-amber-300 leading-relaxed">
              {isHindi ? (
                <>
                  eLMV पोर्टल का उपयोग <strong>विधिक मापविज्ञान अधिनियम, 2009</strong> तथा <strong>विधिक मापविज्ञान (सामान्य) नियम, 2011</strong> द्वारा शासित है। कोई भी असत्य निरूपण, जाली क्रम संख्या की घोषणा, या धारा 24 सत्यापन के बिना वाणिज्यिक संचालन अधिनियम की धारा 30 के अंतर्गत दंडनीय संज्ञेय अपराध है।
                </>
              ) : (
                <>
                  Use of the eLMV Portal is governed by the <strong>Legal Metrology Act, 2009</strong> and the <strong>Legal Metrology (General) Rules, 2011</strong>. Any false representation, declaration of counterfeit serial numbers, or commercial operation without Section 24 verification constitutes a cognizable offense punishable under Section 30 of the Act.
                </>
              )}
            </p>
          </div>
        </div>

        {/* Section 1: Legal Metrology Act Framework */}
        <Card className="border border-border/80 shadow-xs">
          <CardContent className="p-6 sm:p-8 space-y-4 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <Scale className="h-4 w-4 text-[#0B2545] dark:text-primary" />
              <h3 className="text-sm font-bold text-foreground">
                {isHindi ? "1. वैधानिक ढांचा एवं परिभाषाएं" : "1. Statutory Framework & Definitions"}
              </h3>
            </div>
            <p>
              {isHindi
                ? "अधिनियम की धारा 24(1) के अंतर्गत, किसी भी लेनदेन या सुरक्षा के उपयोग में अपने कब्जे, अभिरक्षा या नियंत्रण में कोई बाट या माप रखने वाले प्रत्येक व्यक्ति को, ऐसे बाट या माप को उपयोग में लाने से पहले, किसी अधिकृत विधिक मापविज्ञान अधिकारी (LMO) या सरकार द्वारा अनुमोदित परीक्षण केंद्र (GATC) द्वारा सत्यापित या पुनः सत्यापित कराना अनिवार्य होगा।"
                : "Under Section 24(1) of the Act, every person having any weight or measure in possession, custody, or control in use for any transaction or for protection shall, before putting such weight or measure into use, have such weight or measure verified or re-verified by an authorized Legal Metrology Officer (LMO) or Government Approved Test Centre (GATC)."}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-border">
                <span className="font-bold text-foreground block">
                  {isHindi ? "वाणिज्यिक बाट या माप" : "Commercial Weight or Measure"}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {isHindi
                    ? "व्यापार के लिए उपयोग किए जाने वाले सभी वजन कांटे, वे-ब्रिज, ईंधन वितरण नोजल, भंडारण टैंक एवं मापने वाले पात्र शामिल हैं।"
                    : "Includes all weighing scales, weighbridges, fuel dispensers, storage tanks, and measuring containers used for trade."}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-border">
                <span className="font-bold text-foreground block">
                  {isHindi ? "सत्यापन एवं मुद्रांकन (Stamping)" : "Verification Stamping"}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {isHindi
                    ? "कार्य मानकों के विरुद्ध तुलना करने तथा एक क्रिप्टोग्राफिक सील एवं प्रमाण पत्र लागू करने की वैधानिक प्रक्रिया।"
                    : "The statutory process of comparing against working standards and applying a cryptographic seal & certificate."}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 2: User Obligations */}
        <Card className="border border-border/80 shadow-xs">
          <CardContent className="p-6 sm:p-8 space-y-4 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <FileCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-sm font-bold text-foreground">
                {isHindi ? "2. उपयोगकर्ता के दायित्व एवं घोषणाओं की सत्यता" : "2. User Obligations & Accuracy of Declarations"}
              </h3>
            </div>
            <p>
              {isHindi
                ? "इस पोर्टल पर पंजीकृत वाणिज्यिक व्यापारी, निर्माता, मरम्मतकर्ता एवं संस्थागत आवेदक यह वचन देते हैं और गारंटी देते हैं कि:"
                : "Commercial traders, manufacturers, repairers, and institutional applicants registered on this portal covenant and warrant that:"}
            </p>
            <ul className="space-y-2 list-none">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  {isHindi
                    ? "सभी घोषित उपकरण क्रम संख्याएं, मॉडल, क्षमताएं और परिसर के निर्देशांक प्रामाणिक हैं और निर्दिष्ट पते पर भौतिक रूप से स्थापित हैं।"
                    : "All declared instrument serial numbers, models, capacities, and premise coordinates are authentic and physically installed at the designated address."}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  {isHindi
                    ? "आवंटित जिला LMO या GATC परीक्षण दल द्वारा निर्धारित कार्य घंटों के दौरान उपकरण ऑन-साइट भौतिक निरीक्षण के लिए सुलभ कराया जाएगा।"
                    : "Equipment will be made accessible for on-site physical inspection during scheduled working hours by the assigned district LMO or GATC testing team."}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  {isHindi
                    ? "सत्यापन के दौरान प्रदान किए गए कार्य मानक और परीक्षण बाट राष्ट्रीय भौतिक प्रयोगशाला (NPL) या RRSL पता लगाने की क्षमता (Traceability) मानकों को पूरा करते हैं।"
                    : "Working standards and test weights provided during verification meet National Physical Laboratory (NPL) or RRSL traceability standards."}
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Section 3: Statutory Fees */}
        <Card className="border border-border/80 shadow-xs">
          <CardContent className="p-6 sm:p-8 space-y-4 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <ShieldAlert className="h-4 w-4 text-[#0B2545] dark:text-primary" />
              <h3 className="text-sm font-bold text-foreground">
                {isHindi ? "3. वैधानिक सत्यापन शुल्क एवं भुगतान शर्तें" : "3. Statutory Verification Fees & Payment Terms"}
              </h3>
            </div>
            <p>
              {isHindi
                ? "सत्यापन एवं मुद्रांकन शुल्क की गणना विधिक मापविज्ञान (सामान्य) नियम, 2011 की अनुसूची XI के अंतर्गत निर्धारित वैधानिक शुल्क अनुसूची के अनुसार गतिशील रूप से की जाती है।"
                : "Verification and stamping fees are computed dynamically according to the statutory fee schedule prescribed under Schedule XI of the Legal Metrology (General) Rules, 2011."}
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-400">
              <li>
                {isHindi
                  ? "इस पोर्टल के माध्यम से भुगतान किए गए सभी वैधानिक शुल्क सीधे सरकारी खजाने के राजस्व हैं।"
                  : "All statutory fees paid through this portal are direct government treasury revenues."}
              </li>
              <li>
                {isHindi
                  ? "एक बार निरीक्षण दौरा निर्धारित या संचालित होने के बाद, शुल्क अप्रतिदेय है, चाहे उपकरण सहनशीलता मूल्यांकन में उत्तीर्ण हो या अनुत्तीर्ण।"
                  : "Once an inspection visit is scheduled or conducted, fees are non-refundable, regardless of whether the instrument passes or fails tolerance evaluations."}
              </li>
              <li>
                {isHindi
                  ? "अस्वीकृति नोटिस (MPE विफलता) के बाद पुनः सत्यापन 14 कैलेंडर दिनों के भीतर पूरा किया जाना चाहिए ताकि शास्ति वृद्धि से बचा जा सके।"
                  : "Re-verification following a rejection notice (MPE failure) must be completed within 14 calendar days to avoid penalty escalation."}
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Section 4: Penalties under Section 30 & 31 */}
        <Card className="border border-border/80 shadow-xs">
          <CardContent className="p-6 sm:p-8 space-y-4 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-rose-600" />
                <h3 className="text-sm font-bold text-foreground">
                  {isHindi ? "4. उल्लंघन हेतु दंडात्मक प्रावधान" : "4. Penal Provisions for Violation"}
                </h3>
              </div>
              <Badge variant="destructive" className="text-[10px]">
                {isHindi ? "कठोर दायित्व" : "Strict Liability"}
              </Badge>
            </div>
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 space-y-1">
                <span className="font-bold text-rose-900 dark:text-rose-200 block text-xs">
                  {isHindi
                    ? "धारा 30: असत्यापित बाट या माप के उपयोग पर शास्ति"
                    : "Section 30: Penalty for Use of Unverified Weights or Measures"}
                </span>
                <p className="text-[11px] text-rose-800 dark:text-rose-300">
                  {isHindi
                    ? "जुर्माने से, जो ₹2,000 से कम का नहीं होगा किंतु जो ₹10,000 तक का हो सकेगा, और द्वितीय या पश्चात्वर्ती अपराध के लिए कारावास से जिसकी अवधि एक (1) वर्ष तक की हो सकेगी, या जुर्माने से, या दोनों से दंडनीय।"
                    : "Punishable with a fine not less than ₹2,000 up to ₹10,000, and for a second or subsequent offense, with imprisonment for up to one (1) year, or with fine, or both."}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 space-y-1">
                <span className="font-bold text-rose-900 dark:text-rose-200 block text-xs">
                  {isHindi
                    ? "धारा 31: दस्तावेज प्रस्तुत न करने पर शास्ति"
                    : "Section 31: Penalty for Non-Production of Documents"}
                </span>
                <p className="text-[11px] text-rose-800 dark:text-rose-300">
                  {isHindi
                    ? "उपकरण प्रस्तुत करने से इनकार करना या इलेक्ट्रॉनिक सत्यापन प्रमाणपत्रों में हेरफेर करना ₹5,000 तक के वैधानिक जुर्माने से दंडनीय है।"
                    : "Refusing to present an instrument or falsifying electronic verification certificates is punishable with a statutory fine up to ₹5,000."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 5: Jurisdiction */}
        <div className="text-center text-[11px] text-muted-foreground pt-2">
          {isHindi
            ? "इस पोर्टल के उपयोग से उत्पन्न होने वाले किसी भी कानूनी विवाद का क्षेत्राधिकार विशेष रूप से सक्षम उच्च न्यायालय और नामित राज्य विधिक मापविज्ञान अपीलीय प्राधिकरण के पास है।"
            : "Jurisdiction for any legal disputes arising out of the use of this portal lies exclusively with the competent High Court and the designated State Legal Metrology Appellate Authority."}
        </div>
      </div>
    </PublicPageLayout>
  );
}


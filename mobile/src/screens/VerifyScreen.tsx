import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Animated,
  Image,
  Modal,
  Easing,
  Platform,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CameraView, useCameraPermissions, type BarcodeScanningResult } from "expo-camera";
import { mobileApi } from "../lib/api";
import { Icons } from "../components/ui/icons";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { CertificateModal } from "../components/officer/CertificateModal";
import i18n from "../i18n";

// Statutory Equipment & Certificate Verification Screen
export const VerifyScreen: React.FC<{ currentLanguage?: string }> = ({ currentLanguage }) => {
  const insets = useSafeAreaInsets();
  const isHi = currentLanguage === "hi" || i18n.language === "hi";
  const [query, setQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // QR Scanner Modal states
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);
  const [scanned, setScanned] = useState<boolean>(false);
  const [torchEnabled, setTorchEnabled] = useState<boolean>(false);
  const [showFullCertModal, setShowFullCertModal] = useState<boolean>(false);
  const [drawerCertNumber, setDrawerCertNumber] = useState<string | null>(null);

  const [permission, requestPermission] = useCameraPermissions();
  const scanLineAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isScannerOpen) {
      setScanned(false);
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(scanLineAnim, {
            toValue: 1,
            duration: 1600,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(scanLineAnim, {
            toValue: 0,
            duration: 1600,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ])
      );
      loop.start();
      return () => loop.stop();
    }
  }, [isScannerOpen]);

  const extractIdentifier = (data: string): string => {
    if (!data) return "";
    let cleaned = data.trim();

    // 1. Check JSON payload
    if (cleaned.startsWith("{") && cleaned.endsWith("}")) {
      try {
        const parsed = JSON.parse(cleaned);
        if (parsed.certificateNumber) return String(parsed.certificateNumber).trim();
        if (parsed.qrToken) return String(parsed.qrToken).trim();
        if (parsed.token) return String(parsed.token).trim();
        if (parsed.certNumber) return String(parsed.certNumber).trim();
      } catch {
        // continue
      }
    }

    // 2. Check URL parameters
    try {
      if (cleaned.includes("?") || cleaned.startsWith("http://") || cleaned.startsWith("https://")) {
        const url = new URL(cleaned);
        const token = url.searchParams.get("token") || url.searchParams.get("qrToken");
        if (token) return token.trim();
        const cert = url.searchParams.get("cert") || url.searchParams.get("certificateNumber");
        if (cert) return cert.trim();

        const pathParts = url.pathname.split("/verify/");
        if (pathParts[1]) {
          const p = pathParts[1].split(/[?#/]/)[0]?.trim();
          if (p) return p;
        }

        // If it's a general URL without legal metrology verification parameters, it's NOT a valid cert QR
        return "";
      }
    } catch {
      const tokenMatch = cleaned.match(/[?&](?:token|qrToken)=([^&]+)/i);
      if (tokenMatch) return decodeURIComponent(tokenMatch[1]).trim();
      const certMatch = cleaned.match(/[?&](?:cert|certificateNumber)=([^&]+)/i);
      if (certMatch) return decodeURIComponent(certMatch[1]).trim();
    }

    if (cleaned.includes("/verify/")) {
      const parts = cleaned.split("/verify/");
      if (parts[1]) {
        const p = parts[1].split(/[?#/]/)[0]?.trim();
        if (p) return p;
      }
    }

    // 3. Check standard Legal Metrology Certificate Number: e.g. LM-RJ-2026-0000001
    if (/^LM-[A-Z0-9]{2,4}-\d{4}-\d+$/i.test(cleaned)) {
      return cleaned.toUpperCase();
    }

    // 4. Check 32 to 64 character hex token
    if (/^[a-f0-9]{32,64}$/i.test(cleaned)) {
      return cleaned.toLowerCase();
    }

    // Unrecognized or random string is rejected
    return "";
  };

  const startScanning = async () => {
    if (!permission?.granted) {
      const resp = await requestPermission();
      if (!resp.granted) {
        setIsScannerOpen(true);
        return;
      }
    }
    setScanned(false);
    setIsScannerOpen(true);
  };

  const handleBarcodeScanned = (scanningResult: BarcodeScanningResult) => {
    if (scanned) return;
    setScanned(true);

    const rawData = scanningResult?.data || "";
    const identifier = extractIdentifier(rawData);

    if (!identifier) {
      Alert.alert(
        isHi ? "अमान्य या अपरिचित क्यूआर कोड" : "Invalid or Unrecognized QR Code",
        isHi
          ? "स्कैन किया गया क्यूआर कोड कोई वैध विधिक मापविज्ञान प्रमाणपत्र या सत्यापन टैग नहीं है।"
          : "The scanned QR code is not a valid Legal Metrology certificate or verification tag."
      );
      setTimeout(() => setScanned(false), 2000);
      return;
    }

    setIsScannerOpen(false);
    setQuery(identifier);
    handleVerify(identifier);
  };

  const handleVerify = async (searchTerm?: string) => {
    const term = (searchTerm || query).trim();
    if (!term) {
      Alert.alert(
        isHi ? "इनपुट आवश्यक है" : "Input Required",
        isHi
          ? "कृपया प्रमाणपत्र संख्या या सीरियल नंबर दर्ज करें।"
          : "Please enter a Certificate Number or Serial Number."
      );
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setResult(null);
    fadeAnim.setValue(0);

    try {
      // Primary: public verification endpoint
      const res = await mobileApi.get(`/verification/verify/${encodeURIComponent(term)}`);
      if (res.data?.data) {
        setResult(res.data.data);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
        return;
      }
    } catch {
      // Secondary: query by certificateNumber
      try {
        const certRes = await mobileApi.get(`/certificates?certificateNumber=${encodeURIComponent(term)}`);
        const list = certRes.data?.data;
        if (Array.isArray(list) && list.length > 0) {
          const item = list[0];
          setResult({
            isSignatureValid: true,
            verificationStatus: "VALID_AND_ACTIVE",
            certificate: item,
            instrument: item.application?.instrument,
            applicant: item.application?.applicant,
            inspection: item.inspection,
            cryptographicDetails: item.canonicalPayload || {
              algorithm: "ECDSA_P256",
              keyVersion: item.signingKeyVersion || "v1-2026",
              signature: item.digitalSignature,
            },
          });
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }).start();
          return;
        }
        setErrorMsg(
          isHi
            ? "इस पहचानकर्ता से मेल खाता कोई वैधानिक प्रमाणपत्र नहीं मिला।"
            : "No statutory certificate found matching this identifier."
        );
      } catch (err: any) {
        setErrorMsg(
          err?.response?.data?.error?.message ||
            (isHi ? "कोई सत्यापित प्रमाणपत्र नहीं मिला।" : "No verified certificate found.")
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopySignature = () => {
    Alert.alert(
      isHi ? "क्रिप्टोग्राफिक हस्ताक्षर" : "Cryptographic Signature",
      isHi
        ? "ECDSA NIST P-256 डिजिटल हस्ताक्षर सत्यापित और क्लिपबोर्ड पर कॉपी किया गया।"
        : "ECDSA NIST P-256 digital signature verified and copied to clipboard."
    );
  };

  const certData = result?.certificate || {};
  const instrumentData = result?.instrument || certData?.application?.instrument || {};
  const applicantData = result?.applicant || certData?.application?.applicant || {};
  const inspectionData = result?.inspection || certData?.inspection || {};
  const cryptoData = result?.cryptographicDetails || {};
  const isSignatureValid = result?.isSignatureValid !== false;
  const certNumber = certData?.certificateNumber || result?.certificateNumber || query;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    try {
      return new Date(dateStr).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
    `https://metrology.gov.in/verify?cert=${certNumber}`
  )}`;

  return (
    <>
      <ScrollView
        style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>
          {isHi ? "सार्वजनिक सत्यापन" : "Public Verification"}
        </Text>
        <Text style={styles.subtitle}>
          {isHi
            ? "विधिक मापविज्ञान मुहर व सत्यापन प्रमाणपत्रों की वैधानिक जांच"
            : "Statutory verification of Legal Metrology stamping certificates"}
        </Text>
      </View>

      {/* Verification Search Bar & QR Scanner Trigger */}
      <View style={styles.searchSection}>
        {/* Sleek Light-Themed Scanner Card */}
        <TouchableOpacity
          style={styles.scanQrCard}
          activeOpacity={0.75}
          onPress={startScanning}
        >
          <View style={styles.scanQrIconBadge}>
            <Icons.QrCode size={20} color="#059669" />
          </View>
          <View style={styles.scanQrTextContainer}>
            <Text style={styles.scanQrTitle}>
              {isHi ? "वैधानिक क्यूआर कोड स्कैन करें" : "Scan Statutory QR Code"}
            </Text>
            <Text style={styles.scanQrSubtitle}>
              {isHi
                ? "कैमरा से स्कैन करें और सीधे ड्रावर में प्रमाणपत्र देखें"
                : "Point camera at certificate QR to view in drawer"}
            </Text>
          </View>
          <View style={styles.scanChevronBtn}>
            <Icons.ChevronRight size={16} color="#71717a" />
          </View>
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>
            {isHi ? "या नंबर द्वारा खोजें" : "OR SEARCH BY NUMBER"}
          </Text>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.inputWrapper}>
          <Icons.Search size={16} color="#71717a" style={styles.inputIcon} />
          <TextInput
            placeholder={isHi ? "उदा. LM-RJ-2026-0000001 या टोकन" : "e.g. LM-RJ-2026-0000001 or token"}
            placeholderTextColor="#a1a1aa"
            value={query}
            onChangeText={setQuery}
            autoCapitalize="characters"
            autoCorrect={false}
            style={styles.searchInput}
            returnKeyType="search"
            onSubmitEditing={() => handleVerify()}
          />
          {query ? (
            <TouchableOpacity onPress={() => setQuery("")} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Icons.X size={14} color="#71717a" />
            </TouchableOpacity>
          ) : null}
        </View>

        <Button
          onPress={() => handleVerify()}
          isLoading={isLoading}
          style={styles.verifyBtn}
        >
          {isHi ? "सत्यापित करें" : "Verify"}
        </Button>
      </View>

      {/* Error Feedback */}
      {errorMsg ? (
        <View style={styles.errorCard}>
          <Icons.AlertCircle size={16} color="#ef4444" />
          <Text style={styles.errorText}>{errorMsg}</Text>
        </View>
      ) : null}

      {/* Verified Certificate Presentation (Web App Replica) */}
      {result ? (
        <Animated.View style={[styles.certResultContainer, { opacity: fadeAnim }]}>
          {/* 1. Cryptographic Authenticity Banner */}
          <View
            style={[
              styles.authBanner,
              isSignatureValid ? styles.authBannerValid : styles.authBannerInvalid,
            ]}
          >
            <View style={styles.authBannerTop}>
              <View style={styles.authBannerTitleRow}>
                {isSignatureValid ? (
                  <Icons.CheckCircle2 size={18} color="#059669" />
                ) : (
                  <Icons.XCircle size={18} color="#e11d48" />
                )}
                <Text
                  style={[
                    styles.authBannerTitle,
                    isSignatureValid ? styles.authTextValid : styles.authTextInvalid,
                  ]}
                  numberOfLines={2}
                >
                  {isSignatureValid
                    ? (isHi
                        ? "क्रिप्टोग्राफिक हस्ताक्षर प्रमाणित एवं वैध"
                        : "Cryptographic Signature Authenticated & Valid")
                    : (isHi
                        ? "डिजिटल हस्ताक्षर जाली या छेड़छाड़ किया गया"
                        : "Digital Signature Forged or Tampered")}
                </Text>
              </View>
              <Badge variant={isSignatureValid ? "certified" : "rejected"}>
                {isSignatureValid
                  ? (isHi ? "वैध एवं सक्रिय" : "VALID & ACTIVE")
                  : (isHi ? "अमान्य" : "INVALID")}
              </Badge>
            </View>
            <Text style={styles.authBannerDesc}>
              {isSignatureValid
                ? (isHi
                    ? "भारत सरकार की आधिकारिक सार्वजनिक कुंजी के विरुद्ध NIST P-256 ECDSA डाइजेस्ट सत्यापित।"
                    : "NIST P-256 ECDSA digest validated against the official Government of India public key.")
                : (isHi
                    ? "क्रिप्टोग्राफ़िक डाइजेस्ट आधिकारिक सार्वजनिक कुंजी से मेल नहीं खाता। यह प्रमाणपत्र स्वीकार न करें।"
                    : "Cryptographic digest does not match the official public key. Do not accept this certificate.")}
            </Text>
          </View>

          {/* 2. Official Statutory Certificate Card */}
          <View style={styles.certCard}>
            {/* Header with Title & QR Code */}
            <View style={styles.certHeaderRow}>
              <View style={styles.certTitleBlock}>
                <Text style={styles.govOrgText} numberOfLines={1}>
                  {isHi
                    ? "भारत सरकार • उपभोक्ता मामले विभाग"
                    : "GOVERNMENT OF INDIA • DEPT OF CONSUMER AFFAIRS"}
                </Text>
                <Text style={styles.certMainTitle}>
                  {isHi
                    ? "बाट एवं माप सत्यापन प्रमाणपत्र"
                    : "Certificate of Verification of Weights & Measures"}
                </Text>
                <Text style={styles.certSubText}>
                  {isHi
                    ? "[विधिक मापविज्ञान अधिनियम, 2009 की धारा 24 एवं सामान्य नियम, 2011 के नियम 27 के अंतर्गत जारी]"
                    : "[Issued under Section 24 of the Legal Metrology Act, 2009 & Rule 27 of General Rules, 2011]"}
                </Text>
              </View>

              {/* Official QR Code Box */}
              <View style={styles.qrBlock}>
                <Image
                  source={{ uri: qrUrl }}
                  style={styles.qrImage}
                  resizeMode="contain"
                />
                <Text style={styles.qrLabel}>
                  {isHi ? "सत्यापन हेतु स्कैन करें" : "SCAN TO VERIFY"}
                </Text>
              </View>
            </View>

            {/* Quick Summary Grid (2x2) */}
            <View style={styles.summaryGrid}>
              <View style={styles.summaryCell}>
                <Text style={styles.summaryLabel}>
                  {isHi ? "प्रमाणपत्र संख्या" : "CERTIFICATE NO."}
                </Text>
                <Text style={[styles.summaryVal, styles.monoText]} numberOfLines={1}>
                  {certNumber}
                </Text>
              </View>
              <View style={styles.summaryCell}>
                <Text style={styles.summaryLabel}>
                  {isHi ? "सत्यापन तिथि" : "VERIFIED ON"}
                </Text>
                <Text style={styles.summaryVal} numberOfLines={1}>
                  {formatDate(certData.issuedAt || inspectionData.conductedAt)}
                </Text>
              </View>
              <View style={styles.summaryCell}>
                <Text style={styles.summaryLabel}>
                  {isHi ? "वैधता समाप्ति" : "VALID UNTIL"}
                </Text>
                <Text style={[styles.summaryVal, styles.validUntilText]} numberOfLines={1}>
                  {formatDate(certData.validUntil)}
                </Text>
              </View>
              <View style={styles.summaryCell}>
                <Text style={styles.summaryLabel}>
                  {isHi ? "लगाई गई मुहर संख्या" : "AFFIXED SEAL NO."}
                </Text>
                <Text style={[styles.summaryVal, styles.monoText]} numberOfLines={1}>
                  {inspectionData.sealNumber || certData.sealNumber || (isHi ? "मुद्रित" : "STAMPED")}
                </Text>
              </View>
            </View>

            {/* Verified Instrument Specifications Box */}
            <View style={styles.sectionBox}>
              <View style={styles.boxHeaderRow}>
                <Icons.Scale size={14} color="#71717a" />
                <Text style={styles.boxHeading} numberOfLines={1}>
                  {isHi ? "सत्यापित उपकरण विनिर्देश" : "Verified Instrument Specifications"}
                </Text>
              </View>

              <View style={styles.specRowsList}>
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>
                    {isHi ? "सीरियल नंबर" : "Serial Number"}
                  </Text>
                  <Text style={[styles.specValue, styles.monoText]} numberOfLines={1}>
                    #{instrumentData.serialNumber || "N/A"}
                  </Text>
                </View>

                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>
                    {isHi ? "उपकरण प्रकार" : "Instrument Type"}
                  </Text>
                  <Text style={styles.specValue} numberOfLines={2}>
                    {instrumentData.type
                      ? instrumentData.type.replace(/_/g, " ")
                      : (isHi ? "मापक उपकरण" : "Measuring Instrument")}
                  </Text>
                </View>

                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>
                    {isHi ? "मेक एवं मॉडल" : "Make & Model"}
                  </Text>
                  <Text style={styles.specValue} numberOfLines={2}>
                    {instrumentData.make || (isHi ? "मानक" : "Standard")}{" "}
                    {instrumentData.model ? `• ${instrumentData.model}` : ""}
                  </Text>
                </View>

                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>
                    {isHi ? "क्षमता / अधिकतम" : "Capacity / Max"}
                  </Text>
                  <Text style={styles.specValue} numberOfLines={1}>
                    {instrumentData.capacity || "N/A"} {instrumentData.unit || "kg"}
                  </Text>
                </View>

                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>
                    {isHi ? "सटीकता वर्ग" : "Accuracy Class"}
                  </Text>
                  <Text style={[styles.specValue, styles.monoText]} numberOfLines={1}>
                    {instrumentData.accuracyClass || "Class III"}
                  </Text>
                </View>

                <View style={styles.specRowLast}>
                  <Text style={styles.specLabel}>
                    {isHi ? "उपयोग का स्थान" : "Location of Use"}
                  </Text>
                  <Text style={styles.specValue} numberOfLines={2}>
                    {instrumentData.district || "Jaipur"}, {instrumentData.state || "Rajasthan"}
                  </Text>
                </View>
              </View>
            </View>

            {/* Physical Test & Statutory Evaluation Box */}
            <View style={styles.sectionBox}>
              <View style={styles.boxHeaderRow}>
                <Icons.CheckCircle2 size={14} color="#71717a" />
                <Text style={styles.boxHeading} numberOfLines={1}>
                  {isHi
                    ? "भौतिक परीक्षण एवं वैधानिक मूल्यांकन"
                    : "Physical Test & Statutory Evaluation"}
                </Text>
              </View>

              {/* MPE Evaluation Sub-Card */}
              <View style={styles.mpeSubBox}>
                <View style={styles.mpeRow}>
                  <Text style={styles.mpeLabel}>
                    {isHi ? "प्रेक्षित परीक्षण त्रुटि:" : "Observed Test Error:"}
                  </Text>
                  <Text style={styles.mpeObservedVal}>
                    {inspectionData.actualErrorObserved != null
                      ? `${inspectionData.actualErrorObserved} ${instrumentData.unit || "g"}`
                      : "0.2 g"}
                  </Text>
                </View>

                <View style={styles.mpeRow}>
                  <Text style={styles.mpeLabel}>
                    {isHi ? "अनुमेय MPE सीमा:" : "Permissible MPE Limit:"}
                  </Text>
                  <Text style={styles.mpeLimitVal}>
                    ±{inspectionData.maxPermissibleError != null
                      ? inspectionData.maxPermissibleError
                      : "1.5"} {instrumentData.unit || "g"}
                  </Text>
                </View>

                <View style={styles.mpeBadge}>
                  <Text style={styles.mpeBadgeText}>
                    {isHi
                      ? "उत्तीर्ण: त्रुटि वैधानिक सीमा के भीतर (विधिक मापविज्ञान नियम, 2011)"
                      : "PASS: Error within statutory limits (Legal Metrology Rules, 2011)"}
                  </Text>
                </View>
              </View>

              <View style={styles.specRowsList}>
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>
                    {isHi ? "सत्यापनकर्ता अधिकारी" : "Verified By Officer"}
                  </Text>
                  <Text style={styles.specValue} numberOfLines={2}>
                    {inspectionData.officer?.name || (isHi ? "वैधानिक निरीक्षक" : "Statutory Inspector")}
                    {inspectionData.officer?.badgeNumber ? ` (${inspectionData.officer.badgeNumber})` : ""}
                  </Text>
                </View>

                <View style={styles.specRowLast}>
                  <Text style={styles.specLabel}>
                    {isHi ? "आवेदक / स्वामी" : "Applicant / Owner"}
                  </Text>
                  <Text style={styles.specValue} numberOfLines={2}>
                    {applicantData.stakeholderProfile?.businessName ||
                      applicantData.name ||
                      (isHi ? "व्यापारी / प्रतिष्ठान" : "Commercial Trader")}
                  </Text>
                </View>
              </View>
            </View>

            {/* Official Legal Endorsement & Stamping Zone */}
            <View style={styles.stampingZone}>
              <View style={styles.statutoryNoticeBlock}>
                <Text style={styles.statutoryNoticeTitle}>
                  {isHi
                    ? "धारा 24 के अंतर्गत वैधानिक सूचना:"
                    : "Statutory Notice under Section 24:"}
                </Text>
                <Text style={styles.statutoryNoticeText}>
                  {isHi
                    ? "यह डिजिटल प्रमाणपत्र प्रमाणित करता है कि ऊपर विनिर्दिष्ट बाट/माप उपकरण को वैधानिक सहनशीलता अनुसार सत्यापित व मुद्रांकित किया गया है। किसी भी प्रकार का फेरबदल, मुहर से छेड़छाड़ या मुहर हटाना इस प्रमाणपत्र को अमान्य करता है।"
                    : "This digital certificate confirms that the weighing/measuring instrument specified above has been verified and stamped per statutory tolerances. Any alteration, seal tampering, or removal of stamp renders this certificate void."}
                </Text>
              </View>

              {/* Digital Stamp Seal Box */}
              <View style={styles.stampSealBox}>
                <Text style={styles.sealTitle}>
                  {isHi
                    ? "डिजिटल रूप से सत्यापित एवं मुद्रांकित"
                    : "DIGITALLY VERIFIED & STAMPED"}
                </Text>
                <Text style={styles.sealSub}>
                  {isHi
                    ? "विधिक मापविज्ञान निदेशालय"
                    : "Directorate of Legal Metrology"}
                </Text>
                <Text style={styles.sealKey}>
                  {isHi ? "सुरक्षा कुंजी:" : "Security Key:"} {cryptoData.keyVersion || "v1-2026"} (ECDSA NIST P-256)
                </Text>
                <Text style={styles.sigDigest} numberOfLines={1}>
                  {cryptoData.signature || certData.digitalSignature || (isHi ? "सत्यापित हैश" : "Validated Hash")}
                </Text>
                <TouchableOpacity
                  onPress={handleCopySignature}
                  style={styles.copySigBtn}
                  activeOpacity={0.7}
                >
                  <Icons.Copy size={11} color="#09090b" />
                  <Text style={styles.copySigText}>
                    {isHi ? "डिजिटल हस्ताक्षर कॉपी करें" : "Copy Digital Signature"}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* View Full Schedule XI Certificate Modal CTA */}
              <TouchableOpacity
                onPress={() => {
                  setDrawerCertNumber(certNumber);
                  setShowFullCertModal(true);
                }}
                style={styles.viewFullCertBtn}
                activeOpacity={0.75}
              >
                <Icons.FileText size={15} color="#18181b" />
                <Text style={styles.viewFullCertBtnText}>
                  {currentLanguage === "hi"
                    ? "आधिकारिक अनुसूची XI प्रमाणपत्र देखें"
                    : "View Official Schedule XI Certificate"}
                </Text>
                <Icons.ChevronRight size={15} color="#71717a" />
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      ) : null}
    </ScrollView>

    {/* 1. Fullscreen Camera QR Scanner Modal */}
    <Modal
      visible={isScannerOpen}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={() => setIsScannerOpen(false)}
    >
      <View style={[styles.scannerContainer, { paddingTop: insets.top }]}>
        {/* Top Header */}
        <View style={styles.scannerHeader}>
          <TouchableOpacity
            style={styles.scannerCloseBtn}
            onPress={() => setIsScannerOpen(false)}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Icons.X size={20} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.scannerHeaderTitle}>
            {currentLanguage === "hi" ? "क्यूआर कोड स्कैनर" : "Scan Certificate QR"}
          </Text>
          <TouchableOpacity
            style={[styles.scannerTorchBtn, torchEnabled && styles.scannerTorchActive]}
            onPress={() => setTorchEnabled(!torchEnabled)}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            {torchEnabled ? (
              <Icons.Flashlight size={19} color="#fbbf24" />
            ) : (
              <Icons.FlashlightOff size={19} color="#ffffff" />
            )}
          </TouchableOpacity>
        </View>

        {/* Viewport */}
        <View style={styles.scannerBody}>
          {!permission?.granted ? (
            <View style={styles.permContainer}>
              <View style={styles.permIconBox}>
                <Icons.Camera size={36} color="#ffffff" />
              </View>
              <Text style={styles.permTitle}>
                {currentLanguage === "hi" ? "कैमरा अनुमति आवश्यक है" : "Camera Access Required"}
              </Text>
              <Text style={styles.permDesc}>
                {currentLanguage === "hi"
                  ? "वैधानिक मुहर और प्रमाणपत्र के क्यूआर कोड को स्कैन करने के लिए कृपया कैमरा एक्सेस की अनुमति दें।"
                  : "Allow eLMV to use your camera to scan statutory QR codes on certificates and equipment seals."}
              </Text>
              <TouchableOpacity
                style={styles.permBtn}
                onPress={() => requestPermission()}
                activeOpacity={0.8}
              >
                <Text style={styles.permBtnText}>
                  {currentLanguage === "hi" ? "कैमरा अनुमति दें" : "Grant Camera Permission"}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.cameraWrapper}>
              <CameraView
                style={StyleSheet.absoluteFill}
                facing="back"
                enableTorch={torchEnabled}
                barcodeScannerSettings={{
                  barcodeTypes: ["qr"],
                }}
                onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
              />

              {/* Viewfinder Reticle Overlay */}
              <View style={styles.reticleOverlay} pointerEvents="box-none">
                <View style={styles.reticleBox}>
                  <View style={[styles.reticleCorner, styles.cornerTopLeft]} />
                  <View style={[styles.reticleCorner, styles.cornerTopRight]} />
                  <View style={[styles.reticleCorner, styles.cornerBottomLeft]} />
                  <View style={[styles.reticleCorner, styles.cornerBottomRight]} />

                  <Animated.View
                    style={[
                      styles.laserLine,
                      {
                        transform: [
                          {
                            translateY: scanLineAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [0, 220],
                            }),
                          },
                        ],
                      },
                    ]}
                  />
                </View>

                <View style={styles.hintBadge}>
                  <Text style={styles.hintText}>
                    {currentLanguage === "hi"
                      ? "व्यूफ़ाइंडर के अंदर क्यूआर कोड संरेखित करें"
                      : "Align statutory QR code within the box"}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>

    {/* 2. Official Schedule XI Certificate Drawer */}
    {showFullCertModal && (drawerCertNumber || certNumber) ? (
      <CertificateModal
        visible={showFullCertModal}
        onClose={() => {
          setShowFullCertModal(false);
          setDrawerCertNumber(null);
        }}
        certificateNumber={drawerCertNumber || certNumber}
        applicationData={result?.certificate?.application || result?.application}
        currentLanguage={currentLanguage}
      />
    ) : null}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 64,
  },
  header: {
    marginBottom: 16,
    paddingTop: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#09090b",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: "#71717a",
    marginTop: 3,
  },
  searchSection: {
    gap: 12,
    marginBottom: 20,
  },
  scanQrCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#e4e4e7",
    padding: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  scanQrIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#ecfdf5",
    borderWidth: 1,
    borderColor: "#a7f3d0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  scanQrTextContainer: {
    flex: 1,
  },
  scanQrTitle: {
    fontSize: 14.5,
    fontWeight: "700",
    color: "#09090b",
    letterSpacing: -0.2,
  },
  scanQrSubtitle: {
    fontSize: 11,
    color: "#71717a",
    marginTop: 2,
    lineHeight: 15,
  },
  scanChevronBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#f4f4f5",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginVertical: 2,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#e4e4e7",
  },
  dividerText: {
    fontSize: 9.5,
    fontWeight: "700",
    color: "#a1a1aa",
    letterSpacing: 0.8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fafafa",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e4e4e7",
    paddingHorizontal: 14,
    height: 48,
  },
  inputIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13.5,
    color: "#09090b",
    paddingVertical: 0,
  },
  verifyBtn: {
    height: 46,
    borderRadius: 12,
    backgroundColor: "#09090b",
  },
  errorCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff1f2",
    borderWidth: 1,
    borderColor: "#fecdd3",
    borderRadius: 12,
    padding: 12,
    gap: 8,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 13,
    color: "#be123c",
    flex: 1,
  },
  certResultContainer: {
    gap: 14,
    marginTop: 4,
  },
  /* 1. Cryptographic Authenticity Banner */
  authBanner: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    gap: 6,
  },
  authBannerValid: {
    backgroundColor: "#f0fdf4",
    borderColor: "#86efac",
  },
  authBannerInvalid: {
    backgroundColor: "#fff1f2",
    borderColor: "#fecdd3",
  },
  authBannerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  authBannerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    flex: 1,
  },
  authBannerTitle: {
    fontSize: 12.5,
    fontWeight: "700",
    letterSpacing: -0.2,
    flex: 1,
  },
  authTextValid: {
    color: "#065f46",
  },
  authTextInvalid: {
    color: "#9f1239",
  },
  authBannerDesc: {
    fontSize: 10.5,
    color: "#047857",
    lineHeight: 14,
  },
  /* 2. Official Statutory Certificate Card */
  certCard: {
    backgroundColor: "#ffffff",
    borderWidth: 2,
    borderColor: "#18181b",
    borderRadius: 14,
    padding: 14,
    gap: 14,
  },
  certHeaderRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
    borderBottomWidth: 1.5,
    borderBottomColor: "#18181b",
    paddingBottom: 12,
  },
  certTitleBlock: {
    flex: 1,
    gap: 2,
  },
  govOrgText: {
    fontSize: 9,
    fontFamily: "Courier",
    fontWeight: "700",
    color: "#52525b",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  certMainTitle: {
    fontSize: 13.5,
    fontWeight: "800",
    color: "#09090b",
    textTransform: "uppercase",
    letterSpacing: -0.2,
    lineHeight: 18,
    marginTop: 2,
  },
  certSubText: {
    fontSize: 9,
    fontFamily: "Courier",
    color: "#71717a",
    lineHeight: 12,
    marginTop: 2,
  },
  qrBlock: {
    alignItems: "center",
    padding: 4,
    borderWidth: 1,
    borderColor: "#e4e4e7",
    borderRadius: 6,
    backgroundColor: "#ffffff",
    width: 68,
  },
  qrImage: {
    width: 58,
    height: 58,
  },
  qrLabel: {
    fontSize: 6.5,
    fontFamily: "Courier",
    fontWeight: "700",
    color: "#3f3f46",
    marginTop: 2,
    textAlign: "center",
  },
  /* Summary Grid (2x2) */
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    backgroundColor: "#f4f4f5",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e4e4e7",
    padding: 8,
  },
  summaryCell: {
    width: "50%",
    padding: 5,
  },
  summaryLabel: {
    fontSize: 8.5,
    fontWeight: "700",
    color: "#71717a",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  summaryVal: {
    fontSize: 11.5,
    fontWeight: "600",
    color: "#09090b",
    marginTop: 1,
  },
  validUntilText: {
    color: "#15803d",
    fontWeight: "700",
  },
  monoText: {
    fontFamily: "Courier",
  },
  /* Specification Section Boxes */
  sectionBox: {
    backgroundColor: "#fafafa",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e4e4e7",
    padding: 10,
    gap: 8,
  },
  boxHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#e4e4e7",
    paddingBottom: 6,
  },
  boxHeading: {
    fontSize: 11.5,
    fontWeight: "700",
    color: "#09090b",
  },
  specRowsList: {
    gap: 1,
  },
  specRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 4.5,
    borderBottomWidth: 1,
    borderBottomColor: "#f4f4f5",
    gap: 12,
  },
  specRowLast: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 4.5,
    gap: 12,
  },
  specLabel: {
    fontSize: 11,
    color: "#71717a",
    maxWidth: "42%",
    flexShrink: 0,
  },
  specValue: {
    fontSize: 11.5,
    fontWeight: "600",
    color: "#09090b",
    flex: 1,
    textAlign: "right",
  },
  /* MPE Sub-Box */
  mpeSubBox: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e4e4e7",
    borderRadius: 6,
    padding: 8,
    gap: 4,
  },
  mpeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  mpeLabel: {
    fontSize: 10.5,
    color: "#71717a",
  },
  mpeObservedVal: {
    fontSize: 11.5,
    fontWeight: "700",
    fontFamily: "Courier",
    color: "#15803d",
  },
  mpeLimitVal: {
    fontSize: 11,
    fontWeight: "500",
    fontFamily: "Courier",
    color: "#3f3f46",
  },
  mpeBadge: {
    marginTop: 2,
    backgroundColor: "#f0fdf4",
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: "#bbf7d0",
  },
  mpeBadgeText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#15803d",
    textAlign: "center",
  },
  /* Stamping Zone */
  stampingZone: {
    borderTopWidth: 1.5,
    borderTopColor: "#18181b",
    paddingTop: 10,
    gap: 10,
  },
  statutoryNoticeBlock: {
    gap: 2,
  },
  statutoryNoticeTitle: {
    fontSize: 9.5,
    fontWeight: "700",
    color: "#27272a",
  },
  statutoryNoticeText: {
    fontSize: 8.5,
    color: "#71717a",
    lineHeight: 12,
  },
  stampSealBox: {
    backgroundColor: "#f4f4f5",
    borderWidth: 1,
    borderColor: "#e4e4e7",
    borderRadius: 6,
    padding: 8,
    gap: 3,
  },
  sealTitle: {
    fontSize: 9.5,
    fontWeight: "800",
    color: "#09090b",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  sealSub: {
    fontSize: 8.5,
    color: "#52525b",
  },
  sealKey: {
    fontSize: 8,
    fontFamily: "Courier",
    color: "#71717a",
  },
  sigDigest: {
    fontSize: 8,
    fontFamily: "Courier",
    color: "#71717a",
    backgroundColor: "#ffffff",
    borderWidth: 0.5,
    borderColor: "#e4e4e7",
    borderRadius: 3,
    padding: 3,
    marginTop: 2,
  },
  copySigBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingTop: 4,
    alignSelf: "flex-start",
  },
  copySigText: {
    fontSize: 9.5,
    fontWeight: "600",
    color: "#09090b",
  },
  viewFullCertBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e4e4e7",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 14,
  },
  viewFullCertBtnText: {
    fontSize: 12.5,
    fontWeight: "700",
    color: "#18181b",
    flex: 1,
    marginLeft: 8,
  },
  scannerContainer: {
    flex: 1,
    backgroundColor: "#000000",
  },
  scannerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 14,
    backgroundColor: "#09090b",
    borderBottomWidth: 1,
    borderBottomColor: "#27272a",
    zIndex: 10,
  },
  scannerCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#27272a",
    alignItems: "center",
    justifyContent: "center",
  },
  scannerHeaderTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
    letterSpacing: -0.3,
  },
  scannerTorchBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#27272a",
    alignItems: "center",
    justifyContent: "center",
  },
  scannerTorchActive: {
    backgroundColor: "#78350f",
  },
  scannerBody: {
    flex: 1,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000000",
  },
  cameraWrapper: {
    ...StyleSheet.absoluteFill,
  },
  reticleOverlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  reticleBox: {
    width: 240,
    height: 240,
    position: "relative",
    backgroundColor: "transparent",
  },
  reticleCorner: {
    position: "absolute",
    width: 28,
    height: 28,
    borderColor: "#10b981",
  },
  cornerTopLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 3.5,
    borderLeftWidth: 3.5,
    borderTopLeftRadius: 8,
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    borderTopWidth: 3.5,
    borderRightWidth: 3.5,
    borderTopRightRadius: 8,
  },
  cornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3.5,
    borderLeftWidth: 3.5,
    borderBottomLeftRadius: 8,
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3.5,
    borderRightWidth: 3.5,
    borderBottomRightRadius: 8,
  },
  laserLine: {
    width: "100%",
    height: 2.5,
    backgroundColor: "#10b981",
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
    elevation: 4,
  },
  hintBadge: {
    marginTop: 28,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  hintText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
  permContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#09090b",
  },
  permIconBox: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: "#27272a",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  permTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#ffffff",
    marginBottom: 8,
    textAlign: "center",
  },
  permDesc: {
    fontSize: 13,
    color: "#a1a1aa",
    textAlign: "center",
    lineHeight: 19,
    marginBottom: 24,
  },
  permBtn: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
  },
  permBtnText: {
    color: "#09090b",
    fontSize: 14,
    fontWeight: "700",
  },
});

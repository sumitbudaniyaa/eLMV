import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { api } from "@/lib/api";
import { ApiResponse } from "@sih/shared";
import { formatDate } from "@/lib/utils";
import { downloadCertificatePdf } from "@/lib/certificateUtils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { QRCodeSVG } from "qrcode.react";
import {
  ShieldCheck,
  ShieldAlert,
  Search,
  FileCheck2,
  Camera,
  CameraOff,
  CheckCircle2,
  XCircle,
  Printer,
  Scale,
  UserCheck,
  Upload,
  RefreshCw,
  Loader2,
  ArrowLeft,
  Download,
} from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";

export function PublicVerificationPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const tokenParam = searchParams.get("token") || searchParams.get("cert") || "";
  const [queryInput, setQueryInput] = useState(tokenParam);
  const [activeIdentifier, setActiveIdentifier] = useState(tokenParam);
  const [activeTab, setActiveTab] = useState<"manual" | "camera">("manual");

  // Camera QR Scanner states
  const [cameraStatus, setCameraStatus] = useState<"idle" | "starting" | "scanning" | "error">("idle");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [cameras, setCameras] = useState<Array<{ id: string; label: string }>>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>("");
  const qrScannerRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (tokenParam) {
      setQueryInput(tokenParam);
      setActiveIdentifier(tokenParam);
    }
  }, [tokenParam]);

  const handleScannedData = (decodedText: string) => {
    let cleanToken = decodedText.trim();
    try {
      const url = new URL(decodedText);
      cleanToken = url.searchParams.get("token") || url.searchParams.get("cert") || decodedText;
    } catch {
      // plain certificate number or token string
    }
    setQueryInput(cleanToken);
    setActiveIdentifier(cleanToken);
    setSearchParams({ cert: cleanToken });
    setActiveTab("manual");
  };

  const stopCamera = async () => {
    if (qrScannerRef.current) {
      try {
        if (qrScannerRef.current.isScanning) {
          await qrScannerRef.current.stop();
        }
        qrScannerRef.current.clear();
      } catch (err) {
        console.warn("Scanner stop error:", err);
      }
    }
    setCameraStatus("idle");
  };

  const startCamera = async (overrideDeviceId?: string) => {
    setCameraError(null);
    setCameraStatus("starting");

    try {
      // Clean up previous instance
      if (qrScannerRef.current) {
        try {
          if (qrScannerRef.current.isScanning) {
            await qrScannerRef.current.stop();
          }
          qrScannerRef.current.clear();
        } catch {
          // ignore
        }
      }

      const container = document.getElementById("qr-camera-viewport");
      if (!container) {
        throw new Error("Scanner viewport element not mounted.");
      }

      const html5QrCode = new Html5Qrcode("qr-camera-viewport");
      qrScannerRef.current = html5QrCode;

      // Probe cameras
      let deviceList: Array<{ id: string; label: string }> = [];
      try {
        const detected = await Html5Qrcode.getCameras();
        if (detected && detected.length > 0) {
          deviceList = detected.map((d, idx) => ({
            id: d.id,
            label: d.label || `Camera ${idx + 1}`,
          }));
          setCameras(deviceList);
        }
      } catch (err) {
        console.warn("Camera enumeration error:", err);
      }

      const config = {
        fps: 10,
        qrbox: { width: 220, height: 220 },
      };

      const onScanSuccess = (decodedText: string) => {
        stopCamera();
        handleScannedData(decodedText);
      };

      if (overrideDeviceId) {
        await html5QrCode.start(overrideDeviceId, config, onScanSuccess, () => {});
        setSelectedCameraId(overrideDeviceId);
      } else if (deviceList.length > 0) {
        const backCamera = deviceList.find(
          (c) =>
            c.label.toLowerCase().includes("back") ||
            c.label.toLowerCase().includes("rear") ||
            c.label.toLowerCase().includes("environment")
        );
        const chosenId = backCamera ? backCamera.id : deviceList[0].id;
        await html5QrCode.start(chosenId, config, onScanSuccess, () => {});
        setSelectedCameraId(chosenId);
      } else {
        try {
          await html5QrCode.start({ facingMode: "environment" }, config, onScanSuccess, () => {});
        } catch (envErr) {
          console.log("Environment facing camera unavailable, trying user camera:", envErr);
          await html5QrCode.start({ facingMode: "user" }, config, onScanSuccess, () => {});
        }
      }

      setCameraStatus("scanning");
    } catch (err: any) {
      console.error("Camera failed to start:", err);
      let msg = "Could not access camera.";
      if (err?.name === "NotAllowedError" || err?.message?.includes("Permission") || err?.message?.includes("denied")) {
        msg = "Camera permission was denied. Please allow camera access in browser URL bar or settings.";
      } else if (err?.name === "NotFoundError" || err?.message?.includes("No device")) {
        msg = "No camera was detected on this computer. You can upload a QR image file instead.";
      } else if (err?.name === "NotReadableError") {
        msg = "Camera is currently in use by another app or browser tab.";
      } else if (err?.message) {
        msg = err.message;
      }
      setCameraError(msg);
      setCameraStatus("error");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCameraError(null);
    try {
      let scanner = qrScannerRef.current;
      if (!scanner) {
        scanner = new Html5Qrcode("qr-camera-viewport");
        qrScannerRef.current = scanner;
      }
      if (scanner.isScanning) {
        await scanner.stop();
        setCameraStatus("idle");
      }
      const decodedText = await scanner.scanFile(file, false);
      handleScannedData(decodedText);
    } catch (err) {
      setCameraError("No readable QR code was found in the selected file. Please ensure the QR code is clearly visible.");
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Camera start / stop effect on tab change
  useEffect(() => {
    if (activeTab === "camera") {
      const timer = setTimeout(() => {
        startCamera();
      }, 100);
      return () => {
        clearTimeout(timer);
        stopCamera();
      };
    } else {
      stopCamera();
    }
  }, [activeTab]);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["verification", activeIdentifier],
    queryFn: async () => {
      if (!activeIdentifier) return null;
      const res = await api.get<ApiResponse<any>>(`/verification/verify/${activeIdentifier}`);
      return res.data;
    },
    enabled: !!activeIdentifier,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryInput.trim()) return;
    setActiveIdentifier(queryInput.trim());
    setSearchParams({ cert: queryInput.trim() });
  };

  const result = data?.data;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Mode Switcher & Search Bar — visible only when NOT viewing an active certificate */}
      {!result && (
        <>
          {/* Header Banner */}
          <div className="text-center space-y-2 pt-2 no-print">
            <div className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-muted text-foreground mb-1">
              <ShieldCheck className="h-5 w-5 text-foreground" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              {t("verification.title")}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto">
              {t("verification.subtitle")}
            </p>
          </div>

          {/* Mode Switcher & Search Bar */}
          <Card className="border-border/80 shadow-xs overflow-hidden no-print">
            {/* Tab Switcher */}
            <div className="flex border-b border-border/80 bg-muted/20">
              <button
                type="button"
                onClick={() => setActiveTab("manual")}
                className={`flex-1 py-2.5 px-4 text-xs font-semibold flex items-center justify-center space-x-2 border-b-2 transition-all ${
                  activeTab === "manual"
                    ? "border-foreground text-foreground bg-card"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Search className="h-3.5 w-3.5" />
                <span>{t("verification.tabManual")}</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("camera")}
                className={`flex-1 py-2.5 px-4 text-xs font-semibold flex items-center justify-center space-x-2 border-b-2 transition-all ${
                  activeTab === "camera"
                    ? "border-foreground text-foreground bg-card"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Camera className="h-3.5 w-3.5" />
                <span>{t("verification.tabCamera")}</span>
              </button>
            </div>

            <CardContent className="p-4 sm:p-6">
              {activeTab === "manual" ? (
                <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2.5">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={queryInput}
                      onChange={(e) => setQueryInput(e.target.value)}
                      placeholder={t("verification.searchPlaceholder")}
                      className="pl-9 h-9 text-xs font-mono"
                    />
                  </div>
                  <Button type="submit" size="default" className="h-9 text-xs px-5 shrink-0">
                    <ShieldCheck className="h-3.5 w-3.5 mr-1.5" />
                    {t("verification.searchBtn")}
                  </Button>
                </form>
              ) : (
                <div className="space-y-4">
                  {/* Hidden file input for uploading QR code images */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileUpload}
                  />

                  <div className="text-center space-y-1">
                    <p className="text-xs text-muted-foreground">
                      {t("verification.cameraDesc")}
                    </p>
                  </div>

                  {/* Viewfinder Container */}
                  <div className="relative border border-border/80 rounded-xl bg-black/90 dark:bg-black/60 max-w-sm mx-auto overflow-hidden shadow-inner flex flex-col items-center justify-center min-h-[280px]">
                    {/* Real Video Mount Target */}
                    <div id="qr-camera-viewport" className="w-full h-full min-h-[280px] flex items-center justify-center" />

                    {/* Scanner Overlay UI */}
                    {cameraStatus === "starting" && (
                      <div className="absolute inset-0 bg-background/80 backdrop-blur-xs flex flex-col items-center justify-center space-y-2.5 z-10">
                        <Loader2 className="h-6 w-6 animate-spin text-foreground" />
                        <span className="text-xs font-medium text-foreground">{t("verification.startingCamera")}</span>
                      </div>
                    )}

                    {cameraStatus === "scanning" && (
                      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center z-10">
                        {/* Reticle Target Frame */}
                        <div className="relative w-48 h-48 sm:w-56 sm:h-56 border-2 border-dashed border-white/60 rounded-xl flex items-center justify-center shadow-lg">
                          {/* 4 Corner Markers */}
                          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-emerald-400 -mt-0.5 -ml-0.5" />
                          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-emerald-400 -mt-0.5 -mr-0.5" />
                          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-emerald-400 -mb-0.5 -ml-0.5" />
                          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-emerald-400 -mb-0.5 -mr-0.5" />
                        </div>
                        <span className="mt-3 text-[11px] font-medium text-white/90 bg-black/60 px-3 py-1 rounded-full backdrop-blur-xs">
                          {t("verification.scanningHint")}
                        </span>
                      </div>
                    )}

                    {cameraStatus === "error" && (
                      <div className="absolute inset-0 bg-card p-5 flex flex-col items-center justify-center text-center space-y-3 z-10">
                        <div className="h-9 w-9 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
                          <CameraOff className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-destructive">{t("verification.cameraErrorTitle")}</h4>
                          <p className="text-[11px] text-muted-foreground mt-1 max-w-xs">
                            {cameraError || t("verification.cameraErrorDesc")}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2 justify-center pt-1">
                          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => startCamera(selectedCameraId)}>
                            <RefreshCw className="h-3 w-3 mr-1.5" />
                            Retry
                          </Button>
                          <Button size="sm" className="h-7 text-xs" onClick={() => fileInputRef.current?.click()}>
                            <Upload className="h-3 w-3 mr-1.5" />
                            {t("verification.uploadQr")}
                          </Button>
                        </div>
                      </div>
                    )}

                    {cameraStatus === "idle" && (
                      <div className="absolute inset-0 bg-card p-5 flex flex-col items-center justify-center text-center space-y-3 z-10">
                        <div className="h-10 w-10 rounded-full bg-muted text-muted-foreground flex items-center justify-center">
                          <Camera className="h-5 w-5" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-xs font-semibold text-foreground">Camera Scanner Inactive</h4>
                          <p className="text-[11px] text-muted-foreground max-w-xs">
                            Start your webcam or upload a certificate QR code image.
                          </p>
                        </div>
                        <div className="flex gap-2 pt-1">
                          <Button size="sm" className="h-8 text-xs font-semibold" onClick={() => startCamera()}>
                            <Camera className="h-3.5 w-3.5 mr-1.5" />
                            {t("verification.startCamera")}
                          </Button>
                          <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => fileInputRef.current?.click()}>
                            <Upload className="h-3.5 w-3.5 mr-1.5" />
                            {t("verification.uploadQr")}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Controls Toolbar beneath viewfinder */}
                  <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                    {cameraStatus === "scanning" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs text-muted-foreground hover:text-foreground"
                        onClick={stopCamera}
                      >
                        <CameraOff className="h-3.5 w-3.5 mr-1.5" />
                        {t("verification.stopCamera")}
                      </Button>
                    )}

                    {cameras.length > 1 && cameraStatus === "scanning" && (
                      <select
                        value={selectedCameraId}
                        onChange={(e) => startCamera(e.target.value)}
                        className="h-8 rounded-md border border-input bg-transparent px-2 text-xs text-foreground"
                      >
                        {cameras.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                      {t("verification.uploadQr")}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Loading State */}
      {isLoading && (
        <Card className="border-border/80 p-6 space-y-4 no-print">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-48 w-full" />
        </Card>
      )}

      {/* Error / Not Found State */}
      {isError && (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-6 text-center space-y-2 no-print">
          <ShieldAlert className="h-8 w-8 text-destructive mx-auto" />
          <h3 className="text-sm font-bold text-destructive">Statutory Record Not Found</h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            {(error as any)?.response?.data?.error?.message ||
              "No verified certificate or instrument could be identified with the provided credentials. Check the certificate number or QR code token."}
          </p>
          <div className="pt-2">
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => {
                setActiveIdentifier("");
                setQueryInput("");
                setSearchParams({});
              }}
            >
              <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
              Try Another Search
            </Button>
          </div>
        </div>
      )}

      {/* Validated Certificate Presentation */}
      {result && (
        <div className="space-y-4 animate-in fade-in-0 duration-200">
          {/* Top Control Bar — Hidden in Print */}
          <div className="no-print flex items-center justify-between gap-2.5 pb-1">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground hover:text-foreground h-8 justify-start -ml-1 sm:-ml-2 self-start"
              onClick={() => {
                setActiveIdentifier("");
                setQueryInput("");
                setSearchParams({});
              }}
            >
              <ArrowLeft className="h-3.5 w-3.5 mr-1.5 shrink-0" />
              <span className="truncate">{t("verification.backToSearch", { defaultValue: "Verify Another Certificate" })}</span>
            </Button>
          </div>

          {/* Cryptographic Authenticity Banner — Hidden in Print */}
          <div
            className={`no-print rounded-xl border p-3.5 sm:p-4 ${
              result.isSignatureValid && result.verificationStatus === "VALID_AND_ACTIVE"
                ? "border-emerald-300 bg-emerald-50/70 text-emerald-950 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200"
                : result.isSignatureValid
                ? "border-amber-300 bg-amber-50/70 text-amber-950 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200"
                : "border-rose-300 bg-rose-50/70 text-rose-950 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200"
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-2.5">
                {result.isSignatureValid ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                ) : (
                  <XCircle className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0" />
                )}
                <div>
                  <h3 className="text-xs sm:text-sm font-bold tracking-tight">
                    {result.isSignatureValid
                      ? "Cryptographic Signature Authenticated & Valid"
                      : "CRITICAL ALERT: Digital Signature Forged or Tampered"}
                  </h3>
                  {!result.isSignatureValid && (
                    <p className="text-[11px] opacity-90 mt-0.5 leading-relaxed">
                      The cryptographic digest of this certificate does NOT match the official public key. Do not accept this certificate.
                    </p>
                  )}
                </div>
              </div>

              <Badge
                variant={
                  result.verificationStatus === "VALID_AND_ACTIVE"
                    ? "certified"
                    : result.verificationStatus === "EXPIRED"
                    ? "expired"
                    : "rejected"
                }
                size="sm"
                className="self-start sm:self-auto uppercase tracking-wide font-bold"
              >
                {result.verificationStatus.replace(/_/g, " ")}
              </Badge>
            </div>
          </div>

          {/* Official Statutory Certificate Card — Rendered strictly for display and single-page print */}
          <div
            id="certificate-print-card"
            className="rounded-xl border-2 border-zinc-900 dark:border-zinc-700 bg-white dark:bg-zinc-950 p-6 sm:p-7 space-y-4 shadow-sm relative text-zinc-900 dark:text-zinc-100"
          >
            {/* Header of Certificate with QR Code on Top Right */}
            <div className="flex items-start justify-between pb-3 border-b-2 border-zinc-900/80 dark:border-zinc-700 gap-4">
              <div className="space-y-1 min-w-0 flex-1">
                <div className="inline-flex items-center space-x-2 text-[10px] font-mono tracking-widest uppercase text-zinc-600 dark:text-zinc-400 font-bold">
                  <span>GOVERNMENT OF INDIA</span>
                  <span>•</span>
                  <span>DEPARTMENT OF CONSUMER AFFAIRS</span>
                </div>
                <h2 className="text-base sm:text-lg font-black tracking-tight uppercase text-zinc-900 dark:text-zinc-50">
                  Certificate of Verification of Weights & Measures
                </h2>
                <p className="text-[10.5px] text-zinc-600 dark:text-zinc-400 font-mono">
                  [Issued under Section 24 of the Legal Metrology Act, 2009 & Rule 27 of General Rules, 2011]
                </p>
              </div>

              {/* Official Statutory QR Code */}
              <div className="flex flex-col items-center justify-center p-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white shrink-0 shadow-2xs">
                <QRCodeSVG
                  value={`${window.location.origin}/verify?cert=${result.certificate.certificateNumber}`}
                  size={96}
                  level="H"
                  includeMargin={false}
                />
                <span className="text-[8.5px] font-mono font-bold text-zinc-700 mt-1 uppercase tracking-tighter">
                  Scan to Verify
                </span>
              </div>
            </div>

            {/* Quick Summary Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs">
              <div>
                <span className="text-[9.5px] text-zinc-500 uppercase font-bold block">Certificate No.</span>
                <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100 text-xs">{result.certificate.certificateNumber}</span>
              </div>
              <div>
                <span className="text-[9.5px] text-zinc-500 uppercase font-bold block">Verified On</span>
                <span className="font-medium text-zinc-900 dark:text-zinc-100">{formatDate(result.certificate.issuedAt)}</span>
              </div>
              <div>
                <span className="text-[9.5px] text-zinc-500 uppercase font-bold block">Valid Until</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400">{formatDate(result.certificate.validUntil)}</span>
              </div>
              <div>
                <span className="text-[9.5px] text-zinc-500 uppercase font-bold block">Affixed Seal No.</span>
                <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">{result.inspection?.sealNumber || "STAMPED"}</span>
              </div>
            </div>

            {/* Structured Specifications Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Instrument Details */}
              <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-3.5 space-y-2.5 bg-zinc-50/50 dark:bg-zinc-900/40">
                <div className="flex items-center space-x-2 text-xs font-bold text-zinc-900 dark:text-zinc-100 border-b border-zinc-200 dark:border-zinc-800 pb-1.5">
                  <Scale className="h-3.5 w-3.5 text-zinc-500" />
                  <span>Verified Instrument Specifications</span>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between py-0.5 border-b border-zinc-200/60 dark:border-zinc-800">
                    <span className="text-zinc-500">Serial Number:</span>
                    <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">{result.instrument.serialNumber}</span>
                  </div>
                  <div className="flex justify-between py-0.5 border-b border-zinc-200/60 dark:border-zinc-800">
                    <span className="text-zinc-500">Instrument Type:</span>
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">{result.instrument.type.replace(/_/g, " ")}</span>
                  </div>
                  <div className="flex justify-between py-0.5 border-b border-zinc-200/60 dark:border-zinc-800">
                    <span className="text-zinc-500">Make & Model:</span>
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">{result.instrument.make} — {result.instrument.model}</span>
                  </div>
                  <div className="flex justify-between py-0.5 border-b border-zinc-200/60 dark:border-zinc-800">
                    <span className="text-zinc-500">Capacity / Max:</span>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">{result.instrument.capacity} {result.instrument.unit}</span>
                  </div>
                  <div className="flex justify-between py-0.5 border-b border-zinc-200/60 dark:border-zinc-800">
                    <span className="text-zinc-500">Accuracy Class:</span>
                    <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">{result.instrument.accuracyClass}</span>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span className="text-zinc-500">Location of Use:</span>
                    <span className="text-zinc-700 dark:text-zinc-300 text-right">{result.instrument.district}, {result.instrument.state}</span>
                  </div>
                </div>
              </div>

              {/* Physical Observation & MPE Test Gauge */}
              <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-3.5 space-y-2.5 bg-zinc-50/50 dark:bg-zinc-900/40">
                <div className="flex items-center space-x-2 text-xs font-bold text-zinc-900 dark:text-zinc-100 border-b border-zinc-200 dark:border-zinc-800 pb-1.5">
                  <FileCheck2 className="h-3.5 w-3.5 text-zinc-500" />
                  <span>Physical Test & Statutory Evaluation</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-zinc-500">Observed Test Error:</span>
                      <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                        {result.inspection?.actualErrorObserved} {result.instrument.unit}
                      </span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-zinc-500">Permissible MPE Limit:</span>
                      <span className="font-mono font-medium text-zinc-800 dark:text-zinc-200">
                        ±{result.inspection?.maxPermissibleError} {result.instrument.unit}
                      </span>
                    </div>
                    <span className="text-[9.5px] text-emerald-700 dark:text-emerald-400 font-bold block text-right">
                      PASS: Error within statutory limits (Legal Metrology Rules, 2011)
                    </span>
                  </div>

                  <div className="space-y-1 pt-0.5">
                    <div className="flex justify-between py-0.5 border-b border-zinc-200/60 dark:border-zinc-800">
                      <span className="text-zinc-500">Verified By Officer:</span>
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center">
                        <UserCheck className="h-3 w-3 mr-1 text-zinc-500" />
                        {result.inspection?.officer?.name || "Statutory Inspector"}
                      </span>
                    </div>
                    <div className="flex justify-between py-0.5">
                      <span className="text-zinc-500">Applicant / Owner:</span>
                      <span className="text-zinc-700 dark:text-zinc-300 font-medium">
                        {result.applicant?.stakeholderProfile?.businessName || result.applicant?.name || "Registered Commercial Trader"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Official Legal Endorsement & Stamping Zone */}
            <div className="border-t-2 border-zinc-900/80 dark:border-zinc-700 pt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[10px] text-zinc-600 dark:text-zinc-400">
              <div className="max-w-md space-y-0.5">
                <p className="font-semibold text-zinc-800 dark:text-zinc-200">Statutory Notice under Section 24:</p>
                <p className="leading-tight">
                  This digital certificate confirms that the weighing/measuring instrument specified above has been verified and stamped per statutory tolerances. Any alteration, seal tampering, or removal of stamp renders this certificate void and constitutes an offense under the Legal Metrology Act, 2009.
                </p>
              </div>

              <div className="text-right shrink-0 font-mono text-[9px] border border-zinc-300 dark:border-zinc-700 p-2 rounded bg-zinc-50 dark:bg-zinc-900">
                <div className="font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">Digitally Verified & Stamped</div>
                <div>Directorate of Legal Metrology</div>
                <div>Security Key: {result.cryptographicDetails.keyVersion}</div>
              </div>
            </div>
          </div>

          {/* Bottom Action Bar — Strictly Outside Certificate Card & Hidden in Print */}
          <div className="no-print flex flex-wrap items-center justify-end gap-2 pt-1">
            <Button
              variant="outline"
              size="sm"
              disabled={isDownloading}
              onClick={async () => {
                try {
                  setIsDownloading(true);
                  await downloadCertificatePdf(result.certificate.certificateNumber);
                } catch (err) {
                  console.error("PDF download failed:", err);
                  alert("Failed to download PDF. Please try again.");
                } finally {
                  setIsDownloading(false);
                }
              }}
              className="h-8 text-xs font-medium w-full sm:w-auto justify-center shadow-2xs"
            >
              {isDownloading ? (
                <Loader2 className="h-3.5 w-3.5 mr-1.5 shrink-0 animate-spin" />
              ) : (
                <Download className="h-3.5 w-3.5 mr-1.5 shrink-0" />
              )}
              <span>
                {isDownloading
                  ? "Downloading..."
                  : t("verification.downloadPdf", { defaultValue: "Download PDF" })}
              </span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.print()}
              className="h-8 text-xs font-medium w-full sm:w-auto justify-center shadow-2xs"
            >
              <Printer className="h-3.5 w-3.5 mr-1.5 shrink-0" />
              <span>{t("verification.printCertificate", { defaultValue: "Print Certificate" })}</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

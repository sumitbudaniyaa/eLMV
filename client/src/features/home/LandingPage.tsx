import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  ShieldCheck,
  Scale,
  FileCheck2,
  BarChart3,
  Search,
  ArrowRight,
  Lock,
  CheckCircle2,
  Cpu,
  Layers,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { CertificateDialog } from "@/components/common/CertificateDialog";

export function LandingPage() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const [quickSearch, setQuickSearch] = useState("");
  const [viewCertNumber, setViewCertNumber] = useState<string | null>(null);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickSearch.trim()) return;
    setViewCertNumber(quickSearch.trim());
  };

  return (
    <div className="space-y-8 pb-8">
      {/* Hero Section */}
      <div className="rounded-xl border border-border bg-card p-6 sm:p-10 shadow-xs">
        <div className="max-w-3xl space-y-4">
          <Badge variant="outline" className="text-xs font-normal text-muted-foreground">
            Official Portal • Legal Metrology Act, 2009
          </Badge>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground leading-tight">
            Online Verification &amp; Certification System for Weighing &amp; Measuring Instruments
          </h1>

          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Unified statutory platform under India's Legal Metrology Act, 2009.
            Enables instrument registration, scheduled site visits, physical observation test recording,
            digital certificate issuance (ECDSA P-256), and public cryptographic verification.
          </p>

          {/* Quick Certificate Search in Hero */}
          <form
            onSubmit={handleSearchSubmit}
            className="flex flex-col sm:flex-row items-center gap-2 pt-2 max-w-xl"
          >
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Enter Certificate No. (e.g. LM-KA-2026-0000001) or Token..."
                value={quickSearch}
                onChange={(e) => setQuickSearch(e.target.value)}
                className="pl-9 h-9 text-xs font-mono bg-background"
              />
            </div>
            <Button type="submit" size="default" className="w-full sm:w-auto h-9 text-xs">
              <ShieldCheck className="h-3.5 w-3.5 mr-1.5" />
              Verify Authenticity
            </Button>
          </form>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-2.5 pt-2">
            {isAuthenticated ? (
              <Link to="/dashboard">
                <Button size="sm" className="h-8 text-xs font-semibold">
                  Go to Dashboard
                  <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                </Button>
              </Link>
            ) : (
              <Link to="/login">
                <Button size="sm" className="h-8 text-xs font-semibold">
                  Sign In / Access Portal
                  <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                </Button>
              </Link>
            )}
            <Link to="/instruments">
              <Button variant="outline" size="sm" className="h-8 text-xs">
                <Scale className="h-3.5 w-3.5 mr-1.5" />
                {t("nav.instruments")}
              </Button>
            </Link>
            <Link to="/applications">
              <Button variant="outline" size="sm" className="h-8 text-xs">
                <FileCheck2 className="h-3.5 w-3.5 mr-1.5" />
                {t("nav.applications")}
              </Button>
            </Link>
            <Link to="/analytics">
              <Button variant="outline" size="sm" className="h-8 text-xs">
                <BarChart3 className="h-3.5 w-3.5 mr-1.5" />
                {t("nav.analytics")}
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 4 Architecture Pillars */}
      {/* 4 Architecture Pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-border shadow-xs bg-card">
          <CardContent className="p-5 space-y-2">
            <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center text-muted-foreground">
              <Lock className="h-4 w-4" />
            </div>
            <h3 className="text-xs font-semibold text-foreground">
              Digital PKI Stamping
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Standard ECDSA P-256 signatures embedded in Level-H QR codes and digitally stamped verification certificates.
            </p>
          </CardContent>
        </Card>

        <Card className="border border-border shadow-xs bg-card">
          <CardContent className="p-5 space-y-2">
            <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center text-muted-foreground">
              <Scale className="h-4 w-4" />
            </div>
            <h3 className="text-xs font-semibold text-foreground">
              Tolerance Checking
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Automated Maximum Permissible Error (MPE) checks per the Seventh Schedule of the Legal Metrology Rules, 2011.
            </p>
          </CardContent>
        </Card>

        <Card className="border border-border shadow-xs bg-card">
          <CardContent className="p-5 space-y-2">
            <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center text-muted-foreground">
              <BarChart3 className="h-4 w-4" />
            </div>
            <h3 className="text-xs font-semibold text-foreground">
              Operational Reporting
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Real-time aggregation metrics for turnaround times, pendency aging, and inspector workloads.
            </p>
          </CardContent>
        </Card>

        <Card className="border border-border shadow-xs bg-card">
          <CardContent className="p-5 space-y-2">
            <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center text-muted-foreground">
              <Layers className="h-4 w-4" />
            </div>
            <h3 className="text-xs font-semibold text-foreground">
              Section 24 Audit Log
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Complete audit ledger recording state transitions, inspection observations, seal numbers, and officer actions.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Statutory Specification Specs Strip */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center sm:text-left">
          <div className="space-y-1">
            <span className="text-[11px] uppercase font-medium text-muted-foreground block">
              Signature Algorithm
            </span>
            <span className="text-xs font-medium text-foreground flex items-center justify-center sm:justify-start">
              <Cpu className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
              ECDSA NIST P-256
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] uppercase font-medium text-muted-foreground block">
              Key Protection
            </span>
            <span className="text-xs font-medium text-foreground flex items-center justify-center sm:justify-start">
              <CheckCircle2 className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
              AES-256-GCM
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] uppercase font-medium text-muted-foreground block">
              Governing Law
            </span>
            <span className="text-xs font-medium text-foreground flex items-center justify-center sm:justify-start">
              Act No. 1 of 2010 (Section 24)
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] uppercase font-medium text-muted-foreground block">
              QR Code Matrix
            </span>
            <span className="text-xs font-medium text-foreground flex items-center justify-center sm:justify-start">
              ISO/IEC 18004 Level-H
            </span>
          </div>
        </div>
      </div>

      {/* Statutory Certificate Viewer Modal */}
      <CertificateDialog
        certificateNumber={viewCertNumber}
        open={!!viewCertNumber}
        onOpenChange={(open) => !open && setViewCertNumber(null)}
      />
    </div>
  );
}

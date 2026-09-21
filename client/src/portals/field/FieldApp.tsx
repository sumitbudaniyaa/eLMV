import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Role } from "@sih/shared";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { FieldAuthLayout } from "./layout/FieldAuthLayout";
import { AppShell } from "@/components/layout/AppShell";
import { FieldLoginPage } from "./pages/FieldLoginPage";
import { PublicVerificationPage } from "@/features/verification/PublicVerificationPage";
import { DashboardPage } from "@/features/dashboard/DashboardPage";
import { ApplicationListPage } from "@/features/applications/ApplicationListPage";
import { InstrumentListPage } from "@/features/instruments/InstrumentListPage";
import { FieldRosterPage } from "./pages/FieldRosterPage";
import { SettingsPage } from "@/features/settings/SettingsPage";
import { WebsitePoliciesPage } from "@/features/public/WebsitePoliciesPage";
import { TermsConditionsPage } from "@/features/public/TermsConditionsPage";
import { HelpFaqPage } from "@/features/public/HelpFaqPage";
import { ContactUsPage } from "@/features/public/ContactUsPage";

function FieldRoot() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null;
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;

  if (user.role === Role.ADMIN || user.role === Role.GATC_ADMIN) {
    return <Navigate to="/dashboard" replace />;
  }

  if (user.role !== Role.LMO && user.role !== Role.GATC_INSPECTOR) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Navigate to="/roster" replace />;
}

export function FieldApp() {
  return (
    <Routes>
      {/* Root redirect */}
      <Route path="/" element={<FieldRoot />} />
      <Route path="/field" element={<FieldRoot />} />

      {/* Public & Auth Routes */}
      <Route element={<FieldAuthLayout />}>
        <Route path="/login" element={<FieldLoginPage />} />
        <Route path="/field/login" element={<FieldLoginPage />} />
        <Route path="/verify" element={<PublicVerificationPage />} />
      </Route>

      {/* Public Statutory Information & Citizen Service Pages */}
      <Route path="/policies" element={<WebsitePoliciesPage />} />
      <Route path="/website-policies" element={<WebsitePoliciesPage />} />
      <Route path="/privacy" element={<WebsitePoliciesPage />} />
      <Route path="/terms" element={<TermsConditionsPage />} />
      <Route path="/terms-and-conditions" element={<TermsConditionsPage />} />
      <Route path="/help" element={<HelpFaqPage />} />
      <Route path="/faq" element={<HelpFaqPage />} />
      <Route path="/faqs" element={<HelpFaqPage />} />
      <Route path="/contact" element={<ContactUsPage />} />
      <Route path="/contact-us" element={<ContactUsPage />} />

      {/* Authenticated Field Inspection Suite */}
      <Route
        element={
          <ProtectedRoute allowedRoles={[Role.LMO, Role.GATC_INSPECTOR, Role.ADMIN]}>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route path="/roster" element={<FieldRosterPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/applications" element={<ApplicationListPage />} />
        <Route path="/instruments" element={<InstrumentListPage />} />
        <Route path="/verify" element={<PublicVerificationPage />} />
        <Route path="/settings" element={<SettingsPage />} />

        {/* Backwards compatibility with /field/* prefix */}
        <Route path="/field/roster" element={<Navigate to="/roster" replace />} />
        <Route path="/field/verify" element={<Navigate to="/verify" replace />} />
        <Route path="/field/settings" element={<Navigate to="/settings" replace />} />
      </Route>

      {/* Catch-all fallback */}
      <Route path="*" element={<FieldRoot />} />
    </Routes>
  );
}

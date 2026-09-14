import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Role } from "@sih/shared";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { AdminAuthLayout } from "./layout/AdminAuthLayout";
import { AppShell } from "@/components/layout/AppShell";
import { AdminLoginPage } from "./pages/AdminLoginPage";
import { PublicVerificationPage } from "@/features/verification/PublicVerificationPage";
import { StateAdminDashboardPage } from "./pages/StateAdminDashboardPage";
import { OfficerManagementPage } from "./pages/OfficerManagementPage";
import { GatcAgencyManagementPage } from "./pages/GatcAgencyManagementPage";
import { GatcDashboardPage } from "./pages/GatcDashboardPage";
import { GatcStaffPage } from "./pages/GatcStaffPage";
import { AdminApplicationsPage } from "./pages/AdminApplicationsPage";
import { AdminInstrumentsPage } from "./pages/AdminInstrumentsPage";
import { AdminAnalyticsPage } from "./pages/AdminAnalyticsPage";
import { AdminAuditPage } from "./pages/AdminAuditPage";
import { SettingsPage } from "@/features/settings/SettingsPage";
import { WebsitePoliciesPage } from "@/features/public/WebsitePoliciesPage";
import { TermsConditionsPage } from "@/features/public/TermsConditionsPage";
import { HelpFaqPage } from "@/features/public/HelpFaqPage";
import { ContactUsPage } from "@/features/public/ContactUsPage";

function AdminRoot() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  React.useEffect(() => {
    if (isAuthenticated && user && user.role !== Role.ADMIN && user.role !== Role.GATC_ADMIN) {
      logout();
    }
  }, [isAuthenticated, user, logout]);

  if (isLoading) return null;
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;

  if (user.role !== Role.ADMIN && user.role !== Role.GATC_ADMIN) {
    return (
      <Navigate
        to="/login"
        state={{ authError: "Invalid credentials. Please try again." }}
        replace
      />
    );
  }

  // Redirect based on administrative persona
  if (user.role === Role.GATC_ADMIN) {
    return <Navigate to="/agency" replace />;
  }
  return <Navigate to="/dashboard" replace />;
}

export function AdminApp() {
  return (
    <Routes>
      {/* Root redirect */}
      <Route path="/" element={<AdminRoot />} />

      {/* Public & Auth Routes */}
      <Route element={<AdminAuthLayout />}>
        <Route path="/login" element={<AdminLoginPage />} />
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

      {/* Authenticated Regulatory & Agency Shell */}
      <Route
        element={
          <ProtectedRoute allowedRoles={[Role.ADMIN, Role.GATC_ADMIN]}>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={[Role.ADMIN]}>
              <StateAdminDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/officers"
          element={
            <ProtectedRoute allowedRoles={[Role.ADMIN]}>
              <OfficerManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/agencies"
          element={
            <ProtectedRoute allowedRoles={[Role.ADMIN]}>
              <GatcAgencyManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/agency"
          element={
            <ProtectedRoute allowedRoles={[Role.GATC_ADMIN]}>
              <GatcDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inspectors"
          element={
            <ProtectedRoute allowedRoles={[Role.GATC_ADMIN]}>
              <GatcStaffPage />
            </ProtectedRoute>
          }
        />
        <Route path="/applications" element={<AdminApplicationsPage />} />
        <Route path="/instruments" element={<AdminInstrumentsPage />} />
        <Route path="/analytics" element={<AdminAnalyticsPage />} />
        <Route
          path="/audit"
          element={
            <ProtectedRoute allowedRoles={[Role.ADMIN]}>
              <AdminAuditPage />
            </ProtectedRoute>
          }
        />
        <Route path="/settings" element={<SettingsPage />} />

        {/* Backwards compatibility with /admin/* prefixes */}
        <Route path="/admin/dashboard" element={<Navigate to="/dashboard" replace />} />
        <Route path="/admin/officers" element={<Navigate to="/officers" replace />} />
        <Route path="/admin/agencies" element={<Navigate to="/agencies" replace />} />
        <Route path="/admin/agency" element={<Navigate to="/agency" replace />} />
        <Route path="/admin/inspectors" element={<Navigate to="/inspectors" replace />} />
        <Route path="/admin/applications" element={<Navigate to="/applications" replace />} />
        <Route path="/admin/instruments" element={<Navigate to="/instruments" replace />} />
        <Route path="/admin/analytics" element={<Navigate to="/analytics" replace />} />
        <Route path="/admin/audit" element={<Navigate to="/audit" replace />} />
        <Route path="/admin/settings" element={<Navigate to="/settings" replace />} />
      </Route>

      {/* Catch-all fallback */}
      <Route path="*" element={<AdminRoot />} />
    </Routes>
  );
}


import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Role } from "@sih/shared";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { AppShell } from "@/components/layout/AppShell";
import { LoginPage } from "@/features/auth/LoginPage";
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
import { WrongPortalNotice } from "@/components/common/WrongPortalNotice";

function AdminRoot() {
  const { user, isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;

  // Cross-portal guard: if a Consumer or Field Officer logs in on Admin Portal
  if (user.role === Role.CONSUMER) {
    return (
      <WrongPortalNotice
        currentPortal="admin"
        requiredPortal="consumer"
        portalTitle="Consumer & Commercial Trader Portal"
      />
    );
  }

  if (user.role === Role.LMO || user.role === Role.GATC_INSPECTOR) {
    return (
      <WrongPortalNotice
        currentPortal="admin"
        requiredPortal="field"
        portalTitle="Field Inspection Suite"
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
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/verify" element={<PublicVerificationPage />} />
      </Route>

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


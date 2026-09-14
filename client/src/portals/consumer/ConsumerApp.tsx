import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Role } from "@sih/shared";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { ConsumerLayout } from "./ConsumerLayout";
import { LoginPage } from "@/features/auth/LoginPage";
import { RegisterPage } from "@/features/auth/RegisterPage";
import { PublicVerificationPage } from "@/features/verification/PublicVerificationPage";
import { DashboardPage } from "@/features/dashboard/DashboardPage";
import { InstrumentListPage } from "@/features/instruments/InstrumentListPage";
import { ApplicationListPage } from "@/features/applications/ApplicationListPage";
import { SettingsPage } from "@/features/settings/SettingsPage";
import { WrongPortalNotice } from "@/components/common/WrongPortalNotice";
import { ConsumerLandingPage } from "./pages/ConsumerLandingPage";

function ConsumerWorkspaceGuard({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;

  // Cross-portal guard: if an Admin or LMO logs in on the Consumer Portal
  if (user.role === Role.ADMIN || user.role === Role.GATC_ADMIN) {
    return (
      <WrongPortalNotice
        currentPortal="consumer"
        requiredPortal="admin"
        portalTitle="Regulatory & Agency Admin Portal"
      />
    );
  }

  if (user.role === Role.LMO || user.role === Role.GATC_INSPECTOR) {
    return (
      <WrongPortalNotice
        currentPortal="consumer"
        requiredPortal="field"
        portalTitle="Field Inspection Suite"
      />
    );
  }

  return <>{children}</>;
}

export function ConsumerApp() {
  return (
    <Routes>
      {/* Official Government Landing Page */}
      <Route path="/" element={<ConsumerLandingPage />} />
      <Route path="/home" element={<ConsumerLandingPage />} />

      {/* Public Auth & Verification Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify" element={<PublicVerificationPage />} />
      </Route>

      {/* Authenticated Trader Workspace with Government ConsumerLayout & Full i18n */}
      <Route
        element={
          <ConsumerWorkspaceGuard>
            <ProtectedRoute allowedRoles={[Role.CONSUMER]}>
              <ConsumerLayout />
            </ProtectedRoute>
          </ConsumerWorkspaceGuard>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/instruments" element={<InstrumentListPage />} />
        <Route path="/applications" element={<ApplicationListPage />} />
        <Route path="/settings" element={<SettingsPage />} />

        {/* Backwards compatibility if user navigates with /consumer/* prefix */}
        <Route path="/consumer/dashboard" element={<Navigate to="/dashboard" replace />} />
        <Route path="/consumer/instruments" element={<Navigate to="/instruments" replace />} />
        <Route path="/consumer/applications" element={<Navigate to="/applications" replace />} />
        <Route path="/consumer/settings" element={<Navigate to="/settings" replace />} />
      </Route>

      {/* Catch-all fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

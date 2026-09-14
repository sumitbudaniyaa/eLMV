import React from "react";
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

function FieldRoot() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  React.useEffect(() => {
    if (isAuthenticated && user && user.role !== Role.LMO && user.role !== Role.GATC_INSPECTOR) {
      logout();
    }
  }, [isAuthenticated, user, logout]);

  if (isLoading) return null;
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;

  if (user.role !== Role.LMO && user.role !== Role.GATC_INSPECTOR) {
    return (
      <Navigate
        to="/login"
        state={{ authError: "Invalid credentials. Please try again." }}
        replace
      />
    );
  }

  return <Navigate to="/roster" replace />;
}

export function FieldApp() {
  return (
    <Routes>
      {/* Root redirect */}
      <Route path="/" element={<FieldRoot />} />

      {/* Public & Auth Routes */}
      <Route element={<FieldAuthLayout />}>
        <Route path="/login" element={<FieldLoginPage />} />
        <Route path="/verify" element={<PublicVerificationPage />} />
      </Route>

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

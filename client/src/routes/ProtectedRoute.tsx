import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Role } from "@sih/shared";

import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const location = useLocation();

  React.useEffect(() => {
    if (isAuthenticated && user && allowedRoles && !allowedRoles.includes(user.role as Role)) {
      logout();
    }
  }, [isAuthenticated, user, allowedRoles, logout]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <div className="space-y-3 text-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mx-auto" />
          <p className="text-xs text-muted-foreground">Loading session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role as Role)) {
    return (
      <Navigate
        to="/login"
        state={{ authError: "Invalid credentials. Please try again." }}
        replace
      />
    );
  }

  return <>{children}</>;
}


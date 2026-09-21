import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Role } from "@sih/shared";
import { useAuth } from "@/context/AuthContext";
import { getActivePortal } from "@/lib/subdomain";
import { ConsumerApp } from "@/portals/consumer/ConsumerApp";
import { AdminApp } from "@/portals/admin/AdminApp";
import { FieldApp } from "@/portals/field/FieldApp";

export default function App() {
  const portal = getActivePortal();
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    let title = "eLMV";

    // 1. Role-based determination (highest priority when authenticated)
    if (user?.role === Role.ADMIN || user?.role === Role.GATC_ADMIN) {
      title = "eLMV | admin";
    } else if (user?.role === Role.LMO || user?.role === Role.GATC_INSPECTOR) {
      title = "eLMV | field";
    } else if (user?.role === Role.CONSUMER) {
      title = "eLMV";
    } else {
      // 2. Portal & Route-based determination (for unauthenticated pages or portal entry points)
      const path = location.pathname.toLowerCase();
      if (
        portal === "admin" ||
        path.startsWith("/admin") ||
        path.startsWith("/agency") ||
        path.startsWith("/gatc")
      ) {
        title = "eLMV | admin";
      } else if (
        portal === "field" ||
        path.startsWith("/field") ||
        path.startsWith("/roster") ||
        path.startsWith("/inspectors") ||
        path.startsWith("/officer")
      ) {
        title = "eLMV | field";
      } else {
        title = "eLMV";
      }
    }

    document.title = title;
  }, [portal, location.pathname, user?.role]);

  if (user) {
    if (user.role === Role.ADMIN || user.role === Role.GATC_ADMIN) {
      return <AdminApp />;
    }
    if (user.role === Role.LMO || user.role === Role.GATC_INSPECTOR) {
      return <FieldApp />;
    }
    if (user.role === Role.CONSUMER) {
      return <ConsumerApp />;
    }
  }

  if (portal === "admin") {
    return <AdminApp />;
  }

  if (portal === "field") {
    return <FieldApp />;
  }

  return <ConsumerApp />;
}

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

    if (portal === "admin") {
      title = "eLMV | Admin";
    } else if (portal === "field") {
      title = "eLMV | Field Inspector";
    } else {
      title = "eLMV";
    }

    document.title = title;
  }, [portal]);

  if (portal === "admin") {
    return <AdminApp />;
  }

  if (portal === "field") {
    return <FieldApp />;
  }

  return <ConsumerApp />;
}

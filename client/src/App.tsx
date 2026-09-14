import { getActivePortal } from "@/lib/subdomain";
import { ConsumerApp } from "@/portals/consumer/ConsumerApp";
import { AdminApp } from "@/portals/admin/AdminApp";
import { FieldApp } from "@/portals/field/FieldApp";

export default function App() {
  const portal = getActivePortal();

  if (portal === "admin") {
    return <AdminApp />;
  }

  if (portal === "field") {
    return <FieldApp />;
  }

  return <ConsumerApp />;
}

export type PortalType = "consumer" | "admin" | "field";

/**
 * Detects the current active portal based on:
 * 1. Port number (5173 = consumer, 5174 = admin, 5175 = field)
 * 2. Hostname subdomain prefix (admin.*, field.*, consumer.*)
 * 3. Build-time environment variable (VITE_APP_PORTAL)
 * 4. URL path prefix fallback (/admin/*, /field/*, /consumer/*)
 */
export function getActivePortal(): PortalType {
  // 1. Build-time override (useful for independent production deployments)
  const buildEnv = import.meta.env.VITE_APP_PORTAL as string | undefined;
  if (buildEnv === "admin" || buildEnv === "field" || buildEnv === "consumer") {
    return buildEnv;
  }

  // 2. Window location inspection
  if (typeof window !== "undefined") {
    const { hostname, port, pathname } = window.location;

    // A. Path prefix matching FIRST (ensures http://localhost:5173/admin/* routes to AdminApp directly)
    const lowerPath = pathname.toLowerCase();
    if (
      lowerPath.startsWith("/admin") ||
      lowerPath.startsWith("/agency") ||
      lowerPath.startsWith("/agencies") ||
      lowerPath.startsWith("/gatc") ||
      lowerPath.startsWith("/officer") ||
      lowerPath.startsWith("/inspectors")
    ) {
      return "admin";
    }
    if (
      lowerPath.startsWith("/field") ||
      lowerPath.startsWith("/roster")
    ) {
      return "field";
    }
    if (lowerPath.startsWith("/consumer")) {
      return "consumer";
    }

    // B. Port matching (Local development: 5174=admin, 5175=field, 5173=consumer)
    if (port === "5174") return "admin";
    if (port === "5175") return "field";
    if (port === "5173") return "consumer";

    // C. Subdomain matching (Production or *.localhost)
    const lowerHost = hostname.toLowerCase();
    if (lowerHost.startsWith("admin.") || lowerHost.includes(".admin.")) return "admin";
    if (lowerHost.startsWith("field.") || lowerHost.includes(".field.")) return "field";
    if (lowerHost.startsWith("consumer.") || lowerHost.includes(".consumer.")) return "consumer";
  }

  return "consumer";
}

/**
 * Helper to construct cross-portal URLs (e.g. redirecting a user from Consumer to Admin)
 */
export function getPortalBaseUrl(portal: PortalType): string {
  if (typeof window === "undefined") return "/";

  const { hostname, protocol, port } = window.location;

  // Local development (localhost / 127.0.0.1)
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    const portMap: Record<PortalType, string> = {
      consumer: "5173",
      admin: "5174",
      field: "5175",
    };
    return `${protocol}//${hostname}:${portMap[portal]}`;
  }

  // Subdomain matching on local *.localhost
  if (hostname.endsWith(".localhost")) {
    const portSuffix = port ? `:${port}` : "";
    return `${protocol}//${portal}.localhost${portSuffix}`;
  }

  // Production subdomain replacement (e.g. consumer.domain.com -> admin.domain.com)
  const parts = hostname.split(".");
  if (parts.length >= 2) {
    // Replace first subdomain token
    const baseDomain = parts.slice(1).join(".");
    return `${protocol}//${portal}.${baseDomain}`;
  }

  return "/";
}


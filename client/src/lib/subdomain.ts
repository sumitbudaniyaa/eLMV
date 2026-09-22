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

    // C. Subdomain / Hostname matching (Production, Vercel, or *.localhost)
    const lowerHost = hostname.toLowerCase();

    // Admin checks: admin-elmv.vercel.app, admin.elmv.com, or contains admin subdomain
    if (
      lowerHost.startsWith("admin-") ||
      lowerHost.startsWith("admin.") ||
      lowerHost.includes(".admin.") ||
      lowerHost.includes("-admin.")
    ) {
      return "admin";
    }

    // Field / Inspector checks: inspector-elmv.vercel.app, field-elmv.vercel.app, inspector.elmv.com, field.elmv.com
    if (
      lowerHost.startsWith("inspector-") ||
      lowerHost.startsWith("inspector.") ||
      lowerHost.startsWith("field-") ||
      lowerHost.startsWith("field.") ||
      lowerHost.includes(".inspector.") ||
      lowerHost.includes("-inspector.") ||
      lowerHost.includes(".field.") ||
      lowerHost.includes("-field.")
    ) {
      return "field";
    }

    // Consumer checks: consumer-elmv.vercel.app, consumer.elmv.com
    if (
      lowerHost.startsWith("consumer-") ||
      lowerHost.startsWith("consumer.") ||
      lowerHost.includes(".consumer.") ||
      lowerHost.includes("-consumer.")
    ) {
      return "consumer";
    }
  }

  return "consumer";
}

/**
 * Helper to construct cross-portal URLs (e.g. redirecting a user from Consumer to Admin)
 */
export function getPortalBaseUrl(portal: PortalType): string {
  if (typeof window === "undefined") return "/";

  // 1. Build-time explicit environment variables
  if (portal === "admin" && import.meta.env.VITE_ADMIN_URL) return import.meta.env.VITE_ADMIN_URL as string;
  if (portal === "field" && import.meta.env.VITE_FIELD_URL) return import.meta.env.VITE_FIELD_URL as string;
  if (portal === "consumer" && import.meta.env.VITE_CONSUMER_URL) return import.meta.env.VITE_CONSUMER_URL as string;

  const { hostname, protocol, port } = window.location;
  const portSuffix = port ? `:${port}` : "";

  // 2. Local development (localhost / 127.0.0.1)
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    const portMap: Record<PortalType, string> = {
      consumer: "5173",
      admin: "5174",
      field: "5175",
    };
    return `${protocol}//${hostname}:${portMap[portal]}`;
  }

  // 3. Subdomain matching on local *.localhost
  if (hostname.endsWith(".localhost")) {
    const prefix = portal === "field" ? "inspector" : portal;
    return `${protocol}//${prefix}.localhost${portSuffix}`;
  }

  // 4. Vercel deployment: handles prefix hyphen domains like admin-elmv.vercel.app, inspector-elmv.vercel.app, elmv.vercel.app
  if (hostname.endsWith(".vercel.app")) {
    const rawSub = hostname.replace(/\.vercel\.app$/, "");
    const baseProject = rawSub.replace(/^(admin|inspector|field|consumer)-/, "");

    if (portal === "admin") {
      return `${protocol}//admin-${baseProject}.vercel.app`;
    }
    if (portal === "field") {
      return `${protocol}//inspector-${baseProject}.vercel.app`;
    }
    return `${protocol}//${baseProject}.vercel.app`;
  }

  // 5. Production dot-based subdomain replacement (e.g. consumer.domain.com -> admin.domain.com)
  const parts = hostname.split(".");
  if (parts.length >= 3) {
    const baseDomain = parts.slice(1).join(".");
    const prefix = portal === "field" ? "inspector" : portal;
    return `${protocol}//${prefix}.${baseDomain}${portSuffix}`;
  } else if (parts.length === 2) {
    if (portal === "consumer") return `${protocol}//${hostname}${portSuffix}`;
    const prefix = portal === "field" ? "inspector" : portal;
    return `${protocol}//${prefix}.${hostname}${portSuffix}`;
  }

  // 6. Fallback to path routing on same host
  if (portal === "admin") return `${protocol}//${hostname}${portSuffix}/admin`;
  if (portal === "field") return `${protocol}//${hostname}${portSuffix}/field`;
  return `${protocol}//${hostname}${portSuffix}/`;
}


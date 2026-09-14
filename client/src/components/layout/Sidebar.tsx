import { NavLink, Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import { Role } from "@sih/shared";
import {
  Scale,
  LayoutDashboard,
  FileText,
  BarChart3,
  History,
  LogOut,
  X,
  ClipboardCheck,
  Building2,
  FlaskConical,
  Users,
  UserCheck,
  Settings,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await logout();
    navigate("/login");
  };

  const getInitials = (name?: string) => {
    if (!name) return "LM";
    const parts = name.split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `group flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-all duration-150 border ${
      isActive
        ? "bg-zinc-100 dark:bg-zinc-800 text-foreground font-semibold border-zinc-200/80 dark:border-zinc-700/60 shadow-2xs"
        : "text-muted-foreground hover:bg-zinc-100/60 dark:hover:bg-zinc-800/40 hover:text-foreground border-transparent"
    }`;

  const getRoleTitle = (r?: Role) => {
    if (!r) return "";
    switch (r) {
      case Role.CONSUMER:
        return "Commercial Trader";
      case Role.LMO:
        return "Legal Metrology Officer";
      case Role.GATC_ADMIN:
        return "GATC Agency Admin";
      case Role.GATC_INSPECTOR:
        return "GATC Field Inspector";
      case Role.ADMIN:
        return "State Controller";
      default:
        return "Authorized User";
    }
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 shrink-0 h-full bg-card border-r border-border select-none">
        {/* Brand Header — Aligned with TopBar height (h-14) */}
        <div className="h-14 px-4 flex items-center border-b border-border shrink-0">
          <div className="min-w-0">
            <span className="text-lg font-black tracking-tight text-foreground block leading-tight">
              eLMV
            </span>
            <span className="text-[10px] text-muted-foreground block truncate">
              {t("common.govtOfIndia")}
            </span>
          </div>
        </div>

        {/* Dynamic Role-Specific Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {/* 1. TRADER / CONSUMER NAVIGATION */}
          {user?.role === Role.CONSUMER && (
            <div>
              <span className="px-3 text-xs font-medium text-muted-foreground block mb-1.5">
                {t("nav.operations")}
              </span>
              <nav className="space-y-1">
                <NavLink to="/dashboard" onClick={onClose} className={navLinkClass}>
                  <div className="flex items-center space-x-2.5">
                    <LayoutDashboard className="h-4 w-4 shrink-0" />
                    <span>{t("nav.dashboard")}</span>
                  </div>
                </NavLink>

                <NavLink to="/instruments" onClick={onClose} className={navLinkClass}>
                  <div className="flex items-center space-x-2.5">
                    <Scale className="h-4 w-4 shrink-0" />
                    <span>{t("nav.instruments")}</span>
                  </div>
                </NavLink>

                <NavLink to="/applications" onClick={onClose} className={navLinkClass}>
                  <div className="flex items-center space-x-2.5">
                    <FileText className="h-4 w-4 shrink-0" />
                    <span>{t("nav.applications")}</span>
                  </div>
                </NavLink>
              </nav>
            </div>
          )}

          {/* 2. LMO / GATC FIELD INSPECTOR NAVIGATION */}
          {(user?.role === Role.LMO || user?.role === Role.GATC_INSPECTOR) && (
            <div>
              <span className="px-3 text-xs font-medium text-muted-foreground block mb-1.5">
                {t("nav.inspection")}
              </span>
              <nav className="space-y-1">
                <NavLink to="/roster" onClick={onClose} className={navLinkClass}>
                  <div className="flex items-center space-x-2.5">
                    <ClipboardCheck className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                    <span>{t("nav.roster", { defaultValue: "Inspection Roster" })}</span>
                  </div>
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0"></span>
                </NavLink>

                <NavLink to="/dashboard" onClick={onClose} className={navLinkClass}>
                  <div className="flex items-center space-x-2.5">
                    <LayoutDashboard className="h-4 w-4 shrink-0" />
                    <span>{t("nav.dashboard")}</span>
                  </div>
                </NavLink>

                <NavLink to="/applications" onClick={onClose} className={navLinkClass}>
                  <div className="flex items-center space-x-2.5">
                    <FileText className="h-4 w-4 shrink-0" />
                    <span>{t("nav.applications")}</span>
                  </div>
                </NavLink>

                <NavLink to="/instruments" onClick={onClose} className={navLinkClass}>
                  <div className="flex items-center space-x-2.5">
                    <Scale className="h-4 w-4 shrink-0" />
                    <span>{t("nav.instruments")}</span>
                  </div>
                </NavLink>
              </nav>
            </div>
          )}

          {/* 3. GATC AGENCY ADMIN NAVIGATION */}
          {user?.role === Role.GATC_ADMIN && (
            <div>
              <span className="px-3 text-xs font-medium text-muted-foreground block mb-1.5">
                Agency Operations
              </span>
              <nav className="space-y-1">
                <NavLink to="/agency" onClick={onClose} className={navLinkClass}>
                  <div className="flex items-center space-x-2.5">
                    <LayoutDashboard className="h-4 w-4 shrink-0" />
                    <span>Agency Dashboard</span>
                  </div>
                </NavLink>

                <NavLink to="/inspectors" onClick={onClose} className={navLinkClass}>
                  <div className="flex items-center space-x-2.5">
                    <Users className="h-4 w-4 shrink-0" />
                    <span>Testing Staff & Inspectors</span>
                  </div>
                </NavLink>

                <NavLink to="/applications" onClick={onClose} className={navLinkClass}>
                  <div className="flex items-center space-x-2.5">
                    <FlaskConical className="h-4 w-4 shrink-0" />
                    <span>Assigned Applications</span>
                  </div>
                </NavLink>

                <NavLink to="/instruments" onClick={onClose} className={navLinkClass}>
                  <div className="flex items-center space-x-2.5">
                    <Scale className="h-4 w-4 shrink-0" />
                    <span>Registry</span>
                  </div>
                </NavLink>
              </nav>
            </div>
          )}

          {/* 4. ADMIN / CONTROLLER NAVIGATION */}
          {user?.role === Role.ADMIN && (
            <div>
              <span className="px-3 text-xs font-medium text-muted-foreground block mb-1.5">
                {t("nav.administration")}
              </span>
              <nav className="space-y-1">
                <NavLink to="/dashboard" onClick={onClose} className={navLinkClass}>
                  <div className="flex items-center space-x-2.5">
                    <LayoutDashboard className="h-4 w-4 shrink-0" />
                    <span>Command Center</span>
                  </div>
                </NavLink>

                <NavLink to="/officers" onClick={onClose} className={navLinkClass}>
                  <div className="flex items-center space-x-2.5">
                    <UserCheck className="h-4 w-4 shrink-0" />
                    <span>LMO Officers</span>
                  </div>
                </NavLink>

                <NavLink to="/agencies" onClick={onClose} className={navLinkClass}>
                  <div className="flex items-center space-x-2.5">
                    <Building2 className="h-4 w-4 shrink-0" />
                    <span>GATC Agencies</span>
                  </div>
                </NavLink>

                <NavLink to="/applications" onClick={onClose} className={navLinkClass}>
                  <div className="flex items-center space-x-2.5">
                    <FileText className="h-4 w-4 shrink-0" />
                    <span>All Applications</span>
                  </div>
                </NavLink>

                <NavLink to="/instruments" onClick={onClose} className={navLinkClass}>
                  <div className="flex items-center space-x-2.5">
                    <Scale className="h-4 w-4 shrink-0" />
                    <span>State Registry</span>
                  </div>
                </NavLink>
              </nav>
            </div>
          )}

          {/* SECTION: Intelligence & Audit (Roles with access) */}
          {(user?.role === Role.ADMIN || user?.role === Role.GATC_ADMIN) && (
            <div>
              <span className="px-3 text-xs font-medium text-muted-foreground block mb-1.5">
                {t("nav.reports")}
              </span>
              <nav className="space-y-1">
                <NavLink to="/analytics" onClick={onClose} className={navLinkClass}>
                  <div className="flex items-center space-x-2.5">
                    <BarChart3 className="h-4 w-4 shrink-0" />
                    <span>{t("nav.analytics")}</span>
                  </div>
                </NavLink>

                {user?.role === Role.ADMIN && (
                  <NavLink to="/audit" onClick={onClose} className={navLinkClass}>
                    <div className="flex items-center space-x-2.5">
                      <History className="h-4 w-4 shrink-0" />
                      <span>{t("nav.audit")}</span>
                    </div>
                  </NavLink>
                )}
              </nav>
            </div>
          )}

          {/* SECTION: Account & Settings */}
          <div>
            <span className="px-3 text-xs font-medium text-muted-foreground block mb-1.5">
              {t("nav.account", { defaultValue: "Account" })}
            </span>
            <nav className="space-y-1">
              <NavLink to="/settings" onClick={onClose} className={navLinkClass}>
                <div className="flex items-center space-x-2.5">
                  <Settings className="h-4 w-4 shrink-0" />
                  <span>{t("nav.settings", { defaultValue: "Settings & Credentials" })}</span>
                </div>
              </NavLink>
            </nav>
          </div>

        </div>

        {/* Authenticated User Profile Card — Aligned with page footer height (h-14) */}
        <div className="h-14 px-3 border-t border-border bg-card flex items-center shrink-0">
          {user ? (
            <div className="flex items-center justify-between w-full">
              <Link
                to="/settings"
                onClick={onClose}
                className="flex items-center space-x-2.5 min-w-0 flex-1 hover:opacity-85 transition-opacity cursor-pointer"
                title={t("nav.settings", { defaultValue: "Settings & Credentials" })}
              >
                <div className="h-8 w-8 rounded-full bg-muted border border-border flex items-center justify-center font-bold text-xs text-foreground shrink-0">
                  {getInitials(user.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold truncate leading-tight text-foreground hover:text-primary transition-colors">
                    {user.name}
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate font-mono">
                    {getRoleTitle(user.role as Role)}
                  </p>
                </div>
              </Link>

              <div className="flex items-center gap-1 shrink-0">
                <Link
                  to="/settings"
                  onClick={onClose}
                  className="p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  title={t("nav.settings", { defaultValue: "Settings" })}
                >
                  <Settings className="h-3.5 w-3.5" />
                </Link>
                <button
                  onClick={handleSignOut}
                  className="p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  title={t("nav.logout")}
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="text-[10px] font-mono text-muted-foreground truncate w-full text-center">
              Govt. of India &copy; 2026
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={onClose}
          />
          <div className="relative flex-1 max-w-xs w-full bg-card shadow-2xl z-10 flex flex-col">
            <div className="h-14 px-4 border-b border-border flex items-center justify-between shrink-0">
              <div>
                <span className="font-extrabold text-base text-foreground block leading-tight">eLMV</span>
                <span className="text-[10px] text-muted-foreground block">{t("common.govtOfIndia")}</span>
              </div>
              <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            {/* Nav content inside mobile */}
            <div className="p-3 space-y-2 flex-1 overflow-y-auto">
              {user?.role === Role.CONSUMER && (
                <>
                  <NavLink to="/dashboard" onClick={onClose} className={navLinkClass}>
                    <span>{t("nav.dashboard")}</span>
                  </NavLink>
                  <NavLink to="/instruments" onClick={onClose} className={navLinkClass}>
                    <span>{t("nav.instruments")}</span>
                  </NavLink>
                  <NavLink to="/applications" onClick={onClose} className={navLinkClass}>
                    <span>{t("nav.applications")}</span>
                  </NavLink>
                </>
              )}
              {(user?.role === Role.LMO || user?.role === Role.GATC_INSPECTOR) && (
                <>
                  <NavLink to="/roster" onClick={onClose} className={navLinkClass}>
                    <span>{t("nav.roster", { defaultValue: "Inspection Roster" })}</span>
                  </NavLink>
                  <NavLink to="/dashboard" onClick={onClose} className={navLinkClass}>
                    <span>{t("nav.dashboard")}</span>
                  </NavLink>
                  <NavLink to="/applications" onClick={onClose} className={navLinkClass}>
                    <span>{t("nav.applications")}</span>
                  </NavLink>
                  <NavLink to="/instruments" onClick={onClose} className={navLinkClass}>
                    <span>{t("nav.instruments")}</span>
                  </NavLink>
                  <NavLink to="/analytics" onClick={onClose} className={navLinkClass}>
                    <span>{t("nav.analytics")}</span>
                  </NavLink>
                </>
              )}
              {user?.role === Role.GATC_ADMIN && (
                <>
                  <NavLink to="/agency" onClick={onClose} className={navLinkClass}>
                    <span>Agency Dashboard</span>
                  </NavLink>
                  <NavLink to="/inspectors" onClick={onClose} className={navLinkClass}>
                    <span>Testing Staff</span>
                  </NavLink>
                  <NavLink to="/applications" onClick={onClose} className={navLinkClass}>
                    <span>Assigned Applications</span>
                  </NavLink>
                  <NavLink to="/instruments" onClick={onClose} className={navLinkClass}>
                    <span>Registry</span>
                  </NavLink>
                  <NavLink to="/analytics" onClick={onClose} className={navLinkClass}>
                    <span>Analytics</span>
                  </NavLink>
                </>
              )}
              {user?.role === Role.ADMIN && (
                <>
                  <NavLink to="/dashboard" onClick={onClose} className={navLinkClass}>
                    <span>{t("nav.dashboard")}</span>
                  </NavLink>
                  <NavLink to="/instruments" onClick={onClose} className={navLinkClass}>
                    <span>{t("nav.instruments")}</span>
                  </NavLink>
                  <NavLink to="/applications" onClick={onClose} className={navLinkClass}>
                    <span>{t("nav.applications")}</span>
                  </NavLink>
                  <NavLink to="/analytics" onClick={onClose} className={navLinkClass}>
                    <span>{t("nav.analytics")}</span>
                  </NavLink>
                  <NavLink to="/audit" onClick={onClose} className={navLinkClass}>
                    <span>{t("nav.audit")}</span>
                  </NavLink>
                </>
              )}

              {/* Mobile Settings Link */}
              <div className="pt-2 border-t border-border">
                <NavLink to="/settings" onClick={onClose} className={navLinkClass}>
                  <div className="flex items-center space-x-2.5">
                    <Settings className="h-4 w-4 shrink-0" />
                    <span>{t("nav.settings", { defaultValue: "Settings & Credentials" })}</span>
                  </div>
                </NavLink>
              </div>

            </div>
            {user && (
              <div className="h-14 px-4 border-t border-border flex items-center justify-between shrink-0">
                <Link
                  to="/settings"
                  onClick={onClose}
                  className="hover:opacity-85 transition-opacity"
                >
                  <p className="text-xs font-semibold hover:text-primary transition-colors">{user.name}</p>
                  <p className="text-[10px] text-muted-foreground">{getRoleTitle(user.role as Role)}</p>
                </Link>
                <div className="flex items-center gap-1">
                  <Link
                    to="/settings"
                    onClick={onClose}
                    className="p-1 text-muted-foreground hover:text-foreground"
                    title={t("nav.settings", { defaultValue: "Settings" })}
                  >
                    <Settings className="h-4 w-4" />
                  </Link>
                  <button onClick={handleSignOut} className="p-1 text-muted-foreground hover:text-foreground" title={t("nav.logout")}>
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

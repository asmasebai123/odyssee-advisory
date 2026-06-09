"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Icon, type IconName } from "@/components/shared/Icon";
import { Logotype } from "@/components/shared/OAMark";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";

interface NavItem {
  href: string;
  labelKey:
    | "dashboard"
    | "dossiers"
    | "clients"
    | "factures"
    | "journal"
    | "settings";
  icon: IconName;
  badge?: number;
}

const NAV: NavItem[] = [
  { href: "/admin/dashboard", labelKey: "dashboard", icon: "dashboard" },
  { href: "/admin", labelKey: "dossiers", icon: "folder", badge: 12 },
  { href: "/clients", labelKey: "clients", icon: "users" },
  { href: "/admin/factures", labelKey: "factures", icon: "invoice" },
  { href: "/admin/journal", labelKey: "journal", icon: "clock" },
  { href: "/admin/parametres", labelKey: "settings", icon: "settings" },
];

export interface AvocatSidebarProps {
  userName?: string;
  userRole?: string;
  initials?: string;
}

/**
 * Steel-blue sidebar for the cabinet/admin space.
 */
export const AvocatSidebar: React.FC<AvocatSidebarProps> = ({
  userName = "Pierre Debuisson",
  userRole = "Legal Consultant — UAE",
  initials = "PD",
}) => {
  const pathname = usePathname();
  const params = useParams();
  const locale = (params?.locale as string) || "fr";
  const tNav = useTranslations("sidebar.avocat");
  const tSidebar = useTranslations("sidebar");

  return (
    <aside
      style={{
        background: "var(--sidebar-bg)",
        color: "var(--white)",
        display: "flex",
        flexDirection: "column",
        borderRight: "1px solid var(--sidebar-line)",
        position: "sticky",
        top: 0,
        height: "100vh",
      }}
    >
      <div
        style={{
          padding: "26px 22px 22px",
          borderBottom: "1px solid var(--border-dark)",
        }}
      >
        <Logotype />
      </div>

      <div
        style={{
          padding: "10px 22px 6px",
          marginTop: 18,
          fontSize: 10,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.35)",
          fontWeight: 600,
        }}
      >
        {tSidebar("cabinet")}
      </div>

      <nav style={{ flex: 1, paddingTop: 4 }}>
        {NAV.map((item) => {
          const itemHref = `/${locale}${item.href === "/" ? "" : item.href}`;
          const active = pathname === itemHref || (item.href !== "/admin" && pathname?.startsWith(itemHref));
          return (
            <Link
              key={item.href}
              href={itemHref}
              className={"nav-item " + (active ? "active" : "")}
            >
              <span className="nav-icon">
                <Icon name={item.icon} size={18} />
              </span>
              <span style={{ flex: 1 }}>{tNav(item.labelKey)}</span>
              {item.badge && (
                <span
                  style={{
                    background: "var(--gold)",
                    color: "var(--ink)",
                    fontSize: 10,
                    fontWeight: 700,
                    padding: "2px 6px",
                    borderRadius: 10,
                    minWidth: 18,
                    textAlign: "center",
                  }}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Sélecteur de langue */}
      <div
        style={{
          padding: "12px 22px",
          borderTop: "1px solid var(--border-dark)",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <LanguageSwitcher variant="sidebar" />
      </div>

      <div
        style={{
          padding: "12px 22px 18px",
        }}
      >
        <div
          onClick={async () => {
            try {
              const { createBrowserClient } = await import("@supabase/ssr");
              const supabase = createBrowserClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
              );
              await supabase.auth.signOut();
              window.location.href = `/${locale}/login`;
            } catch (err) {
              console.error("Signout error:", err);
            }
          }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "10px 12px",
            background: "rgba(255,255,255,0.03)",
            borderRadius: 3,
            cursor: "pointer",
          }}
        >
          <div className="avatar" style={{ width: 32, height: 32, fontSize: 12 }}>
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: "white" }}>
              {userName}
            </div>
            <div
              style={{
                fontSize: 10.5,
                color: "rgba(255,255,255,0.45)",
                letterSpacing: "0.04em",
              }}
            >
              {userRole}
            </div>
          </div>
          <Icon name="log-out" size={14} style={{ color: "rgba(255,255,255,0.4)" }} />
        </div>
      </div>
    </aside>
  );
};

"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "@/components/shared/Icon";
import { Logotype } from "@/components/shared/OAMark";

interface NavItem {
  href: string;
  label: string;
  icon: IconName;
  badge?: number;
}

const NAV: NavItem[] = [
  { href: "/dashboard", label: "Tableau de bord", icon: "dashboard" },
  { href: "/dossier", label: "Mon dossier", icon: "folder" },
  { href: "/documents", label: "Documents", icon: "doc" },
  { href: "/factures", label: "Factures", icon: "invoice" },
  { href: "/messagerie", label: "Messagerie", icon: "message", badge: 2 },
  { href: "/parametres", label: "Paramètres", icon: "settings" },
];

export interface ClientSidebarProps {
  userName?: string;
  userRole?: string;
  initials?: string;
}

/**
 * Steel-blue sidebar for the investor portal.
 */
export const ClientSidebar: React.FC<ClientSidebarProps> = ({
  userName = "Pierre Laurent",
  userRole = "Client privé",
  initials = "PL",
}) => {
  const pathname = usePathname();

  return (
    <aside
      style={{
        background: "var(--bg-dark)",
        color: "var(--white)",
        display: "flex",
        flexDirection: "column",
        borderRight: "1px solid rgba(255,255,255,0.04)",
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
        Espace client
      </div>

      <nav style={{ flex: 1, paddingTop: 4 }}>
        {NAV.map((item) => {
          const active = pathname?.startsWith(item.href) ?? false;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={"nav-item " + (active ? "active" : "")}
            >
              <span className="nav-icon">
                <Icon name={item.icon} size={18} />
              </span>
              <span style={{ flex: 1 }}>{item.label}</span>
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

      <div
        style={{
          padding: "18px 22px",
          borderTop: "1px solid var(--border-dark)",
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
              window.location.href = "/login";
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

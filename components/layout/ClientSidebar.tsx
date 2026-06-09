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
    | "dossier"
    | "documents"
    | "factures"
    | "messagerie"
    | "settings";
  icon: IconName;
  badge?: number;
}

const NAV: NavItem[] = [
  { href: "/dashboard", labelKey: "dashboard", icon: "dashboard" },
  { href: "/dossier", labelKey: "dossier", icon: "folder" },
  { href: "/documents", labelKey: "documents", icon: "doc" },
  { href: "/factures", labelKey: "factures", icon: "invoice" },
  { href: "/messagerie", labelKey: "messagerie", icon: "message", badge: 2 },
  { href: "/parametres", labelKey: "settings", icon: "settings" },
];

export interface ClientSidebarProps {
  userName?: string;
  userRole?: string;
  initials?: string;
}

/**
 * Sidebar espresso pour l'espace investisseur. Libellés traduits via next-intl.
 */
export const ClientSidebar: React.FC<ClientSidebarProps> = ({
  userName: propUserName = "Pierre Laurent",
  userRole: propUserRole = "Client privé",
  initials: propInitials = "PL",
}) => {
  const pathname = usePathname();
  const params = useParams();
  const locale = (params?.locale as string) || "fr";
  const tNav = useTranslations("sidebar.client");
  const tSidebar = useTranslations("sidebar");

  const [dossiers, setDossiers] = React.useState<any[]>([]);
  const [activeDossier, setActiveDossier] = React.useState<any>(null);
  const [clientProfile, setClientProfile] = React.useState<any>(null);

  React.useEffect(() => {
    async function loadClientData() {
      try {
        const res = await fetch("/api/client/dossier?t=" + Date.now(), { cache: "no-store" });
        const resData = await res.json();
        if (resData.success) {
          setDossiers(resData.dossiers || []);
          setActiveDossier(resData.dossier);
          setClientProfile(resData.profile);
        }
      } catch (err) {
        console.error("Failed to load client data in sidebar:", err);
      }
    }
    loadClientData();
  }, []);

  const userName = clientProfile
    ? `${clientProfile.prenom} ${clientProfile.nom}`
    : propUserName;
  const initials = clientProfile
    ? `${clientProfile.prenom.charAt(0)}${clientProfile.nom.charAt(0)}`.toUpperCase()
    : propInitials;
  const userRole = clientProfile?.role === "client" ? "Client privé" : propUserRole;

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

      {/* Sélecteur de dossier premium pour les clients multi-dossiers */}
      {dossiers.length > 1 && (
        <div
          style={{
            padding: "16px 22px 14px",
            borderBottom: "1px solid var(--border-dark)",
            display: "flex",
            flexDirection: "column",
            gap: 6
          }}
        >
          <div
            style={{
              fontSize: 9.5,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--gold)",
              fontWeight: 700,
            }}
          >
            Dossier Actif
          </div>
          <div style={{ position: "relative" }}>
            <select
              value={activeDossier?.id || ""}
              onChange={(e) => {
                const val = e.target.value;
                document.cookie = `selected_dossier_id=${val}; path=/; max-age=31536000; SameSite=Lax`;
                window.location.reload();
              }}
              style={{
                width: "100%",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(184,150,90,0.3)",
                borderRadius: 4,
                color: "var(--white)",
                padding: "8px 28px 8px 12px",
                fontSize: 12.5,
                outline: "none",
                cursor: "pointer",
                appearance: "none",
                fontFamily: "inherit",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                overflow: "hidden"
              }}
            >
              {dossiers.map((d: any) => (
                <option key={d.id} value={d.id} style={{ background: "var(--sidebar-bg)", color: "var(--white)" }}>
                  {d.titre}
                </option>
              ))}
            </select>
            <div
              style={{
                position: "absolute",
                right: 10,
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
                color: "var(--gold)",
                display: "flex",
                alignItems: "center"
              }}
            >
              <Icon name="chevron-down" size={12} />
            </div>
          </div>
        </div>
      )}

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
        {tSidebar("investorSpace")}
      </div>

      <nav style={{ flex: 1, paddingTop: 4 }}>
        {NAV.map((item) => {
          const itemHref = `/${locale}${item.href}`;
          const active = pathname === itemHref || pathname?.startsWith(itemHref + "/") || false;
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
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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
          <Icon
            name="log-out"
            size={14}
            style={{ color: "rgba(255,255,255,0.4)" }}
          />
        </div>
      </div>
    </aside>
  );
};

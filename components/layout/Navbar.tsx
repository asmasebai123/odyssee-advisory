"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Icon } from "@/components/shared/Icon";
import { useMobileNav } from "@/components/layout/MobileShell";
import { createBrowserClient } from "@supabase/ssr";

export interface NavbarProps {
  title: string;
  breadcrumb?: string;
  /** Optional toggle link for the role-switcher button on the right. */
  switchRoleHref?: string;
  switchRoleLabel?: string;
  /** Avatar initials shown on the far right. */
  initials?: string;
}

// Utility to format time elapsed localized
const formatTimeElapsed = (dateStr: string, locale: string = "fr") => {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / (1000 * 60));
    
    if (diffMin < 1) return locale === "ar" ? "الآن" : locale === "en" ? "Just now" : "À l'instant";
    if (diffMin < 60) return locale === "ar" ? `منذ ${diffMin} د` : locale === "en" ? `${diffMin}m ago` : `Il y a ${diffMin} min`;
    if (diffMin < 1440) {
      const hours = Math.floor(diffMin / 60);
      return locale === "ar" ? `منذ ${hours} س` : locale === "en" ? `${hours}h ago` : `Il y a ${hours} h`;
    }
    return date.toLocaleDateString(locale === "ar" ? "ar-EG" : locale === "en" ? "en-US" : "fr-FR", { 
      day: "numeric", 
      month: "short" 
    });
  } catch {
    return "";
  }
};

const getNotificationStyles = (type: string) => {
  switch (type) {
    case "message":
      return { icon: "message" as const, color: "var(--gold)", bg: "rgba(184, 150, 90, 0.1)" };
    case "document":
      return { icon: "doc" as const, color: "#3B82F6", bg: "rgba(59, 130, 246, 0.1)" };
    case "signature":
      return { icon: "check-circle" as const, color: "#10B981", bg: "rgba(16, 185, 129, 0.1)" };
    case "invoice":
      return { icon: "credit-card" as const, color: "#F59E0B", bg: "rgba(245, 158, 11, 0.1)" };
    case "status":
      return { icon: "info" as const, color: "#8B5CF6", bg: "rgba(139, 92, 246, 0.1)" };
    default:
      return { icon: "bell" as const, color: "var(--ink-2)", bg: "var(--border-soft)" };
  }
};

/**
 * White topbar used inside (client) and (avocat) layouts.
 * Includes breadcrumb + title, command palette search, role switcher, bell and avatar.
 */
export const Navbar: React.FC<NavbarProps> = ({
  title,
  breadcrumb,
  switchRoleHref,
  switchRoleLabel,
  initials = "PL",
}) => {
  const { setOpen } = useMobileNav();
  const params = useParams();
  const locale = (params?.locale as string) || "fr";
  const t = useTranslations("navbar");
  const tCommon = useTranslations("common");

  const [notifications, setNotifications] = React.useState<any[]>([]);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const supabase = React.useMemo(() => {
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }, []);

  const fetchNotifications = React.useCallback(async () => {
    try {
      const res = await fetch("/api/notifications?t=" + Date.now(), { cache: "no-store" });
      const data = await res.json();
      if (data && data.notifications) {
        setNotifications(data.notifications);
        setUnreadCount(data.notifications.filter((n: any) => !n.lu).length);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  }, []);

  React.useEffect(() => {
    fetchNotifications();

    const channel = supabase
      .channel("navbar-notifications-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications" },
        () => {
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchNotifications, supabase]);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const markAsRead = async (id: string) => {
    try {
      // Update local state instantly for extreme responsiveness
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, lu: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));

      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      setNotifications((prev) => prev.map((n) => ({ ...n, lu: true })));
      setUnreadCount(0);

      const unread = notifications.filter((n) => !n.lu);
      await Promise.all(
        unread.map((n) =>
          fetch("/api/notifications", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: n.id }),
          })
        )
      );
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  // --- Search / Command Palette Logic ---
  const router = useRouter();
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [searchResults, setSearchResults] = React.useState<any[]>([]);
  const [isSearching, setIsSearching] = React.useState(false);

  const isAdmin = typeof window !== "undefined" && window.location.pathname.includes("/admin");

  // Global keydown listener for ⌘K / Ctrl+K shortcut
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        setSearchOpen((open) => !open);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Search API fetch with 200ms debounce
  React.useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        if (data && data.results) {
          setSearchResults(data.results);
        }
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setIsSearching(false);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleNavigate = (url: string) => {
    setSearchOpen(false);
    setSearchQuery("");
    router.push(`/${locale}${url}`);
  };

  const paletteItemStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "10px 20px",
    cursor: "pointer",
    transition: "all 0.15s ease",
  };

  return (
    <>
      <div className="topbar">
        <button
      type="button"
      className="mobile-burger"
      onClick={() => setOpen(true)}
      aria-label={t("openMenu")}
      style={{
        width: 40,
        height: 40,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
        color: "var(--ink)",
        border: "1px solid var(--border)",
        background: "var(--white)",
        flexShrink: 0,
        cursor: "pointer",
      }}
    >
      <Icon name="menu" size={20} />
    </button>
    <div style={{ flex: 1, minWidth: 0 }}>
      {breadcrumb && (
        <div
          style={{
            fontSize: 11,
            color: "var(--ink-3)",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            fontWeight: 600,
            marginBottom: 4,
          }}
        >
          {breadcrumb}
        </div>
      )}
      <h1 style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.02em" }}>
        {title}
      </h1>
    </div>

    <div
      className="topbar-search desktop-only"
      onClick={() => setSearchOpen(true)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 14px",
        background: "var(--bg-light)",
        borderRadius: "var(--radius-sm)",
        width: 280,
        border: "1px solid var(--border-soft)",
        cursor: "pointer",
        transition: "all 0.15s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "var(--gold-line)";
        e.currentTarget.style.background = "var(--white)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--border-soft)";
        e.currentTarget.style.background = "var(--bg-light)";
      }}
    >
      <Icon name="search" size={15} style={{ color: "var(--ink-3)" }} />
      <span style={{ flex: 1, fontSize: 13, color: "var(--ink-3)", userSelect: "none" }}>
        {t("search")}
      </span>
      <span
        style={{
          fontSize: 10,
          color: "var(--ink-3)",
          padding: "2px 6px",
          border: "1px solid var(--border)",
          borderRadius: 2,
          letterSpacing: "0.05em",
          background: "var(--white)"
        }}
      >
        ⌘K
      </span>
    </div>

    {switchRoleHref && switchRoleLabel && (
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <Link
          href={switchRoleHref}
          className="btn btn-sm"
          style={{
            background: "transparent",
            color: "var(--ink-2)",
            border: "1px solid var(--border)",
            letterSpacing: "0.04em",
          }}
          title={t("switchToClient")}
        >
          <Icon name="key" size={13} />
          {switchRoleLabel}
        </Link>
      </div>
    )}

    <div style={{ width: 1, height: 28, background: "var(--border)" }} />

    <div style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: "relative",
          width: 38,
          height: 38,
          borderRadius: 4,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--gold)",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          transition: "background 0.2s ease"
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-light)"}
        onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
        title={tCommon("notifications")}
      >
        <Icon name="bell" size={18} />
        {unreadCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              width: 8,
              height: 8,
              background: "var(--error)",
              borderRadius: "50%",
              border: "2px solid var(--white)",
            }}
          />
        )}
      </button>

      {isOpen && (
        <div
          ref={dropdownRef}
          style={{
            position: "absolute",
            top: "100%",
            right: 0,
            marginTop: 8,
            width: 320,
            background: "rgba(255, 255, 255, 0.92)",
            backdropFilter: "blur(12px)",
            border: "1px solid var(--border-soft)",
            borderRadius: 8,
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.08)",
            zIndex: 9999,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            textAlign: locale === "ar" ? "right" : "left",
            direction: locale === "ar" ? "rtl" : "ltr"
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "12px 16px",
              borderBottom: "1px solid var(--border-soft)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)" }}>
              {locale === "ar" ? "الإشعارات" : locale === "en" ? "Notifications" : "Notifications"}
            </span>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  markAllAsRead();
                }}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: 11,
                  color: "var(--gold)",
                  fontWeight: 600,
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                {locale === "ar" ? "تحديد الكل كمقروء" : locale === "en" ? "Mark all read" : "Tout marquer lu"}
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ overflowY: "auto", flex: 1, maxHeight: 280 }}>
            {notifications.length === 0 ? (
              <div style={{ padding: "32px 16px", textAlign: "center", color: "var(--ink-3)", fontSize: 12.5 }}>
                <Icon name="bell" size={24} style={{ color: "var(--border)", marginBottom: 8, marginInline: "auto" }} />
                <div>{locale === "ar" ? "لا توجد إشعارات جديدة" : locale === "en" ? "No new notifications" : "Aucune notification"}</div>
              </div>
            ) : (
              notifications.map((n) => {
                const styles = getNotificationStyles(n.type);
                return (
                  <div
                    key={n.id}
                    onClick={() => markAsRead(n.id)}
                    style={{
                      padding: "12px 16px",
                      borderBottom: "1px solid var(--border-soft)",
                      display: "flex",
                      gap: 12,
                      cursor: "pointer",
                      background: n.lu ? "transparent" : "rgba(184, 150, 90, 0.03)",
                      transition: "background 0.2s ease",
                      alignItems: "flex-start"
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(0, 0, 0, 0.02)")}
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = n.lu ? "transparent" : "rgba(184, 150, 90, 0.03)")
                    }
                  >
                    {/* Icon container */}
                    <div
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: "50%",
                        backgroundColor: styles.bg,
                        color: styles.color,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Icon name={styles.icon} size={14} />
                    </div>

                    {/* Text / content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          fontSize: 12.5,
                          color: "var(--ink)",
                          margin: 0,
                          lineHeight: 1.4,
                          fontWeight: n.lu ? 400 : 600,
                        }}
                      >
                        {n.message}
                      </p>
                      <span style={{ fontSize: 10, color: "var(--ink-3)", marginTop: 4, display: "block" }}>
                        {formatTimeElapsed(n.created_at, locale)}
                      </span>
                    </div>

                    {/* Unread indicator */}
                    {!n.lu && (
                      <div
                        style={{
                          width: 6,
                          height: 6,
                          backgroundColor: "var(--error)",
                          borderRadius: "50%",
                          marginTop: 6,
                          flexShrink: 0,
                        }}
                      />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>

    <div className="avatar" style={{ cursor: "pointer" }}>
      {initials}
    </div>
  </div>

  {searchOpen && (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0, 0, 0, 0.4)",
        backdropFilter: "blur(8px)",
        zIndex: 10000,
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        paddingTop: "15vh"
      }}
      onClick={() => setSearchOpen(false)}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 550,
          background: "rgba(255, 255, 255, 0.96)",
          backdropFilter: "blur(20px)",
          border: "1px solid var(--border-soft)",
          borderRadius: 12,
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.1)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "16px 20px",
            borderBottom: "1px solid var(--border-soft)"
          }}
        >
          <Icon name="search" size={18} style={{ color: "var(--gold)" }} />
          <input
            autoFocus
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={locale === "ar" ? "ابحث عن ملف، مستند، فاتورة..." : locale === "en" ? "Search for files, documents, invoices..." : "Rechercher un dossier, document, facture..."}
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              background: "transparent",
              fontSize: 15,
              color: "var(--ink)",
              direction: locale === "ar" ? "rtl" : "ltr"
            }}
          />
          {isSearching && (
            <span style={{ fontSize: 12, color: "var(--ink-3)" }}>
              ⌛
            </span>
          )}
          <button
            type="button"
            onClick={() => setSearchOpen(false)}
            style={{
              background: "var(--bg-light)",
              border: "none",
              borderRadius: 4,
              padding: "4px 8px",
              fontSize: 11,
              color: "var(--ink-3)",
              cursor: "pointer"
            }}
          >
            ESC
          </button>
        </div>

        {/* Results / Default Shortcuts Area */}
        <div
          style={{
            maxHeight: 350,
            overflowY: "auto",
            padding: "12px 0",
            direction: locale === "ar" ? "rtl" : "ltr",
            textAlign: locale === "ar" ? "right" : "left"
          }}
        >
          {searchQuery.trim() === "" ? (
            /* Default Quick Links */
            <div>
              <div style={{ padding: "8px 20px", fontSize: 11, fontWeight: 700, color: "var(--gold)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                {locale === "ar" ? "الوصول السريع" : locale === "en" ? "Quick Links" : "Raccourcis"}
              </div>
              {isAdmin ? (
                /* Lawyer/Admin shortcuts */
                <>
                  <div 
                    onClick={() => handleNavigate("/admin/dashboard")} 
                    className="palette-item" 
                    style={paletteItemStyle}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "var(--bg-light)";
                      e.currentTarget.style.paddingLeft = "24px";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.paddingLeft = "20px";
                    }}
                  >
                    <Icon name="dashboard" size={14} style={{ color: "var(--ink-2)", marginInlineEnd: 8 }} />
                    <span>{locale === "ar" ? "لوحة تحكم المكتب" : locale === "en" ? "Firm Dashboard" : "Tableau de bord Cabinet"}</span>
                  </div>
                  <div 
                    onClick={() => handleNavigate("/admin/journal")} 
                    className="palette-item" 
                    style={paletteItemStyle}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "var(--bg-light)";
                      e.currentTarget.style.paddingLeft = "24px";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.paddingLeft = "20px";
                    }}
                  >
                    <Icon name="scale" size={14} style={{ color: "var(--ink-2)", marginInlineEnd: 8 }} />
                    <span>{locale === "ar" ? "سجل المراجعة" : locale === "en" ? "Audit Log" : "Journal d'audit"}</span>
                  </div>
                  <div 
                    onClick={() => handleNavigate("/admin/parametres")} 
                    className="palette-item" 
                    style={paletteItemStyle}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "var(--bg-light)";
                      e.currentTarget.style.paddingLeft = "24px";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.paddingLeft = "20px";
                    }}
                  >
                    <Icon name="settings" size={14} style={{ color: "var(--ink-2)", marginInlineEnd: 8 }} />
                    <span>{locale === "ar" ? "إعدادات المكتب" : locale === "en" ? "Firm Settings" : "Paramètres Cabinet"}</span>
                  </div>
                </>
              ) : (
                /* Client shortcuts */
                <>
                  <div 
                    onClick={() => handleNavigate("/dashboard")} 
                    className="palette-item" 
                    style={paletteItemStyle}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "var(--bg-light)";
                      e.currentTarget.style.paddingLeft = "24px";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.paddingLeft = "20px";
                    }}
                  >
                    <Icon name="dashboard" size={14} style={{ color: "var(--ink-2)", marginInlineEnd: 8 }} />
                    <span>{locale === "ar" ? "لوحة التحكم" : locale === "en" ? "Dashboard" : "Tableau de bord"}</span>
                  </div>
                  <div 
                    onClick={() => handleNavigate("/dossier")} 
                    className="palette-item" 
                    style={paletteItemStyle}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "var(--bg-light)";
                      e.currentTarget.style.paddingLeft = "24px";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.paddingLeft = "20px";
                    }}
                  >
                    <Icon name="folder" size={14} style={{ color: "var(--ink-2)", marginInlineEnd: 8 }} />
                    <span>{locale === "ar" ? "ملفي العقاري" : locale === "en" ? "Property File" : "Mon Dossier Immobilier"}</span>
                  </div>
                  <div 
                    onClick={() => handleNavigate("/documents")} 
                    className="palette-item" 
                    style={paletteItemStyle}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "var(--bg-light)";
                      e.currentTarget.style.paddingLeft = "24px";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.paddingLeft = "20px";
                    }}
                  >
                    <Icon name="doc" size={14} style={{ color: "var(--ink-2)", marginInlineEnd: 8 }} />
                    <span>{locale === "ar" ? "مستنداتي" : locale === "en" ? "My Documents" : "Mes Documents"}</span>
                  </div>
                  <div 
                    onClick={() => handleNavigate("/factures")} 
                    className="palette-item" 
                    style={paletteItemStyle}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "var(--bg-light)";
                      e.currentTarget.style.paddingLeft = "24px";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.paddingLeft = "20px";
                    }}
                  >
                    <Icon name="invoice" size={14} style={{ color: "var(--ink-2)", marginInlineEnd: 8 }} />
                    <span>{locale === "ar" ? "الفواتير" : locale === "en" ? "Invoices" : "Mes Factures"}</span>
                  </div>
                  <div 
                    onClick={() => handleNavigate("/messagerie")} 
                    className="palette-item" 
                    style={paletteItemStyle}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "var(--bg-light)";
                      e.currentTarget.style.paddingLeft = "24px";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.paddingLeft = "20px";
                    }}
                  >
                    <Icon name="message" size={14} style={{ color: "var(--ink-2)", marginInlineEnd: 8 }} />
                    <span>{locale === "ar" ? "المراسلات الأمنة" : locale === "en" ? "Secure Chat" : "Messagerie Sécurisée"}</span>
                  </div>
                  <div 
                    onClick={() => handleNavigate("/parametres")} 
                    className="palette-item" 
                    style={paletteItemStyle}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "var(--bg-light)";
                      e.currentTarget.style.paddingLeft = "24px";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.paddingLeft = "20px";
                    }}
                  >
                    <Icon name="settings" size={14} style={{ color: "var(--ink-2)", marginInlineEnd: 8 }} />
                    <span>{locale === "ar" ? "الإعدادات" : locale === "en" ? "Settings" : "Paramètres"}</span>
                  </div>
                </>
              )}
            </div>
          ) : searchResults.length === 0 ? (
            /* Empty search results */
            <div style={{ padding: "32px 20px", textAlign: "center", color: "var(--ink-3)", fontSize: 13.5 }}>
              <Icon name="search" size={24} style={{ color: "var(--border)", marginBottom: 8, marginInline: "auto" }} />
              <div>{locale === "ar" ? "لا توجد نتائج مطابقة" : locale === "en" ? "No results found" : "Aucun résultat trouvé"}</div>
            </div>
          ) : (
            /* Search results */
            <div>
              <div style={{ padding: "8px 20px", fontSize: 11, fontWeight: 700, color: "var(--gold)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                {locale === "ar" ? "نتائج البحث" : locale === "en" ? "Search Results" : "Résultats de recherche"}
              </div>
              {searchResults.map((res: any) => {
                const iconName = res.type === "client" ? "users" : res.type === "dossier" ? "folder" : res.type === "document" ? "doc" : "invoice";
                const typeColor = res.type === "client" ? "#8B5CF6" : res.type === "dossier" ? "#3B82F6" : res.type === "document" ? "#10B981" : "#F59E0B";
                return (
                  <div
                    key={res.id}
                    onClick={() => handleNavigate(res.url)}
                    className="palette-item"
                    style={paletteItemStyle}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "var(--bg-light)";
                      e.currentTarget.style.paddingLeft = "24px";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.paddingLeft = "20px";
                    }}
                  >
                    <div
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: "50%",
                        backgroundColor: `rgba(${res.type === "client" ? "139, 92, 246" : res.type === "dossier" ? "59, 130, 246" : res.type === "document" ? "16, 185, 129" : "245, 158, 11"}, 0.1)`,
                        color: typeColor,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        marginInlineEnd: 4
                      }}
                    >
                      <Icon name={iconName as any} size={12} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {res.title}
                      </div>
                      <div style={{ fontSize: 10.5, color: "var(--ink-3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {res.subtitle}
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: 9,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        color: typeColor,
                        padding: "2px 6px",
                        borderRadius: 4,
                        backgroundColor: `rgba(${res.type === "client" ? "139, 92, 246" : res.type === "dossier" ? "59, 130, 246" : res.type === "document" ? "16, 185, 129" : "245, 158, 11"}, 0.08)`,
                        marginInlineStart: 8
                      }}
                    >
                      {res.type === "client" ? (locale === "ar" ? "عميل" : locale === "en" ? "client" : "client") :
                       res.type === "dossier" ? (locale === "ar" ? "ملف" : locale === "en" ? "file" : "dossier") :
                       res.type === "document" ? (locale === "ar" ? "مستند" : locale === "en" ? "doc" : "document") :
                       (locale === "ar" ? "فاتورة" : locale === "en" ? "invoice" : "facture")}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )}
  </>
  );
};

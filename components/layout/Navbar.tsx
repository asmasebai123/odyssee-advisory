"use client";

import * as React from "react";
import Link from "next/link";
import { Icon } from "@/components/shared/Icon";

export interface NavbarProps {
  title: string;
  breadcrumb?: string;
  /** Optional toggle link for the role-switcher button on the right. */
  switchRoleHref?: string;
  switchRoleLabel?: string;
  /** Avatar initials shown on the far right. */
  initials?: string;
}

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
}) => (
  <div className="topbar">
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
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 14px",
        background: "var(--bg-light)",
        borderRadius: "var(--radius-sm)",
        width: 280,
        border: "1px solid var(--border-soft)",
      }}
    >
      <Icon name="search" size={15} style={{ color: "var(--ink-3)" }} />
      <input
        placeholder="Rechercher un dossier, document…"
        style={{
          border: "none",
          outline: "none",
          background: "transparent",
          flex: 1,
          fontSize: 13,
          color: "var(--ink)",
        }}
      />
      <span
        style={{
          fontSize: 10,
          color: "var(--ink-3)",
          padding: "2px 6px",
          border: "1px solid var(--border)",
          borderRadius: 2,
          letterSpacing: "0.05em",
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
          title="Changer de rôle (démo)"
        >
          <Icon name="key" size={13} />
          {switchRoleLabel}
        </Link>
      </div>
    )}

    <div style={{ width: 1, height: 28, background: "var(--border)" }} />

    <button
      style={{
        position: "relative",
        width: 38,
        height: 38,
        borderRadius: 2,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--gold)",
      }}
      title="Notifications"
    >
      <Icon name="bell" size={18} />
      <span
        style={{
          position: "absolute",
          top: 8,
          right: 8,
          width: 7,
          height: 7,
          background: "var(--error)",
          borderRadius: "50%",
          border: "2px solid var(--white)",
        }}
      />
    </button>

    <div className="avatar" style={{ cursor: "pointer" }}>
      {initials}
    </div>
  </div>
);

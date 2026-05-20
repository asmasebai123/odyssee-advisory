import * as React from "react";
import { Icon, type IconName } from "./Icon";

type Accent = "gold" | "success" | "warning" | "error";
type Tone = "white" | "beige";

export interface KPICardDelta {
  value: string;
  label: string;
}

export interface KPICardProps {
  label: string;
  value: string;
  icon: IconName;
  delta?: KPICardDelta;
  accent?: Accent;
  dark?: boolean;
  tone?: Tone;
}

const ACCENT_VAR: Record<Accent, string> = {
  gold: "var(--gold)",
  success: "var(--success)",
  warning: "var(--warning)",
  error: "var(--error)",
};

export const KPICard: React.FC<KPICardProps> = ({
  label,
  value,
  delta,
  icon,
  accent = "gold",
  dark = false,
  tone = "white",
}) => {
  const accentColor = ACCENT_VAR[accent];
  const bg = dark ? undefined : tone === "beige" ? "var(--beige)" : "var(--white)";

  return (
    <div
      className={"card lift " + (dark ? "card-dark" : "")}
      style={{
        padding: 22,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        borderTop: dark ? "1px solid rgba(255,255,255,0.04)" : "none",
        background: bg,
        boxShadow: tone === "beige" ? "none" : undefined,
        border: tone === "beige" ? "1px solid var(--border)" : undefined,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: dark ? "rgba(255,255,255,0.55)" : "var(--ink-3)",
          }}
        >
          {label}
        </div>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 6,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: dark
              ? "rgba(184,150,90,0.14)"
              : tone === "beige"
                ? "var(--white)"
                : "var(--beige)",
            color: accentColor,
          }}
        >
          <Icon name={icon} size={17} />
        </div>
      </div>
      <div
        style={{
          fontFamily: "var(--display)",
          fontSize: 32,
          fontWeight: 700,
          color: dark
            ? "var(--gold)"
            : tone === "beige"
              ? "var(--gold)"
              : "var(--ink)",
          lineHeight: 1,
          letterSpacing: "-0.02em",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {value}
      </div>
      {delta && (
        <div
          style={{
            fontSize: 12,
            color: dark ? "rgba(255,255,255,0.6)" : "var(--ink-3)",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span style={{ color: accentColor, fontWeight: 600 }}>{delta.value}</span>
          <span>{delta.label}</span>
        </div>
      )}
    </div>
  );
};

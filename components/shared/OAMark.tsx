import * as React from "react";

export interface OAMarkProps {
  size?: number;
  dark?: boolean;
}

/**
 * Square brand mark — "OA" inside a dark badge with a gold outline.
 */
export const OAMark: React.FC<OAMarkProps> = ({ size = 36, dark = true }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: 2,
      background: dark ? "#233149" : "transparent",
      border: dark ? "1px solid rgba(184,150,90,0.45)" : "1px solid var(--gold)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "var(--display)",
      fontWeight: 700,
      color: "var(--gold)",
      fontSize: size * 0.42,
      letterSpacing: "-0.04em",
      lineHeight: 1,
      flexShrink: 0,
    }}
  >
    <span style={{ marginRight: -1 }}>O</span>
    <span>A</span>
  </div>
);

export interface LogotypeProps {
  light?: boolean;
  compact?: boolean;
}

/**
 * Brand mark + wordmark used in the sidebar header.
 * Default = light wordmark for a dark sidebar background.
 */
export const Logotype: React.FC<LogotypeProps> = ({
  light = false,
  compact = false,
}) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
    <OAMark size={36} />
    {!compact && (
      <div style={{ lineHeight: 1.1 }}>
        <div
          style={{
            fontFamily: "var(--display)",
            fontSize: 16,
            fontWeight: 700,
            color: light ? "var(--ink)" : "var(--white)",
            letterSpacing: "-0.01em",
          }}
        >
          Odyssée
        </div>
        <div
          style={{
            fontSize: 9.5,
            letterSpacing: "0.32em",
            textTransform: "uppercase",
            color: "var(--gold)",
            marginTop: 3,
            fontWeight: 700,
          }}
        >
          Advisory
        </div>
      </div>
    )}
  </div>
);

import * as React from "react";

export interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  action?: React.ReactNode;
}

/**
 * Section header with optional gold eyebrow and right-aligned action slot.
 */
export const PageHeader: React.FC<PageHeaderProps> = ({
  eyebrow,
  title,
  action,
}) => (
  <div
    style={{
      display: "flex",
      alignItems: "flex-end",
      justifyContent: "space-between",
      marginBottom: 18,
    }}
  >
    <div>
      {eyebrow && (
        <div
          style={{
            fontSize: 10.5,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            fontWeight: 700,
            color: "var(--gold)",
            marginBottom: 4,
          }}
        >
          {eyebrow}
        </div>
      )}
      <h2 style={{ fontSize: 20, fontWeight: 600 }}>{title}</h2>
    </div>
    {action}
  </div>
);

export { PageHeader as SectionHeader };

import * as React from "react";
import { Icon } from "./Icon";

export interface StepperProps {
  steps: string[];
  current: number;
}

/**
 * Horizontal stepper — gold filled dots for done/active, neutral for upcoming.
 */
export const Stepper: React.FC<StepperProps> = ({ steps, current }) => (
  <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
    {steps.map((s, i) => {
      const done = i < current;
      const active = i === current;
      return (
        <React.Fragment key={s}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
              flexShrink: 0,
              minWidth: 0,
            }}
          >
            <div
              className={active ? "step-dot-active" : ""}
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background:
                  done ? "var(--gold)" : active ? "var(--gold)" : "var(--white)",
                color: done || active ? "var(--ink)" : "var(--ink-3)",
                border:
                  done || active
                    ? "1px solid var(--gold)"
                    : "1px solid var(--border)",
                fontSize: 11,
                fontWeight: 700,
                fontFamily: "var(--mono)",
              }}
            >
              {done ? <Icon name="check" size={13} stroke={2.5} /> : i + 1}
            </div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: active ? "var(--ink)" : "var(--ink-3)",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                whiteSpace: "nowrap",
              }}
            >
              {s}
            </div>
          </div>
          {i < steps.length - 1 && (
            <div
              style={{
                flex: 1,
                height: 1,
                margin: "0 12px",
                background: i < current ? "var(--gold)" : "var(--border)",
                marginTop: -22,
              }}
            />
          )}
        </React.Fragment>
      );
    })}
  </div>
);

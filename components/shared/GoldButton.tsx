"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "dark" | "ghost-gold";
type Size = "default" | "sm";

const VARIANT_CLASS: Record<Variant, string> = {
  primary: "btn btn-primary",
  secondary: "btn btn-secondary",
  dark: "btn btn-dark",
  "ghost-gold": "btn btn-ghost-gold",
};

const SIZE_CLASS: Record<Size, string> = {
  default: "",
  sm: "btn-sm",
};

export interface GoldButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

/**
 * Project-wide button. Uses the .btn / .btn-* classes from globals.css so the
 * design matches the exported Claude Design styles exactly.
 */
export const GoldButton = React.forwardRef<HTMLButtonElement, GoldButtonProps>(
  (
    { variant = "primary", size = "default", className, children, ...rest },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        className={cn(VARIANT_CLASS[variant], SIZE_CLASS[size], className)}
        {...rest}
      >
        {children}
      </button>
    );
  },
);
GoldButton.displayName = "GoldButton";

"use client";

import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

const LOCALES = [
  { code: "fr", label: "FR" },
  { code: "en", label: "EN" },
  { code: "ar", label: "AR" },
] as const;

const SUPPORTED = new Set(LOCALES.map((l) => l.code as string));

export interface LanguageSwitcherProps {
  /** Style visuel : `sidebar` (fond sombre) ou `default` (fond clair). */
  variant?: "sidebar" | "default";
}

/**
 * Sélecteur de langue (FR / EN / AR).
 *
 * - Bascule l'URL vers la nouvelle locale (`/fr/... ↔ /en/... ↔ /ar/...`).
 * - Sauvegarde la préférence dans `users.langue` (best-effort).
 * - `<html lang/dir>` est mis à jour par <HtmlDir> dans le layout locale.
 */
export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  variant = "default",
}) => {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const tCommon = useTranslations("common");
  const [pending, setPending] = React.useState<string | null>(null);

  const onChange = async (newLocale: string) => {
    if (newLocale === locale || pending) return;
    setPending(newLocale);

    // Remplacer le 1er segment de l'URL par la nouvelle locale.
    const path = pathname || "/";
    const segments = path.split("/");
    if (segments.length > 1 && SUPPORTED.has(segments[1])) {
      segments[1] = newLocale;
    } else {
      segments.splice(1, 0, newLocale);
    }
    const newPath = segments.join("/") || `/${newLocale}`;

    // Sauvegarder la préférence (best-effort, ne bloque pas la navigation).
    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      );
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from("users")
          .update({ langue: newLocale })
          .eq("id", user.id);
      }
    } catch {
      // ignore — la navigation prime
    }

    router.push(newPath);
    router.refresh();
  };

  const isSidebar = variant === "sidebar";
  const containerStyle: React.CSSProperties = {
    display: "inline-flex",
    gap: 4,
    padding: 4,
    borderRadius: 999,
    background: isSidebar ? "rgba(255,255,255,0.04)" : "var(--bg-app)",
    border: isSidebar
      ? "1px solid rgba(255,255,255,0.08)"
      : "1px solid var(--border)",
  };

  const buttonBase: React.CSSProperties = {
    minWidth: 36,
    padding: "6px 10px",
    fontSize: 11.5,
    fontWeight: 700,
    letterSpacing: "0.06em",
    borderRadius: 999,
    cursor: "pointer",
    border: "none",
    transition: "all 0.15s ease",
  };

  return (
    <div
      role="group"
      aria-label={tCommon("settings")}
      style={containerStyle}
    >
      {LOCALES.map((l) => {
        const active = locale === l.code;
        const style: React.CSSProperties = {
          ...buttonBase,
          background: active ? "var(--gold)" : "transparent",
          color: active
            ? "#FFFFFF"
            : isSidebar
              ? "rgba(255,255,255,0.55)"
              : "var(--ink-2)",
          opacity: pending && pending !== l.code ? 0.5 : 1,
        };
        return (
          <button
            key={l.code}
            type="button"
            onClick={() => onChange(l.code)}
            disabled={!!pending}
            aria-pressed={active}
            style={style}
            title={l.label}
          >
            {l.label}
          </button>
        );
      })}
    </div>
  );
};

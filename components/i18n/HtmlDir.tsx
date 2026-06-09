"use client";

import * as React from "react";

/**
 * Met à jour `<html lang="…" dir="…">` côté client en fonction de la locale
 * active. L'arabe passe en `rtl` ; les autres langues restent en `ltr`.
 * Évite un flash en mettant à jour aussi sur changement de locale.
 */
export function HtmlDir({ locale }: { locale: string }): null {
  React.useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.lang = locale || "fr";
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
  }, [locale]);
  return null;
}

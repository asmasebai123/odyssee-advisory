import * as React from "react";
import { Poppins, Cormorant_Garamond } from "next/font/google";
import "./globals.css";

// Titres + corps de texte — Poppins (style LawSight), chargé via next/font
// (auto-hébergé, sans décalage de mise en page).
const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

// Accent or italique (« Pierre », « experience »…) — Cormorant Garamond.
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${poppins.variable} ${cormorant.variable}`}>
      <body>{children}</body>
    </html>
  );
}

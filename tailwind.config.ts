import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      colors: {
        // Brand palette — Odyssée Advisory (light luxury / espresso)
        background: "#FCFAF5", // near-white warm canvas
        card: "#FFFFFF",
        surface: "#F7F2E6", // warm beige
        beige: "#F7F2E6",
        "beige-soft": "#FBF6EB",
        cream: "#FFFCF5",
        gold: {
          DEFAULT: "#C9A26A",
          hover: "#AE8853",
          deep: "#AE8853",
          soft: "#DDC196",
          dim: "rgba(201, 162, 106, 0.10)",
          line: "rgba(201, 162, 106, 0.22)",
        },
        sidebar: {
          DEFAULT: "#221710", // espresso
          alt: "#2D1F16",
          deep: "#1F1611",
          text: "#A99784", // muted warm inactive
          textAlt: "#C9A26A",
        },
        text: {
          DEFAULT: "#2F2418",
          muted: "#685749",
          subtle: "#A99784",
        },
        ink: {
          DEFAULT: "#2F2418",
          2: "#685749",
          3: "#A99784",
        },
        border: {
          DEFAULT: "#F1E8D2",
          soft: "#F6EFDE",
          dark: "rgba(255,255,255,0.10)",
        },
        success: "#2D7A4F",
        warning: "#C8860A",
        error: "#C0392B",
      },
      fontFamily: {
        display: ['var(--font-display)', '"Plus Jakarta Sans"', '"Inter"', "sans-serif"],
        sans: ['var(--font-sans)', '"Inter"', "system-ui", "sans-serif"],
        serif: ['var(--font-display)', '"Plus Jakarta Sans"', '"Inter"', "serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
      },
      borderRadius: {
        DEFAULT: "12px",
        sm: "8px",
        pill: "9999px",
      },
      boxShadow: {
        card: "0 1px 3px rgba(60,40,15,0.06), 0 6px 16px rgba(60,40,15,0.04)",
        lift: "0 4px 8px rgba(60,40,15,0.06), 0 18px 36px rgba(60,40,15,0.10)",
        gold: "0 1px 2px rgba(184,150,90,0.25), inset 0 1px 0 rgba(255,255,255,0.18)",
        "gold-lift": "0 6px 18px rgba(184,150,90,0.32)",
      },
      keyframes: {
        pulseGold: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(184,150,90,0.5)" },
          "50%": { boxShadow: "0 0 0 6px rgba(184,150,90,0)" },
        },
        fadeUp: {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "pulse-gold": "pulseGold 2s infinite",
        "fade-up": "fadeUp .35s ease both",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;

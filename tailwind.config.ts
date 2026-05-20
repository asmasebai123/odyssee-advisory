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
        // Brand palette — Odyssée Advisory
        background: "#FAF8F3", // warm ivory — main bg
        card: "#FFFFFF",
        surface: "#F0EBE0", // warm beige
        beige: "#F0E8D6",
        "beige-soft": "#F7F0E0",
        gold: {
          DEFAULT: "#B8965A",
          hover: "#A07840",
          soft: "#C9A86B",
          dim: "rgba(184, 150, 90, 0.14)",
          line: "rgba(184, 150, 90, 0.32)",
        },
        sidebar: {
          DEFAULT: "#2C3E5C", // steel blue
          alt: "#364A6B",
          deep: "#233149",
          text: "#8FA8C8", // muted blue inactive
          textAlt: "#9AB1CE",
        },
        text: {
          DEFAULT: "#2C2C2C",
          muted: "#555555",
          subtle: "#8C8275",
        },
        ink: {
          DEFAULT: "#2C2C2C",
          2: "#555555",
          3: "#8C8275",
        },
        border: {
          DEFAULT: "#E8E2D8",
          soft: "#EFE7D2",
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

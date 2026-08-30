import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Official FLOP Brand Palette
        flop: {
          base: "#0A1128", // Primary wordmark, Headings, Dark backgrounds, Main dark UI
          grey: "#5C6670", // Secondary text, Captions, Dividers, Disabled UI on Base
          blue: "#0466C8", // Links, Interactive elements, Structural fills, Selected states
          cyan: "#00B4D8", // FLOP Chip, Rare accent, Important highlights (used sparingly)
          green: "#32D74B", // Live states, Success, Verified states, Healthy network states
          ice: "#F5F7FA", // Light backgrounds, Primary light surfaces, Reversed wordmark
        },
        // Semantic aliases for consistency
        background: "#0A1128",
        surface: "#0e1838",
        "surface-raised": "#13214a",
        "surface-border": "rgba(92, 102, 112, 0.28)",
        "surface-highlight": "rgba(4, 102, 200, 0.25)",
        text: {
          primary: "#F5F7FA",
          secondary: "#5C6670",
          muted: "rgba(245, 247, 250, 0.65)",
        },
      },
      fontFamily: {
        mono: [
          "JetBrains Mono",
          "Fira Code",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "radar-sweep": "radarSweep 3.5s linear infinite",
        "scan-line": "scanLine 2.5s ease-in-out infinite",
      },
      keyframes: {
        radarSweep: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        scanLine: {
          "0%, 100%": { transform: "translateY(0%)" },
          "50%": { transform: "translateY(100%)" },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;

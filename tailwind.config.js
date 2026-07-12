/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        paper: "#f7f3ee",
        ink: "#1a1a1a",
        "ink-soft": "#2b2b2b",
        jd: {
          red: "#e1251b",
          dark: "#b51d14",
        },
        acid: "#ffd500",
        muted: "#8b8580",
      },
      fontFamily: {
        display: ['"Noto Serif SC"', '"Source Han Serif SC"', "serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "Menlo", "monospace"],
      },
      boxShadow: {
        hard: "6px 6px 0 0 #1a1a1a",
        "hard-sm": "4px 4px 0 0 #1a1a1a",
      },
    },
  },
  plugins: [],
};

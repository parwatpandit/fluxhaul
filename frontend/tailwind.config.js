/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Geist", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      colors: {
        brand: {
          50:  "#ecfeff",
          100: "#cffafe",
          200: "#a5f3fc",
          300: "#67e8f9",
          400: "#22d3ee",
          500: "#06b6d4",
          600: "#0891b2",
          700: "#0e7490",
          800: "#155e75",
          900: "#164e63",
        },
        surface: {
          DEFAULT: "#0a0a0a",
          50:  "#111111",
          100: "#161616",
          200: "#1c1c1c",
          300: "#242424",
          400: "#2e2e2e",
          500: "#3a3a3a",
        },
      },
      boxShadow: {
        "glow-sm": "0 0 10px rgba(6,182,212,0.3)",
        "glow-md": "0 0 25px rgba(6,182,212,0.25)",
        "glow-lg": "0 0 50px rgba(6,182,212,0.2)",
        "glass":   "0 8px 32px rgba(0,0,0,0.4)",
      },
      animation: {
        "fade-in":    "fadeIn 0.5s ease forwards",
        "slide-up":   "slideUp 0.5s ease forwards",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0" },
          to:   { opacity: "1" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 10px rgba(6,182,212,0.3)" },
          "50%":      { boxShadow: "0 0 30px rgba(6,182,212,0.6)" },
        },
      },
    },
  },
  plugins: [],
};
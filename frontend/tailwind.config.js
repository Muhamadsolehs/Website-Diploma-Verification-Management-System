/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      colors: {
        dvms: {
          bg: "#111111",
          panel: "#1b1b1f",
          panel2: "#20232c",
          slate: "#313b4f",
          purple: "#5a20ff",
          purple2: "#371568",
          lime: "#d7ff00",
          green: "#11c991",
          red: "#ff8f8f",
          muted: "#aaa9b8",
          border: "#3a3943",
        },
      },
      boxShadow: {
        glow: "0 0 32px rgba(90,32,255,.22)",
        lime: "0 0 26px rgba(215,255,0,.18)",
      },
    },
  },
  plugins: [],
};

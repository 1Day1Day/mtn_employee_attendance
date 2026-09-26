import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        mtn: {
          yellow: "#FFCC00",
          "yellow-dark": "#E6B800",
          black: "#0A0A0A",
          charcoal: "#1F1F1F",
          grey: "#6B6B6B",
          "grey-light": "#F5F5F5",
        },
        status: {
          success: "#16A34A",
          error: "#DC2626",
          pending: "#EA580C",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 2px 10px rgba(0,0,0,0.06)",
      },
    },
  },
  plugins: [],
};

export default config;

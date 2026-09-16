import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Derived from docs/DESIGN.md — sampled from the reference dashboard.
        ink: {
          950: "#34256E",
          900: "#3B2A82",
          800: "#4B3AA0",
          700: "#6954B7",
          600: "#8170D8",
          500: "#8D87FF",
          300: "#C5C2FE",
          100: "#E5E4FF",
        },
        sky: {
          100: "#E4EEFD",
        },
        text: {
          heading: "#170B42",
          body: "#525266",
          muted: "#9C9CAE",
        },
        surface: {
          page: "#F5F5FA",
          card: "#FFFFFF",
          border: "#ECEBF3",
        },
        status: {
          success: "#5FA83B",
          danger: "#D36063",
        },
      },
      borderRadius: {
        card: "20px",
      },
      boxShadow: {
        card: "0 8px 24px -8px rgba(59, 42, 130, 0.10)",
      },
    },
  },
  plugins: [],
};

export default config;

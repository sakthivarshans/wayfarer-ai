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
        // Warm secondary family — added for the design refresh (see
        // docs/DESIGN.md "Redesign addendum"). Used for marketing-feeling
        // moments (auth pages, place-card scrims, empty states) so the app
        // isn't one flat violet hue everywhere. Never replaces ink as the
        // primary interactive/brand color.
        sand: {
          50: "#FBF6EE",
          100: "#F5EAD6",
          300: "#E8CBA0",
          500: "#D9A567",
          700: "#B87A3D",
        },
        coral: {
          400: "#E8825F",
          500: "#DE6A43",
          600: "#C4522E",
        },
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "Georgia", "serif"],
        sans: ["var(--font-general-sans)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "20px",
      },
      boxShadow: {
        card: "0 8px 24px -8px rgba(59, 42, 130, 0.10)",
        warm: "0 12px 32px -10px rgba(180, 90, 40, 0.22)",
      },
    },
  },
  plugins: [],
};

export default config;

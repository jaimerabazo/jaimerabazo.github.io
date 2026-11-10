import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx,mdx}",
    "./components/**/*.{ts,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "ui-serif", "Georgia", "serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
        hand: ["var(--font-hand)", "cursive"],
      },
      colors: {
        paper: {
          DEFAULT: "#f3efe6",
          light: "#faf8f3",
          dark: "#e7e1d3",
        },
        ink: {
          400: "#9a978f",
          500: "#6f6c66",
          600: "#4b4945",
          700: "#2b2a28",
          900: "#151515",
        },
        // Ballpoint blue — for handwritten notes and doodles
        pen: "#2c49b8",
        // Departure-board colors
        board: "#18181b",
        flap: "#f4c84a",
        signal: "#e4572e",
        // Boarding pass livery bands
        livery: {
          DEFAULT: "#1c2747",
          gold: "#d9b45f",
        },
      },
      boxShadow: {
        card: "var(--shadow-card)",
        prop: "var(--shadow-prop)",
        art: "var(--shadow-art)",
        pressed: "var(--shadow-pressed)",
      },
      letterSpacing: {
        tightest: "-0.04em",
        tighter: "-0.03em",
        tight2: "-0.022em",
      },
      keyframes: {
        blink: {
          "0%, 55%": { opacity: "1" },
          "56%, 100%": { opacity: "0.25" },
        },
      },
      animation: {
        blink: "blink 1.2s steps(1) infinite",
      },
    },
  },
  plugins: [],
};

export default config;

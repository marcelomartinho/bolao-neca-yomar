import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)"],
        cond: ["var(--font-cond)"],
        mono: ["var(--font-mono)"],
      },
      colors: {
        paper: "#fbfaf4",
        paper2: "#f4f1e6",
        ink: "#0b2c5c",
        ink2: "#5a6a86",
        line: "#d5dde7",
        grass: "#0b6b3a",
        grassSoft: "#e5efe8",
        gold: "#c79410",
        goldSoft: "#f6ecc7",
        bluebr: "#0b2c5c",
        blueSoft: "#e8edf5",
      },
      boxShadow: {
        paper: "0 4px 6px -1px rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.06)",
      },
    },
  },
  plugins: [],
} satisfies Config;

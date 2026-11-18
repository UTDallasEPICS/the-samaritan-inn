import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary:   "#00167c",
        secondary: "#0caebb",
        light:     "#c7c8ca",
        white:     "#ffffff",
      },
      fontFamily: {
        // `font-sans` → Montserrat everywhere
        sans: ["Montserrat", "sans‑serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;

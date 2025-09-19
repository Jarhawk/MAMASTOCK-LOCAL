import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  safelist: [
    "bg-zinc-900",
    "text-zinc-100",
    "hover:bg-zinc-800/50",
    "hover:bg-muted",
    "font-semibold",
    "border-border",
    "bg-background",
    "text-foreground",
    "shadow-lg",
    "drop-shadow-[0_0_20px_rgba(255,210,0,0.8)]",
    {
      pattern: /(bg|text|border)-(muted|background|foreground)/
    }
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--mamastock-bg)",
        text: "var(--mamastock-text)",
      },
    },
  },
  plugins: [],
} satisfies Config;

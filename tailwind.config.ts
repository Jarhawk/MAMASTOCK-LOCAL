import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"] ,
  theme: {
    extend: {
      colors: {
        background: "var(--mamastock-bg)",
        text: "var(--mamastock-text)"
      }
    }
  },
  plugins: []
} satisfies Config;

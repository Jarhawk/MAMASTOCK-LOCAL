import type { Config } from "tailwindcss";

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    "hidden","block","md:hidden","md:block",
    "w-64","border-r","flex","min-h-screen","flex-1","min-w-0",
    "opacity-0","opacity-100","translate-x-0","-translate-x-full","md:translate-x-0"
  ],
  theme: { extend: {} },
  plugins: [],
} satisfies Config;

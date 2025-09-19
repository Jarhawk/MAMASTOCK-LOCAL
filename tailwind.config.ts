import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  safelist: [
    "fixed","md:relative","hidden","md:flex","w-64","md:w-64",
    "z-50","h-screen","overflow-y-auto","flex","flex-col","space-y-1",
    "px-2","px-3","py-2","rounded-md","items-center","justify-between","md:justify-start",
    "bg-gray-900","text-white","text-gray-300","hover:bg-gray-700","hover:text-white",
    "group","group-hover:text-white","group-hover:bg-gray-700"
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

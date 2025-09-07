import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
const tauriApi = "@tauri-apps/api";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@tauri-apps/plugin-path": `${tauriApi}/path`,
    },
  },
  server: {
    port: 5173,
  },
  build: {
    rollupOptions: {
      external: [/^@tauri-apps\/api/],
    },
  },
});

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "@tauri-apps/plugin-path": "@tauri-apps/api/path",
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

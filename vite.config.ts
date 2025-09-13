import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const isTauri = !!process.env.TAURI_PLATFORM;

export default defineConfig({
  base: isTauri ? "./" : "/",
  plugins: [react()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
  server: {
    port: 5173,
    strictPort: true,
    host: true,
    hmr: { overlay: true },
  },
});

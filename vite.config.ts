import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA as pwa } from "vite-plugin-pwa";

const isTauri =
  !!process.env.TAURI_PLATFORM || process.env.VITE_TAURI === "1";

const plugins = [
  react(),
  !isTauri &&
    pwa({
      registerType: "autoUpdate",
    }),
].filter(Boolean);

export default defineConfig({
  base: isTauri ? "./" : "/",
  plugins,
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

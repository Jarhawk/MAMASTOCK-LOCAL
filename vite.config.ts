import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";
import { VitePWA as pwa } from "vite-plugin-pwa";

const isTauri =
  !!process.env.TAURI_PLATFORM || process.env.VITE_TAURI === "1";

export default defineConfig(({ mode }) => {
  const plugins = [react()];

  if (mode === "production" && !isTauri) {
    plugins.push(
      pwa({
        registerType: "autoUpdate",
      })
    );
  }

  return {
    base: isTauri ? "./" : "/",
    plugins,
    resolve: {
      alias: { "@": resolve(__dirname, "src") },
    },
    server: {
      port: 5173,
      strictPort: true,
      host: true,
      hmr: { overlay: true },
    },
    optimizeDeps: {
      entries: ["index.html", "src/main.jsx"],
      exclude: [
        "@tauri-apps/api",
        "@tauri-apps/plugin-fs",
        "@tauri-apps/plugin-dialog",
        "@tauri-apps/plugin-shell",
        "@tauri-apps/plugin-process",
        "@tauri-apps/plugin-log",
        "@tauri-apps/plugin-sql",
      ],
    },
    build: {
      rollupOptions: {
        input: resolve(__dirname, "index.html"),
      },
    },
    appType: "spa",
  };
});

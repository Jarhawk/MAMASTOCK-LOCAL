import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";
import { VitePWA as pwa } from "vite-plugin-pwa";

const isTauri =
  !!process.env.TAURI_PLATFORM || process.env.VITE_TAURI === "1";

export default defineConfig(({ mode }) => {
  const plugins = [
    react(),
    !isTauri &&
      pwa({
        registerType: "autoUpdate",
      }),
  ].filter(Boolean);

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
      chunkSizeWarningLimit: 1600,
      rollupOptions: {
        input: resolve(__dirname, "index.html"),
        output: {
          manualChunks(id) {
            if (id.includes("xlsx")) return "xlsx";
            if (id.includes("jspdf")) return "jspdf";
            if (id.includes("html2canvas")) return "html2canvas";
            if (id.includes("recharts")) return "recharts";
            if (id.includes("dompurify")) return "purify";
            if (id.includes("@tauri-apps")) return "tauri";
          },
        },
      },
    },
    appType: "spa",
  };
});

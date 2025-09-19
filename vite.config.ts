import path from "node:path";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA as pwa } from "vite-plugin-pwa";

const isTauri = !!process.env.TAURI_PLATFORM || process.env.VITE_TAURI === "1";

export default defineConfig(() => {
  const plugins = [
    react(),
    !isTauri &&
      pwa({
        registerType: "autoUpdate",
      }),
  ].filter(Boolean);

  return {
    base: "./",
    plugins,
    resolve: {
      // CODEREVIEW: normalize absolute imports with @/*
      alias: {
        "@": path.resolve(__dirname, "src"),
        "#db": path.resolve(__dirname, "db"),
      },
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
      target: "es2020",
      chunkSizeWarningLimit: 1500,
      rollupOptions: {
        input: path.resolve(__dirname, "index.html"),
        output: {
          // CODEREVIEW: split heavy vendors to speed up load and avoid 500k warnings
          manualChunks: {
            react: ["react", "react-dom"],
            recharts: ["recharts"],
            xlsx: ["xlsx"],
            pdf: ["jspdf", "jspdf-autotable", "html2canvas"],
            sanitize: ["dompurify"],
            tauri: [
              "@tauri-apps/api",
              "@tauri-apps/plugin-dialog",
              "@tauri-apps/plugin-fs",
              "@tauri-apps/plugin-log",
              "@tauri-apps/plugin-process",
              "@tauri-apps/plugin-shell",
              "@tauri-apps/plugin-sql",
            ],
          },
        },
      },
    },
    appType: "spa",
  };
});

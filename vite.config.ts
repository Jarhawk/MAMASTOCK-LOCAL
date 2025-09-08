import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      crypto: "crypto-browserify",
      stream: "stream-browserify",
      buffer: "buffer",
      process: "process/browser",
    },
  },
  define: {
    "process.env": {},
  },
  optimizeDeps: {
    include: ["crypto-browserify", "stream-browserify", "buffer", "process"],
  },
  server: {
    port: 5173,
  },
  build: {
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      external: [/^@tauri-apps\/api/],
    },
  },
});

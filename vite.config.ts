import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      crypto: path.resolve(__dirname, "src/shims/crypto.ts"),
      "node:crypto": path.resolve(__dirname, "src/shims/crypto.ts"),
    },
  },
  define: { global: "globalThis" },
  optimizeDeps: {
    exclude: ["bcryptjs", "crypto-js"],
    esbuildOptions: { define: { global: "globalThis" } },
  },
  server: { port: 5173, strictPort: true, host: true },
});

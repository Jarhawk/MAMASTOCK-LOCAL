import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  base: "/",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      crypto: "/src/shims/crypto.ts",
    },
  },
  define: {
    global: "globalThis",
  },
  optimizeDeps: {
    // bcryptjs sometimes breaks if pre-bundled with a hard 'crypto' require
    exclude: ["bcryptjs"],
    esbuildOptions: {
      define: { global: "globalThis" },
    },
  },
  server: { port: 5173, strictPort: true, host: true },
});

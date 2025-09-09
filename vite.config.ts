import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

const cryptoShim = fileURLToPath(new URL("./src/shims/crypto.ts", import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      crypto: cryptoShim,
      "node:crypto": cryptoShim,
    },
  },
  define: { global: "globalThis" },
  optimizeDeps: {
    exclude: ["bcryptjs", "crypto-js"],
    esbuildOptions: { define: { global: "globalThis" } },
  },
  server: { port: 5173, strictPort: true, host: true },
});

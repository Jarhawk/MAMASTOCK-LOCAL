import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  server: { port: 5173, strictPort: true },
  base: '/',
  plugins: [react()],
  optimizeDeps: {
    exclude: ['@tauri-apps/plugin-log', '@surma/rollup-plugin-off-main-thread'],
    entries: ['src/main.jsx'],
  },
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
});


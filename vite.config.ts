import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react() as any],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
    conditions: ['tauri']
  },
  esbuild: {
    loader: 'tsx',
    include: /src\/.*\.[tj]sx?$/,
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'tsx',
        '.jsx': 'tsx'
      }
    }
  },
  server: {
    port: 5173
  }
});

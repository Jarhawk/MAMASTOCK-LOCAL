import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react() as any],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['test/setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@tauri-apps/api/path': path.resolve(__dirname, './test/stubs/tauri-path.ts'),
      '@tauri-apps/api/fs': path.resolve(__dirname, './test/stubs/tauri-fs.ts'),
    }
  },
});

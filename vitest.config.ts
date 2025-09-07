import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react() as any],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['test/setup.ts'],
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@tauri-apps/api/path': fileURLToPath(
        new URL('./test/stubs/tauri-path.ts', import.meta.url)
      ),
      '@tauri-apps/plugin-fs': fileURLToPath(
        new URL('./test/stubs/tauri-fs.ts', import.meta.url)
      ),
      '@tauri-apps/plugin-dialog': fileURLToPath(
        new URL('./test/stubs/tauri-dialog.ts', import.meta.url)
      ),
    },
    extensions: ['.js', '.ts', '.tsx'],
  },
});

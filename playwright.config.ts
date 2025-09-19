import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./test/e2e",
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: "http://127.0.0.1:4173",
    trace: "on-first-retry",
    headless: true,
  },
  webServer: {
    // Build puis préview Vite sur un port/host fixes (OK dans Docker)
    command: "npm run build && npm run preview -- --port 4173 --host 0.0.0.0 --strictPort",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: !process.env.CI,
    timeout: 240_000,           // laisse le temps à la build en conteneur
    stdout: "pipe",
    stderr: "pipe",
  },
});

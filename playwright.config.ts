import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./test/e2e",
  timeout: 60000,
  expect: {
    timeout: 10000
  },
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: "http://127.0.0.1:4173",
    trace: "on-first-retry",
    headless: true
  },
  webServer: {
    command: "npm run build -- --logLevel silent && npm run preview -- --port 4173 --host 127.0.0.1",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: !process.env.CI,
    stdout: "pipe",
    stderr: "pipe"
  }
});

import { defineConfig } from "@playwright/test";

const useWebServer = process.env.PW_WEBSERVER === "1";

export default defineConfig({
  testDir: "./tests/e2e",
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3000",
    headless: true,
    launchOptions: {
      chromiumSandbox: false
    }
  },
  webServer: useWebServer
    ? {
        command: "npm run dev",
        url: "http://localhost:3000",
        reuseExistingServer: true,
        timeout: 120000
      }
    : undefined,
  timeout: 60000,
  retries: 0
});

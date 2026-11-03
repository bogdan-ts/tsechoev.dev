import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  use: { baseURL: "http://127.0.0.1:3000" },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["iPhone 13"], viewport: { width: 375, height: 812 }, defaultBrowserType: "chromium" } },
  ],
  webServer: { command: "npm run preview", url: "http://127.0.0.1:3000", reuseExistingServer: false },
});

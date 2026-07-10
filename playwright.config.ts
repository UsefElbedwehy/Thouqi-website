import { defineConfig, devices } from "@playwright/test";

/**
 * e2e config. Runs against a real dev server (needs the live Supabase env in
 * `.env.local` — these are integration tests, unlike the hermetic Vitest unit
 * suite). `npm run test:e2e` boots the server itself; set `E2E_BASE_URL` to
 * point at an already-running one instead.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3000",
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: "npm run dev",
        url: "http://localhost:3000",
        reuseExistingServer: true,
        timeout: 60_000,
      },
});

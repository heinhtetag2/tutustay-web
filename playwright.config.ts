import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.E2E_PORT ?? 3100);

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 45_000,
  expect: { timeout: 10_000 }, // the dev server compiles pages on first hit
  fullyParallel: false,
  retries: 0,
  reporter: [["list"]],
  use: { baseURL: `http://localhost:${PORT}`, trace: "retain-on-failure" },
  projects: [{ name: "desktop", use: { ...devices["Desktop Chrome"] } }, { name: "mobile", use: { ...devices["Pixel 7"] } }],
  webServer: { command: `npm run dev -- -p ${PORT}`, url: `http://localhost:${PORT}/en`, reuseExistingServer: true, timeout: 120_000 },
});

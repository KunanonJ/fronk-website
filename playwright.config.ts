import { defineConfig, devices } from "@playwright/test";

/**
 * Behavioral E2E (smoke.spec, a11y.spec) and visual regression (visual.spec).
 *
 * Smoke and a11y run on every PR (CI job e2e-smoke, desktop Chromium) and can
 * run locally against any server via PLAYWRIGHT_BASE_URL. Visual baselines
 * are Linux-only and captured in the pinned Playwright Docker image; see the
 * header of tests/e2e/visual.spec.ts for the local command and refresh flow.
 */

const PORT = Number(process.env.PORT ?? 3000);
// 127.0.0.1, not localhost: in CI containers Node and the server can resolve
// localhost to different address families.
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: "./tests/e2e",
  // Visual diffs are deterministic only when motion is settled; give the app
  // room to hydrate and disable animations at assertion time per-test.
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  expect: {
    // Allow a tiny per-pixel tolerance so font anti-aliasing / grain noise
    // doesn't cause false visual-regression failures.
    toHaveScreenshot: { maxDiffPixelRatio: 0.01, animations: "disabled" },
  },
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
  },
  projects: [
    {
      // Chromium at a phone viewport so visual baselines capture the mobile
      // breakpoint (the iPhone/WebKit engine is covered by the `webkit` project).
      name: "mobile",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 375, height: 812 },
      },
    },
    {
      name: "tablet",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 768, height: 1024 },
      },
    },
    {
      name: "desktop",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 900 },
      },
    },
    // Cross-browser engines (behavioral smoke only; visual.spec is Chromium-only).
    {
      name: "webkit",
      use: {
        ...devices["Desktop Safari"],
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: "firefox",
      use: {
        ...devices["Desktop Firefox"],
        viewport: { width: 1440, height: 900 },
      },
    },
    // Profile redesign device matrix (design spec 10.1) and an iPhone-class
    // WebKit phone, for the hidden /preview pages only (profile*.spec.ts):
    // the Galaxy Z Fold closed and open, and a tablet in landscape.
    {
      name: "fold-closed",
      testMatch: /profile(-[a-z-]+)?\.spec\.ts$/,
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 344, height: 882 },
      },
    },
    {
      name: "fold-open",
      testMatch: /profile(-[a-z-]+)?\.spec\.ts$/,
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 882, height: 1104 },
      },
    },
    {
      name: "tablet-landscape",
      testMatch: /profile(-[a-z-]+)?\.spec\.ts$/,
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1180, height: 820 },
      },
    },
    {
      name: "webkit-phone",
      testMatch: /profile(-[a-z-]+)?\.spec\.ts$/,
      use: {
        ...devices["iPhone 13"],
        viewport: { width: 390, height: 844 },
      },
    },
  ],
  // Reuse a running server if present; otherwise start one. Visual baselines
  // are most stable against `pnpm build && pnpm start` (vite preview, workerd),
  // but `pnpm dev` is fine for local iteration.
  webServer: {
    command: process.env.PLAYWRIGHT_WEB_SERVER ?? "pnpm dev",
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});

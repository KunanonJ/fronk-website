import { defineConfig, devices } from "@playwright/test";

/**
 * Visual-regression + behavioral E2E harness for the terminal-HUD redesign.
 *
 * Why this exists: the redesign is highly visual (pure-black shell, hairline
 * frame, WebGL hero, live HUD). Unit tests can't catch a broken gradient or a
 * shifted frame. This harness screenshots every route at mobile/tablet/desktop
 * and re-runs with reduced-motion forced, so each redesign phase can prove it
 * changed only what it meant to.
 *
 * Baselines are intentionally NOT committed pre-redesign (the soft-brutalism
 * look is about to be replaced). Generate/refresh them per phase against a
 * locally-running server:
 *
 *   pnpm dev                       # in one terminal
 *   pnpm test:e2e --update-snapshots
 *
 * CI can adopt these once the look stabilizes (Phase 8).
 */

const PORT = Number(process.env.PORT ?? 3000);
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? `http://localhost:${PORT}`;

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
      use: { ...devices["Desktop Chrome"], viewport: { width: 375, height: 812 } },
    },
    {
      name: "tablet",
      use: { ...devices["Desktop Chrome"], viewport: { width: 768, height: 1024 } },
    },
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } },
    },
    // Cross-browser engines (behavioral smoke only; visual.spec is Chromium-only).
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"], viewport: { width: 1440, height: 900 } },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"], viewport: { width: 1440, height: 900 } },
    },
  ],
  // Reuse a running dev server if present; otherwise start one. Visual baselines
  // are most stable against `pnpm build && pnpm start`, but dev is fine for
  // local iteration.
  webServer: {
    command: process.env.PLAYWRIGHT_WEB_SERVER ?? "pnpm dev",
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});

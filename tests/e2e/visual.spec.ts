import { expect, test } from "@playwright/test";
import { ROUTES } from "./routes";

/**
 * Full-page visual baselines for every public route, in both themes
 * (visual-redesign Phase 6). They are the parity reference for the TanStack
 * Start migration.
 *
 * Baselines are Linux-only, captured in the official Playwright image so CI
 * and local runs render identically (fonts are self-hosted via next/font):
 *
 *   docker run --rm --ipc=host -v "$PWD":/work -w /work \
 *     mcr.microsoft.com/playwright:v1.64.1-noble \
 *     npx playwright test visual.spec.ts --project=mobile --project=desktop
 *
 * CI runs the same image (the `visual` job). After an intentional visual
 * change, refresh with `--update-snapshots=changed` and review every image.
 *
 * Reduced motion keeps captures deterministic (it also turns off every
 * entrance animation and the Bangkok scene loops), the clock is frozen so the
 * Home "Based in Bangkok" card always reads 10:30 AM, and the first-visit
 * intro is marked as seen so it never covers a capture. Chromium only: WebKit and
 * Firefox rasterise fonts too differently for pixel diffs (smoke.spec covers
 * them). CMS-driven routes are skipped: an owner edit in Sanity would
 * otherwise fail unrelated pull requests.
 */
const CMS_DRIVEN = new Set(["resume", "blog"]);
const THEMES = ["light", "dark"] as const;

test.skip(
  ({ browserName }) => browserName !== "chromium",
  "visual baselines are captured on Chromium only",
);

for (const theme of THEMES) {
  test.describe(`visual (${theme})`, () => {
    test.beforeEach(async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      // 03:30 UTC = 10:30 AM in Bangkok (GMT+7, no DST).
      await page.clock.setFixedTime(new Date("2026-11-09T03:30:00Z"));
      await page.addInitScript((value) => {
        try {
          localStorage.setItem("theme", value);
          sessionStorage.setItem("fronk-intro-seen", "1");
        } catch {
          // Storage can be unavailable; the site then uses its default theme.
        }
      }, theme);
    });

    for (const route of ROUTES) {
      test(`${route.name} matches its baseline`, async ({ page }) => {
        test.skip(CMS_DRIVEN.has(route.name), "content comes from Sanity");
        await page.goto(route.path, { waitUntil: "networkidle" });
        await expect(page.locator("html")).toHaveClass(
          new RegExp(`(^|\\s)${theme}(\\s|$)`),
        );
        // Settle web fonts so glyph metrics are stable across runs.
        await page.evaluate(() => document.fonts.ready);
        await expect(page).toHaveScreenshot(`${route.name}-${theme}.png`, {
          fullPage: true,
        });
      });
    }
  });
}

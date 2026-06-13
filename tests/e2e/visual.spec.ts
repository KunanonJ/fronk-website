import { expect, test } from "@playwright/test";
import { ROUTES } from "./routes";

/**
 * Full-page visual baseline for every public route. Run with
 * `--update-snapshots` to (re)capture after an intentional redesign phase.
 * Snapshot names are namespaced by project (viewport) automatically.
 *
 * Reduced motion is forced so the capture is deterministic: the WebGL hero
 * falls back to its static field, the HUD/ticker freeze, and scroll-reveal
 * stays fully visible — otherwise no two runs would match. Baselines are
 * Chromium-only; WebKit/Firefox font rendering differs too much for pixel diffs
 * (those engines are covered behaviorally by smoke.spec).
 */
test.skip(
  ({ browserName }) => browserName !== "chromium",
  "visual baselines are captured on Chromium only",
);
test.beforeEach(async ({ page }) => {
  // Deterministic capture: WebGL hero → static field, HUD/ticker freeze,
  // scroll-reveal stays fully shown — so two runs match pixel-for-pixel.
  await page.emulateMedia({ reducedMotion: "reduce" });
});

for (const route of ROUTES) {
  test(`visual > ${route.name} > matches baseline`, async ({ page }) => {
    await page.goto(route.path, { waitUntil: "networkidle" });
    // Settle web fonts so glyph metrics are stable across runs.
    await page.evaluate(() => document.fonts.ready);
    await expect(page).toHaveScreenshot(`${route.name}.png`, {
      fullPage: true,
    });
  });
}

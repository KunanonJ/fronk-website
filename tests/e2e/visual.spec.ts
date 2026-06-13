import { expect, test } from "@playwright/test";
import { ROUTES } from "./routes";

/**
 * Full-page visual baseline for every public route. Run with
 * `--update-snapshots` to (re)capture after an intentional redesign phase.
 * Snapshot names are namespaced by project (viewport) automatically.
 */
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

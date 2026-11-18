import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { PREVIEW_ROUTES, ROUTES } from "./routes";

const WCAG_21 = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];
// Pages rebuilt in the profile redesign also run WCAG 2.2 AA (best-practices
// audit, section 6): the previews now, each page family as it moves. axe-core
// leaves its WCAG 2.2 rule (target-size) off unless this tag is named.
const WCAG_22 = [...WCAG_21, "wcag22aa"];
const PREVIEW_PATHS = new Set(PREVIEW_ROUTES.map((route) => route.path));

test("the WCAG 2.2 tag really runs target-size: two 10 px buttons fail it", async ({
  page,
}) => {
  await page.setContent(
    `<main><h1>Fixture</h1><button style="width:10px;height:10px;padding:0;border:0">a</button><button style="width:10px;height:10px;padding:0;border:0">b</button></main>`,
  );
  const results = await new AxeBuilder({ page }).withTags(WCAG_22).analyze();
  expect(results.violations.map((v) => v.id)).toContain("target-size");
});

// Automated WCAG scan on every public route, in both themes. Serious/critical
// violations fail the build; minor/moderate are surfaced in the report only.
//
// Reduced motion is forced so scroll-reveal content renders fully visible
// before the scan. Without it axe raced the reveal: on a cold server it ran
// while content was still at opacity 0 (skipped), so low-contrast text only
// failed intermittently.
test.use({ reducedMotion: "reduce" });

const THEMES = ["dark", "light"] as const;

for (const theme of THEMES) {
  test.describe(`accessibility scan (${theme})`, () => {
    test.beforeEach(async ({ page }) => {
      // next-themes reads its default storage key before first paint.
      await page.addInitScript((value) => {
        try {
          localStorage.setItem("theme", value);
        } catch {
          // Storage can be unavailable; the site then uses its default theme.
        }
      }, theme);
    });

    for (const route of [...ROUTES, ...PREVIEW_ROUTES]) {
      test(`${route.name} has no serious or critical axe violations`, async ({
        page,
      }) => {
        await page.goto(route.path);
        await page.waitForLoadState("networkidle");
        // Guard: the scan must run in the theme it claims to cover.
        await expect(page.locator("html")).toHaveClass(
          new RegExp(`(^|\\s)${theme}(\\s|$)`),
        );

        const results = await new AxeBuilder({ page })
          .withTags(PREVIEW_PATHS.has(route.path) ? WCAG_22 : WCAG_21)
          .analyze();

        const blocking = results.violations.filter((v) =>
          ["serious", "critical"].includes(v.impact ?? ""),
        );

        expect(
          blocking.map((v) => ({
            id: v.id,
            impact: v.impact,
            nodes: v.nodes.map((n) => n.target.join(" ")).slice(0, 5),
          })),
        ).toEqual([]);
      });
    }
  });
}

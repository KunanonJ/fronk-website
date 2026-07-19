import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { ROUTES } from "./routes";

// Automated WCAG scan on every public route. Serious/critical violations
// fail the build; minor/moderate are surfaced in the report only.
test.describe("accessibility scan", () => {
  for (const route of ROUTES) {
    test(`${route.name} has no serious or critical axe violations`, async ({
      page,
    }) => {
      await page.goto(route.path);
      await page.waitForLoadState("networkidle");

      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
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

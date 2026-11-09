import { expect, test } from "@playwright/test";
import { ROUTES } from "./routes";

/**
 * Behavioral smoke + accessibility/motion guard. These run on every phase to
 * prove the redesign never ships a blank page, a console-erroring route, or a
 * motion violation for reduced-motion users.
 */

/**
 * External resource 404s (favicon-CDN misses behind CompanyLogo's initials
 * fallback, etc.) are environment noise, not bugs. We assert on genuine
 * JS/React failures — uncaught exceptions and real console.error output — and
 * deliberately ignore failed-resource-load messages.
 */
function isRealError(text: string): boolean {
  return !/Failed to load resource|net::ERR_|404 \(\)/.test(text);
}

test.describe("smoke > every route renders without JS errors", () => {
  for (const route of ROUTES) {
    test(`${route.name} renders an <h1> and throws no JS errors`, async ({
      page,
    }) => {
      const errors: string[] = [];
      page.on("console", (msg) => {
        if (msg.type() === "error" && isRealError(msg.text()))
          errors.push(msg.text());
      });
      page.on("pageerror", (err) => errors.push(err.message));

      await page.goto(route.path, { waitUntil: "networkidle" });

      await expect(page.locator("h1").first()).toBeVisible();
      expect(
        errors,
        `JS errors on ${route.path}:\n${errors.join("\n")}`,
      ).toEqual([]);
    });
  }
});

test.describe("a11y > reduced-motion users get a static, usable page", () => {
  test("home renders its heading with reduced motion forced", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/", { waitUntil: "networkidle" });
    await expect(page.locator("h1").first()).toBeVisible();

    // The browser-level preference must actually be reported as reduced — this
    // is the signal every JS animation (HUD, ticker, WebGL field) consults via
    // useReducedMotion. If this regresses, motion guards silently break.
    const prefersReduced = await page.evaluate(
      () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
    expect(prefersReduced).toBe(true);
  });
});

test.describe("a11y > keyboard users can reach the skip link", () => {
  test("first Tab focuses the skip-to-content link", async ({ page, browserName }) => {
    // WebKit/Safari does not move Tab focus to links unless full keyboard access
    // is enabled — that's the browser's default, not a page defect. The skip link
    // is present and focusable; Chromium + Firefox exercise the Tab behavior.
    test.skip(
      browserName === "webkit",
      "Safari does not Tab to links by default (full keyboard access off)",
    );
    await page.goto("/", { waitUntil: "networkidle" });
    await page.keyboard.press("Tab");
    const focusedHref = await page.evaluate(
      () => (document.activeElement as HTMLAnchorElement | null)?.getAttribute("href"),
    );
    expect(focusedHref).toBe("#main");
  });
});

test.describe("resume > company logos are self-hosted (ux-audit finding 12)", () => {
  test("logos render and no image request leaves the site", async ({ page, baseURL }) => {
    const origin = new URL(baseURL ?? "http://localhost:3000").origin;
    const offsite: string[] = [];
    page.on("request", (request) => {
      if (request.resourceType() !== "image") return;
      const url = new URL(request.url());
      if (url.protocol === "data:" || url.protocol === "blob:") return;
      if (url.origin !== origin) offsite.push(request.url());
    });

    await page.goto("/resume", { waitUntil: "networkidle" });
    // The logos are lazy; load every one so the whole page is checked.
    await page.evaluate(() => {
      for (const img of Array.from(document.images)) img.loading = "eager";
    });
    await page.waitForLoadState("networkidle");
    await page.waitForFunction(() =>
      Array.from(document.images).every((img) => img.complete),
    );

    const logos = page.locator('[data-logo="image"] img');
    expect(await logos.count()).toBeGreaterThan(0);
    const broken = await logos.evaluateAll((imgs) =>
      (imgs as HTMLImageElement[])
        .filter((img) => img.naturalWidth === 0)
        .map((img) => img.getAttribute("src")),
    );
    expect(broken, "logos that failed to load").toEqual([]);
    expect(offsite, "image requests to other hosts").toEqual([]);
  });
});

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
  test("first Tab focuses the skip-to-content link", async ({
    page,
    browserName,
  }) => {
    // WebKit/Safari does not move Tab focus to links unless full keyboard access
    // is enabled — that's the browser's default, not a page defect. The skip link
    // is present and focusable; Chromium + Firefox exercise the Tab behavior.
    test.skip(
      browserName === "webkit",
      "Safari does not Tab to links by default (full keyboard access off)",
    );
    await page.goto("/", { waitUntil: "networkidle" });
    await page.keyboard.press("Tab");
    const focusedHref = await page.evaluate(() =>
      (document.activeElement as HTMLAnchorElement | null)?.getAttribute(
        "href",
      ),
    );
    expect(focusedHref).toBe("#main");
  });
});

test.describe("resume > company logos are self-hosted (ux-audit finding 12)", () => {
  test("logos render and no image request leaves the site", async ({
    page,
    baseURL,
  }) => {
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

test.describe("resume > the detail view is a typed search param", () => {
  test("?view=compact hides the bullets, Detailed brings them back on a clean URL", async ({
    page,
  }) => {
    await page.goto("/resume?view=compact", { waitUntil: "networkidle" });
    const group = page.getByRole("group", { name: "Résumé detail" });
    await expect(
      group.getByRole("button", { name: "Compact" }),
    ).toHaveAttribute("aria-pressed", "true");
    const currently = page.getByRole("article", { name: "Currently" });
    await expect(currently.getByText(/^Live at /)).toHaveCount(0);

    await group.getByRole("button", { name: "Detailed" }).click();
    await expect(page).toHaveURL(/\/resume$/);
    await expect(
      group.getByRole("button", { name: "Detailed" }),
    ).toHaveAttribute("aria-pressed", "true");
    await expect(currently.getByText(/^Live at /).first()).toBeVisible();
  });

  test("an unknown view falls back to detailed without an error", async ({
    page,
  }) => {
    const response = await page.goto("/resume?view=everything", {
      waitUntil: "networkidle",
    });
    expect(response?.ok()).toBe(true);
    await expect(page).toHaveURL(/\/resume$/);
    await expect(
      page
        .getByRole("group", { name: "Résumé detail" })
        .getByRole("button", { name: "Detailed" }),
    ).toHaveAttribute("aria-pressed", "true");
  });
});

test.describe("skills > the catalog filter is a typed search param", () => {
  test("?show=user narrows the catalog, All brings back a clean URL", async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));
    page.on("console", (msg) => {
      if (msg.type() === "error" && isRealError(msg.text()))
        errors.push(msg.text());
    });

    // /skills is prerendered: the filter applies after hydration, with no
    // hydration mismatch.
    await page.goto("/skills?show=user", { waitUntil: "networkidle" });
    const group = page.getByRole("group", { name: "Show" });
    await expect(
      group.getByRole("button", { name: /^You invoke/ }),
    ).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByText(/^Showing \d+ of 20 skills$/)).toBeVisible();
    // Verify and ship holds only skills the agent loads on its own.
    const ship = page.getByRole("article", { name: "Verify and ship" });
    await expect(ship).toHaveCount(0);

    await group.getByRole("button", { name: /^All/ }).click();
    await expect(page).toHaveURL(/\/skills$/);
    await expect(ship).toBeVisible();
    expect(errors, errors.join("\n")).toEqual([]);
  });

  test("an unknown filter falls back to all without an error", async ({
    page,
  }) => {
    const response = await page.goto("/skills?show=everything", {
      waitUntil: "networkidle",
    });
    expect(response?.ok()).toBe(true);
    await expect(page).toHaveURL(/\/skills$/);
    await expect(
      page
        .getByRole("group", { name: "Show" })
        .getByRole("button", { name: /^All/ }),
    ).toHaveAttribute("aria-pressed", "true");
  });
});

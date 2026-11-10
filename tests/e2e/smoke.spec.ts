import { expect, test, type Page } from "@playwright/test";
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

test.describe("portfolio > the category filter is a typed search param", () => {
  test("?category=ai-agents narrows the projects, All brings back a clean URL", async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));
    page.on("console", (msg) => {
      if (msg.type() === "error" && isRealError(msg.text()))
        errors.push(msg.text());
    });

    // /portfolio is prerendered: the filter applies after hydration, with no
    // hydration mismatch.
    await page.goto("/portfolio?category=ai-agents", {
      waitUntil: "networkidle",
    });
    const group = page.getByRole("group", {
      name: "Filter projects by category",
    });
    await expect(
      group.getByRole("button", { name: "AI agents", exact: true }),
    ).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByText("1 of 4 projects")).toBeVisible();
    const tbh = page.getByRole("article", { name: "TBH Intranet" });
    await expect(tbh).toHaveCount(0);

    await group.getByRole("button", { name: "All", exact: true }).click();
    await expect(page).toHaveURL(/\/portfolio$/);
    await expect(tbh).toBeVisible();

    await group
      .getByRole("button", { name: "Ops automation", exact: true })
      .click();
    await expect(page).toHaveURL(/\/portfolio\?category=ops-automation$/);
    await expect(
      page.getByRole("article", { name: "Node Validator Automation" }),
    ).toBeVisible();
    expect(errors, errors.join("\n")).toEqual([]);
  });

  test("an unknown category falls back to all without an error", async ({
    page,
  }) => {
    const response = await page.goto("/portfolio?category=everything", {
      waitUntil: "networkidle",
    });
    expect(response?.ok()).toBe(true);
    await expect(page).toHaveURL(/\/portfolio$/);
    await expect(page.getByText("4 of 4 projects")).toBeVisible();
    await expect(
      page
        .getByRole("group", { name: "Filter projects by category" })
        .getByRole("button", { name: "All", exact: true }),
    ).toHaveAttribute("aria-pressed", "true");
  });
});

test.describe("library > list filters are typed search params", () => {
  /** Collects uncaught errors and real console errors (hydration mismatches). */
  function watchErrors(page: Page): string[] {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));
    page.on("console", (msg) => {
      if (msg.type() === "error" && isRealError(msg.text()))
        errors.push(msg.text());
    });
    return errors;
  }

  test("/stack?group=ship narrows the tools, All brings back a clean URL", async ({
    page,
  }) => {
    const errors = watchErrors(page);
    // /stack is prerendered: the filter applies after hydration, with no
    // hydration mismatch.
    await page.goto("/stack?group=ship", { waitUntil: "networkidle" });
    const group = page.getByRole("group", { name: "Filter tools by group" });
    await expect(group.getByRole("button", { name: /^Ship/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(page.getByText("Showing 8 of 16 tools · Ship")).toBeVisible();
    const build = page.getByRole("article", { name: "Build" });
    await expect(build).toHaveCount(0);

    await group.getByRole("button", { name: /^All/ }).click();
    await expect(page).toHaveURL(/\/stack$/);
    await expect(build).toBeVisible();
    expect(errors, errors.join("\n")).toEqual([]);
  });

  test("/build?venture=manut narrows the board and marks emptied columns", async ({
    page,
  }) => {
    const errors = watchErrors(page);
    await page.goto("/build?venture=manut", { waitUntil: "networkidle" });
    // The board's size changes with the content; the Manut count is the point.
    await expect(page.getByText(/^2 of \d+ tickets · Manut$/)).toBeVisible();
    await expect(
      page
        .getByRole("article", { name: "In progress" })
        .getByText("Nothing here for this filter."),
    ).toBeVisible();
    await page
      .getByRole("group", { name: "Filter tickets by venture" })
      .getByRole("button", { name: /^Site/ })
      .click();
    await expect(page).toHaveURL(/\/build\?venture=site$/);
    expect(errors, errors.join("\n")).toEqual([]);
  });

  test("/examples?persona=founders shows the founders' examples", async ({
    page,
  }) => {
    const errors = watchErrors(page);
    await page.goto("/examples?persona=founders", {
      waitUntil: "networkidle",
    });
    await expect(page.getByText("3 examples for Founders")).toBeVisible();
    await expect(
      page.getByRole("article", { name: "Thin public build board" }),
    ).toBeVisible();
    await page
      .getByRole("group", { name: "Show examples for" })
      .getByRole("button", { name: /Builders/ })
      .click();
    await expect(page).toHaveURL(/\/examples$/);
    expect(errors, errors.join("\n")).toEqual([]);
  });

  test("/learn?lang=th renders the Thai hubs on the server", async ({
    page,
  }) => {
    const errors = watchErrors(page);
    await page.goto("/learn?lang=th", { waitUntil: "networkidle" });
    // The hub count comes from the content, so read it rather than pin it.
    const thai = page.getByText(/^Showing \d+ hubs in Thai$/);
    await expect(thai).toBeVisible();
    const count = Number((await thai.textContent())?.match(/\d+/)?.[0]);
    expect(count).toBeGreaterThan(0);
    await expect(page.locator('h2[lang="th"]')).toHaveCount(count);
    await page
      .getByRole("group", { name: "Hub language" })
      .getByRole("button", { name: "English" })
      .click();
    await expect(page).toHaveURL(/\/learn$/);
    await expect(
      page.getByText(`Showing ${count} hubs in English`),
    ).toBeVisible();
    expect(errors, errors.join("\n")).toEqual([]);
  });

  test("unknown values fall back to the defaults without an error", async ({
    page,
  }) => {
    for (const [path, clean, group, pressed] of [
      ["/stack?group=tools", /\/stack$/, "Filter tools by group", /^All/],
      ["/build?venture=x", /\/build$/, "Filter tickets by venture", /^All/],
      ["/examples?persona=ceo", /\/examples$/, "Show examples for", /Builders/],
      ["/learn?lang=fr", /\/learn$/, "Hub language", /^English/],
    ] as const) {
      const response = await page.goto(path, { waitUntil: "networkidle" });
      expect(response?.ok(), path).toBe(true);
      await expect(page).toHaveURL(clean);
      await expect(
        page
          .getByRole("group", { name: group })
          .getByRole("button", { name: pressed }),
      ).toHaveAttribute("aria-pressed", "true");
    }
  });
});

test.describe("not-found > unknown paths answer 404 with the bento page", () => {
  test("status 404, the recovery links and no hidden pages", async ({
    page,
  }) => {
    const response = await page.goto("/does-not-exist", {
      waitUntil: "networkidle",
    });
    expect(response?.status()).toBe(404);
    await expect(page.locator("h1")).toHaveText("Nothing lives here.");
    const recovery = page.getByRole("navigation", { name: "Recovery links" });
    await expect(recovery.getByRole("link")).toHaveCount(4);
    await expect(
      page.locator('a[href^="/blog"], a[href^="/press"]'),
    ).toHaveCount(0);
  });
});

test.describe("press > the type filter is a typed search param", () => {
  test("?type=product narrows the coverage, All brings back a clean URL", async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));
    page.on("console", (msg) => {
      if (msg.type() === "error" && isRealError(msg.text()))
        errors.push(msg.text());
    });

    // /press is prerendered: the filter applies after hydration.
    await page.goto("/press?type=product", { waitUntil: "networkidle" });
    const group = page.getByRole("group", { name: "Filter coverage by type" });
    await expect(
      group.getByRole("button", { name: "Product · 2" }),
    ).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByText("Showing 2 of 4")).toBeVisible();

    await group.getByRole("button", { name: /^All/ }).click();
    await expect(page).toHaveURL(/\/press$/);
    await expect(page.getByText("Showing 4 of 4")).toBeVisible();
    expect(errors, errors.join("\n")).toEqual([]);
  });

  test("an unknown type falls back to all without an error", async ({
    page,
  }) => {
    const response = await page.goto("/press?type=video", {
      waitUntil: "networkidle",
    });
    expect(response?.ok()).toBe(true);
    await expect(page).toHaveURL(/\/press$/);
    await expect(page.getByText("Showing 4 of 4")).toBeVisible();
  });
});

test.describe("blog > tag and search are typed search params", () => {
  test("?tag= narrows the posts; the chips and the search box write the URL", async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));
    page.on("console", (msg) => {
      if (msg.type() === "error" && isRealError(msg.text()))
        errors.push(msg.text());
    });

    // /blog renders on request, so the server already applies ?tag=.
    await page.goto("/blog?tag=SME", { waitUntil: "networkidle" });
    const tags = page.getByRole("group", { name: "Filter by tag" });
    await expect(
      tags.getByRole("button", { name: /^SME \d+$/ }),
    ).toHaveAttribute("aria-pressed", "true");
    await expect(
      page.getByText(/^Showing \d+ of \d+ posts tagged SME$/),
    ).toBeVisible();

    await tags.getByRole("button", { name: /^All \d+$/ }).click();
    await expect(page).toHaveURL(/\/blog$/);

    await page.getByRole("searchbox", { name: "Search posts" }).fill("loops");
    await expect(page).toHaveURL(/\/blog\?q=loops$/);
    await expect(page.getByText(/^Showing \d+ of \d+ posts$/)).toBeVisible();
    expect(errors, errors.join("\n")).toEqual([]);
  });
});

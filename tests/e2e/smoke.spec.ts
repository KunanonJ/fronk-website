import { expect, test, type Locator, type Page } from "@playwright/test";
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
    const projects = page.getByRole("article", {
      name: "Independent projects",
    });
    await expect(projects.getByText(/^Live at /)).toHaveCount(0);

    await group.getByRole("button", { name: "Detailed" }).click();
    await expect(page).toHaveURL(/\/resume$/);
    await expect(
      group.getByRole("button", { name: "Detailed" }),
    ).toHaveAttribute("aria-pressed", "true");
    await expect(projects.getByText(/^Live at /).first()).toBeVisible();
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

/**
 * The recruiter path (recruiter-fit phase 2): what someone hiring a forward
 * deployed or AI engineer needs is one glance or one click away.
 */
test.describe("recruiter path > the role, the availability and the résumé are one glance away", () => {
  test.beforeEach(async ({ page }) => {
    // The first-visit intro would cover the hero for its second and a half.
    await page.addInitScript(() => {
      try {
        sessionStorage.setItem("fronk-intro-seen", "1");
      } catch {
        // Storage can be unavailable; the intro then plays and the test waits.
      }
    });
  });

  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 375, height: 812 },
  ]) {
    test(`home shows the role, who he is open to and both buttons without scrolling at ${viewport.width} px`, async ({
      page,
    }) => {
      await page.setViewportSize(viewport);
      await page.goto("/", { waitUntil: "networkidle" });
      const hero = page.locator('section[aria-labelledby="hero-title"]');
      const h1 = hero.getByRole("heading", { level: 1 });
      await expect(h1).toContainText(
        "Forward deployed AI engineering from Bangkok.",
      );
      await expect(h1).toBeInViewport({ ratio: 1 });
      await expect(hero.getByText("Open to roles")).toBeInViewport({
        ratio: 1,
      });
      await expect(
        hero.getByRole("link", { name: "Contact me" }),
      ).toBeInViewport({ ratio: 1 });
      await expect(
        hero.getByRole("link", { name: "Résumé", exact: true }),
      ).toBeInViewport({ ratio: 1 });
    });
  }

  for (const route of ROUTES) {
    // /design is the unlinked design-system page: it has no site header.
    if (route.name === "design") continue;
    test(`${route.name}: the résumé is one click away in the header at desktop width`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(route.path, { waitUntil: "domcontentloaded" });
      const resume = page
        .getByRole("navigation", { name: "Primary" })
        .getByRole("link", { name: "Résumé" });
      await expect(resume).toBeVisible();
      await expect(resume).toHaveAttribute("href", "/resume");
    });
  }

  for (const route of ROUTES) {
    if (route.name === "design") continue;
    test(`${route.name}: on a phone the résumé is two taps away, the menu then its row`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await page.goto(route.path, { waitUntil: "networkidle" });
      await expect(
        page.getByRole("navigation", { name: "Primary" }),
      ).toBeHidden();
      await page.getByRole("button", { name: "Open menu" }).click();
      await page
        .getByRole("navigation", { name: "Site" })
        .getByRole("link", { name: "Résumé" })
        .click();
      await expect(page).toHaveURL(/\/resume$/);
      await expect(page.getByRole("heading", { level: 1 })).toContainText(
        "AI Engineering Lead.",
      );
    });
  }

  test("the header links appear at 1024 px, on one row, and not below it", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1023, height: 800 });
    await page.goto("/portfolio", { waitUntil: "networkidle" });
    const nav = page.getByRole("navigation", { name: "Primary" });
    await expect(nav).toBeHidden();
    await page.setViewportSize({ width: 1024, height: 800 });
    await expect(nav).toBeVisible();
    // The links sit between the email and the buttons and touch neither.
    const chrome = page.locator("header[data-site-chrome]");
    const box = async (target: Locator) => {
      const found = await target.boundingBox();
      if (!found) throw new Error("a header part has no box");
      return found;
    };
    const header = await box(chrome);
    const email = await box(chrome.locator('a[href^="mailto:"]'));
    const links = await box(nav);
    const share = await box(
      chrome.getByRole("button", { name: "Share this page" }),
    );
    expect(links.x).toBeGreaterThan(email.x + email.width);
    expect(links.x + links.width).toBeLessThanOrEqual(share.x);
    // One row: a wrapped header would be about twice this tall.
    expect(header.height).toBeLessThan(60);
    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
      ),
    ).toBe(0);
    // The current section is marked for the eye as well as for a reader.
    await expect(nav.locator('a[aria-current="page"]')).toHaveText("Work");
    await expect(nav.locator('a[aria-current="page"] .bg-mark')).toBeVisible();
  });

  test("a hiring button opens the contact form ready for a recruiter", async ({
    page,
  }) => {
    await page.goto("/topics/forward-deployed-ai-engineering", {
      waitUntil: "networkidle",
    });
    await page
      .locator('section[aria-labelledby="hero-title"]')
      .getByRole("link", { name: "Contact" })
      .click();
    await expect(page).toHaveURL(/\/contact\?topic=hiring$/);
    await expect(page.getByRole("button", { name: "Hiring" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(
      page.getByLabel(
        "Tell me about the role: the team, the scope and the location",
      ),
    ).toBeVisible();
    await expect(
      page.getByRole("article", { name: "For recruiters" }),
    ).toBeVisible();
  });

  test("the hiring link also works as a direct visit, and the chip stays the visitor's", async ({
    page,
  }) => {
    // The page is prerendered as the general form; the intent arrives after
    // hydration.
    await page.goto("/contact?topic=hiring", { waitUntil: "networkidle" });
    await expect(page).toHaveURL(/\/contact\?topic=hiring$/);
    const chip = page.getByRole("button", { name: "Hiring" });
    await expect(chip).toHaveAttribute("aria-pressed", "true");
    await expect(
      page.getByLabel(
        "Tell me about the role: the team, the scope and the location",
      ),
    ).toBeVisible();
    // Taking the chip off brings the general question back.
    await chip.click();
    await expect(chip).toHaveAttribute("aria-pressed", "false");
    await expect(
      page.getByLabel("What are you working on, and how can I help?"),
    ).toBeVisible();
  });

  test("About answers a recruiter in its closing card", async ({ page }) => {
    await page.goto("/about", { waitUntil: "networkidle" });
    const card = page.getByRole("article", { name: "Next" });
    await expect(
      card.getByRole("heading", { name: "For recruiters" }),
    ).toBeVisible();
    await expect(
      card.getByRole("link", { name: "Contact about a role" }),
    ).toHaveAttribute("href", "/contact?topic=hiring");
    // The ink button serves every reader: it opens the general form.
    await expect(
      card.getByRole("link", { name: "Contact", exact: true }),
    ).toHaveAttribute("href", "/contact");
  });

  test("an unknown contact topic falls back to the general form without an error", async ({
    page,
  }) => {
    const response = await page.goto("/contact?topic=nope", {
      waitUntil: "networkidle",
    });
    expect(response?.ok()).toBe(true);
    await expect(page).toHaveURL(/\/contact$/);
    await expect(page.getByRole("button", { name: "Hiring" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  test("the FDE hub leaves no section card mostly empty at desktop width", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/topics/forward-deployed-ai-engineering", {
      waitUntil: "networkidle",
    });
    // Each section card: the gap between its kicker and its big number.
    const gaps = await page
      .locator('article[aria-labelledby^="card-s"]')
      .evaluateAll((cards) =>
        cards.map((card) => {
          const kicker = card.querySelector("h2")!.getBoundingClientRect();
          const number = card
            .querySelector("p[aria-hidden]")!
            .getBoundingClientRect();
          return Math.round(number.top - kicker.bottom);
        }),
      );
    expect(gaps).toHaveLength(4);
    for (const gap of gaps) expect(gap).toBeLessThanOrEqual(120);
  });

  test("the Thai FDE hub carries the same pill and buttons, in Thai", async ({
    page,
  }) => {
    await page.goto("/th/topics/forward-deployed-ai-engineering", {
      waitUntil: "networkidle",
    });
    const hero = page.locator('section[aria-labelledby="hero-title"]');
    // The pill is one paragraph: the label, a middle dot, then the detail.
    await expect(
      hero.locator("p", {
        hasText: "เปิดรับตำแหน่ง · Forward Deployed Engineer",
      }),
    ).toBeVisible();
    await expect(hero.getByRole("link", { name: "เรซูเม่" })).toHaveAttribute(
      "href",
      "/resume",
    );
    await expect(hero.getByRole("link", { name: "ติดต่อ" })).toHaveAttribute(
      "href",
      "/contact?topic=hiring",
    );
  });

  test("a case study ends with the résumé and the hiring contact", async ({
    page,
  }) => {
    await page.goto("/portfolio/tbh-intranet", { waitUntil: "networkidle" });
    const card = page.getByRole("article", { name: "Hiring" });
    await expect(card.getByRole("link", { name: "Résumé" })).toHaveAttribute(
      "href",
      "/resume",
    );
    await expect(card.getByRole("link", { name: "Contact" })).toHaveAttribute(
      "href",
      "/contact?topic=hiring",
    );
  });
});

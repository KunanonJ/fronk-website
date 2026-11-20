import AxeBuilder from "@axe-core/playwright";
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

/**
 * The Content Security Policy (best-practices audit R21, src/server/http.ts),
 * enforced: every page sends it, and nothing on a page breaks it, lazy parts
 * included. Each block fires securitypolicyviolation. Only the site's own
 * policy counts (the one that reports to /api/csp-report): on the live site,
 * Cloudflare's script monitor adds its own report-only policy to some
 * responses, and that one reports every script by design.
 */
test.describe("csp > every route sends the policy and breaks none of it", () => {
  for (const route of ROUTES) {
    test(`${route.name} reports no Content Security Policy violation`, async ({
      page,
    }) => {
      await page.addInitScript(() => {
        const seen: string[] = [];
        (window as unknown as { __csp: string[] }).__csp = seen;
        document.addEventListener("securitypolicyviolation", (event) => {
          if (!event.originalPolicy.includes("/api/csp-report")) return;
          seen.push(
            `${event.effectiveDirective} ${event.blockedURI || "inline"}`,
          );
        });
      });
      const response = await page.goto(route.path, {
        waitUntil: "networkidle",
      });
      expect(
        response?.headers()["content-security-policy"],
        route.path,
      ).toContain("report-uri /api/csp-report");
      expect(response?.headers()["reporting-endpoints"], route.path).toBe(
        'csp="/api/csp-report"',
      );
      await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += innerHeight) {
          scrollTo(0, y);
          await new Promise((done) => setTimeout(done, 50));
        }
      });
      await page.waitForLoadState("networkidle");
      const violations = await page.evaluate(
        () => (window as unknown as { __csp: string[] }).__csp,
      );
      expect(violations, route.path).toEqual([]);
    });
  }
});

test("csp > the report endpoint takes a browser's report", async ({
  request,
}) => {
  const report = await request.post("/api/csp-report", {
    headers: { "Content-Type": "application/csp-report" },
    data: JSON.stringify({
      "csp-report": {
        "document-uri": "https://kunanonj.com/about",
        "effective-directive": "img-src",
        "blocked-uri": "https://example.com/x.png",
      },
    }),
  });
  expect(report.status()).toBe(204);
  expect((await request.get("/api/csp-report")).status()).toBe(405);
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
    // The earlier entries are folded: open them, so their logos count too.
    await page.locator("details.pf-resume__more > summary").click();
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
    // The ventures' marks in the facts card and the Building now tiles.
    const snapshot = page.locator("section.pf-resume-card");
    await expect(snapshot.locator('[data-logo="image"] img')).toHaveCount(2);
    const broken = await logos.evaluateAll((imgs) =>
      (imgs as HTMLImageElement[])
        .filter((img) => img.naturalWidth === 0)
        .map((img) => img.getAttribute("src")),
    );
    expect(broken, "logos that failed to load").toEqual([]);
    expect(offsite, "image requests to other hosts").toEqual([]);
  });
});

/**
 * The résumé's first screen ("Snapshot", now-building program phase 2): a
 * recruiter sees who he is, that he is building, and the PDF without
 * scrolling. At desktop width Contact is there too; on a phone the facts
 * card comes before the summary, so Download PDF is.
 */
test.describe("resume > the first screen answers a recruiter", () => {
  test.beforeEach(async ({ page }) => {
    // The first-visit intro would cover the page for its second and a half.
    await page.addInitScript(() => {
      try {
        sessionStorage.setItem("fronk-intro-seen", "1");
      } catch {
        // Storage can be unavailable; the intro then plays and the test waits.
      }
    });
  });

  const parts = (page: Page) => {
    const hero = page.locator('section[aria-labelledby="hero-title"]');
    const card = hero.locator("section.pf-resume-card");
    return {
      h1: hero.getByRole("heading", { level: 1 }),
      availability: hero.locator(".pf-resume__availability"),
      pdf: card.getByRole("link", { name: "Download PDF" }),
      contact: card.getByRole("link", { name: "Contact", exact: true }),
      email: card.getByRole("link", { name: "fronk.kunanon@gmail.com" }),
    };
  };

  test("at 1440 x 900: the h1, the availability line, Download PDF and Contact", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/resume", { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    const { h1, availability, pdf, contact, email } = parts(page);
    await expect(h1).toContainText("Kunanon Jarat.");
    await expect(availability).toContainText("Currently building");
    for (const part of [h1, availability, pdf, contact, email])
      await expect(part).toBeInViewport({ ratio: 1 });
    await expect(pdf).toHaveAttribute("download", "Kunanon-Jarat-Resume.pdf");
  });

  test("at 390 x 844: the h1, the availability line and Download PDF", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/resume", { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    const { h1, availability, pdf } = parts(page);
    for (const part of [h1, availability, pdf])
      await expect(part).toBeInViewport({ ratio: 1 });
  });

  test("Copy puts the address on the clipboard and says so politely", async ({
    page,
    context,
    browserName,
  }) => {
    // Only Chromium takes the clipboard permissions; the others copy on the
    // click alone.
    if (browserName === "chromium")
      await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto("/resume", { waitUntil: "networkidle" });
    const card = page.locator("section.pf-resume-card");
    // The clock is client only: once it shows, the page has hydrated.
    await expect(card.locator("time[data-clock]")).toBeVisible();
    const copy = card.getByRole("button", { name: "Copy email" });
    const status = card.getByRole("status");
    await expect(status).toHaveText("");
    await copy.click();
    await expect(status).toHaveText("Email copied");
    await expect(status).toHaveAttribute("aria-live", "polite");
    await expect(copy).toContainText("Copied");
    if (browserName === "chromium")
      expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
        "fronk.kunanon@gmail.com",
      );
    // The confirmation clears itself after two seconds.
    await expect(status).toHaveText("", { timeout: 5_000 });
  });

  test("an old ?view=compact link still opens the whole résumé", async ({
    page,
  }) => {
    const response = await page.goto("/resume?view=compact", {
      waitUntil: "networkidle",
    });
    expect(response?.ok()).toBe(true);
    const experience = page.getByRole("article", {
      name: "Experience",
      exact: true,
    });
    await expect(
      experience.getByText(/^Owned the roadmap and requirements/),
    ).toBeVisible();
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
    await expect(page.getByText("1 of 5 projects")).toBeVisible();
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
    await expect(page.getByText("5 of 5 projects")).toBeVisible();
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
    await expect(page.locator('h3[lang="th"]')).toHaveCount(count);
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
 * Filters move their cards (polish pass, F3): with motion allowed, a filter
 * click runs a view transition of type "filter" that gets ready without an
 * error (two elements sharing a transition name would abort it), the list
 * changes in place, and the page keeps its scroll.
 */
test.describe("filters > a click moves the cards, with no page error", () => {
  const FILTERS = [
    {
      path: "/portfolio",
      group: "Filter projects by category",
      option: /^Ops automation$/,
      item: ".pf-work-index__item",
    },
    {
      path: "/skills",
      group: "Show",
      option: /^You invoke/,
      item: ".pf-skill-card__item",
    },
    {
      path: "/blog",
      group: "Filter by tag",
      option: /^SME \d+$/,
      item: ".pf-blog-list__item",
    },
  ] as const;

  for (const { path, group, option, item } of FILTERS) {
    test(`${path}: the filter transition runs and the list changes`, async ({
      page,
      browserName,
    }) => {
      test.skip(
        browserName !== "chromium",
        "view-transition types are checked in Chromium",
      );
      const errors: string[] = [];
      page.on("pageerror", (err) => errors.push(err.message));
      page.on("console", (msg) => {
        if (msg.type() === "error" && isRealError(msg.text()))
          errors.push(msg.text());
      });
      await page.emulateMedia({ reducedMotion: "no-preference" });
      // Logs each view transition the page starts, with its types and
      // whether it got ready or was aborted.
      await page.addInitScript(() => {
        const log: string[] = [];
        (window as unknown as { __vt: string[] }).__vt = log;
        const doc = document as unknown as {
          startViewTransition?: (arg: unknown) => {
            ready: Promise<void>;
          };
        };
        const start = doc.startViewTransition?.bind(document);
        if (!start) return;
        doc.startViewTransition = (arg) => {
          const transition = start(arg);
          const types = (arg as { types?: string[] } | undefined)?.types;
          log.push(`start ${types?.join(",") ?? ""}`);
          transition.ready.then(
            () => log.push("ready"),
            (err: Error) => log.push(`aborted ${err.name}`),
          );
          return transition;
        };
      });

      await page.goto(path, { waitUntil: "networkidle" });
      const filter = page.getByRole("group", { name: group });
      await filter.scrollIntoViewIfNeeded();
      const top = await page.evaluate(() => window.scrollY);
      const before = await page.locator(item).count();

      await filter.getByRole("button", { name: option }).click();
      await expect(
        filter.getByRole("button", { name: option }),
      ).toHaveAttribute("aria-pressed", "true");
      await expect.poll(() => page.locator(item).count()).not.toBe(before);
      await expect
        .poll(() =>
          page.evaluate(() => (window as unknown as { __vt: string[] }).__vt),
        )
        .toEqual(["start filter", "ready"]);
      expect(await page.evaluate(() => window.scrollY)).toBe(top);
      expect(errors, errors.join("\n")).toEqual([]);
    });
  }
});

/**
 * The tile-to-case morph (plan morph-count-up_PLAN_20-11-26): opening a case
 * from its card runs the page transition with the card's title, and a
 * venture's logo, morphing into the h1. A name used twice would abort the
 * transition, so the log must show it ready.
 */
test.describe("case cards > opening a case morphs the card into its h1", () => {
  const CARDS = [
    {
      from: "/portfolio",
      card: ".pf-work-card",
      parts: ["pf-morph-title"],
    },
    {
      from: "/",
      card: ".pf-card:has(.pf-venture-art__logo)",
      parts: ["pf-morph-title", "pf-morph-logo"],
    },
  ] as const;

  for (const { from, card, parts } of CARDS) {
    test(`${from}: a card's ${parts.join(" and ")} morph into the case`, async ({
      page,
      browserName,
    }) => {
      test.skip(
        browserName !== "chromium",
        "view-transition types are checked in Chromium",
      );
      const errors: string[] = [];
      page.on("pageerror", (err) => errors.push(err.message));
      await page.emulateMedia({ reducedMotion: "no-preference" });
      await page.addInitScript(() => {
        try {
          sessionStorage.setItem("fronk-intro-seen", "1");
        } catch {
          // Storage can be unavailable; the intro then plays first.
        }
        // Logs each view transition with its types and, once ready, the
        // morph groups it animates (or why it was aborted).
        const log: string[] = [];
        (window as unknown as { __vt: string[] }).__vt = log;
        const doc = document as unknown as {
          startViewTransition?: (arg: unknown) => { ready: Promise<void> };
        };
        const start = doc.startViewTransition?.bind(document);
        if (!start) return;
        doc.startViewTransition = (arg) => {
          const transition = start(arg);
          const types = (arg as { types?: string[] } | undefined)?.types;
          log.push(`start ${types?.join(",") ?? ""}`);
          transition.ready.then(
            () => {
              const groups = document
                .getAnimations()
                .map((a) => (a.effect as KeyframeEffect | null)?.pseudoElement)
                .filter((name): name is string =>
                  Boolean(name?.startsWith("::view-transition-group(pf-")),
                )
                .map((name) =>
                  name.replace(/^::view-transition-group\((.*)\)$/, "$1"),
                )
                .sort();
              log.push(`ready ${[...new Set(groups)].join(" ")}`);
            },
            (err: Error) => log.push(`aborted ${err.name}`),
          );
          return transition;
        };
      });

      await page.goto(from, { waitUntil: "networkidle" });
      const link = page.locator(card).first().locator("a.ds-stretch");
      const href = await link.getAttribute("href");
      await link.scrollIntoViewIfNeeded();
      await link.click();
      await expect(page).toHaveURL(new RegExp(`${href}$`));
      await expect
        .poll(() =>
          page.evaluate(() => (window as unknown as { __vt: string[] }).__vt),
        )
        .toEqual(["start page", `ready ${[...parts].sort().join(" ")}`]);
      await expect(page.locator(".pf-case-hero__title")).toHaveAttribute(
        "data-morph",
        "",
      );
      expect(errors, errors.join("\n")).toEqual([]);
    });
  }
});

/**
 * Count-ups (plan morph-count-up_PLAN_20-11-26): a figure below the fold
 * waits at zero, counts up once in view and lands on the figure; its text is
 * the real figure all along, and under reduced motion nothing counts.
 */
test.describe("figures > count up once in view, the text always the real figure", () => {
  const figure = ".pf-read-pick .ds-count";

  test("/proof: a metric counts up as it comes into view", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/proof", { waitUntil: "networkidle" });
    const first = page.locator(figure).first();
    const value = (await first.textContent()) ?? "";
    expect(value).toMatch(/\d/);
    await expect(first).toHaveAttribute("data-shown", /^\D*0\D*$/);

    // Samples the frames from the moment it scrolls into view.
    const frames = await first.evaluate(async (el) => {
      const seen: string[] = [];
      el.scrollIntoView({ block: "center", behavior: "instant" });
      const end = performance.now() + 2000;
      while (performance.now() < end) {
        seen.push(`${el.getAttribute("data-shown")}|${el.textContent}`);
        await new Promise(requestAnimationFrame);
      }
      return seen;
    });
    const shown = frames.map((frame) => frame.split("|")[0]);
    expect(new Set(shown).size).toBeGreaterThan(3);
    expect(shown.at(-1)).toBe("null");
    for (const frame of frames) expect(frame.split("|")[1]).toBe(value);
  });

  test("/proof: under reduced motion, nothing counts", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/proof", { waitUntil: "networkidle" });
    await expect(page.locator(`${figure}[data-shown]`)).toHaveCount(0);
  });
});

/**
 * The footer on reveal (plan dither-print-in_PLAN_20-11-26): below the fold,
 * its dither field waits blank and its two drawings wait hidden; in view the
 * field prints in and the drawings play once, then all is still and drawn.
 * Under reduced motion nothing waits.
 */
test.describe("footer > the dither prints in and the drawings play once in view", () => {
  const field = ".pf-footer__dither";
  const art = ".pf-footer__art";

  test("/about at 1440 px: wait, play once, end still", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/about", { waitUntil: "networkidle" });
    await expect(page.locator(field)).toHaveAttribute("data-print", "wait");
    await expect(page.locator(`${art}[data-wait]`)).toHaveCount(2);

    // Samples the field and the drawings from the moment they scroll in.
    const seen = await page.evaluate(
      async ({ field, art }) => {
        const canvas = document.querySelector<HTMLCanvasElement>(field)!;
        document
          .querySelector(".pf-footer")!
          .scrollIntoView({ block: "start", behavior: "instant" });
        const states = new Set<string>();
        let playing = 0;
        const end = performance.now() + 2500;
        while (performance.now() < end) {
          states.add(String(canvas.getAttribute("data-print")));
          playing = Math.max(
            playing,
            document
              .getAnimations()
              .filter((a) =>
                (a.effect as KeyframeEffect | null)?.target?.closest(art),
              ).length,
          );
          await new Promise(requestAnimationFrame);
        }
        const data = canvas
          .getContext("2d")!
          .getImageData(0, 0, canvas.width, canvas.height).data;
        let ink = 0;
        for (let i = 3; i < data.length; i += 4) if (data[i]) ink++;
        return {
          states: [...states],
          playing,
          still: document
            .getAnimations()
            .filter((a) =>
              (a.effect as KeyframeEffect | null)?.target?.closest(art),
            ).length,
          ink,
        };
      },
      { field, art },
    );
    expect(seen.states).toContain("run");
    expect(seen.states.at(-1)).toBe("null");
    expect(seen.playing).toBeGreaterThan(100);
    expect(seen.still).toBe(0);
    expect(seen.ink).toBeGreaterThan(0);
    await expect(page.locator(`${art}[data-wait]`)).toHaveCount(0);
  });

  test("/about under reduced motion: nothing waits", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/about", { waitUntil: "networkidle" });
    await expect(page.locator("canvas.ds-dither[data-print]")).toHaveCount(0);
    await expect(page.locator(`${art}[data-wait]`)).toHaveCount(0);
  });
});

/**
 * Reading aids (plan reading-aids_PLAN_20-11-26): on the long reads, a line at
 * the top of the screen is empty at the top of the page and full once the
 * main content has been read, CSS only; a case's eyebrow ends with its
 * reading time. Other pages draw no line, and under reduced motion it hides.
 */
test.describe("reading aids > the reading line follows the main content", () => {
  /** The line's horizontal scale at a share of the main content's scroll. */
  const scaleAt = (page: Page, share: number) =>
    page.evaluate(async (share) => {
      const main = document.querySelector("main")!;
      const end = main.getBoundingClientRect().bottom + window.scrollY;
      window.scrollTo({
        top: Math.round((end - window.innerHeight) * share),
        behavior: "instant",
      });
      await new Promise((done) =>
        requestAnimationFrame(() => requestAnimationFrame(done)),
      );
      const line = document.querySelector(".pf-reading")!;
      const transform = getComputedStyle(line).transform;
      return transform === "none"
        ? 1
        : Number(/matrix\(([^,]+)/.exec(transform)?.[1]);
    }, share);

  for (const path of [
    "/portfolio/tbh-intranet",
    "/ventures/gogocash",
    "/topics/ai-transformation-thailand",
    "/about",
  ]) {
    test(`${path}: empty at the top, half way at half, full at the end`, async ({
      page,
      browserName,
    }) => {
      test.skip(
        browserName !== "chromium",
        "scroll-driven animations are checked in Chromium",
      );
      await page.emulateMedia({ reducedMotion: "no-preference" });
      await page.goto(path, { waitUntil: "load" });
      await expect(page.locator(".pf-reading")).toHaveCSS("display", "block");
      expect(await scaleAt(page, 0)).toBeCloseTo(0, 2);
      expect(await scaleAt(page, 0.5)).toBeCloseTo(0.5, 1);
      expect(await scaleAt(page, 1)).toBeCloseTo(1, 2);
    });
  }

  test("a case's eyebrow ends with its reading time", async ({ page }) => {
    await page.goto("/portfolio/tbh-intranet", { waitUntil: "load" });
    await expect(page.locator(".pf-case-hero__eyebrow")).toHaveText(
      /·\s\d+\smin\sread$/,
    );
  });

  test("no line on a page that is not a long read, none under reduced motion", async ({
    page,
  }) => {
    await page.goto("/proof", { waitUntil: "load" });
    await expect(page.locator(".pf-reading")).toHaveCount(0);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/portfolio/tbh-intranet", { waitUntil: "load" });
    await expect(page.locator(".pf-reading")).toHaveCSS("display", "none");
  });
});

/**
 * Link underlines (research item 5): a prose link's underline draws in, the
 * full accent at 2 px, under the pointer or keyboard focus; a footer link's
 * underline is there unpainted and fades in. At rest both look as before.
 */
test.describe("links > underlines draw in under the pointer and the keyboard", () => {
  const decoration = (locator: Locator) =>
    locator.evaluate((el) => {
      const style = getComputedStyle(el);
      return {
        color: style.textDecorationColor,
        thickness: style.textDecorationThickness,
      };
    });

  test("/about: a prose link and a footer link", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/about", { waitUntil: "load" });
    await expect(page.locator("time[data-clock]")).toBeAttached();
    // /about settles late (its activity card fills in, the footer moves
    // 12 px after hydration), which can slide a link from under the
    // pointer: each hover is retried until its state holds.
    const prose = page.locator("main .ds-prose-link").first();
    await prose.scrollIntoViewIfNeeded();
    expect((await decoration(prose)).thickness).toBe("auto");
    await expect(async () => {
      await prose.hover();
      expect(await decoration(prose)).toEqual({
        color: "rgb(110, 60, 255)",
        thickness: "2px",
      });
    }).toPass();
    await page.mouse.move(0, 0);
    expect((await decoration(prose)).thickness).toBe("auto");
    // Reached with the keyboard: Tab back to it from the control before.
    await prose.focus();
    await page.keyboard.press("Shift+Tab");
    await page.keyboard.press("Tab");
    expect((await decoration(prose)).thickness).toBe("2px");

    const footer = page.locator(".pf-footer__link").first();
    await footer.scrollIntoViewIfNeeded();
    expect((await decoration(footer)).color).toBe("rgba(0, 0, 0, 0)");
    await expect(async () => {
      await footer.hover();
      expect((await decoration(footer)).color).not.toBe("rgba(0, 0, 0, 0)");
    }).toPass();
  });
});

/**
 * Search (premium interactions, item 8): ⌘K or the nav's button opens a
 * modal dialog whose stylesheet loads only then; the field is a combobox,
 * the arrows move, Enter opens a result, Esc closes and gives focus back.
 * Phones open it from the menu. The footer's "Now" line ends with the time
 * in Bangkok once the page runs.
 */
test.describe("search > ⌘K opens a dialog that finds and opens pages", () => {
  const dialog = "dialog.pf-search[open]";
  /** Opens a page and waits for hydration: the footer's clock is client-only. */
  const visit = async (page: Page, path: string) => {
    await page.goto(path, { waitUntil: "load" });
    await expect(page.locator("time[data-clock]")).toBeAttached();
  };
  const searchSheet = (page: Page) =>
    page.evaluate(() =>
      [...document.querySelectorAll('link[rel="stylesheet"]')].some((link) =>
        /search/.test((link as HTMLLinkElement).href),
      ),
    );

  test("⌘K, type, arrows and Enter open a case; its sheet loads only then", async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));
    await visit(page, "/about");
    await expect(page.locator(".pf-search-toggle")).toBeVisible();
    expect(await searchSheet(page)).toBe(false);

    await page.keyboard.press("ControlOrMeta+k");
    await expect(page.locator(dialog)).toBeVisible();
    expect(await searchSheet(page)).toBe(true);
    const field = page.getByRole("combobox", { name: "Search the site" });
    await expect(field).toBeFocused();
    await expect(page.getByRole("option").first()).toBeVisible();

    await field.fill("intranet");
    await expect(page.getByRole("option")).toHaveCount(1);
    await expect(page.getByRole("option")).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/portfolio\/tbh-intranet$/);
    await expect(page.locator("dialog.pf-search")).toHaveCount(0);

    await page.keyboard.press("ControlOrMeta+k");
    await field.fill("a");
    const second = page.getByRole("option").nth(1);
    await page.keyboard.press("ArrowDown");
    await expect(second).toHaveAttribute("aria-selected", "true");
    await expect(field).toHaveAttribute(
      "aria-activedescendant",
      (await second.getAttribute("id"))!,
    );

    // A case's own name leads, ahead of the pages that mention it.
    await field.fill("gogocash");
    const first = page.getByRole("option").first();
    await expect(first).toHaveAttribute("aria-selected", "true");
    await expect(first.locator(".pf-search__title")).toHaveText("GoGoCash");
    expect(errors, errors.join("\n")).toEqual([]);
  });

  test("the button opens it; Esc closes it and gives focus back; no serious axe violations", async ({
    page,
  }) => {
    await visit(page, "/contact");
    const button = page.getByRole("button", { name: "Search the site" });
    await button.click();
    await expect(page.locator(dialog)).toBeVisible();
    await expect(page.getByRole("option").first()).toBeVisible();
    const results = await new AxeBuilder({ page })
      .include("dialog.pf-search")
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(
      results.violations
        .filter((v) => ["serious", "critical"].includes(v.impact ?? ""))
        .map((v) => v.id),
    ).toEqual([]);
    await page.keyboard.press("Escape");
    await expect(page.locator("dialog.pf-search")).toHaveCount(0);
    await expect(button).toBeFocused();
  });

  test("on a phone, the menu's Search opens it", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await visit(page, "/");
    await expect(page.locator(".pf-search-toggle")).toBeHidden();
    await page.getByRole("button", { name: "Open menu" }).click();
    await page.getByRole("button", { name: "Search", exact: true }).click();
    await expect(page.locator(dialog)).toBeVisible();
    await expect(page.locator("#site-menu:popover-open")).toHaveCount(0);
  });

  test("the footer's Now line, then the time in Bangkok", async ({ page }) => {
    await page.goto("/contact", { waitUntil: "load" });
    const footer = page.locator(".pf-footer__name-block");
    await expect(footer).toContainText("Now: building GoGoCash and Manut AI");
    await expect(footer.locator("time[data-clock]")).toHaveText(
      /^\d{2}:\d{2}$/,
    );
  });
});

/**
 * Link previews (premium interactions, item 6): a case's text link shows the
 * case's card after a pause under the pointer, or at once on keyboard
 * focus; the pointer can move onto it; Esc dismisses it; its stylesheet
 * loads only then. Cards that open a case have none, and touch has none.
 */
test.describe("link previews > a case's text link shows its card", () => {
  const card = ".pf-preview";
  const visit = async (page: Page, path: string) => {
    await page.goto(path, { waitUntil: "load" });
    await expect(page.locator("time[data-clock]")).toBeAttached();
  };

  test("/about: under the pointer after a pause, onto the card, Esc", async ({
    page,
  }) => {
    await visit(page, "/about");
    const link = page
      .locator('main a.ds-prose-link[href="/portfolio/tbh-intranet"]')
      .first();
    await link.scrollIntoViewIfNeeded();
    const previewSheet = () =>
      page.evaluate(() =>
        [...document.querySelectorAll('link[rel="stylesheet"]')].some((l) =>
          /preview/.test((l as HTMLLinkElement).href),
        ),
      );
    expect(await previewSheet()).toBe(false);

    await expect(async () => {
      await link.hover();
      await expect(page.locator(card)).toBeVisible({ timeout: 1500 });
    }).toPass();
    expect(await previewSheet()).toBe(true);
    const tooltip = page.getByRole("tooltip");
    await expect(tooltip).toContainText("TBH Intranet");
    await expect(tooltip).toContainText("One back office");
    await expect(link).toHaveAttribute(
      "aria-describedby",
      (await tooltip.getAttribute("id"))!,
    );

    // Hoverable: the pointer crosses to the card and it stays.
    const box = (await page.locator(card).boundingBox())!;
    await page.mouse.move(box.x + 24, box.y + 24, { steps: 5 });
    await page.waitForTimeout(400);
    await expect(page.locator(card)).toBeVisible();

    // Dismissible without moving the pointer.
    await page.keyboard.press("Escape");
    await expect(page.locator(card)).toHaveCount(0);
    await expect(link).not.toHaveAttribute("aria-describedby", /./);
  });

  test("/about: on keyboard focus, gone when focus leaves", async ({
    page,
  }) => {
    await visit(page, "/about");
    const link = page
      .locator('main a.ds-prose-link[href="/ventures/manut"]')
      .first();
    await link.focus();
    await page.keyboard.press("Shift+Tab");
    await page.keyboard.press("Tab");
    await expect(page.getByRole("tooltip")).toContainText("Manut");
    await page.locator("body").press("Escape");
    await expect(page.locator(card)).toHaveCount(0);
  });

  test("/portfolio: the cards that open a case have no preview", async ({
    page,
  }) => {
    await visit(page, "/portfolio");
    const cardLink = page.locator(".pf-work-card a.ds-stretch").first();
    await cardLink.scrollIntoViewIfNeeded();
    await cardLink.hover();
    await page.waitForTimeout(900);
    await expect(page.locator(card)).toHaveCount(0);
  });
});

/**
 * The pixel portrait (owner, 20-11-26): the nav's avatar is the portrait's
 * 16 x 16 cut; on /about the portrait lies over the photo, a press tries a
 * trait (remembered), and the pill dissolves it to the photo and back.
 */
test.describe("pixel portrait > the nav avatar and /about's portrait", () => {
  test("the nav avatar is the pixel portrait", async ({ page }) => {
    await page.goto("/", { waitUntil: "load" });
    const avatar = page.locator(".pf-nav__name svg.pf-portrait");
    await expect(avatar).toBeVisible();
    await expect(avatar).toHaveAttribute("viewBox", "0 0 16 16");
  });

  test("/about: a press tries a trait; the pill shows the photo and back", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/about", { waitUntil: "load" });
    await expect(page.locator("time[data-clock]")).toBeAttached();
    const pixels = page.locator(".pf-about-page__pixels");
    const tryTrait = page.getByRole("button", { name: /^Try a trait/ });
    await expect(pixels).toBeVisible();
    await expect(tryTrait).toHaveText("Try a trait · 0/6");
    await tryTrait.click();
    await expect(tryTrait).toHaveText("Try a trait · 1/6");
    // A press on the portrait does the same, for a pointer.
    await pixels.click({ position: { x: 120, y: 200 } });
    await expect(tryTrait).toHaveText("Try a trait · 2/6");
    await page.reload({ waitUntil: "load" });
    await expect(tryTrait).toHaveText("Try a trait · 2/6");

    await page.getByRole("button", { name: "Show the photo" }).click();
    await expect(pixels).toBeHidden();
    await expect(page.locator(".pf-about-page__photo")).toBeVisible();
    await page.getByRole("button", { name: "Show the pixels" }).click();
    await expect(pixels).toBeVisible();
  });
});

/**
 * The recruiter path (recruiter-fit phase 2): what a visitor weighing his
 * work needs is one glance or one click away. Since the owner's direction of
 * 20-11-26 the availability says he is building GoGoCash and Manut AI, and
 * the buttons lead to a project ("Get in touch", "Work with me"); the old
 * hiring address still opens the form, for a future role.
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
    test(`home shows the role, what he is building and both buttons without scrolling at ${viewport.width} px`, async ({
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
      await expect(hero.getByText("Currently building")).toBeInViewport({
        ratio: 1,
      });
      await expect(hero.getByText(/open to roles/i)).toHaveCount(0);
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
      // Tap one opens the menu. Tap two is this row: a plain link, on screen.
      await page.getByRole("button", { name: "Open menu" }).click();
      const row = page
        .getByRole("navigation", { name: "Site" })
        .getByRole("link", { name: "Résumé" });
      await expect(row).toBeInViewport();
      await expect(row).toHaveAttribute("href", "/resume");
    });
  }

  // The tap-through runs once, not once per route, and stops at the URL.
  // The first in-browser visit to /resume in a page load reads Sanity. One
  // run failed 23 such tests at once on a failed read, which then showed the
  // error page, so this required job no longer asserts the résumé's content
  // here: the résumé tests above load the page itself. Since phase 3 a failed
  // read shows the repo's copy instead (resumeProfile.test.ts).
  test("on a phone the menu's Résumé row leads to the résumé", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/portfolio", { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "Open menu" }).click();
    await page
      .getByRole("navigation", { name: "Site" })
      .getByRole("link", { name: "Résumé" })
      .click();
    await expect(page).toHaveURL(/\/resume$/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  // Rewritten at the profile redesign's cutover (Phase 6; umbrella input
  // R17, design spec 13 item 23), to the same intent: the pill nav shows its
  // Primary links from 810 px (the old header from 1024), in one 48 px row,
  // with no email link and no Share button of its own.
  test("the nav's links appear from 810 px, on one row, and not below it", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 809, height: 800 });
    await page.goto("/portfolio", { waitUntil: "networkidle" });
    const nav = page.getByRole("navigation", { name: "Primary" });
    await expect(nav).toBeHidden();
    const chrome = page.locator("header[data-site-chrome]");
    const box = async (target: Locator) => {
      const found = await target.boundingBox();
      if (!found) throw new Error("a header part has no box");
      return found;
    };
    for (const width of [810, 1024, 1440]) {
      await page.setViewportSize({ width, height: 800 });
      await expect(nav).toBeVisible();
      // The links sit between the name and the buttons and touch neither.
      const name = await box(
        chrome.getByRole("link", { name: "Kunanon Jarat, home" }),
      );
      const links = await box(nav);
      const buttons = await box(chrome.locator(".pf-nav__right"));
      expect(links.x, `${width}`).toBeGreaterThanOrEqual(name.x + name.width);
      expect(links.x + links.width, `${width}`).toBeLessThanOrEqual(buttons.x);
      // One row: a wrapped bar would be about twice this tall.
      expect((await box(chrome)).height, `${width}`).toBeLessThan(60);
      expect(
        await page.evaluate(
          () =>
            document.documentElement.scrollWidth -
            document.documentElement.clientWidth,
        ),
        `${width}`,
      ).toBe(0);
    }
    // The old header's email link and Share button are gone from the bar.
    await expect(chrome.locator('a[href^="mailto:"]:visible')).toHaveCount(0);
    await expect(chrome.getByRole("button", { name: /share/i })).toHaveCount(0);
    // The current section is marked for the eye as well as for a reader. The
    // tint is drawn, not only declared: the ::before has content and a box
    // the link's size (a hidden one keeps its colour but has neither).
    const current = nav.locator('a[aria-current="page"]');
    await expect(current).toHaveText("Work");
    const mark = await current.evaluate((el) => {
      const tint = getComputedStyle(el, "::before");
      const link = el.getBoundingClientRect();
      return {
        content: tint.content,
        display: tint.display,
        width: parseFloat(tint.width) - link.width,
        height: parseFloat(tint.height) - link.height,
        background: tint.backgroundColor,
      };
    });
    expect(mark.content).toBe('""');
    expect(mark.display).not.toBe("none");
    expect(Math.abs(mark.width)).toBeLessThan(1);
    expect(Math.abs(mark.height)).toBeLessThan(1);
    expect(mark.background).not.toBe("rgba(0, 0, 0, 0)");
  });

  test("a work button opens the contact form ready for a project", async ({
    page,
  }) => {
    await page.goto("/topics/forward-deployed-ai-engineering", {
      waitUntil: "networkidle",
    });
    await page
      .locator('section[aria-labelledby="hero-title"]')
      .getByRole("link", { name: "Work with me" })
      .click();
    await expect(page).toHaveURL(/\/contact\?topic=project$/);
    await expect(
      page.getByRole("button", { name: "Freelance or consulting" }),
    ).toHaveAttribute("aria-pressed", "true");
    await expect(
      page.getByLabel("What are you building, and where could I help?"),
    ).toBeVisible();
    await expect(
      page.getByRole("article", { name: "For recruiters", exact: true }),
    ).toBeVisible();
  });

  test("the old hiring link still works as a direct visit, for a future role, and the chip stays the visitor's", async ({
    page,
  }) => {
    // The page is prerendered as the general form; the intent arrives after
    // hydration.
    await page.goto("/contact?topic=hiring", { waitUntil: "networkidle" });
    await expect(page).toHaveURL(/\/contact\?topic=hiring$/);
    await expect(page.getByRole("button", { name: "Hiring" })).toHaveCount(0);
    const chip = page.getByRole("button", { name: "A future role" });
    await expect(chip).toHaveAttribute("aria-pressed", "true");
    await expect(
      page.getByLabel(
        "Not looking right now, but tell me about the role for later: the team and the scope",
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
    const card = page.getByRole("article", { name: "Next", exact: true });
    await expect(
      card.getByRole("heading", { name: "For recruiters" }),
    ).toBeVisible();
    // Not looking now: the recruiter's link is for later (20-11-26).
    await expect(
      card.getByRole("link", { name: "Get in touch for later" }),
    ).toHaveAttribute("href", "/contact?topic=hiring");
    // The ink button serves every reader: it opens the general form.
    await expect(
      card.getByRole("link", { name: "Contact", exact: true }),
    ).toHaveAttribute("href", "/contact");
  });

  test("Contact leaves no empty cell beside the recruiter card", async ({
    page,
  }) => {
    // Cards rise into place as they enter; measure them at rest.
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/contact", { waitUntil: "networkidle" });
    const who = page.getByRole("article", {
      name: "Who should write",
      exact: true,
    });
    const recruiters = page.getByRole("article", {
      name: "For recruiters",
      exact: true,
    });
    const box = async (card: Locator) => {
      const found = await card.boundingBox();
      if (!found) throw new Error("a card has no box");
      return found;
    };
    // Each resize re-flows the grid; under load the first read can come
    // before it settles, so the row checks poll until the layout is at rest.
    // Three columns: the two cards share a row.
    await page.setViewportSize({ width: 1440, height: 900 });
    await expect
      .poll(
        async () => Math.abs((await box(who)).y - (await box(recruiters)).y),
        {
          message: "both cards start on one row at 1440 px",
        },
      )
      .toBeLessThan(2);
    const wideWho = await box(who);
    expect((await box(recruiters)).x).toBeGreaterThan(
      wideWho.x + wideWho.width,
    );
    // Two columns: each takes a whole row, so neither sits beside a gap.
    await page.setViewportSize({ width: 800, height: 900 });
    await expect
      .poll(
        async () => {
          const midWho = await box(who);
          return (await box(recruiters)).y - (midWho.y + midWho.height);
        },
        { message: "the recruiter card starts below the other at 800 px" },
      )
      .toBeGreaterThanOrEqual(0);
    // The widths settle with the same re-flow, so they are polled too: a
    // single read straight after the row check once caught them 64 px apart.
    await expect
      .poll(
        async () =>
          Math.abs((await box(recruiters)).width - (await box(who)).width),
        { message: "both cards take the whole row at 800 px" },
      )
      .toBeLessThan(2);
  });

  test("an unknown contact topic falls back to the general form without an error", async ({
    page,
  }) => {
    const response = await page.goto("/contact?topic=nope", {
      waitUntil: "networkidle",
    });
    expect(response?.ok()).toBe(true);
    await expect(page).toHaveURL(/\/contact$/);
    // The default is never written into the URL either.
    await page.goto("/contact?topic=general", { waitUntil: "networkidle" });
    await expect(page).toHaveURL(/\/contact$/);
    for (const name of ["Freelance or consulting", "A future role"])
      await expect(page.getByRole("button", { name })).toHaveAttribute(
        "aria-pressed",
        "false",
      );
  });

  test("the FDE hub sets its four sections as chapters, each body beside its heading at desktop width", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/topics/forward-deployed-ai-engineering", {
      waitUntil: "networkidle",
    });
    // Profile redesign, Phase 7 (R17: the bento test's intent, no section
    // left mostly empty): each chapter's body starts level with its kicker,
    // in the column beside its heading, so no band of the page sits empty.
    const chapters = await page
      .locator("section.pf-case-chapter:has(> h2.t-h3)")
      .evaluateAll((sections) =>
        sections.map((chapter) => {
          const box = (selector: string) =>
            chapter.querySelector(selector)!.getBoundingClientRect();
          const kicker = box(".pf-case-kicker");
          const heading = box("h2");
          const body = box("p:not([aria-hidden])");
          return {
            level: Math.round(Math.abs(body.top - kicker.top)),
            beside: body.left > heading.right,
          };
        }),
      );
    expect(chapters).toHaveLength(4);
    for (const chapter of chapters) {
      expect(chapter.level).toBeLessThanOrEqual(8);
      expect(chapter.beside).toBe(true);
    }
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
        hasText: "กำลังสร้าง · GoGoCash และ Manut AI ที่กรุงเทพฯ",
      }),
    ).toBeVisible();
    await expect(hero.getByRole("link", { name: "เรซูเม่" })).toHaveAttribute(
      "href",
      "/resume",
    );
    await expect(hero.getByRole("link", { name: "ติดต่อ" })).toHaveAttribute(
      "href",
      "/contact?topic=project",
    );
  });

  test("a case study ends with the résumé and the work contact", async ({
    page,
  }) => {
    await page.goto("/portfolio/tbh-intranet", { waitUntil: "networkidle" });
    await expect(
      page.getByRole("article", { name: "Hiring", exact: true }),
    ).toHaveCount(0);
    const card = page.getByRole("article", {
      name: "Work together",
      exact: true,
    });
    await expect(card.getByRole("link", { name: "Résumé" })).toHaveAttribute(
      "href",
      "/resume",
    );
    await expect(
      card.getByRole("link", { name: "Get in touch" }),
    ).toHaveAttribute("href", "/contact?topic=project");
  });
});

/**
 * Case-study evidence (recruiter-fit phase 3): each case study states what
 * changed and his part, from figures the owner cleared, and /proof shows
 * delivery beside the venture metrics.
 */
test.describe("case-study evidence > what changed and his part, from cleared figures", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      try {
        sessionStorage.setItem("fronk-intro-seen", "1");
      } catch {
        // Storage can be unavailable; the intro then plays and the test waits.
      }
    });
    // Cards rise into place; measure them where they rest.
    await page.emulateMedia({ reducedMotion: "reduce" });
  });

  /** True when nothing is wider than the viewport (no sideways scroll). */
  const fitsWidth = (page: Page) =>
    page.evaluate(
      () =>
        document.documentElement.scrollWidth <=
        document.documentElement.clientWidth,
    );

  test("the intranet case opens with its two outcomes and his part, above the mockup", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/portfolio/tbh-intranet", { waitUntil: "networkidle" });
    const outcome = page.getByRole("article", { name: "Outcome", exact: true });
    const part = page.getByRole("article", { name: "My part", exact: true });
    await expect(outcome).toContainText("Adoption");
    await expect(outcome).toContainText("50+ employees");
    await expect(outcome).toContainText("Build cycles");
    await expect(outcome).toContainText("4 months to 1 week");
    await expect(
      outcome.getByRole("link", { name: "As stated in the résumé →" }),
    ).toHaveAttribute("href", "/resume");
    await expect(part).toContainText("wrote code for the platform");
    // Measure once the cards are drawn and the web fonts have set the text.
    await expect(outcome).toBeVisible();
    await expect(part).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    // Each a full row, his part under the outcomes, both before the mockup.
    const [o, m, mock] = await Promise.all([
      outcome.boundingBox(),
      part.boundingBox(),
      page
        .getByRole("article", { name: "Interface", exact: true })
        .boundingBox(),
    ]);
    expect(m!.y).toBeGreaterThanOrEqual(o!.y + o!.height);
    expect(Math.abs(o!.width - m!.width)).toBeLessThan(2);
    expect(mock!.y).toBeGreaterThanOrEqual(m!.y + m!.height);
    // Neither card is stretched past its content: no empty band.
    expect(o!.height).toBeLessThan(260);
    expect(m!.height).toBeLessThan(260);
    // Both in view early: the outcomes within the first screen and a half.
    expect(o!.y + o!.height).toBeLessThan(1.5 * 900);
  });

  for (const width of [800, 375, 320]) {
    test(`the outcome and his part stack and fit at ${width} px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/portfolio/tbh-intranet", { waitUntil: "networkidle" });
      const outcome = page.getByRole("article", {
        name: "Outcome",
        exact: true,
      });
      const part = page.getByRole("article", { name: "My part", exact: true });
      await expect(outcome).toBeVisible();
      await expect(part).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      const o = await outcome.boundingBox();
      const m = await part.boundingBox();
      expect(m!.y).toBeGreaterThanOrEqual(o!.y + o!.height);
      expect(Math.abs(o!.width - m!.width)).toBeLessThan(2);
      expect(await fitsWidth(page)).toBe(true);
    });
  }

  test("the agents case states the staffing change and the turnaround", async ({
    page,
  }) => {
    await page.goto("/portfolio/ai-automation", { waitUntil: "networkidle" });
    const outcome = page.getByRole("article", { name: "Outcome", exact: true });
    await expect(outcome).toContainText("10 people to 1 operator");
    await expect(outcome).toContainText("30 minutes");
    await expect(
      page.getByRole("article", { name: "My part", exact: true }),
    ).toContainText("wrote code for the agents");
  });

  test("a case with no cleared figure shows his part and no outcome", async ({
    page,
  }) => {
    await page.goto("/portfolio/node-validator-automation", {
      waitUntil: "networkidle",
    });
    await expect(
      page.getByRole("article", { name: "My part", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("article", { name: "Outcome", exact: true }),
    ).toHaveCount(0);
  });

  test("the first outcome shows on the portfolio card and on Home", async ({
    page,
  }) => {
    await page.goto("/portfolio", { waitUntil: "networkidle" });
    await expect(
      page.getByRole("article", { name: "TBH Intranet" }),
    ).toContainText("Adoption: 50+ employees");
    await expect(
      page.getByRole("article", { name: "AI Automation" }),
    ).toContainText("Recurring workflow staffing: 10 people to 1 operator");
    await page.goto("/", { waitUntil: "networkidle" });
    await expect(
      page.getByRole("article", { name: "Selected work" }),
    ).toContainText("Adoption: 50+ employees");
  });

  test("proof leads with delivery, and a tile opens its case study", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/proof", { waitUntil: "networkidle" });
    const delivery = page.getByRole("article", {
      name: "Delivery",
      exact: true,
    });
    const metrics = page.getByRole("article", {
      name: "Venture metrics",
      exact: true,
    });
    const [d, v] = await Promise.all([
      delivery.boundingBox(),
      metrics.boundingBox(),
    ]);
    expect(d!.y).toBeLessThan(v!.y);
    await expect(
      delivery.getByRole("link", { name: "As stated in the résumé →" }),
    ).toHaveAttribute("href", "/resume");
    const tiles = delivery
      .getByRole("list", { name: "Outcomes, each linking to its case study" })
      .getByRole("link");
    await expect(tiles).toHaveCount(4);
    // The lead no longer repeats the h1.
    await expect(
      page.getByText("Delivery outcomes, as the résumé states them", {
        exact: false,
      }),
    ).toBeVisible();
    await tiles.filter({ hasText: "10 people to 1 operator" }).click();
    await expect(page).toHaveURL(/\/portfolio\/ai-automation$/);
    await expect(
      page.getByRole("article", { name: "Outcome", exact: true }),
    ).toContainText("10 people to 1 operator");
  });

  test("GoGoCash's totals carry their month on proof and on the case page", async ({
    page,
  }) => {
    await page.goto("/proof", { waitUntil: "networkidle" });
    const total = page.getByRole("button", { name: /THB 13 million/ });
    await expect(total).toContainText("As of October 2026");
    await total.click();
    await expect(page.getByRole("blockquote")).toContainText(
      "As of October 2026, cumulative gross merchandise value is THB 13 million and cashback paid is THB 169,000.",
    );
    await page.goto("/ventures/gogocash", { waitUntil: "networkidle" });
    for (const [label, value] of [
      ["Cumulative gross merchandise value", "THB 13 million"],
      ["Cashback paid", "THB 169,000"],
    ]) {
      const tile = page.locator("dl > div", { hasText: label });
      await expect(tile).toContainText(value!);
      await expect(tile).toContainText("As of October 2026");
    }
    // One user count on the page, as the résumé gives it: every sentence
    // that counts registered users says 1,000, not 21,000 and not "1,000+".
    // (The stat tile draws the figure and its label apart; the unit tests
    // pin that pair.)
    await expect(page.getByText("more than a thousand")).toHaveCount(0);
    const text = await page.locator("main").innerText();
    const counts = [
      ...text.matchAll(/([\d,.]*\d\+?)\s+registered users/gi),
    ].map((match) => match[1]);
    expect(counts.length).toBeGreaterThan(1);
    expect([...new Set(counts)]).toEqual(["1,000"]);
  });

  // The longest new figure on each page: it must be drawn, and fit.
  for (const [path, figure] of [
    ["/proof", "10 people to 1 operator"],
    ["/proof", "THB 13 million"],
    ["/ventures/gogocash", "THB 169,000"],
    ["/portfolio", "Recurring workflow staffing: 10 people to 1 operator"],
  ] as const) {
    for (const width of [375, 320]) {
      test(`${path} shows "${figure}" on a ${width} px screen without sideways scroll`, async ({
        page,
      }) => {
        await page.setViewportSize({ width, height: 812 });
        await page.goto(path, { waitUntil: "networkidle" });
        const shown = page.getByText(figure, { exact: true }).first();
        await shown.scrollIntoViewIfNeeded();
        await expect(shown).toBeVisible();
        // Wrapped, not clipped: the text's box stays inside the screen.
        const box = await shown.boundingBox();
        expect(box!.x).toBeGreaterThanOrEqual(0);
        expect(box!.x + box!.width).toBeLessThanOrEqual(width);
        expect(await fitsWidth(page)).toBe(true);
      });
    }
  }

  test("the FDE hub lists the outcomes in English and in Thai", async ({
    page,
  }) => {
    await page.goto("/topics/forward-deployed-ai-engineering", {
      waitUntil: "networkidle",
    });
    await expect(
      page.getByText(
        "TBH Intranet: adoption by 50+ employees; build cycles from 4 months to 1 week",
      ),
    ).toBeVisible();
    await expect(
      page.getByText(
        "AI Automation: recurring workflow staffing from 10 people to 1 operator; 30-minute turnaround",
      ),
    ).toBeVisible();
    await page.goto("/th/topics/forward-deployed-ai-engineering", {
      waitUntil: "networkidle",
    });
    // The Thai wording is pinned in the unit audit; here its figures. Each
    // line gives the same figures as the English one, in the same order and
    // in Arabic numerals, and no others.
    const proof = page.locator('article[aria-labelledby="card-proof"] li');
    await expect(proof.first()).toBeVisible();
    const lines = await proof.allInnerTexts();
    expect(lines.join(" ")).not.toMatch(/[๐-๙]/);
    const figuresOf = (name: string) =>
      lines
        .filter((line) => line.trim().startsWith(`${name}: `))
        .map((line) => line.match(/\d[\d,.]*\+?/g) ?? []);
    expect(figuresOf("TBH Intranet")).toEqual([["50+", "4", "1"]]);
    expect(figuresOf("AI Automation")).toEqual([["10", "1", "30"]]);
  });

  test("this site is a public project that links its source and claims no figure", async ({
    page,
    request,
  }) => {
    await page.goto("/portfolio/kunanonj-com", { waitUntil: "networkidle" });
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "kunanonj.com.",
    );
    await expect(
      page.getByRole("link", { name: /Source on GitHub/ }),
    ).toHaveAttribute("href", "https://github.com/KunanonJ/fronk-website");
    await expect(
      page.getByRole("article", { name: "Outcome", exact: true }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("article", { name: "My part", exact: true }),
    ).toHaveCount(0);
    const twin = await request.get("/portfolio/kunanonj-com.md");
    expect(twin.status()).toBe(200);
    expect(await twin.text()).toContain(
      "Source on GitHub: https://github.com/KunanonJ/fronk-website",
    );
    const image = await request.get("/portfolio/kunanonj-com/opengraph-image");
    expect(image.status()).toBe(200);
    expect(image.headers()["content-type"]).toContain("image/png");
    const sitemap = await request.get("/sitemap.xml");
    expect(await sitemap.text()).toContain("/portfolio/kunanonj-com</loc>");
  });

  test("the text endpoints and the structured data carry the same outcomes", async ({
    page,
    request,
  }) => {
    const twin = await (await request.get("/portfolio/tbh-intranet.md")).text();
    expect(twin).toContain("## Outcome");
    expect(twin).toContain("- **Adoption:** 50+ employees");
    expect(twin).toContain("## My part");
    const full = await (await request.get("/llms-full.txt")).text();
    expect(full).toContain(
      "Outcome: Adoption: 50+ employees; Build cycles: 4 months to 1 week.",
    );
    expect(full).toContain("## Personal projects");
    expect(full).toContain(
      "- THB 13 million Cumulative gross merchandise value (as of October 2026)",
    );
    await page.goto("/portfolio/tbh-intranet", {
      waitUntil: "domcontentloaded",
    });
    const work = await page
      .locator('script[type="application/ld+json"]')
      .evaluateAll((nodes) =>
        nodes
          .map((node) => JSON.parse(node.textContent ?? "{}"))
          .find((data) => data["@type"] === "CreativeWork"),
      );
    expect(work.description).toContain(
      "Outcome, as stated in the résumé: Adoption: 50+ employees; Build cycles: 4 months to 1 week.",
    );
  });
});

// worker-cache-followup plan, step 10. These read the headers the built
// Worker sends (CI serves `pnpm start`, the Worker runtime). /learn reads
// nothing from Sanity while the blog is hidden, so neither test depends on
// Sanity being reachable.
test.describe("worker cache > what the edge may keep", () => {
  test("a server function's answer is kept nowhere", async ({ page }) => {
    const answers: { status: number; cacheControl: string | null }[] = [];
    page.on("response", (response) => {
      if (new URL(response.url()).pathname.startsWith("/_serverFn/"))
        answers.push({
          status: response.status(),
          cacheControl: response.headers()["cache-control"] ?? null,
        });
    });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/", { waitUntil: "networkidle" });
    // Count only what the visit to Learn fetches.
    answers.length = 0;
    // Learn is in the footer's Pages list since the Phase 6 cutover (the old
    // header's menu held it before): an in-app navigation either way.
    await page
      .getByRole("contentinfo")
      .getByRole("link", { name: "Learn", exact: true })
      .click();
    await expect(page).toHaveURL(/\/learn$/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    // The link's preload or the navigation fetched the page's data.
    await expect.poll(() => answers.length).toBeGreaterThan(0);
    expect(answers).toContainEqual({ status: 200, cacheControl: "no-store" });
    for (const answer of answers) expect(answer.cacheControl).toBe("no-store");
  });

  test("the tagged pages and feeds get an hour at the edge and stale-if-error=0", async ({
    request,
  }) => {
    for (const path of ["/learn", "/feed.xml", "/llms.txt", "/sitemap.xml"]) {
      const res = await request.get(path);
      expect(res.status(), path).toBe(200);
      expect(res.headers()["cdn-cache-control"], path).toBe(
        "public, max-age=3600, stale-if-error=0",
      );
      expect(res.headers()["cache-control"], path).toBe(
        "public, max-age=0, must-revalidate",
      );
      expect(res.headers()["cache-tag"], path).toBe("posts");
    }
  });

  test("files that change only on a deploy keep a day at the edge", async ({
    request,
  }) => {
    const browser: Record<string, string> = {
      "/robots.txt": "public, max-age=3600",
      "/manifest.webmanifest": "public, max-age=3600",
      "/.well-known/security.txt": "public, max-age=3600",
      "/skills.json": "public, max-age=3600",
      "/studio": "public, max-age=0, must-revalidate",
    };
    for (const [path, cacheControl] of Object.entries(browser)) {
      const res = await request.get(path);
      expect(res.status(), path).toBe(200);
      expect(res.headers()["cdn-cache-control"], path).toBe(
        "public, max-age=86400",
      );
      expect(res.headers()["cache-control"], path).toBe(cacheControl);
    }
  });
});

// agent-readiness plan, gate 3: the formats Cloudflare's Agent Readiness
// checks look for. The built Worker answers these (CI serves `pnpm start`).
test.describe("agent readiness", () => {
  const BROWSER = "text/html,application/xhtml+xml,*/*;q=0.8";

  test("pages with a Markdown version answer Accept: text/markdown with it", async ({
    request,
  }) => {
    for (const [path, markdown] of [
      ["/", "/index.md"],
      ["/about", "/about.md"],
      ["/portfolio/kunanonj-com", "/portfolio/kunanonj-com.md"],
    ]) {
      const md = await request.get(path, {
        headers: { Accept: "text/markdown" },
      });
      expect(md.status(), path).toBe(200);
      expect(md.headers()["content-type"], path).toBe(
        "text/markdown; charset=utf-8",
      );
      expect(md.headers()["vary"], path).toBe("Accept");
      expect(md.headers()["content-location"], path).toBe(markdown);
      expect(await md.text(), path).toMatch(/^# /);

      const html = await request.get(path, { headers: { Accept: BROWSER } });
      expect(html.status(), path).toBe(200);
      expect(html.headers()["content-type"], path).toContain("text/html");
      expect(html.headers()["vary"], path).toBe("Accept");
      expect(html.headers()["content-location"], path).toBeUndefined();
    }
  });

  test("the home page links its Markdown, llms.txt and the sitemap", async ({
    request,
  }) => {
    const link = (await request.get("/")).headers()["link"] ?? "";
    expect(link).toContain(
      '</index.md>; rel="alternate"; type="text/markdown"',
    );
    expect(link).toContain('</llms.txt>; rel="describedby"');
    expect(link).toContain('</sitemap.xml>; rel="sitemap"');
  });

  test("robots.txt declares the content signals in every group that allows crawling", async ({
    request,
  }) => {
    const res = await request.get("/robots.txt");
    expect(res.status()).toBe(200);
    const text = await res.text();
    const groups = text.split("\n\n").filter((g) => g.startsWith("User-Agent"));
    // The * group, the named crawlers and the two blocked ones.
    expect(groups.length).toBeGreaterThanOrEqual(4);
    expect(groups.filter((g) => /^Disallow: \/$/m.test(g)).length).toBe(2);
    for (const group of groups) {
      const allows = /^Allow: \//m.test(group);
      expect(
        /^Content-Signal: search=yes, ai-input=yes, ai-train=yes$/m.test(group),
        group.split("\n")[0],
      ).toBe(allows);
    }
  });

  test("the Agent Skills index lists the skills in the discovery format", async ({
    request,
  }) => {
    const res = await request.get("/.well-known/agent-skills/index.json");
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toBe(
      "application/json; charset=utf-8",
    );
    const index = (await res.json()) as {
      $schema: string;
      skills: { name: string; type: string; url: string; digest: string }[];
    };
    expect(index.$schema).toBe(
      "https://schemas.agentskills.io/discovery/0.2.0/schema.json",
    );
    expect(index.skills).toHaveLength(20);
    for (const skill of index.skills) {
      expect(skill.type, skill.name).toBe("archive");
      expect(skill.url, skill.name).toMatch(/-flat\.zip$/);
      expect(skill.digest, skill.name).toMatch(/^sha256:[0-9a-f]{64}$/);
    }
  });
});

/**
 * Tap targets inside `root` that are under `min` px, that overlap another
 * target, or that something else covers. A link in a sentence is left out,
 * as WCAG 2.2's inline exception (2.5.8) allows: an inline link next to
 * visible text that belongs to no target. (Such a link wrapping onto a second
 * line would also measure as one box over both lines, overlapping its
 * neighbours on paper only.) "Covered" hit-tests the centre and a point 1 px
 * inside the middle of each edge, not the corners, where rounded controls
 * give way to their parent. It runs in the page, so it uses nothing from this
 * file's scope.
 */
function tapAreas({ min, root }: { min: number; root: string }) {
  const SELECTOR =
    "a[href], button, input:not([type=hidden]), select, textarea, summary, [role=button], [role=tab]";
  const name = (el: Element) =>
    (
      (el as HTMLElement).innerText?.trim() ||
      el.getAttribute("aria-label") ||
      el.tagName
    ).slice(0, 40);
  // Visible text in `block` outside every target and every aria-hidden part.
  const sentenceText = (block: Element) => {
    let length = 0;
    const walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const parent = node.parentElement;
      if (!parent || parent.closest(`${SELECTOR}, [aria-hidden="true"]`))
        continue;
      const box = parent.getBoundingClientRect();
      // Screen-reader-only text is clipped to a 1 px box.
      if (box.width <= 1 || box.height <= 1) continue;
      length += (node.nodeValue ?? "").trim().length;
    }
    return length;
  };
  const inSentence = (el: Element, style: CSSStyleDeclaration) => {
    if (style.display !== "inline") return false;
    let block = el.parentElement;
    while (
      block &&
      ["inline", "inline-block", "contents"].includes(
        getComputedStyle(block).display,
      )
    )
      block = block.parentElement;
    return block !== null && sentenceText(block) > 0;
  };
  const scope = document.querySelector(root);
  const found = scope ? Array.from(scope.querySelectorAll(SELECTOR)) : [];
  const targets = found
    .map((el) => ({
      el,
      box: el.getBoundingClientRect(),
      style: getComputedStyle(el),
    }))
    .filter(
      ({ el, box, style }) =>
        style.display !== "none" &&
        style.visibility !== "hidden" &&
        box.width > 1 &&
        box.height > 1 &&
        !inSentence(el, style),
    );
  const small = targets
    .filter(({ box }) => Math.min(box.width, box.height) < min)
    .map(
      ({ el, box }) =>
        `${name(el)} ${box.width.toFixed(1)}×${box.height.toFixed(1)}`,
    );
  const overlaps: string[] = [];
  for (const [i, a] of targets.entries()) {
    for (const b of targets.slice(i + 1)) {
      if (a.el.contains(b.el) || b.el.contains(a.el)) continue;
      const x =
        Math.min(a.box.right, b.box.right) - Math.max(a.box.left, b.box.left);
      const y =
        Math.min(a.box.bottom, b.box.bottom) - Math.max(a.box.top, b.box.top);
      if (x > 0.5 && y > 0.5) overlaps.push(`${name(a.el)} / ${name(b.el)}`);
    }
  }
  const covered: string[] = [];
  for (const { el } of targets) {
    el.scrollIntoView({ block: "nearest", behavior: "instant" });
    // The part of the target on screen, inside every clipping ancestor.
    let { left, top, right, bottom } = el.getBoundingClientRect();
    for (let a = el.parentElement; a; a = a.parentElement) {
      const style = getComputedStyle(a);
      if (style.overflowX === "visible" && style.overflowY === "visible")
        continue;
      const clip = a.getBoundingClientRect();
      left = Math.max(left, clip.left);
      top = Math.max(top, clip.top);
      right = Math.min(right, clip.right);
      bottom = Math.min(bottom, clip.bottom);
    }
    left = Math.max(left, 0);
    top = Math.max(top, 0);
    right = Math.min(right, window.innerWidth);
    bottom = Math.min(bottom, window.innerHeight);
    if (right - left < 2 || bottom - top < 2) continue;
    const x = (left + right) / 2;
    const y = (top + bottom) / 2;
    const points: [number, number][] = [
      [x, y],
      [left + 1, y],
      [right - 1, y],
      [x, top + 1],
      [x, bottom - 1],
    ];
    // The phone menu's theme radios (Phase 6 cutover) are the one exception:
    // their labels take the pointer and check the radio, so a tap anywhere on
    // the label is a tap on the radio. Any other control a label covers
    // counts as covered.
    const labels =
      el.matches("#site-menu input.pf-theme__input[type=radio]") &&
      "labels" in el &&
      el.labels
        ? [...(el.labels as NodeListOf<HTMLLabelElement>)]
        : [];
    for (const [px, py] of points) {
      const hit = document.elementFromPoint(px, py);
      if (hit && el.contains(hit)) continue;
      if (hit && labels.some((label) => label.contains(hit))) continue;
      covered.push(
        `${name(el)} at ${Math.round(px)},${Math.round(py)}: ${hit?.tagName ?? "nothing"}`,
      );
      break;
    }
  }
  window.scrollTo(0, 0);
  return { count: targets.length, small, overlaps, covered };
}

test.describe("tap areas > at phone widths, 24 px or more, apart and uncovered", () => {
  // WCAG 2.2, 2.5.8 Target Size (Minimum).
  const MIN = 24;
  // The pages a phone visitor reaches first, and the ones with short links:
  // the footer's X on every page, the adapted-skills lists on /skills.
  const PAGES = [
    "/",
    "/about",
    "/skills",
    "/portfolio",
    "/portfolio/tbh-intranet",
    "/contact",
    "/resume",
    // Phase 7 (D1): a hub in each language and the densest reading pages.
    "/topics/forward-deployed-ai-engineering",
    "/th/topics/ai-transformation-thailand",
    "/stack",
    "/proof",
  ];

  test.beforeEach(async ({ page }) => {
    // Cards rise into place; measure them where they rest.
    await page.emulateMedia({ reducedMotion: "reduce" });
  });

  // 344: the Galaxy Z Fold closed (design spec 10.1; Phase 6 device matrix).
  for (const width of [320, 344, 390]) {
    for (const path of PAGES) {
      test(`${path} at ${width} px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 800 });
        const res = await page.goto(path, { waitUntil: "networkidle" });
        // A page that went missing would measure the 404 page instead.
        expect(res?.status(), path).toBe(200);
        await expect(
          page.getByRole("heading", { level: 1 }).first(),
        ).toBeVisible();
        await page.evaluate(() => document.fonts.ready);
        const { count, small, overlaps, covered } = await page.evaluate(
          tapAreas,
          { min: MIN, root: "body" },
        );
        expect(count).toBeGreaterThan(0);
        expect(small, `tap areas under ${MIN} px`).toEqual([]);
        expect(overlaps, "overlapping tap areas").toEqual([]);
        expect(covered, "covered tap areas").toEqual([]);
      });
    }

    // Hidden while closed, so the page tests above never measure it.
    test(`the open menu at ${width} px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto("/", { waitUntil: "networkidle" });
      const trigger = page.getByRole("button", { name: "Open menu" });
      await expect(trigger).toBeVisible();
      await trigger.click();
      await expect(page.locator("#site-menu")).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      const { count, small, overlaps, covered } = await page.evaluate(
        tapAreas,
        { min: MIN, root: "#site-menu" },
      );
      // More than a handful of links, so the menu was measured open.
      expect(count).toBeGreaterThan(5);
      expect(small, `menu tap areas under ${MIN} px`).toEqual([]);
      expect(overlaps, "overlapping menu tap areas").toEqual([]);
      expect(covered, "covered menu tap areas").toEqual([]);
    });
  }
});

test.describe("share pill > a round icon on phones, the labelled pill from 640 px", () => {
  for (const width of [390, 639, 640]) {
    test(`at ${width} px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto("/skills", { waitUntil: "networkidle" });
      // The hero pill: the pill nav has no Share button (Phase 6 cutover).
      const share = page
        .getByRole("main")
        .getByRole("button", { name: "Share", exact: true });
      await expect(share).toBeVisible();
      const box = (await share.boundingBox())!;
      const label = share.getByText("Share", { exact: true });
      const labelBox = (await label.boundingBox())!;
      if (width < 640) {
        // 56 px round, the label kept for screen readers only.
        expect(Math.round(box.width)).toBe(56);
        expect(Math.round(box.height)).toBe(56);
        expect(labelBox.width).toBeLessThanOrEqual(1);
      } else {
        expect(box.width).toBeGreaterThan(box.height);
        expect(labelBox.width).toBeGreaterThan(20);
      }
    });
  }
});

/*
 * The share panel of the pages Phase 7 restyles (the layout's
 * SharePanelHost; Phase 6 review, finding 1). It is fixed under the bar and
 * last in the page, so focus that leaves it must close it, or it would cover
 * the skip link, the nav and whatever the page scrolls to under the bar
 * (WCAG 2.4.11).
 */
test.describe("share panel > focus that leaves it closes it", () => {
  test("Tab past the last row on /skills at 390 px closes the panel", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/skills", { waitUntil: "networkidle" });
    const share = page
      .getByRole("main")
      .getByRole("button", { name: "Share", exact: true });
    // By keyboard: the pill takes focus, then Enter opens the panel, and
    // focus moves to its first row.
    await share.focus();
    await page.keyboard.press("Enter");
    const panel = page.getByRole("region", { name: "Share this page" });
    await expect(panel).toBeVisible();
    await expect(
      panel.getByRole("button", { name: /Copy link/ }),
    ).toBeFocused();
    // Through every row, then past the last one. The panel is last in the
    // page, so that Tab hands focus to the browser's own UI (nothing on the
    // page has focus, so the panel covers nothing yet), and the next one
    // brings it back at the skip link, with the nav and the page after it:
    // by then the panel must be gone.
    const rows = await panel.locator("button, a[href]").count();
    expect(rows).toBeGreaterThanOrEqual(4);
    for (let row = 0; row <= rows; row += 1) await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Skip to content" });
    await expect(skip).toBeFocused();
    await expect(panel).toHaveCount(0);
    await expect(share).toHaveAttribute("aria-expanded", "false");
    // What has focus is what is drawn at its centre.
    expect(
      await skip.evaluate((el) => {
        const box = el.getBoundingClientRect();
        const hit = document.elementFromPoint(
          box.left + box.width / 2,
          box.top + box.height / 2,
        );
        return Boolean(hit && el.contains(hit));
      }),
    ).toBe(true);
  });

  test("Escape from a row closes it and returns focus to the pill", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/skills", { waitUntil: "networkidle" });
    const share = page
      .getByRole("main")
      .getByRole("button", { name: "Share", exact: true });
    await share.focus();
    await page.keyboard.press("Enter");
    const panel = page.getByRole("region", { name: "Share this page" });
    await expect(panel).toBeVisible();
    await page.keyboard.press("Tab");
    await page.keyboard.press("Escape");
    await expect(panel).toHaveCount(0);
    await expect(share).toBeFocused();
  });
});

import { readFileSync } from "node:fs";
import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Locator, type Page } from "@playwright/test";
import { parseAttributes } from "../../lib/parity/parity.mjs";
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

/**
 * The key that moves focus through a page's links and buttons (`back` for
 * the reverse). WebKit on macOS, as Safari does by default (full keyboard
 * access off), moves Tab between text fields only; Option+Tab moves through
 * every link and button, as Tab does in Chromium and Firefox.
 */
const tabKey = (browserName: string, back = false) =>
  `${browserName === "webkit" ? "Alt+" : ""}${back ? "Shift+" : ""}Tab`;

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

/** The page's own document loads, counted as they start. */
function documents(page: Page) {
  const seen = { count: 0 };
  page.on("request", (request) => {
    if (request.isNavigationRequest() && request.frame() === page.mainFrame())
      seen.count += 1;
  });
  return seen;
}

/**
 * The asset retry (src/lib/assetRetry.ts; UX sweep 21-11-26): a page whose
 * own script or stylesheet fails to load (one load in 600 got a 502 on the
 * main bundle and never ran) reloads once and runs; a file that keeps
 * failing reloads it once and no more.
 */
test.describe("assets > a site file that fails to load reloads the page once", () => {
  const ENTRY = /\/assets\/index-[\w-]+\.js$/;

  test("a 502 on the main bundle: one reload, then the page runs and the flag is gone", async ({
    page,
  }) => {
    const loads = documents(page);
    // Throughout the first load (its preload and its module script may each
    // ask), then the bundle answers.
    await page.route(ENTRY, (route) =>
      loads.count <= 1
        ? route.fulfill({ status: 502, body: "Bad gateway" })
        : route.fallback(),
    );
    await page.goto("/contact", { waitUntil: "commit" });
    // The footer's clock is client-only: the page has hydrated.
    await expect(page.locator("time[data-clock]")).toBeAttached({
      timeout: 15_000,
    });
    expect(loads.count).toBe(2);
    await page.waitForLoadState("load");
    await expect
      .poll(() => page.evaluate(() => sessionStorage.getItem("pf-asset-retry")))
      .toBeNull();
    // The address is the page's own: nothing was added to it.
    expect(new URL(page.url()).pathname + new URL(page.url()).search).toBe(
      "/contact",
    );
  });

  test("a stylesheet that fails: one reload, and the page is styled", async ({
    page,
  }) => {
    const loads = documents(page);
    await page.route(/\/assets\/profile-[\w-]+\.css$/, (route) =>
      loads.count <= 1
        ? route.fulfill({ status: 502, body: "Bad gateway" })
        : route.fallback(),
    );
    await page.goto("/about", { waitUntil: "commit" });
    await expect(page.locator("time[data-clock]")).toBeAttached({
      timeout: 15_000,
    });
    expect(loads.count).toBe(2);
    // profile.css places the bar.
    await expect(page.locator(".pf-nav")).toHaveCSS("position", "fixed");
  });

  test("a bundle that keeps failing: one reload and no more", async ({
    page,
  }) => {
    const loads = documents(page);
    await page.route(ENTRY, (route) =>
      route.fulfill({ status: 502, body: "Bad gateway" }),
    );
    await page.goto("/contact", { waitUntil: "commit" });
    await expect.poll(() => loads.count).toBe(2);
    await page.waitForLoadState("load");
    // Long enough for a second reload, were there one.
    await page.waitForTimeout(2_000);
    expect(loads.count).toBe(2);
    await expect(page.locator("time[data-clock]")).toHaveCount(0);
    expect(
      await page.evaluate(() => sessionStorage.getItem("pf-asset-retry")),
    ).toBe("1");
  });
});

/**
 * A tab left open across a deploy (src/lib/staleChunk.ts): the deploy took
 * the old build's files away, so a link followed inside the site asks for a
 * chunk that answers 404. The page asked for loads fresh, at the top, once
 * per page and build; that page failing again in the same build ends on
 * the error page; a feature's chunk that fails on the page in use never
 * reloads it.
 */
test.describe("assets > a navigation whose chunk a deploy removed loads its page fresh, once", () => {
  // Up to three page loads and a few seconds of waiting for a reload that
  // must not come: under a full parallel run, 30 s ran out.
  test.describe.configure({ timeout: 60_000 });
  const FLAG = "pf-chunk-reload";

  /** Every file the page showing has asked for. */
  const requests = (page: Page) => {
    const asked = new Set<string>();
    page.on("request", (request) => {
      if (request.isNavigationRequest() && request.frame() === page.mainFrame())
        asked.clear();
      asked.add(request.url());
    });
    return asked;
  };

  /**
   * The deploy, with the page open: from now on every file under /assets/
   * the page has not asked for answers 404, until the next document load
   * (the fresh page, as the new build would be; here the same files) or
   * for good.
   */
  const deploy = async (
    page: Page,
    asked: Set<string>,
    { recovers }: { recovers: boolean },
  ) => {
    const kept = new Set(asked);
    let gone = true;
    if (recovers)
      page.on("request", (request) => {
        if (
          request.isNavigationRequest() &&
          request.frame() === page.mainFrame()
        )
          gone = false;
      });
    await page.route(/\/assets\//, (route) =>
      gone && !kept.has(route.request().url())
        ? route.fulfill({ status: 404, body: "Not found" })
        : route.fallback(),
    );
  };

  /** The session flag, and the flag a reload to the page showing sets. */
  const flagAndPage = (page: Page) =>
    page.evaluate((key) => {
      return [
        sessionStorage.getItem(key),
        `${document.documentElement.dataset.build} ${location.pathname}`,
      ];
    }, FLAG);

  const clock = (page: Page) => page.locator("time[data-clock]");

  /** How far the page showing is scrolled. */
  const offset = (page: Page) =>
    page.evaluate(() => Math.round(window.scrollY));

  const MODES = "pf-test-scroll-modes";
  /**
   * Every value a page gives `history.scrollRestoration`, the last page's
   * kept for the next (session storage outlives the reload). The last one
   * the old page gave decides where the browser reopens the fresh page:
   * "auto" puts it at the old page's offset. The offset alone shows that
   * only when the reload comes before the error page scrolls to the top,
   * a race; the modes show it every time.
   */
  const recordScrollModes = (page: Page) =>
    page.addInitScript((key) => {
      try {
        sessionStorage.setItem(
          `${key}-before`,
          sessionStorage.getItem(key) ?? "",
        );
        sessionStorage.setItem(key, "");
      } catch {
        return;
      }
      const own = Object.getOwnPropertyDescriptor(
        History.prototype,
        "scrollRestoration",
      );
      if (!own?.set) return;
      const set = own.set;
      Object.defineProperty(History.prototype, "scrollRestoration", {
        ...own,
        set(this: History, mode: ScrollRestoration) {
          try {
            const modes = sessionStorage.getItem(key);
            sessionStorage.setItem(key, modes ? `${modes} ${mode}` : mode);
          } catch {
            // Recording only; the page goes on as it would.
          }
          set.call(this, mode);
        },
      });
    }, MODES);

  /** The last value the page before this one gave `scrollRestoration`. */
  const lastModeBefore = (page: Page) =>
    page.evaluate(
      (key) => sessionStorage.getItem(`${key}-before`)?.split(" ").pop(),
      MODES,
    );

  for (const { name, from, link } of [
    // The skill route's loader imports its chunk: the router alone shows
    // its error page.
    { name: "a skill", from: "/skills", link: ".pf-skill-card__link" },
    // About's chunk is its component only, which TanStack's lazy route
    // component would reload on its own: still one load.
    { name: "About", from: "/", link: 'footer a[href="/about"]' },
  ]) {
    test(`${name}: the page asked for loads fresh at the top, after one document load`, async ({
      page,
    }) => {
      const loads = documents(page);
      const asked = requests(page);
      await recordScrollModes(page);
      await page.goto(from, { waitUntil: "networkidle" });
      await expect(clock(page)).toBeAttached();
      await deploy(page, asked, { recovers: true });

      // A link far down the page: the fresh page once opened at the old
      // page's offset, mid-page or at its footer, in every engine.
      const target = page.locator(link).last();
      await target.scrollIntoViewIfNeeded();
      expect(await offset(page)).toBeGreaterThan(0);
      const href = await target.getAttribute("href");
      const words = (await target.textContent())?.trim() ?? "";
      const fresh = page.waitForEvent("load");
      await target.click();
      await fresh;

      expect(new URL(page.url()).pathname).toBe(href);
      await expect(clock(page)).toBeAttached();
      await expect(page.locator("h1").first()).toContainText(words);
      // Long enough for a second load, were there one.
      await page.waitForTimeout(1_000);
      expect(loads.count).toBe(2);
      expect(await lastModeBefore(page)).toBe("manual");
      expect(await offset(page)).toBe(0);
      const [flag, here] = await flagAndPage(page);
      expect(flag).toBe(here);
    });
  }

  test("one failed answer and no deploy, then a deploy: each page loads fresh once", async ({
    page,
  }) => {
    const loads = documents(page);
    const asked = requests(page);
    await page.goto("/skills", { waitUntil: "networkidle" });
    await expect(clock(page)).toBeAttached();

    // A blip (a 502), not a deploy: the skill's chunk fails until the page
    // loads again, and the fresh page is the same build.
    let blip = true;
    page.on("request", (request) => {
      if (request.isNavigationRequest() && request.frame() === page.mainFrame())
        blip = false;
    });
    await page.route(/\/assets\/_slug-[\w-]+\.js$/, (route) =>
      blip
        ? route.fulfill({ status: 502, body: "Bad gateway" })
        : route.fallback(),
    );
    const skill = page.locator(".pf-skill-card__link").first();
    const skillHref = await skill.getAttribute("href");
    let fresh = page.waitForEvent("load");
    await skill.click();
    await fresh;
    expect(new URL(page.url()).pathname).toBe(skillHref);
    await expect(clock(page)).toBeAttached();
    await page.waitForLoadState("networkidle");
    expect(loads.count).toBe(2);

    // A deploy later, with that page open: the reload the blip used was
    // the skill's, and About still loads fresh.
    await deploy(page, asked, { recovers: true });
    const about = page.locator('a[href="/about"]').first();
    const words = (await about.textContent())?.trim() ?? "";
    fresh = page.waitForEvent("load");
    await about.click();
    await fresh;
    expect(new URL(page.url()).pathname).toBe("/about");
    await expect(clock(page)).toBeAttached();
    await expect(page.locator("h1").first()).toContainText(words);
    // Long enough for a fourth load, were there one.
    await page.waitForTimeout(1_000);
    expect(loads.count).toBe(3);
    const [flag, here] = await flagAndPage(page);
    expect(flag).toBe(here);
  });

  test("the same page failing again in the build that reloaded it: the error page, never a second reload", async ({
    page,
  }) => {
    const loads = documents(page);
    const asked = requests(page);
    await page.goto("/", { waitUntil: "networkidle" });
    await expect(clock(page)).toBeAttached();
    // The flag a reload to About left earlier in this tab and build. Set
    // here, not by a reload: WebKit's memory cache keeps the chunks of
    // earlier pages, so About's would never fail again.
    await page.evaluate(
      (key) =>
        sessionStorage.setItem(
          key,
          `${document.documentElement.dataset.build} /about`,
        ),
      FLAG,
    );
    await deploy(page, asked, { recovers: false });
    await page.locator('a[href="/about"]').first().click();
    await expect(page.locator("h1").first()).toHaveText(
      /Something\s+went\s+wrong/,
    );
    expect(new URL(page.url()).pathname).toBe("/about");
    // Longer than a reload may wait for its files (3 s), were there one.
    await page.waitForTimeout(3_500);
    expect(loads.count).toBe(1);
    const [flag, here] = await flagAndPage(page);
    expect(flag).toBe(here);
  });

  test("a feature's chunk that fails on the page in use never reloads it", async ({
    page,
  }) => {
    // The nav's Search button shows from 810 px.
    await page.setViewportSize({ width: 1440, height: 900 });
    const loads = documents(page);
    const asked = requests(page);
    await page.addInitScript(() => {
      const seen = window as unknown as { __chunkErrors: number };
      seen.__chunkErrors = 0;
      addEventListener("vite:preloadError", () => (seen.__chunkErrors += 1));
    });
    await page.goto("/about", { waitUntil: "networkidle" });
    await expect(clock(page)).toBeAttached();
    await deploy(page, asked, { recovers: false });

    // The search dialog's code loads on first use.
    await page.locator(".pf-search-toggle").click();
    await expect
      .poll(() =>
        page.evaluate(
          () => (window as unknown as { __chunkErrors: number }).__chunkErrors,
        ),
      )
      .toBeGreaterThan(0);
    // Longer than a reload may wait for its files (3 s), were there one.
    await page.waitForTimeout(3_500);
    expect(loads.count).toBe(1);
    expect(new URL(page.url()).pathname).toBe("/about");
    const [flag] = await flagAndPage(page);
    expect(flag).toBeNull();
  });
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

  for (const [width, height] of [
    [1920, 1080],
    [1440, 900],
    [390, 844],
  ] as const) {
    test(`at ${width} x ${height} no logo in the first screen is lazy, and the ones below it are (UX sweep 21-11-26)`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height });
      await page.goto("/resume", { waitUntil: "networkidle" });
      const logos = await page
        .locator('[data-logo="image"] img')
        .evaluateAll((imgs) =>
          imgs.map((img) => {
            const box = img.getBoundingClientRect();
            return {
              src: img.getAttribute("src"),
              loading: img.getAttribute("loading"),
              // In the first screen, as the page opens at its top.
              first: box.top < window.innerHeight && box.bottom > 0,
            };
          }),
        );
      const first = logos.filter((logo) => logo.first);
      expect(first.length).toBeGreaterThan(0);
      expect(first.filter((logo) => logo.loading === "lazy")).toEqual([]);
      // Far below the first screen: still lazy.
      expect(
        logos.filter((logo) => logo.loading === "lazy").length,
      ).toBeGreaterThan(0);
    });
  }

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
    await expect(page.getByText(/^Showing \d+ of 22 skills$/)).toBeVisible();
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

test.describe("skills > each skill page loads its own SKILL.md and no other", () => {
  /** A SKILL.md's opening lines, as a script carries them (escaped or not). */
  const FRONTMATTER = /---(?:\\n|\n)name: ([a-z-]+)(?:\\n|\n)description: /g;

  /** The SKILL.md the sync wrote, as the page shows it. */
  const skillMd = (slug: string) =>
    readFileSync(`lib/content/skill-md/${slug}.md`, "utf8").replace(/\n+$/, "");

  /** The SKILL.md card's text: its one or two blocks, a line apart. */
  async function shownSkillMd(page: Page) {
    const blocks = await page.locator("#skill-md pre").allTextContents();
    return blocks.join("\n");
  }

  /** Every script the page fetches, and the skills whose SKILL.md each holds. */
  function watchScripts(page: Page) {
    const bodies: Promise<string>[] = [];
    page.on("response", (res) => {
      if (res.request().resourceType() === "script")
        bodies.push(res.text().catch(() => ""));
    });
    return async () => {
      const names = (await Promise.all(bodies)).flatMap((body) =>
        [...body.matchAll(FRONTMATTER)].map((m) => m[1]!),
      );
      return [...new Set(names)].sort();
    };
  }

  test("/skills loads none; a skill, its next one and Back each show their own", async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));
    page.on("console", (msg) => {
      if (msg.type() === "error" && isRealError(msg.text()))
        errors.push(msg.text());
    });
    const loaded = watchScripts(page);

    await page.goto("/skills", { waitUntil: "networkidle" });
    expect(await loaded(), "SKILL.md bodies loaded by /skills").toEqual([]);

    // Client-side navigations: each fetches only the skill it opens.
    await page
      .getByRole("article", { name: "ama", exact: true })
      .getByRole("link", { name: "ama", exact: true })
      .click();
    await expect(page).toHaveURL(/\/skills\/ama$/);
    await expect(page.locator("h1")).toHaveText("ama");
    await expect.poll(() => shownSkillMd(page)).toBe(skillMd("ama"));

    await page
      .getByRole("navigation", { name: "More skills" })
      .getByRole("link", { name: /^Next/ })
      .click();
    await expect(page).toHaveURL(/\/skills\/how$/);
    await expect(page.locator("h1")).toHaveText("how");
    await expect.poll(() => shownSkillMd(page)).toBe(skillMd("how"));

    await page.goBack();
    await expect(page).toHaveURL(/\/skills\/ama$/);
    await expect.poll(() => shownSkillMd(page)).toBe(skillMd("ama"));
    expect(await loaded()).toEqual(["ama", "how"]);
    expect(errors, errors.join("\n")).toEqual([]);
  });

  test("a skill page loaded directly shows its SKILL.md from the page itself", async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));
    page.on("console", (msg) => {
      if (msg.type() === "error" && isRealError(msg.text()))
        errors.push(msg.text());
    });
    const loaded = watchScripts(page);

    await page.goto("/skills/ama", { waitUntil: "networkidle" });
    expect(await shownSkillMd(page)).toBe(skillMd("ama"));
    // The prerendered page carries the text in its loader data, so hydration
    // fetches no SKILL.md, and Show all works once it has run.
    expect(await loaded()).toEqual([]);
    const toggle = page.locator('button[aria-controls="skill-md"]');
    await expect(toggle).toHaveText(/^Show all \d+ lines$/);
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await expect(page.locator("#skill-md pre").last()).toBeVisible();
    expect(errors, errors.join("\n")).toEqual([]);
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
    // The drawings show from 1280 px only (shell.css), so a project at phone
    // width measures them at this width too.
    await page.setViewportSize({ width: 1440, height: 900 });
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

  test("/about: a prose link and a footer link", async ({
    page,
    browserName,
  }) => {
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
    await page.keyboard.press(tabKey(browserName, true));
    await page.keyboard.press(tabKey(browserName));
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
    // The nav's button shows from 810 px; phones open search from the menu
    // (the phone test below).
    await page.setViewportSize({ width: 1440, height: 900 });
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
    browserName,
  }) => {
    // The nav's button shows from 810 px.
    await page.setViewportSize({ width: 1440, height: 900 });
    await visit(page, "/contact");
    const button = page.getByRole("button", { name: "Search the site" });
    // Safari does not focus a button on a mouse click, so the dialog gives
    // focus back to the page there; a keyboard press on the button (Option+
    // Tab to it) is what it returns focus from.
    if (browserName === "webkit") {
      await button.focus();
      await page.keyboard.press("Enter");
    } else {
      await button.click();
    }
    await expect(page.locator(dialog)).toBeVisible();
    await expect(page.getByRole("option").first()).toBeVisible();
    // Scan the dialog once it has finished opening: mid-fade, its text is
    // part-transparent and axe measured it below 4.5:1 now and then.
    await page.locator(dialog).evaluate((el) =>
      Promise.all(
        el
          .getAnimations({ subtree: true })
          .filter(
            (motion) => motion.effect?.getTiming().iterations !== Infinity,
          )
          .map((motion) => motion.finished),
      ),
    );
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

  /*
   * The dialog's code fails to load (a deploy took its chunk away, or the
   * network dropped it): nothing opens, and the page in use stays, rather
   * than the route's error page taking it, with no reload either
   * (components/ui/LazyFeature.tsx). Search closes again, so once the code
   * answers, the button and ⌘K ask for it once more and open the dialog.
   */
  test("its code fails to load: the page stays, with no error page and no reload; the next open loads it", async ({
    page,
  }) => {
    let asked = 0;
    let failing = true;
    await page.route(/\/assets\/SearchDialog-[\w-]+\.js$/, (route) => {
      asked += 1;
      return failing
        ? route.fulfill({ status: 404, body: "Not found" })
        : route.continue();
    });
    let documents = 0;
    page.on("request", (request) => {
      if (request.isNavigationRequest() && request.frame() === page.mainFrame())
        documents += 1;
    });
    // The nav's button, pressed once the code answers, shows from 810 px.
    await page.setViewportSize({ width: 1440, height: 900 });
    await visit(page, "/about");
    const heading = page.locator("h1").first();
    const title = (await heading.textContent()) ?? "";
    expect(title).not.toBe("");

    // React logs the failure a boundary caught once it has committed what
    // the boundary shows: by then an error page would be up, were there one.
    const caught = page.waitForEvent("console", {
      predicate: (msg) => msg.type() === "error" && isRealError(msg.text()),
    });
    await page.keyboard.press("ControlOrMeta+k");
    await caught;
    expect(asked).toBeGreaterThan(0);
    await expect(page.locator("dialog.pf-search")).toHaveCount(0);
    await expect(heading).toBeVisible();
    await expect(heading).toHaveText(title);
    await expect(page.getByText(/Something\s+went\s+wrong/)).toHaveCount(0);
    expect(new URL(page.url()).pathname).toBe("/about");
    expect(documents).toBe(1);

    // The code answers again: the button asks once more and opens it, and
    // so does ⌘K after Esc.
    failing = false;
    const before = asked;
    await page.getByRole("button", { name: "Search the site" }).click();
    await expect(page.locator(dialog)).toBeVisible();
    expect(asked).toBeGreaterThan(before);
    await page.keyboard.press("Escape");
    await expect(page.locator("dialog.pf-search")).toHaveCount(0);
    await page.keyboard.press("ControlOrMeta+k");
    await expect(page.locator(dialog)).toBeVisible();
    await expect(heading).toHaveText(title);
    expect(documents).toBe(1);
  });

  /*
   * The dialog's own stylesheet (React's `precedence` link) fails to load,
   * a deploy or a blip: the dialog opens without it, the browser's plain
   * dialog. Once the file answers again, the next open asks for it past the
   * caches and links it anew beside React's own element, and the dialog
   * waits for it (components/ui/LazyFeature.tsx): it comes in styled, with
   * no reload, and the page in use stays.
   */
  test("its stylesheet fails to load: once it answers, the next open is styled; the page stays, with no reload", async ({
    page,
  }) => {
    let asked = 0;
    let failing = true;
    await page.route(/\/assets\/search-[\w-]+\.css$/, (route) => {
      asked += 1;
      return failing
        ? route.fulfill({ status: 404, body: "Not found" })
        : route.continue();
    });
    let documents = 0;
    page.on("request", (request) => {
      if (request.isNavigationRequest() && request.frame() === page.mainFrame())
        documents += 1;
    });
    await page.setViewportSize({ width: 1440, height: 900 });
    await visit(page, "/about");
    const heading = page.locator("h1").first();
    const title = (await heading.textContent()) ?? "";
    expect(title).not.toBe("");

    await page.keyboard.press("ControlOrMeta+k");
    const opened = page.locator(dialog);
    await expect(opened).toBeVisible();
    expect(asked).toBeGreaterThan(0);
    // search.css rounds it (24 px); the browser's own dialog is square.
    await expect(opened).toHaveCSS("border-radius", "0px");
    await page.keyboard.press("Escape");
    await expect(page.locator("dialog.pf-search")).toHaveCount(0);

    // The file answers again. The radius the dialog has as it first enters
    // the page, before any paint: styled from the start, not restyled.
    failing = false;
    const before = asked;
    await page.evaluate(() => {
      const seen = window as unknown as { __radius?: string };
      new MutationObserver((_, observer) => {
        const entered = document.querySelector("dialog.pf-search");
        if (!entered) return;
        seen.__radius = getComputedStyle(entered).borderRadius;
        observer.disconnect();
      }).observe(document.body, { childList: true, subtree: true });
    });
    await page.keyboard.press("ControlOrMeta+k");
    await expect(opened).toBeVisible();
    await expect(opened).toHaveCSS("border-radius", "24px");
    expect(
      await page.evaluate(
        () => (window as unknown as { __radius?: string }).__radius,
      ),
    ).toBe("24px");
    expect(asked).toBeGreaterThan(before);
    await expect(page.getByRole("option").first()).toBeVisible();
    await expect(heading).toHaveText(title);
    await expect(page.getByText(/Something\s+went\s+wrong/)).toHaveCount(0);
    expect(new URL(page.url()).pathname).toBe("/about");
    expect(documents).toBe(1);
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

  /** Holds the dialog's code back `ms`, as a slow first open does. */
  const slowCode = (page: Page, ms: number) =>
    page.route(/\/assets\/SearchDialog-[\w-]+\.js$/, async (route) => {
      await new Promise((done) => setTimeout(done, ms));
      await route.continue();
    });

  /*
   * The keys typed after ⌘K while the dialog loads (UX hunt 22-11-26): its
   * first open takes a third of a second or more, and the first letters of
   * a quick "⌘K verify" were lost. They are kept for the field; Enter is
   * held from the page (it would press whatever has focus there).
   */
  test("keys typed while it loads reach the field, and Enter presses nothing on the page", async ({
    page,
  }) => {
    await slowCode(page, 1000);
    await page.setViewportSize({ width: 1440, height: 900 });
    await visit(page, "/about");
    // A link has focus: an Enter that reached it would leave the page.
    await page.locator("main a[href^='/']").first().focus();
    await page.keyboard.press("ControlOrMeta+k");
    await page.keyboard.type("verifx", { delay: 50 });
    await page.keyboard.press("Backspace");
    await page.keyboard.type("y");
    await page.keyboard.press("Enter");
    const field = page.getByRole("combobox", { name: "Search the site" });
    await expect(field).toBeFocused();
    await expect(field).toHaveValue("verify");
    expect(new URL(page.url()).pathname).toBe("/about");
    // Keys after it opens go on into the field.
    await page.keyboard.type(" loop");
    await expect(field).toHaveValue("verify loop");
  });

  test("at 50 ms a key right after the first ⌘K, no key is lost", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await visit(page, "/contact");
    await page.keyboard.press("ControlOrMeta+k");
    await page.keyboard.type("verify", { delay: 50 });
    await expect(
      page.getByRole("combobox", { name: "Search the site" }),
    ).toHaveValue("verify");
  });

  test("Escape before it opens gives the opening up", async ({ page }) => {
    let served = 0;
    await page.route(/\/assets\/SearchDialog-[\w-]+\.js$/, async (route) => {
      await new Promise((done) => setTimeout(done, 600));
      await route.continue();
      served += 1;
    });
    await page.setViewportSize({ width: 1440, height: 900 });
    await visit(page, "/contact");
    await page.keyboard.press("ControlOrMeta+k");
    await page.keyboard.press("Escape");
    await expect.poll(() => served).toBeGreaterThan(0);
    // Time for the code to run, were the dialog still asked for.
    await page.waitForTimeout(500);
    await expect(page.locator("dialog.pf-search")).toHaveCount(0);
    await page.keyboard.press("ControlOrMeta+k");
    await expect(page.locator(dialog)).toBeVisible();
  });

  /*
   * ⌘K over an open Say hello (UX hunt 22-11-26): the dialog gave focus
   * back, on Esc, to Say hello's Copy email, inside the panel it had closed,
   * so focus fell to the page; and WebKit closed the panel without a toggle
   * event, so its trigger kept aria-expanded="true".
   */
  test("⌘K over an open Say hello closes it, and Esc gives focus back to its trigger", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await visit(page, "/about");
    const trigger = page.getByRole("button", { name: "Say hello" }).first();
    await trigger.focus();
    await page.keyboard.press("Enter");
    const panel = page.locator(".pf-say__panel--nav");
    await expect(
      page.getByRole("button", { name: "Copy email" }),
    ).toBeFocused();
    await page.keyboard.press("ControlOrMeta+k");
    await expect(page.locator(dialog)).toBeVisible();
    await expect(panel).toBeHidden();
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await page.keyboard.press("Escape");
    await expect(page.locator("dialog.pf-search")).toHaveCount(0);
    await expect(trigger).toBeFocused();
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  /*
   * A drag selecting the field's text that ends outside the dialog clicks
   * the dialog itself, as a press on the backdrop does, and closed it with
   * the query in Chromium and WebKit (UX hunt 22-11-26).
   */
  test("a drag from the field that ends outside keeps it open; a press outside closes it", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await visit(page, "/contact");
    await page.keyboard.press("ControlOrMeta+k");
    const field = page.getByRole("combobox", { name: "Search the site" });
    await field.fill("automation");
    const box = (await field.boundingBox())!;
    await page.mouse.move(box.x + box.width * 0.3, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(8, 8, { steps: 6 });
    await page.mouse.up();
    await expect(page.locator(dialog)).toBeVisible();
    await expect(field).toHaveValue("automation");
    await page.mouse.click(8, 8);
    await expect(page.locator("dialog.pf-search")).toHaveCount(0);
  });

  /** The page's scroll position, read at the call. */
  const scrollY = (page: Page) => page.evaluate(() => window.scrollY);

  test("the page behind it holds still while it is open", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await visit(page, "/about");
    await page.keyboard.press("ControlOrMeta+k");
    await expect(page.locator(dialog)).toBeVisible();
    // Over the backdrop, beside the dialog.
    await page.mouse.move(100, 450);
    await page.mouse.wheel(0, 700);
    await page.waitForTimeout(400);
    expect(await scrollY(page)).toBe(0);
    // The control: closed, the same wheel scrolls.
    await page.keyboard.press("Escape");
    await expect(page.locator("dialog.pf-search")).toHaveCount(0);
    await page.mouse.wheel(0, 700);
    await expect.poll(() => scrollY(page)).toBeGreaterThan(0);
  });

  test("on a phone, the page under the open menu holds still", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await visit(page, "/");
    await page.getByRole("button", { name: "Open menu" }).click();
    const menu = page.getByRole("navigation", { name: "Site" });
    await expect(menu).toBeVisible();
    const card = (await menu.boundingBox())!;
    // Below the card, on the page.
    await page.mouse.move(195, Math.min(card.y + card.height + 120, 820));
    await page.mouse.wheel(0, 500);
    await page.waitForTimeout(400);
    expect(await scrollY(page)).toBe(0);
    await page.keyboard.press("Escape");
    await expect(menu).toBeHidden();
    await page.mouse.wheel(0, 500);
    await expect.poll(() => scrollY(page)).toBeGreaterThan(0);
  });

  for (const [width, most] of [
    [390, 2],
    [1440, 1],
  ] as const) {
    test(`at ${width} px a result's summary takes up to ${most} line${most > 1 ? "s" : ""} (UX sweep 21-11-26)`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 844 });
      await visit(page, "/contact");
      await page.keyboard.press("ControlOrMeta+k");
      await page.getByRole("combobox", { name: "Search the site" }).fill("ai");
      const summary = page.locator(".pf-search__summary").first();
      await expect(summary).toBeVisible();
      const lines = await summary.evaluate((el) => {
        // One line of it: the same element holding two letters.
        const probe = el.cloneNode() as HTMLElement;
        probe.textContent = "Ag";
        el.after(probe);
        const line = probe.getBoundingClientRect().height;
        probe.remove();
        return Math.round(el.getBoundingClientRect().height / line);
      });
      // On a phone one line kept under half of most summaries: two lines,
      // clamped there; on a wide screen, one.
      expect(lines).toBe(most);
    });
  }

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
    browserName,
  }) => {
    await visit(page, "/about");
    const link = page
      .locator('main a.ds-prose-link[href="/ventures/manut"]')
      .first();
    await link.focus();
    await page.keyboard.press(tabKey(browserName, true));
    await page.keyboard.press(tabKey(browserName));
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

  test("/about: the pills on the portrait ring in ink and paper, which read on the violet", async ({
    page,
    browserName,
  }) => {
    // The site's violet ring vanished on the violet pixel portrait (UX hunt
    // 22-11-26, WCAG 2.4.7): ink against the pill, paper outside it.
    await page.emulateMedia({ reducedMotion: "reduce" });
    for (const theme of ["light", "dark"] as const) {
      await page.addInitScript((value) => {
        try {
          localStorage.setItem("theme", value);
        } catch {
          // Storage can be unavailable; the site then uses its default theme.
        }
      }, theme);
      await page.goto("/about", { waitUntil: "load" });
      await expect(page.locator("time[data-clock]")).toBeAttached();
      const pills = [
        page.getByRole("button", { name: "Show the photo" }),
        page.getByRole("button", { name: /^Try a trait/ }),
      ];
      // Save appears once a trait is found; Tab goes on to it.
      await pills[1]!.focus();
      await page.keyboard.press("Enter");
      await page.keyboard.press(tabKey(browserName));
      pills.push(page.getByRole("button", { name: /my edition$/ }));
      await expect(pills[2]!).toBeFocused();
      for (const pill of pills) {
        await pill.focus();
        // Polled: reduced motion still gives every change a 0.01 ms
        // transition (globals.css), so the first read can be the old value.
        const ring = () =>
          pill.evaluate((el) => {
            const probe = document.createElement("i");
            probe.style.cssText = "color: var(--paper); background: var(--ink)";
            document.body.append(probe);
            const tokens = getComputedStyle(probe);
            const paper = tokens.color;
            const ink = tokens.backgroundColor;
            probe.remove();
            const style = getComputedStyle(el);
            return {
              shown: el.matches(":focus-visible"),
              outside: style.outlineColor === paper,
              inside: style.boxShadow === `${ink} 0px 0px 0px 5px`,
            };
          });
        await expect
          .poll(ring, `${theme}: ${await pill.textContent()}`)
          .toEqual({ shown: true, outside: true, inside: true });
      }
    }
  });
});

/**
 * Home's og:video (lib/og/homeVideo.ts, owner 21-11-26): Messages and
 * Discord play Home's share card as a loop; the other apps keep the
 * og:image. Apple's players ask for `bytes=0-1` first and play only on a
 * 206 (src/server/http.ts, withByteRanges). Home only: Messages would show
 * Home's card for any page that named it.
 */
test.describe("share > Home's card plays as a looping og:video", () => {
  test("home: the og:video is an MP4 served in byte ranges, and no other page names one", async ({
    request,
  }) => {
    const videoTags = (html: string) =>
      [...html.matchAll(/<meta\b([^>]*)>/gi)]
        .map((m) => parseAttributes(m[1]!) as Record<string, string>)
        .filter((attrs) => attrs.property?.startsWith("og:video"))
        .map((attrs) => [attrs.property, attrs.content]);

    const home = await (await request.get("/")).text();
    const tags = videoTags(home);
    const url = tags[0]?.[1] ?? "";
    expect(url).toMatch(/^https:\/\/kunanonj\.com\/og\/home-[0-9a-f]{8}\.mp4$/);
    expect(tags).toEqual([
      ["og:video", url],
      ["og:video:secure_url", url],
      ["og:video:type", "video/mp4"],
      ["og:video:width", "1200"],
      ["og:video:height", "630"],
    ]);
    // The still stays for the apps that show one: the video's first frame.
    expect(home).toContain(
      '<meta property="og:image" content="https://kunanonj.com/opengraph-image"',
    );

    const path = new URL(url).pathname;
    const whole = await request.get(path);
    expect(whole.status()).toBe(200);
    expect(whole.headers()["content-type"]).toBe("video/mp4");
    expect(whole.headers()["accept-ranges"]).toBe("bytes");
    const bytes = await whole.body();
    expect(bytes.toString("latin1", 4, 8)).toBe("ftyp");
    expect(bytes.length).toBeLessThan(2 * 1024 * 1024);
    const probe = await request.get(path, { headers: { Range: "bytes=0-1" } });
    expect(probe.status()).toBe(206);
    expect(probe.headers()["content-range"]).toBe(`bytes 0-1/${bytes.length}`);
    expect([...(await probe.body())]).toEqual([...bytes.subarray(0, 2)]);

    for (const route of ROUTES.filter((r) => r.path !== "/")) {
      const html = await (await request.get(route.path)).text();
      expect(videoTags(html), route.path).toEqual([]);
    }
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

  test("Contact offers the email first, then the form that says Or write it here, then Elsewhere, and asks once (UX sweep 21-11-26)", async ({
    page,
  }) => {
    // Cards rise into place as they enter; measure them at rest.
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/contact", { waitUntil: "networkidle" });
    const card = (name: string) =>
      page.getByRole("article", { name, exact: true });
    const email = card("Email me directly");
    const form = card("Say hello");
    const elsewhere = card("Elsewhere");
    const box = async (target: Locator) => {
      const found = await target.boundingBox();
      if (!found) throw new Error("a card has no box");
      return found;
    };
    // One order for the eye, Tab and a screen reader: the page's own.
    expect(
      await page
        .locator(".pf-contact__top > article")
        .evaluateAll((cards) =>
          cards.map((c) => c.getAttribute("aria-labelledby")),
        ),
    ).toEqual(["card-email", "card-form", "card-elsewhere"]);
    // A phone stacks them, the email above the form.
    await page.setViewportSize({ width: 390, height: 844 });
    await expect
      .poll(async () => {
        const above = await box(email);
        return (await box(form)).y - (above.y + above.height);
      })
      .toBeGreaterThan(0);
    // From 1024 px the email and the form share the first row, the email on
    // the left, and Elsewhere sits under the email: at the breakpoint and
    // on a wide screen. Every check polls: the columns settle over a few
    // frames after a resize, and a single read of Elsewhere straight after
    // the row check once caught it 31 px off under load.
    for (const size of [
      { width: 1024, height: 768 },
      { width: 1440, height: 900 },
    ]) {
      const at = `at ${size.width} px`;
      await page.setViewportSize(size);
      await expect
        .poll(
          async () => Math.abs((await box(email)).y - (await box(form)).y),
          { message: `the email and the form share a row ${at}` },
        )
        .toBeLessThan(2);
      await expect
        .poll(
          async () => {
            const left = await box(email);
            return (await box(form)).x - (left.x + left.width);
          },
          { message: `the form starts right of the email ${at}` },
        )
        .toBeGreaterThan(0);
      await expect
        .poll(
          async () => Math.abs((await box(elsewhere)).x - (await box(email)).x),
          { message: `Elsewhere lines up with the email ${at}` },
        )
        .toBeLessThan(2);
      await expect
        .poll(
          async () => {
            const above = await box(email);
            return (await box(elsewhere)).y - (above.y + above.height);
          },
          { message: `Elsewhere starts below the email ${at}` },
        )
        .toBeGreaterThan(0);
      // The column ends with the form: Elsewhere fills its row rather than
      // stopping 108 to 198 px above the form's foot (UX hunt 22-11-26).
      await expect
        .poll(
          async () => {
            const left = await box(elsewhere);
            const right = await box(form);
            return Math.abs(left.y + left.height - (right.y + right.height));
          },
          { message: `Elsewhere ends with the form ${at}` },
        )
        .toBeLessThan(1);
    }
    // The form's body starts at its heading's left edge, not 4 px in.
    for (const width of [390, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await expect
        .poll(
          async () => {
            const heading = await box(page.locator("#card-form"));
            const field = await box(page.locator("#contact-name"));
            return Math.abs(field.x - heading.x);
          },
          {
            message: `the form's fields line up with its heading at ${width} px`,
          },
        )
        .toBeLessThan(0.5);
    }
    // The page is the call to action: the footer keeps its card, not its own.
    const footer = page.locator("footer[data-site-chrome]");
    await expect(footer.getByRole("heading")).toHaveCount(0);
    await expect(footer.locator(".pf-say__trigger--footer")).toHaveCount(0);
    await expect(
      footer.getByRole("navigation", { name: "Pages" }),
    ).toBeVisible();
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
      ["/open-source", "/open-source.md"],
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
    expect(index.skills).toHaveLength(22);
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
    // The open-source cards: four Copy pills and the foot links.
    "/open-source",
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

    // Save my edition (now-building-and-genz Phase 6) shows only once a
    // trait is found, so the /about test above never measures it.
    test(`/about with a trait found (Save my edition) at ${width} px`, async ({
      page,
    }) => {
      await page.addInitScript(() => {
        localStorage.setItem("pf-portrait-found", '["cap","pin"]');
        localStorage.setItem("pf-portrait-worn", "cap");
      });
      await page.setViewportSize({ width, height: 800 });
      await page.goto("/about", { waitUntil: "networkidle" });
      await expect(
        page.getByRole("button", { name: "Save my edition" }),
      ).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      const { small, overlaps, covered } = await page.evaluate(tapAreas, {
        min: MIN,
        root: ".pf-about-page__portrait",
      });
      expect(small, `tap areas under ${MIN} px`).toEqual([]);
      expect(overlaps, "overlapping tap areas").toEqual([]);
      expect(covered, "covered tap areas").toEqual([]);
    });

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
        // 44 px round, the hero pills' height (UX hunt 22-11-26), the label
        // kept for screen readers only.
        expect(Math.round(box.width)).toBe(44);
        expect(Math.round(box.height)).toBe(44);
        expect(labelBox.width).toBeLessThanOrEqual(1);
      } else {
        expect(box.width).toBeGreaterThan(box.height);
        expect(labelBox.width).toBeGreaterThan(20);
      }
    });
  }
});

/*
 * UX hunt 22-11-26: the Share pill is the height, text size and weight of
 * the pill beside it, on phones (round) and on a desktop. It was a 56 px
 * pill of 17 px semibold text beside 44 px pills of 16 px medium text (and
 * 52 px on the case pages). The hero pills are 44 px, the case pages' link
 * out 52 px.
 */
test.describe("share pill > as tall as the pill beside it, in the same type", () => {
  const pages = [
    { path: "/skills", beside: "View on GitHub" },
    { path: "/topics/ai-transformation-thailand", beside: "Talk about" },
    { path: "/th/topics/ai-transformation-thailand", beside: "ติดต่อ" },
    { path: "/ventures/manut", beside: "Visit" },
  ];
  for (const width of [390, 1440]) {
    for (const { path, beside } of pages) {
      test(`${path} at ${width} px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(path, { waitUntil: "networkidle" });
        const main = page.getByRole("main");
        const share = main.getByRole("button", { name: "Share", exact: true });
        const next = main.getByRole("link", { name: beside }).first();
        const shareBox = (await share.boundingBox())!;
        const nextBox = (await next.boundingBox())!;
        expect(Math.round(shareBox.height)).toBe(Math.round(nextBox.height));
        const type = (el: Element) => {
          const style = getComputedStyle(el);
          return `${style.fontSize} ${style.fontWeight}`;
        };
        expect(await share.evaluate(type)).toBe(await next.evaluate(type));
        if (width < 640) {
          expect(Math.round(shareBox.width)).toBe(Math.round(shareBox.height));
        }
      });
    }
  }
});

/*
 * The share panel of the pages Phase 7 restyles (the layout's
 * SharePanelHost; Phase 6 review, finding 1). It is fixed under the bar and
 * last in the page, so focus that leaves it must close it, or it would cover
 * the skip link, the nav and whatever the page scrolls to under the bar
 * (WCAG 2.4.11).
 */
test.describe("share panel > the copy row shows the address (UX sweep 21-11-26)", () => {
  for (const width of [1440, 390]) {
    test(`at ${width} px a short address shows whole, a long one ends in an ellipsis inside the row`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 844 });
      for (const [path, label] of [
        ["/skills", "kunanonj.com/skills"],
        [
          "/skills/verification-before-completion",
          "kunanonj.com/skills/verification-before-completion",
        ],
      ] as const) {
        await page.goto(path, { waitUntil: "networkidle" });
        await page
          .getByRole("main")
          .getByRole("button", { name: "Share", exact: true })
          .click();
        const panel = page.getByRole("region", { name: "Share this page" });
        const address = panel.getByText(label, { exact: true });
        await expect(address).toBeVisible();
        const fit = await address.evaluate((el) => {
          const row = el.closest("button")!.getBoundingClientRect();
          const box = el.getBoundingClientRect();
          return {
            whole: el.scrollWidth <= el.clientWidth,
            inside: box.right <= row.right && box.left >= row.left,
            ellipsis: getComputedStyle(el).textOverflow,
          };
        });
        expect(fit.inside, path).toBe(true);
        expect(fit.ellipsis).toBe("ellipsis");
        // The 19-character address was cut by 7 px in a 130 px slot.
        if (path === "/skills") expect(fit.whole, path).toBe(true);
      }
    });
  }
});

test.describe("share panel > focus that leaves it closes it", () => {
  test("Tab past the last row on /skills at 390 px closes the panel", async ({
    page,
    browserName,
  }) => {
    test.skip(
      browserName === "firefox",
      "Playwright's Firefox keeps focus on a page's last element when Tab goes past it (no browser UI to hand it to), so focus never comes round to the skip link",
    );
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
    for (let row = 0; row <= rows; row += 1)
      await page.keyboard.press(tabKey(browserName));
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
    browserName,
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
    await page.keyboard.press(tabKey(browserName));
    await page.keyboard.press("Escape");
    await expect(panel).toHaveCount(0);
    await expect(share).toBeFocused();
  });
});

/*
 * The 404 you fix, Save my edition and the holo card (now-building-and-genz
 * Phase 6). The 404 arrives with seven pixels missing, each a button; patched
 * by keyboard or pointer (or Patch it all) it plays its print-in and finds
 * the Coral cap, which the toast announces. The status stays 404. On /about,
 * once a trait is found, Save my edition downloads the portrait as a
 * 480 x 480 PNG; a mouse tilts the portrait card, and nothing moves under
 * reduced motion.
 */
const CORAL_CAP = "#ff7a3d";

/** A visit without the first-visit intro, waiting for hydration. */
async function visitPlay(page: Page, path: string) {
  await page.addInitScript(() => {
    try {
      sessionStorage.setItem("fronk-intro-seen", "1");
    } catch {
      // Storage can be unavailable; the intro then plays first.
    }
  });
  const response = await page.goto(path, { waitUntil: "load" });
  // The footer's clock is client-only: the page has hydrated.
  await expect(page.locator("time[data-clock]")).toBeAttached();
  return response;
}

/**
 * The 404, once its game has hydrated too: it is a lazy chunk, so it can
 * hydrate after the page. Its lucky link leaves /portfolio for a case study
 * only then.
 */
async function visitNotFound(page: Page) {
  const response = await visitPlay(page, "/does-not-exist");
  await expect(
    page.getByRole("link", { name: "I'm feeling lucky" }),
  ).toHaveAttribute("href", /^\/(portfolio|ventures)\/[a-z-]+$/);
  return response;
}

const patchGaps = (page: Page) =>
  page.getByRole("button", { name: /^Patch pixel \d of 7$/ });
const foundTraits = (page: Page) =>
  page.evaluate(
    () =>
      JSON.parse(localStorage.getItem("pf-portrait-found") ?? "[]") as string[],
  );

/** The cap was found: the toast says so and the nav's avatar wears it. */
async function expectCapFound(page: Page) {
  const toast = page.getByTestId("trait-toast");
  await expect(toast).toBeVisible();
  await expect(toast.getByRole("status")).toHaveText(
    "You found Coral cap · 1/6",
  );
  expect(await foundTraits(page)).toEqual(["cap"]);
  await expect
    .poll(() =>
      page
        .locator(".pf-nav__avatar path[fill]")
        .evaluateAll((paths) => paths.map((p) => p.getAttribute("fill"))),
    )
    .toContain(CORAL_CAP);
}

/** How many of the drawing's squares are animating. */
const animatedSquares = (page: Page) =>
  page
    .locator("svg.pf-patch__art")
    .evaluate(
      (svg) =>
        [...svg.querySelectorAll("rect")].filter(
          (rect) => rect.getAnimations().length > 0,
        ).length,
    );

test.describe("404 > the page you fix (Phase 6)", () => {
  test("answers 404 with its words and links, and seven gaps to patch", async ({
    page,
  }) => {
    const response = await visitNotFound(page);
    expect(response?.status()).toBe(404);
    await expect(page.locator("h1")).toHaveText("Nothing lives here.");
    await expect(
      page
        .getByRole("navigation", { name: "Recovery links" })
        .getByRole("link"),
    ).toHaveCount(4);
    await expect(patchGaps(page)).toHaveCount(7);
    const sizes = await patchGaps(page).evaluateAll((els) =>
      els.map((el) => {
        const box = el.getBoundingClientRect();
        return Math.min(box.width, box.height);
      }),
    );
    for (const size of sizes) expect(size).toBeGreaterThanOrEqual(24);
    // At rest nothing is found, and the lucky link is a case study.
    expect(await foundTraits(page)).toEqual([]);
    await expect(
      page.getByRole("link", { name: "I'm feeling lucky" }),
    ).toHaveAttribute("href", /^\/(portfolio|ventures)\/[a-z-]+$/);
  });

  test("fixed by keyboard: each gap in turn, then the cap", async ({
    page,
    browserName,
  }) => {
    await visitNotFound(page);
    const first = page.getByRole("button", { name: "Patch pixel 1 of 7" });
    // Tab in from the top, as a keyboard reader does.
    for (let presses = 0; presses < 60; presses += 1) {
      if (await first.evaluate((el) => el === document.activeElement)) break;
      await page.keyboard.press(tabKey(browserName));
    }
    await expect(first).toBeFocused();
    for (let left = 7; left > 0; left -= 1) {
      // Focus moves on by itself after each patch.
      await page.keyboard.press(left % 2 ? "Enter" : "Space");
      await expect(patchGaps(page)).toHaveCount(left - 1);
    }
    await expect(
      page.getByRole("link", { name: "I'm feeling lucky" }),
    ).toBeFocused();
    await expect(page.locator(".pf-patch__news")).toHaveText(
      "Fixed. Every pixel is back.",
    );
    await expectCapFound(page);
  });

  test("fixed by pointer, gap by gap, then the print-in plays", async ({
    page,
  }) => {
    await visitNotFound(page);
    const squares = page.locator("svg.pf-patch__art rect");
    const before = await squares.count();
    for (let left = 7; left > 0; left -= 1) {
      await patchGaps(page).first().click();
      await expect(squares).toHaveCount(before + 8 - left);
    }
    // Whole again: the drawing's beats run on its squares.
    expect(await animatedSquares(page)).toBeGreaterThan(100);
    await expectCapFound(page);
  });

  test("Patch it all, under reduced motion: filled at once, nothing moves", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await visitNotFound(page);
    await page.getByRole("button", { name: "Patch it all" }).click();
    await expect(patchGaps(page)).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: "Patch it all" }),
    ).toHaveCount(0);
    expect(await animatedSquares(page)).toBe(0);
    await expectCapFound(page);
    // The lucky link opens a real case study.
    const href = await page
      .getByRole("link", { name: "I'm feeling lucky" })
      .getAttribute("href");
    expect((await page.request.get(href!)).status(), href!).toBe(200);
  });
});

test.describe("about > Save my edition and the holo card (Phase 6)", () => {
  const portraitCard = (page: Page) => page.locator(".pf-about-page__portrait");
  const transformOf = (page: Page) =>
    portraitCard(page).evaluate((el) => getComputedStyle(el).transform);

  test("at rest: no Save button, no sheen, a flat card", async ({ page }) => {
    await visitPlay(page, "/about");
    await expect(
      page.getByRole("button", { name: "Save my edition" }),
    ).toHaveCount(0);
    await expect(page.locator(".pf-holo")).toHaveCount(0);
    expect(await transformOf(page)).toBe("none");
  });

  test("Save my edition downloads the portrait as a 480 x 480 PNG", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      localStorage.setItem("pf-portrait-found", '["cap","pin","shades"]');
      localStorage.setItem("pf-portrait-worn", "cap");
    });
    await visitPlay(page, "/about");
    const save = page.getByRole("button", { name: "Save my edition" });
    await expect(save).toBeVisible();
    const [download] = await Promise.all([
      page.waitForEvent("download"),
      save.click(),
    ]);
    expect(download.suggestedFilename()).toBe("kunanonj-edition.png");
    const png = readFileSync((await download.path())!);
    // The PNG signature, then IHDR's width and height.
    expect([...png.subarray(0, 8)]).toEqual([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
    ]);
    expect(png.subarray(12, 16).toString("ascii")).toBe("IHDR");
    expect([png.readUInt32BE(16), png.readUInt32BE(20)]).toEqual([480, 480]);
    await expect(
      page.locator(".pf-about-page__portrait [aria-live]"),
    ).toHaveText("Saved your edition, 3 of 6, as a PNG.");
  });

  test("a mouse tilts the card toward it, and the controls still work", async ({
    page,
  }) => {
    await visitPlay(page, "/about");
    const card = portraitCard(page);
    await card.scrollIntoViewIfNeeded();
    const box = (await card.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await expect(page.locator(".pf-holo")).toBeAttached();
    await page.mouse.move(box.x + box.width * 0.9, box.y + box.height * 0.3, {
      steps: 8,
    });
    await expect.poll(() => transformOf(page)).toMatch(/^matrix3d\(/);
    await expect(card).toHaveAttribute("data-holo", "on");
    // The trait button still answers under the pointer.
    await page.getByRole("button", { name: "Try a trait · 0/6" }).click();
    await expect(
      page.getByRole("button", { name: "Try a trait · 1/6" }),
    ).toBeVisible();
    // Leaving eases it back flat.
    await page.mouse.move(box.x - 60, box.y + box.height / 2);
    await expect(card).toHaveAttribute("data-holo", "off");
  });

  test("stays flat under reduced motion", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await visitPlay(page, "/about");
    const card = portraitCard(page);
    await card.scrollIntoViewIfNeeded();
    const box = (await card.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.move(box.x + box.width * 0.9, box.y + box.height * 0.3, {
      steps: 8,
    });
    await page.waitForTimeout(400);
    await expect(page.locator(".pf-holo")).toHaveCount(0);
    expect(await transformOf(page)).toBe("none");
  });
});

/** The committed GitHub snapshot the open-source page is built from. */
type OpenSourceSnapshot = {
  projects: {
    url: string;
    lastCommitAt: string;
    release: { tag: string } | null;
  }[];
};
const openSource = JSON.parse(
  readFileSync("lib/content/openSource.generated.json", "utf8"),
) as OpenSourceSnapshot;

test.describe("open source > the owner's projects, from the GitHub snapshot", () => {
  test("Home's strip follows the story and a tile opens its card under the bar", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.addInitScript(() => {
      try {
        sessionStorage.setItem("fronk-intro-seen", "1");
      } catch {
        // Storage can be unavailable; the intro then plays and ends.
      }
    });
    await page.goto("/", { waitUntil: "networkidle" });
    expect(
      await page
        .locator("#open-source")
        .evaluate((el) => el.previousElementSibling?.id),
    ).toBe("journey");
    const strip = page.getByRole("region", { name: "Built in the open." });
    const tiles = strip.getByRole("list").getByRole("link");
    await expect(tiles).toHaveCount(openSource.projects.length);
    await tiles.first().click();
    await expect(page).toHaveURL(/\/open-source#superstacks$/);
    const card = page.locator("#superstacks");
    await expect(card).toBeInViewport();
    // Clear of the floating bar (the root's 96 px scroll padding).
    await expect
      .poll(async () => (await card.boundingBox())?.y ?? -1)
      .toBeGreaterThanOrEqual(90);
  });

  test("each card links its repository in a new tab and names its latest release", async ({
    page,
  }) => {
    await page.goto("/open-source", { waitUntil: "networkidle" });
    const cards = page.locator("main article");
    await expect(cards).toHaveCount(openSource.projects.length);
    for (const [index, project] of openSource.projects.entries()) {
      const card = cards.nth(index);
      const repo = card.locator(`a[href="${project.url}"]`);
      await expect(repo).toHaveAttribute("target", "_blank");
      await expect(repo).toHaveAttribute("rel", /noopener/);
      if (project.release)
        await expect(
          card.getByText(project.release.tag, { exact: true }),
        ).toBeVisible();
    }
  });

  test("Copy puts each Superstacks step on the clipboard: the marketplace, then the plugin", async ({
    page,
    context,
    browserName,
  }) => {
    test.skip(browserName !== "chromium", "only Chromium reads the clipboard");
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto("/open-source", { waitUntil: "networkidle" });
    const card = page.getByRole("article", { name: "Superstacks" });
    // The Updated words show once the page has hydrated.
    await expect(card.locator("time[title]")).toBeVisible();
    for (const [name, announcement, command] of [
      [
        "Copy the Superstacks marketplace command",
        "Copied the marketplace command",
        "/plugin marketplace add KunanonJ/superstacks",
      ],
      [
        "Copy the Superstacks plugin install command",
        "Copied the plugin install command",
        "/plugin install superstacks@superstacks",
      ],
    ]) {
      // Each row has its own live region, beside its button.
      const row = card
        .locator(".pf-cat-command")
        .filter({ has: page.getByRole("button", { name }) });
      await row.getByRole("button", { name }).click();
      await expect(row.getByRole("status")).toHaveText(announcement!);
      expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
        command,
      );
    }
  });

  test("Updated is a date in the HTML and words after hydration, with no warning", async ({
    page,
  }) => {
    const [superstacks] = openSource.projects;
    const committed = new Date(superstacks!.lastCommitAt);
    const errors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error" || /hydrat/i.test(message.text()))
        errors.push(message.text());
    });
    page.on("pageerror", (error) => errors.push(error.message));

    // A crawler, or a visitor before the script runs, reads the date.
    const html = await (await page.request.get("/open-source")).text();
    expect(html).toMatch(
      new RegExp(
        `<time [^>]*dateTime="${superstacks!.lastCommitAt.slice(0, 10)}"[^>]*>\\d{1,2} \\w{3} \\d{4}</time>`,
        "i",
      ),
    );
    expect(html).not.toMatch(/<time [^>]*>[^<]*(ago|today|yesterday)</);

    // Five UTC days after the commit, the browser says so.
    await page.clock.setFixedTime(
      new Date(committed.getTime() + 5 * 86_400_000),
    );
    await page.goto("/open-source", { waitUntil: "networkidle" });
    const updated = page
      .getByRole("article", { name: "Superstacks" })
      .locator("dd time");
    await expect(updated).toHaveText("5 days ago");
    await expect(updated).toHaveAttribute(
      "title",
      new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      }).format(committed),
    );
    expect(errors.filter(isRealError)).toEqual([]);
  });
});

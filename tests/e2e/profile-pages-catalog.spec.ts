import { expect, test, type Locator, type Page } from "@playwright/test";

/**
 * Profile redesign, Phase 7 group D2 (process/features/profile-site-redesign,
 * phase 7 steps 7c, 7e to 7i): /skills and the skill pages, /resume, the 404,
 * /design, and the hidden /blog and /press, now in the redesign's token
 * scope. routes.ts lists them in PROFILE_ROUTES, so axe runs WCAG 2.2 on them
 * in both themes and profile.spec.ts checks their fit on every project. Here,
 * in desktop Chromium:
 *
 * - the device matrix (design spec 10.1): every page holds at 344, 390, 820,
 *   882, 1180 and 1440 px, with nothing in the side gutter;
 * - one page per family through the best-practice checks of
 *   references/best-practices-audit_18-11-26.md (forced colors, text
 *   spacing, zoom, more contrast, request origins; plan gate 7). Each check
 *   first fails a fixture, so a check that stops catching anything fails;
 * - what jsdom cannot see: the résumé's grid, its print, the 404's scope,
 *   /design's canonical and theme switch, and the hidden pages' robots.
 *
 * The press and blog banners still load from images.unsplash.com (their
 * content, unchanged here; the phase 7 report lists it), so the request
 * check runs on the other families only.
 */

const PAGES = {
  skills: "/skills",
  skill: "/skills/verify-loop",
  resume: "/resume",
  notFound: "/does-not-exist",
  design: "/design",
  press: "/press",
  blog: "/blog",
  post: "/blog/ai-transformation-thailand-smes",
} as const;

const MATRIX = [344, 390, 820, 882, 1180, 1440] as const;

function desktopOnly() {
  test.skip(
    test.info().project.name !== "desktop",
    "runs once, in desktop Chromium",
  );
}

async function prepare(page: Page, theme: "light" | "dark" = "light") {
  await page.addInitScript((value) => {
    try {
      localStorage.setItem("theme", value);
      sessionStorage.setItem("fronk-intro-seen", "1");
    } catch {
      // Storage can be unavailable; the site then uses its default theme.
    }
  }, theme);
}

/** Opens a page and checks it answered (the 404 answers 404, on purpose). */
async function open(page: Page, path: string) {
  const res = await page.goto(path, { waitUntil: "networkidle" });
  expect(res?.status(), path).toBe(path === PAGES.notFound ? 404 : 200);
  await page.evaluate(() => document.fonts.ready);
}

/**
 * Moves focus to `target` with real Tab presses from wherever focus is, as a
 * keyboard reader does (never a script focus on a control). Desktop
 * Chromium only, where Tab reaches every control.
 */
async function tabTo(page: Page, target: Locator) {
  for (let presses = 0; presses < 60; presses += 1) {
    if (await target.evaluate((el) => el === document.activeElement)) return;
    await page.keyboard.press("Tab");
  }
  await expect(target).toBeFocused();
}

/**
 * Sideways scroll, a part in the side gutter, text under 12 px and targets
 * under 24 px.
 */
function layoutProblems(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const problems: string[] = [];
    const width = document.documentElement.scrollWidth;
    if (width > window.innerWidth + 1) {
      problems.push(`${width}px of content in ${window.innerWidth}px`);
    }
    // A part that crosses its .ds-wrap's padding into the side gutter. Font
    // metrics differ between machines, and a tile's overflow: hidden keeps
    // a part that is too wide from scrolling, so this catches on a Mac what
    // only CI's wider text would push off screen. A rotated mark's box
    // overhangs by up to 3 px, hence the 4 px allowance. Some parts leave the
    // column on purpose: the notebook bleeds to the left edge on phones
    // (design spec 8.7), a marquee's track runs past its clipped frame, and
    // the skill credits' links widen their hit area with a -6 px margin while
    // their text stays on the edge.
    const bleeds = ".pf-book, .ds-marquee__track, .pf-skill-credits__skill";
    // Decoration may overhang: a part with no text whose every element is
    // hidden from assistive tech (a pixel mark set beside a word, say).
    const decorative = (node: Element): boolean =>
      !node.textContent?.trim() &&
      (node.closest("[aria-hidden='true']") !== null ||
        (node.children.length > 0 && [...node.children].every(decorative)));
    for (const wrap of document.querySelectorAll<HTMLElement>(".ds-wrap")) {
      const box = wrap.getBoundingClientRect();
      const style = getComputedStyle(wrap);
      const start = box.left + parseFloat(style.paddingLeft) - 4;
      const end = box.right - parseFloat(style.paddingRight) + 4;
      for (const el of wrap.querySelectorAll<HTMLElement>("*")) {
        const rect = el.getBoundingClientRect();
        if (rect.width <= 1 || rect.height <= 1) continue; // visually hidden
        if (decorative(el)) continue;
        if (el.closest(bleeds)) continue;
        if (rect.left < start || rect.right > end) {
          const name = el.classList[0] ? `.${el.classList[0]}` : "";
          problems.push(
            `${el.tagName.toLowerCase()}${name} crosses the gutter`,
          );
          break;
        }
      }
    }
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
    );
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const text = node.textContent?.trim();
      const el = node.parentElement;
      if (!text || !el) continue;
      const rect = el.getBoundingClientRect();
      if (rect.width <= 1 || rect.height <= 1) continue;
      if (parseFloat(getComputedStyle(el).fontSize) < 12) {
        problems.push(`small text: "${text.slice(0, 30)}"`);
      }
    }
    for (const el of document.querySelectorAll<HTMLElement>(
      "a[href], button, input, select, textarea, summary",
    )) {
      const rect = el.getBoundingClientRect();
      if (rect.width <= 1 && rect.height <= 1) continue;
      if (getComputedStyle(el).display === "inline" && el.closest("p, li")) {
        continue;
      }
      if (rect.width < 24 || rect.height < 24) {
        const name = el.getAttribute("aria-label") ?? el.textContent?.trim();
        problems.push(
          `${Math.round(rect.width)}x${Math.round(rect.height)}: ${name}`,
        );
      }
    }
    return problems;
  });
}

/** This lane's ringed parts, beside the shared primitives. */
const RINGED = [
  ".ds-pill",
  ".ds-chip",
  ".ds-badge",
  ".ds-tile",
  ".ds-motion-toggle",
  ".pf-theme",
  ".pf-filter",
  ".pf-cat-command",
  ".pf-skill-card",
  ".pf-skill-step",
  ".pf-skill-pager__link",
  ".pf-skill-source__well",
  ".pf-resume__card",
  ".pf-resume__well",
  ".pf-press-card__banner",
  ".pf-blog-banner",
].join(", ");

/** In forced colors, ringed parts keep an edge and pixel art goes away. */
function forcedColorsProblems(page: Page): Promise<string[]> {
  return page.evaluate((ringed) => {
    const out: string[] = [];
    for (const el of document.querySelectorAll<HTMLElement>(ringed)) {
      const s = getComputedStyle(el);
      if (s.display === "none") continue;
      const edge =
        s.borderTopStyle !== "none" &&
        parseFloat(s.borderTopWidth) >= 1 &&
        s.borderTopColor !== "rgba(0, 0, 0, 0)" &&
        s.borderTopColor !== "transparent";
      if (!edge) out.push(`no edge: .${[...el.classList].join(".")}`);
    }
    for (const el of document.querySelectorAll<HTMLElement>(
      ".ds-px-mark, .ds-px-dot, .ds-word-mark, .ds-dither, .pf-art",
    )) {
      if (getComputedStyle(el).display !== "none") {
        out.push(`still drawn: .${[...el.classList].join(".")}`);
      }
    }
    return out;
  }, RINGED);
}

/** WCAG 1.4.12 text spacing; then any text its box clips. */
async function clippedText(page: Page): Promise<string[]> {
  await page.addStyleTag({
    content:
      "*, *::before, *::after { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; } p { margin-bottom: 2em !important; }",
  });
  return page.evaluate(() => {
    const out: string[] = [];
    for (const el of document.querySelectorAll<HTMLElement>("body *")) {
      const ownText = [...el.childNodes].some(
        (n) => n.nodeType === Node.TEXT_NODE && n.textContent?.trim(),
      );
      if (!ownText || el.closest(".ds-marquee")) continue;
      const s = getComputedStyle(el);
      if (!/hidden|clip/.test(s.overflowX + s.overflowY)) continue;
      if (el.clientWidth <= 1) continue;
      if (
        el.scrollHeight > el.clientHeight + 1 ||
        el.scrollWidth > el.clientWidth + 1
      ) {
        out.push(`clipped: "${el.textContent?.trim().slice(0, 30)}"`);
      }
    }
    return out;
  });
}

/** Font sizes of every `t-*` text style on the page, by position. */
function typeSizes(page: Page): Promise<Record<string, number>> {
  return page.evaluate(() => {
    const out: Record<string, number> = {};
    document.querySelectorAll<HTMLElement>("body *").forEach((el, i) => {
      const style = [...el.classList].find((c) => c.startsWith("t-"));
      if (style)
        out[`${i} .${style}`] = parseFloat(getComputedStyle(el).fontSize);
    });
    return out;
  });
}

/** WCAG 1.4.4 and 1.4.10: text doubles at 500%, nothing sideways at 200%. */
async function zoomShortfalls(page: Page): Promise<string[]> {
  await page.setViewportSize({ width: 1280, height: 800 });
  const base = await typeSizes(page);
  await page.setViewportSize({ width: 640, height: 400 });
  const out: string[] = [];
  const reflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  if (reflow > 1) out.push(`${reflow}px sideways at 200% zoom`);
  await page.setViewportSize({ width: 256, height: 160 });
  const zoomed = await typeSizes(page);
  for (const [key, px] of Object.entries(base)) {
    const at500 = (zoomed[key] ?? 0) * 5;
    if (at500 < px * 2 - 0.5) out.push(`${key}: ${px}px, ${at500}px zoomed`);
  }
  return out;
}

/** With prefers-contrast: more, the small-text floor moves up to ink 80. */
function inkFloorRaised(page: Page): Promise<boolean> {
  return page.evaluate(() => {
    const s = getComputedStyle(document.documentElement);
    return (
      s.getPropertyValue("--ink-60").trim() ===
      s.getPropertyValue("--ink-80").trim()
    );
  });
}

/** Origins outside the site, the analytics beacon aside. */
function foreignOrigins(urls: readonly string[], base: string): string[] {
  const allowed = new Set([
    new URL(base).origin,
    "https://static.cloudflareinsights.com",
    "https://cloudflareinsights.com",
  ]);
  const origins = urls
    .filter((url) => /^https?:/.test(url))
    .map((url) => new URL(url).origin);
  return [...new Set(origins)].filter((origin) => !allowed.has(origin));
}

test.describe("group D2's pages across the device matrix (desktop Chromium)", () => {
  for (const path of Object.values(PAGES)) {
    test(`${path} holds at 344, 390, 820, 882, 1180 and 1440 px`, async ({
      page,
    }) => {
      desktopOnly();
      await page.emulateMedia({ reducedMotion: "reduce" });
      await prepare(page);
      await open(page, path);
      await expect(page.locator("html")).toHaveAttribute(
        "data-design",
        "profile",
      );
      for (const width of MATRIX) {
        await page.setViewportSize({ width, height: 900 });
        // Chromium can resolve vw units at the old width until its next
        // frame (--pad stayed 72 px at 344 px), so measure two frames on.
        await page.evaluate(
          () =>
            new Promise<void>((done) =>
              requestAnimationFrame(() => requestAnimationFrame(() => done())),
            ),
        );
        await page.evaluate(() => document.fonts.ready);
        expect(await layoutProblems(page), `${path} at ${width}px`).toEqual([]);
      }
    });
  }
});

/** One page per family: skills, the résumé, the 404, /design, press. */
const FAMILIES = [
  PAGES.skill,
  PAGES.resume,
  PAGES.notFound,
  PAGES.design,
  PAGES.press,
] as const;

test.describe("best practices on group D2's pages (desktop Chromium)", () => {
  for (const path of FAMILIES) {
    test(`forced colors: ringed parts keep an edge, pixel art hides (${path})`, async ({
      page,
    }) => {
      desktopOnly();
      await page.emulateMedia({ forcedColors: "active" });
      await page.setContent(
        `<a class="ds-pill" href="#x" style="border:0;box-shadow:0 0 0 1px #000">x</a>`,
      );
      expect(await forcedColorsProblems(page)).not.toEqual([]);

      await prepare(page);
      await open(page, path);
      expect(await forcedColorsProblems(page)).toEqual([]);
    });

    test(`text spacing (WCAG 1.4.12) clips no text (${path})`, async ({
      page,
    }) => {
      desktopOnly();
      await page.setContent(
        `<div style="width:120px;height:20px;overflow:hidden;font-size:16px">Text that cannot fit in this box</div>`,
      );
      expect(await clippedText(page)).not.toEqual([]);

      await prepare(page);
      await open(page, path);
      expect(await clippedText(page)).toEqual([]);
    });

    test(`zoom (WCAG 1.4.4, 1.4.10): text doubles and nothing scrolls sideways (${path})`, async ({
      page,
    }) => {
      desktopOnly();
      await page.setContent(
        `<p class="t-fixture" style="font-size:5vw;margin:0">Viewport-only text</p>`,
      );
      expect(await zoomShortfalls(page)).not.toEqual([]);

      await prepare(page);
      await open(page, path);
      expect(await zoomShortfalls(page)).toEqual([]);
    });

    test(`more contrast raises the small-text floor (${path})`, async ({
      page,
    }) => {
      desktopOnly();
      await prepare(page);
      await open(page, path);
      expect(await inkFloorRaised(page)).toBe(false);
      await page.emulateMedia({ contrast: "more" });
      expect(await inkFloorRaised(page)).toBe(true);
    });

    if (path !== PAGES.press) {
      test(`requests stay on the site (${path})`, async ({ page, baseURL }) => {
        desktopOnly();
        const base = baseURL ?? "http://127.0.0.1:3000";
        expect(
          foreignOrigins([`${base}/a.css`, "https://example.com/x.png"], base),
        ).toEqual(["https://example.com"]);

        const urls: string[] = [];
        page.on("request", (request) => urls.push(request.url()));
        await prepare(page);
        await open(page, path);
        expect(foreignOrigins(urls, base)).toEqual([]);
      });
    }
  }
});

test.describe("what jsdom cannot see (desktop Chromium)", () => {
  test.beforeEach(() => desktopOnly());

  test("the résumé: University-era beside Education from 1024 px, across the row below", async ({
    page,
  }) => {
    await prepare(page);
    await open(page, PAGES.resume);
    const box = async (name: string) =>
      (await page.getByRole("article", { name, exact: true }).boundingBox())!;

    await page.setViewportSize({ width: 1440, height: 900 });
    let early = await box("University-era");
    const education = await box("Education");
    let current = await box("Currently");
    expect(early.x).toBeGreaterThan(education.x + education.width);
    // Two of three columns, from the second to the row's end.
    expect(early.x + early.width).toBeCloseTo(current.x + current.width, 0);
    expect(early.width).toBeGreaterThan(education.width * 1.9);

    await page.setViewportSize({ width: 820, height: 900 });
    early = await box("University-era");
    current = await box("Currently");
    expect(early.x).toBeCloseTo(current.x, 0);
    expect(early.width).toBeCloseTo(current.width, 0);
  });

  test("the résumé prints its plain document, not the screen layout", async ({
    page,
  }) => {
    await prepare(page);
    await open(page, PAGES.resume);
    await page.emulateMedia({ media: "print" });
    await expect(page.locator("[data-resume-print]")).toBeVisible();
    await expect(
      page.locator('section[aria-labelledby="hero-title"]'),
    ).toBeHidden();
    await expect(page.locator(".pf-resume")).toBeHidden();
    // The bar's offset never reaches the paper.
    const top = await page
      .locator("main#main")
      .evaluate((el) => parseFloat(getComputedStyle(el).paddingTop));
    expect(top).toBe(0);
  });

  test("the 404 is the new status page, in the scope, with its pixel picture", async ({
    page,
  }) => {
    await prepare(page);
    await open(page, PAGES.notFound);
    await expect(page.locator("html")).toHaveAttribute(
      "data-design",
      "profile",
    );
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Nothing lives here.",
    );
    const art = page
      .getByRole("article", { name: "404 · Not found" })
      .locator("svg.pf-art");
    await expect(art).toBeVisible();
    // The page clears the fixed bar: the h1 starts below it.
    const h1 = (await page.getByRole("heading", { level: 1 }).boundingBox())!;
    expect(h1.y).toBeGreaterThan(80);
  });

  test("a route that fails shows the new error page, in the scope, and Try again recovers", async ({
    page,
  }) => {
    await prepare(page);
    await open(page, "/");
    // The résumé's loader asks the server on an in-app visit: fail it.
    await page.route("**/_serverFn/**", (route) => route.abort());
    await page
      .getByRole("navigation", { name: "Primary" })
      .getByRole("link", { name: "Résumé" })
      .click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Something went wrong.",
    );
    await expect(page.getByRole("alert")).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute(
      "data-design",
      "profile",
    );
    await expect(
      page
        .getByRole("article", { name: "Error · Didn't load" })
        .locator("svg.pf-art"),
    ).toBeVisible();
    await expect(
      page
        .getByRole("navigation", { name: "Recovery links" })
        .getByRole("link"),
    ).toHaveCount(4);
    await page.unroute("**/_serverFn/**");
    await page.getByRole("button", { name: "Try again" }).click();
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Kunanon Jarat.",
    );
  });

  test("/design: its own canonical, noindex, and a theme switch of its own", async ({
    page,
  }) => {
    await prepare(page);
    await open(page, PAGES.design);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      /\/design$/,
    );
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      "noindex, nofollow",
    );
    await expect(page.locator("header[data-site-chrome]")).toHaveCount(0);
    // The radio sits under its label, which takes the click.
    await page.locator(".pf-theme__option", { hasText: "Dark" }).click();
    await expect(page.locator("html")).toHaveClass(/(^|\s)dark(\s|$)/);
  });

  test("the hidden pages stay noindex", async ({ page }) => {
    for (const path of [PAGES.press, PAGES.blog, PAGES.resume]) {
      await open(page, path);
      await expect(page.locator('meta[name="robots"]'), path).toHaveAttribute(
        "content",
        /noindex/,
      );
    }
  });

  test("the skills pipeline: eight steps in order, each a link to its skill", async ({
    page,
  }) => {
    await prepare(page);
    await open(page, PAGES.skills);
    const steps = page
      .getByRole("article", { name: "The pipeline" })
      .getByRole("listitem");
    await expect(steps).toHaveCount(8);
    for (const step of await steps.all()) {
      await expect(step.getByRole("link")).toHaveAttribute(
        "href",
        /^\/skills\/[a-z-]+$/,
      );
    }
    // The install tabs are toggle pills: Tab reaches the selected one from
    // the top of the page, and the arrow keys move the selection.
    const tabs = page.getByRole("tablist", {
      name: "Install the whole pack with",
    });
    await tabTo(page, tabs.getByRole("tab", { name: "Claude Code" }));
    await page.keyboard.press("ArrowRight");
    const codex = tabs.getByRole("tab", { name: "Codex" });
    await expect(codex).toHaveAttribute("aria-selected", "true");
    await expect(codex).toBeFocused();
  });
});

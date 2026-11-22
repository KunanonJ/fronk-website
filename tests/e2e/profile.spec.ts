import { expect, test, type Page } from "@playwright/test";
import { ROUTES } from "./routes";

/**
 * Profile redesign checks for the pages in the redesign's token scope: the
 * hidden /preview pages until the Phase 6 cutover, the live core pages since
 * (Home, the portfolio, the case pages, About and Contact; routes.ts).
 *
 * - Every project that runs this file (the device matrix of design spec 10.1,
 *   the WebKit phone, and the mobile, tablet and desktop projects): nothing
 *   scrolls sideways, no text under 12 px, every control 24 x 24 px or more.
 * - Desktop Chromium only: the best-practice checks of
 *   process/features/profile-site-redesign/references/best-practices-audit_18-11-26.md
 *   (forced colors, text spacing, zoom, more contrast, request origins) on
 *   Home, a case page, About and Contact (Phase 6 plan gate 10). Each check
 *   is a plain function, run first on a fixture it must fail, so a check
 *   that stops catching anything fails too.
 * - The matrix baselines live with each section's spec (profile-hero,
 *   profile-work-about, profile-journey and profile-case); the full pages'
 *   are in visual.spec.ts. The /preview/system baselines went with that page.
 */

const THEMES = ["light", "dark"] as const;
const HOME = "/";
/** Plan gate 10: Home, a case page, About and Contact. */
const BEST_PRACTICE_PAGES = [
  HOME,
  "/portfolio/tbh-intranet",
  "/about",
  "/contact",
] as const;

async function prepare(page: Page, theme: (typeof THEMES)[number]) {
  await page.addInitScript((value) => {
    try {
      localStorage.setItem("theme", value);
      sessionStorage.setItem("fronk-intro-seen", "1");
    } catch {
      // Storage can be unavailable; the site then uses its default theme.
    }
  }, theme);
}

/** Sideways scroll, text under 12 px and targets under 24 px. */
async function layoutProblems(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const problems: string[] = [];
    const width = document.documentElement.scrollWidth;
    if (width > window.innerWidth + 1) {
      problems.push(
        `${width}px of content in a ${window.innerWidth}px viewport`,
      );
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
      if (rect.width <= 1 || rect.height <= 1) continue; // visually hidden
      let size = parseFloat(getComputedStyle(el).fontSize);
      // SVG text renders at its declared size times the drawing's scale: a
      // 12-unit label in a 640-unit drawing 580 px wide is about 11 px.
      if (el instanceof SVGGraphicsElement) {
        const matrix = el.getScreenCTM();
        if (matrix) size *= Math.hypot(matrix.a, matrix.b);
      }
      if (size < 12) {
        const px = Math.round(size * 10) / 10;
        problems.push(`${px}px text: "${text.slice(0, 30)}"`);
      }
    }
    const targets = document.querySelectorAll<HTMLElement>(
      "a[href], button, input, select, textarea, summary, [role='button']",
    );
    for (const el of targets) {
      const rect = el.getBoundingClientRect();
      if (rect.width <= 1 && rect.height <= 1) continue; // visually hidden
      // WCAG 2.5.8 exempts links that sit inside a run of text.
      if (getComputedStyle(el).display === "inline" && el.closest("p, li")) {
        continue;
      }
      if (rect.width < 24 || rect.height < 24) {
        const name = el.getAttribute("aria-label") ?? el.textContent?.trim();
        problems.push(
          `${Math.round(rect.width)}x${Math.round(rect.height)} target: ${name}`,
        );
      }
    }
    return problems;
  });
}

/** In forced colors, ringed parts keep an edge and pixel art goes away. */
async function forcedColorsProblems(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const out: string[] = [];
    const ringed = document.querySelectorAll<HTMLElement>(
      ".ds-pill, .ds-chip, .ds-badge, .ds-tile, .ds-motion-toggle, .pf-nav__pill, .pf-theme-toggle, .pf-theme, .pf-say__panel, .pf-menu, .pf-footer__card",
    );
    for (const el of ringed) {
      const s = getComputedStyle(el);
      const edge =
        s.borderTopStyle !== "none" &&
        parseFloat(s.borderTopWidth) >= 1 &&
        s.borderTopColor !== "rgba(0, 0, 0, 0)" &&
        s.borderTopColor !== "transparent";
      if (!edge) out.push(`no edge: .${[...el.classList].join(".")}`);
    }
    const art = document.querySelectorAll<HTMLElement>(
      ".ds-px-mark, .ds-px-dot, .ds-word-mark, .ds-dither",
    );
    for (const el of art) {
      if (getComputedStyle(el).display !== "none") {
        out.push(`still drawn: .${[...el.classList].join(".")}`);
      }
    }
    return out;
  });
}

/**
 * In forced colors, each bar of the FAQ's plus and cross keeps its ink: drawn
 * in CanvasText with forced-color-adjust off, not painted over as Canvas, so
 * open and closed still read apart (review finding 10).
 */
async function faqMarkProblems(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const probe = document.createElement("span");
    probe.style.color = "CanvasText";
    document.body.append(probe);
    const ink = getComputedStyle(probe).color;
    probe.remove();
    const marks = document.querySelectorAll<HTMLElement>(".pf-faq__mark");
    const out = marks.length === 0 ? ["no FAQ mark"] : [];
    marks.forEach((mark, at) => {
      for (const part of ["::before", "::after"]) {
        const bar = getComputedStyle(mark, part);
        if (bar.forcedColorAdjust !== "none" || bar.backgroundColor !== ink) {
          out.push(
            `mark ${at}${part}: ${bar.backgroundColor} (${bar.forcedColorAdjust}), not ${ink}`,
          );
        }
      }
    });
    return out;
  });
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
      // The marquee clips its moving track on purpose.
      if (!ownText || el.closest(".ds-marquee")) continue;
      const s = getComputedStyle(el);
      if (!/hidden|clip/.test(s.overflowX + s.overflowY)) continue;
      if (el.clientWidth <= 1) continue; // visually hidden
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

/** Computed font sizes of every `t-*` text style on the page, by position. */
async function typeSizes(page: Page): Promise<Record<string, number>> {
  return page.evaluate(() => {
    const out: Record<string, number> = {};
    document.querySelectorAll<HTMLElement>("body *").forEach((el, i) => {
      const style = [...el.classList].find((c) => c.startsWith("t-"));
      if (style) {
        out[`${i} .${style}`] = parseFloat(getComputedStyle(el).fontSize);
      }
    });
    return out;
  });
}

/**
 * WCAG 1.4.4 through zoom: at 500% (a 1280 px window shows 256 CSS px) text
 * must reach twice its size at 100%, and at 200% (640 px) nothing may scroll
 * sideways. Returns the shortfalls.
 */
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
    if (at500 < px * 2 - 0.5) {
      out.push(`${key}: ${px}px at 100%, at most ${at500.toFixed(1)}px zoomed`);
    }
  }
  return out;
}

/** With prefers-contrast: more, the small-text floor moves up to ink 80. */
async function inkFloorRaised(page: Page): Promise<boolean> {
  return page.evaluate(() => {
    const s = getComputedStyle(document.documentElement);
    return (
      s.getPropertyValue("--ink-60").trim() ===
      s.getPropertyValue("--ink-80").trim()
    );
  });
}

/**
 * Origins outside the site. Allowed: the site itself, and the beacon hosts
 * that components/CloudflareAnalytics.tsx loads (cookieless analytics, only
 * when its token is set).
 */
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

for (const route of ROUTES) {
  for (const theme of THEMES) {
    test(`${route.name} (${theme}) fits this width: no sideways scroll, 12 px text, 24 px targets`, async ({
      page,
    }) => {
      await prepare(page, theme);
      await page.goto(route.path, { waitUntil: "networkidle" });
      expect(await layoutProblems(page)).toEqual([]);
    });
  }
}

/** The best-practice checks run once, in desktop Chromium. */
function desktopOnly() {
  test.skip(
    test.info().project.name !== "desktop",
    "runs once, in desktop Chromium",
  );
}

/*
 * The device matrix (design spec 10.1; Phase 6 plan): the pages the cutover
 * rebuilt hold at every anchor width. Home's sections and the intranet case
 * have their own matrix checks in their specs.
 */
test.describe("the pages the cutover rebuilt, across the device matrix (desktop Chromium)", () => {
  for (const path of ["/portfolio", "/about", "/contact"]) {
    test(`${path} holds at 344, 390, 820, 882, 1180 and 1440 px`, async ({
      page,
    }) => {
      desktopOnly();
      await page.emulateMedia({ reducedMotion: "reduce" });
      await prepare(page, "light");
      await page.goto(path, { waitUntil: "networkidle" });
      for (const width of [344, 390, 820, 882, 1180, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        await page.evaluate(() => document.fonts.ready);
        expect(await layoutProblems(page), `${path} at ${width}px`).toEqual([]);
      }
    });
  }
});

test.describe("About's Read my story (review finding 9)", () => {
  test("lands with the story's heading below the bar", async ({ page }) => {
    test.skip(
      !["desktop", "webkit-phone"].includes(test.info().project.name),
      "desktop Chromium and the WebKit phone",
    );
    // The fixed bar's bottom edge: 32 px down and 48 px tall.
    const BAR_BOTTOM = 80;
    await page.emulateMedia({ reducedMotion: "reduce" });
    await prepare(page, "light");
    await page.goto("/about", { waitUntil: "networkidle" });
    await page.getByRole("link", { name: "Read my story" }).click();
    await expect(page).toHaveURL(/#story$/);
    // The story section's h2 (AboutPage's StorySection).
    const heading = page.locator("h2#story-title");
    await expect(heading).toHaveCount(1);
    // Once the jump has settled, the heading is on screen, under the bar.
    await expect
      .poll(async () => (await heading.boundingBox())?.y ?? -1)
      .toBeGreaterThanOrEqual(BAR_BOTTOM);
    const box = (await heading.boundingBox())!;
    const height = page.viewportSize()!.height;
    expect(box.y + box.height).toBeLessThanOrEqual(height);
    // The section, heading included, is the anchor the browser scrolled to.
    expect(await page.locator("#story").evaluate((el) => el.tagName)).toBe(
      "SECTION",
    );
  });
});

/*
 * The raster pictures are sharp on 2x screens (UX hunt 22-11-26, U26): the
 * kunanonj.com cover and About's photo each list a larger file, which a 2x
 * screen takes (the cover drew its 1440 file 1.8 times up at 1440 px, the
 * photo its 480 file 1.67 times); a 1x screen keeps the file it had, so it
 * loads no more than before.
 */
test.describe("the cover and About's photo on 1x and 2x screens (UX hunt 22-11-26)", () => {
  const ENGINES = new Set(["desktop", "webkit", "firefox"]);

  test.beforeEach(({ browserName: _browserName }, testInfo) => {
    test.skip(
      !ENGINES.has(testInfo.project.name),
      "Chromium, WebKit and Firefox",
    );
  });

  /** The address of the file an image shows, once it has chosen one. */
  const shown = (page: Page, selector: string) =>
    expect.poll(() =>
      page
        .locator(selector)
        .first()
        .evaluate((img: HTMLImageElement) =>
          img.currentSrc ? new URL(img.currentSrc).pathname : "",
        ),
    );

  for (const [scale, cover, photo] of [
    [1, "/portfolio/kunanonj-com/cover.webp", "/profile-portrait.webp"],
    [
      2,
      "/portfolio/kunanonj-com/cover-2880.webp",
      "/profile-portrait-800.webp",
    ],
  ] as const) {
    test.describe(`at ${scale}x`, () => {
      test.use({ deviceScaleFactor: scale });

      test(`1440 px wide: the cover and the photo show ${cover.split("/").pop()} and ${photo.slice(1)}`, async ({
        page,
        browserName,
      }) => {
        test.skip(
          scale > 1 && browserName === "firefox",
          "Playwright's Firefox draws at 1x whatever deviceScaleFactor says",
        );
        await page.setViewportSize({ width: 1440, height: 900 });
        await prepare(page, "light");
        await page.goto("/portfolio/kunanonj-com", { waitUntil: "load" });
        expect(await page.evaluate(() => devicePixelRatio)).toBe(scale);
        await shown(page, ".pf-case-art__shot").toBe(cover);
        await page.goto("/about", { waitUntil: "load" });
        await shown(page, ".pf-about-page__photo").toBe(photo);
      });
    });
  }
});

/**
 * /about#now, which Learn links, is Now's heading since Now moved into the
 * story's column (owner decision 21-11-26): an h3 that must land in view,
 * under the bar, from Learn's card and on a direct load.
 */
test.describe("About's #now (owner decision 21-11-26)", () => {
  const BAR_BOTTOM = 80;
  const landsInView = async (page: Page) => {
    await expect(page).toHaveURL(/\/about#now$/);
    const heading = page.locator("#story h3#now");
    await expect(heading).toHaveCount(1);
    await expect
      .poll(async () => (await heading.boundingBox())?.y ?? -1)
      .toBeGreaterThanOrEqual(BAR_BOTTOM);
    const box = (await heading.boundingBox())!;
    expect(box.y + box.height).toBeLessThanOrEqual(page.viewportSize()!.height);
  };

  test.beforeEach(async ({ page }) => {
    test.skip(
      !["desktop", "webkit-phone"].includes(test.info().project.name),
      "desktop Chromium and the WebKit phone",
    );
    await page.emulateMedia({ reducedMotion: "reduce" });
    await prepare(page, "light");
  });

  test("Learn's What I'm doing now lands on the heading, below the bar", async ({
    page,
  }) => {
    await page.goto("/learn", { waitUntil: "networkidle" });
    await page.locator('a[href="/about#now"]').click();
    await landsInView(page);
  });

  test("a direct load of /about#now lands on the heading, below the bar", async ({
    page,
  }) => {
    await page.goto("/about#now", { waitUntil: "networkidle" });
    await landsInView(page);
  });
});

test("the 12 px floor reads SVG text at the size it is drawn", async ({
  page,
}) => {
  desktopOnly();
  // A 12-unit label in a 640-unit drawing: 10.9 px at 580 px wide, 12 px at
  // its full size.
  const drawing = (width: number) =>
    page.setContent(
      `<svg viewBox="0 0 640 400" style="display:block;width:${width}px"><text x="10" y="40" font-size="12">A 12-unit label</text></svg>`,
    );
  await drawing(580);
  expect(await layoutProblems(page)).toEqual([
    '10.9px text: "A 12-unit label"',
  ]);
  await drawing(640);
  expect(await layoutProblems(page)).toEqual([]);
});

test.describe("best practices on the profile pages (desktop Chromium)", () => {
  test("forced colors: the FAQ's open and closed marks keep their bars (/about)", async ({
    page,
  }) => {
    desktopOnly();
    await page.emulateMedia({ forcedColors: "active" });
    await page.setContent(
      `<style>.pf-faq__mark::before, .pf-faq__mark::after { content: ""; display: block; height: 2px; background: rgb(113, 110, 121); }</style><span class="pf-faq__mark"></span>`,
    );
    expect(await faqMarkProblems(page)).not.toEqual([]);

    await prepare(page, "light");
    await page.goto("/about", { waitUntil: "networkidle" });
    expect(await faqMarkProblems(page)).toEqual([]);
    // Open and closed differ: the open mark is turned into a cross.
    const turns = await page
      .locator(".pf-faq__mark")
      .evaluateAll((marks) =>
        marks.map((mark) => getComputedStyle(mark).rotate),
      );
    expect(turns[0]).toBe("45deg");
    expect(new Set(turns.slice(1))).toEqual(new Set(["none"]));
  });

  for (const path of BEST_PRACTICE_PAGES) {
    test(`forced colors: ringed parts keep an edge, pixel art hides (${path})`, async ({
      page,
    }) => {
      desktopOnly();
      await page.emulateMedia({ forcedColors: "active" });
      await page.setContent(
        `<a class="ds-pill" href="#x" style="border:0;box-shadow:0 0 0 1px #000">x</a>`,
      );
      expect(await forcedColorsProblems(page)).not.toEqual([]);

      await prepare(page, "light");
      await page.goto(path, { waitUntil: "networkidle" });
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

      await prepare(page, "light");
      await page.goto(path, { waitUntil: "networkidle" });
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

      await prepare(page, "light");
      await page.goto(path, { waitUntil: "networkidle" });
      expect(await zoomShortfalls(page)).toEqual([]);
    });

    test(`more contrast raises the small-text floor (${path})`, async ({
      page,
    }) => {
      desktopOnly();
      await prepare(page, "light");
      await page.goto(path, { waitUntil: "networkidle" });
      expect(await inkFloorRaised(page)).toBe(false);

      await page.emulateMedia({ contrast: "more" });
      expect(await inkFloorRaised(page)).toBe(true);
    });

    test(`requests stay on the site (${path})`, async ({ page, baseURL }) => {
      desktopOnly();
      const base = baseURL ?? "http://127.0.0.1:3000";
      expect(
        foreignOrigins([`${base}/a.css`, "https://example.com/x.png"], base),
      ).toEqual(["https://example.com"]);

      const urls: string[] = [];
      page.on("request", (request) => urls.push(request.url()));
      await prepare(page, "light");
      await page.goto(path, { waitUntil: "networkidle" });
      expect(foreignOrigins(urls, base)).toEqual([]);
    });

    test(`scrolling through the page reveals every waiting block (${path})`, async ({
      page,
    }) => {
      desktopOnly();
      await page.emulateMedia({ reducedMotion: "no-preference" });
      await prepare(page, "light");
      await page.goto(path, { waitUntil: "networkidle" });
      // Half a screen at a time, as a reader scrolls, ending at the very bottom
      // where a short last block must still count as seen.
      await page.evaluate(async () => {
        const frame = () =>
          new Promise((done) =>
            requestAnimationFrame(() => requestAnimationFrame(done)),
          );
        const end = () => document.documentElement.scrollHeight;
        for (let y = 0; y < end(); y += window.innerHeight / 2) {
          window.scrollTo({ top: y, behavior: "instant" });
          await frame();
        }
        window.scrollTo({ top: end(), behavior: "instant" });
        await frame();
      });
      await expect(page.locator("[data-reveal]").first()).toBeAttached();
      await expect(page.locator("[data-reveal].is-pending")).toHaveCount(0);
    });

    test(`print shows blocks that were never scrolled into view (${path})`, async ({
      page,
    }) => {
      desktopOnly();
      await page.emulateMedia({ reducedMotion: "no-preference" });
      await prepare(page, "light");
      await page.goto(path, { waitUntil: "networkidle" });
      await expect(
        page.locator("[data-reveal].is-pending").first(),
      ).toBeAttached();
      await page.emulateMedia({ media: "print" });
      const hidden = await page.$$eval(
        "[data-reveal].is-pending",
        (els) =>
          els.filter((el) => getComputedStyle(el).opacity !== "1").length,
      );
      expect(hidden).toBe(0);
    });
  }
});

import { expect, test, type Page } from "@playwright/test";
import { PREVIEW_ROUTES } from "./routes";

/**
 * Profile redesign checks for the hidden /preview pages (Phase 0 onward).
 *
 * - Every project that runs this file (the device matrix of design spec 10.1,
 *   the WebKit phone, and the mobile, tablet and desktop projects): nothing
 *   scrolls sideways, no text under 12 px, every control 24 x 24 px or more.
 * - Desktop Chromium only: the best-practice checks of
 *   process/features/profile-site-redesign/references/best-practices-audit_18-11-26.md
 *   (forced colors, text spacing, zoom, more contrast, request origins). Each
 *   check is a plain function, run first on a fixture it must fail, so a
 *   check that stops catching anything fails too.
 * - The matrix projects (fold-closed, fold-open, tablet-landscape): baselines
 *   of /preview/system in both themes. Linux only, captured in the pinned
 *   Playwright image like visual.spec.ts; mobile and desktop are there.
 */

const THEMES = ["light", "dark"] as const;
const MATRIX = new Set(["fold-closed", "fold-open", "tablet-landscape"]);
const SYSTEM = "/preview/system";
const HOME = "/preview";

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
      const size = parseFloat(getComputedStyle(el).fontSize);
      if (size < 12) problems.push(`${size}px text: "${text.slice(0, 30)}"`);
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
 * when its token is set). Turnstile's host is allowed on /contact only.
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

for (const route of PREVIEW_ROUTES) {
  for (const theme of THEMES) {
    test(`${route.name} (${theme}) fits this width: no sideways scroll, 12 px text, 24 px targets`, async ({
      page,
    }) => {
      await prepare(page, theme);
      await page.goto(route.path, { waitUntil: "networkidle" });
      await expect(page.locator("html")).toHaveAttribute(
        "data-design",
        "profile",
      );
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

test.describe("best practices on the preview (desktop Chromium)", () => {
  for (const path of [SYSTEM, HOME]) {
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

for (const theme of THEMES) {
  test(`preview-system matches its baseline at this width (${theme})`, async ({
    page,
  }, testInfo) => {
    test.skip(
      !MATRIX.has(testInfo.project.name),
      "matrix widths only; visual.spec.ts covers mobile and desktop",
    );
    await page.emulateMedia({ reducedMotion: "reduce" });
    await prepare(page, theme);
    await page.goto(SYSTEM, { waitUntil: "networkidle" });
    await expect(page.locator("html")).toHaveClass(
      new RegExp(`(^|\\s)${theme}(\\s|$)`),
    );
    await page.evaluate(() => document.fonts.ready);
    await expect(page).toHaveScreenshot(`preview-system-${theme}.png`, {
      fullPage: true,
    });
  });
}

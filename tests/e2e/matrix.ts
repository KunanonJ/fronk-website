import { expect, type Locator, type Page } from "@playwright/test";

/*
 * What the page-family device-matrix specs share (profile-pages-hubs and
 * profile-pages-catalog): the storage set-up, the keyboard walk, and the
 * layout, forced-colours, text-spacing and zoom checks of design spec 10.1.
 * The checks run in the page, so each spec's choices (which parts may bleed,
 * which parts are ringed) travel as the argument to page.evaluate.
 */

export type Theme = "light" | "dark";

/** The theme from the first paint, and the intro already seen. */
export async function prepare(page: Page, theme: Theme = "light") {
  await page.addInitScript((value) => {
    try {
      localStorage.setItem("theme", value);
      sessionStorage.setItem("fronk-intro-seen", "1");
    } catch {
      // Storage can be unavailable; the site then uses its default theme.
    }
  }, theme);
}

/**
 * Presses Tab until `target` has focus, as a keyboard reader moves (never a
 * script focus on a control); WebKit moves to links and buttons with
 * Option+Tab, as Safari does by default.
 */
export async function tabTo(page: Page, target: Locator, most = 12) {
  const webkit = page.context().browser()?.browserType().name() === "webkit";
  for (let presses = 0; presses < most; presses += 1) {
    if (await target.evaluate((el) => el === document.activeElement)) break;
    await page.keyboard.press(webkit ? "Alt+Tab" : "Tab");
  }
  await expect(target).toBeFocused();
}

/** Links, buttons and fields: what counts as a tap target (WCAG 2.5.8). */
const TARGETS = "a[href], button, input, select, textarea, summary";

export interface LayoutOptions {
  /** Parts that leave the column on purpose, as one selector. */
  bleeds?: string;
  /** More tap targets, as one selector (a `[role='button']`, say). */
  moreTargets?: string;
}

/**
 * Sideways scroll, a part in the side gutter, text under 12 px and targets
 * under 24 px.
 */
export function layoutProblems(
  page: Page,
  { bleeds = "", moreTargets }: LayoutOptions = {},
): Promise<string[]> {
  const targets = moreTargets ? `${TARGETS}, ${moreTargets}` : TARGETS;
  return page.evaluate(
    ({ bleeds, targets }) => {
      const problems: string[] = [];
      const width = document.documentElement.scrollWidth;
      if (width > window.innerWidth + 1) {
        problems.push(`${width}px of content in ${window.innerWidth}px`);
      }
      // A part that crosses its .ds-wrap's padding into the side gutter.
      // Font metrics differ between machines, and a tile's overflow: hidden
      // keeps a part that is too wide from scrolling, so this catches on a
      // Mac what only CI's wider text would push off screen. A rotated
      // mark's box overhangs by up to 3 px, hence the 4 px allowance.
      // Decoration may overhang: a part with no text whose every element is
      // hidden from assistive tech (a pixel mark set beside a word, say).
      const decorative = (node: Element): boolean =>
        !node.textContent?.trim() &&
        (node.closest("[aria-hidden='true']") !== null ||
          (node.children.length > 0 && [...node.children].every(decorative)));
      // A part inside a sideways scroller (a filter row on phones) is one
      // swipe or Tab away, not lost in the gutter; the scroller itself is
      // still checked.
      const scrolled = (node: Element, wrap: Element): boolean => {
        let up = node.parentElement;
        while (up && up !== wrap) {
          if (/auto|scroll/.test(getComputedStyle(up).overflowX)) return true;
          up = up.parentElement;
        }
        return false;
      };
      for (const wrap of document.querySelectorAll<HTMLElement>(".ds-wrap")) {
        const box = wrap.getBoundingClientRect();
        const style = getComputedStyle(wrap);
        const start = box.left + parseFloat(style.paddingLeft) - 4;
        const end = box.right - parseFloat(style.paddingRight) + 4;
        for (const el of wrap.querySelectorAll<HTMLElement>("*")) {
          const rect = el.getBoundingClientRect();
          if (rect.width <= 1 || rect.height <= 1) continue; // visually hidden
          if (decorative(el)) continue;
          if (bleeds && el.closest(bleeds)) continue;
          if (scrolled(el, wrap)) continue;
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
        if (rect.width <= 1 || rect.height <= 1) continue; // visually hidden
        if (parseFloat(getComputedStyle(el).fontSize) < 12) {
          problems.push(`small text: "${text.slice(0, 30)}"`);
        }
      }
      for (const el of document.querySelectorAll<HTMLElement>(targets)) {
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
    },
    { bleeds, targets },
  );
}

/**
 * In forced colours, ringed parts keep an edge and pixel art goes away.
 * Both are selectors: the parts that carry a ring, and the pixel art.
 */
export function forcedColorsProblems(
  page: Page,
  { ringed, art }: { ringed: string; art: string },
): Promise<string[]> {
  return page.evaluate(
    ({ ringed, art }) => {
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
      for (const el of document.querySelectorAll<HTMLElement>(art)) {
        if (getComputedStyle(el).display !== "none") {
          out.push(`still drawn: .${[...el.classList].join(".")}`);
        }
      }
      return out;
    },
    { ringed, art },
  );
}

export interface TextOptions {
  /** Where to look: `main` for the page's own text, `body` for all of it. */
  scope?: "main" | "body";
  /** Parts whose text may run past their box (a marquee), as one selector. */
  skip?: string;
}

/** WCAG 1.4.12 text spacing; then any text its box clips. */
export async function clippedText(
  page: Page,
  { scope = "body", skip = "" }: TextOptions = {},
): Promise<string[]> {
  await page.addStyleTag({
    content:
      "*, *::before, *::after { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; } p { margin-bottom: 2em !important; }",
  });
  return page.evaluate(
    ({ scope, skip }) => {
      const out: string[] = [];
      for (const el of document.querySelectorAll<HTMLElement>(`${scope} *`)) {
        const ownText = [...el.childNodes].some(
          (n) => n.nodeType === Node.TEXT_NODE && n.textContent?.trim(),
        );
        if (!ownText || (skip && el.closest(skip))) continue;
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
    },
    { scope, skip },
  );
}

/**
 * WCAG 1.4.4 and 1.4.10 through zoom: at 500% (a 1280 px window shows 256
 * CSS px) text reaches twice its size at 100%, and at 200% (640 px) nothing
 * scrolls sideways. `scope` is where the `t-*` text styles are read.
 */
export async function zoomShortfalls(
  page: Page,
  scope: "main" | "body" = "body",
): Promise<string[]> {
  const sizes = () =>
    page.evaluate((scope) => {
      const out: Record<string, number> = {};
      document.querySelectorAll<HTMLElement>(`${scope} *`).forEach((el, i) => {
        const style = [...el.classList].find((c) => c.startsWith("t-"));
        if (style)
          out[`${i} .${style}`] = parseFloat(getComputedStyle(el).fontSize);
      });
      return out;
    }, scope);
  await page.setViewportSize({ width: 1280, height: 800 });
  const base = await sizes();
  await page.setViewportSize({ width: 640, height: 400 });
  const out: string[] = [];
  const reflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  if (reflow > 1) out.push(`${reflow}px sideways at 200% zoom`);
  await page.setViewportSize({ width: 256, height: 160 });
  const zoomed = await sizes();
  for (const [key, px] of Object.entries(base)) {
    const at500 = (zoomed[key] ?? 0) * 5;
    if (at500 < px * 2 - 0.5) {
      out.push(`${key}: ${px}px at 100%, at most ${at500.toFixed(1)}px zoomed`);
    }
  }
  return out;
}

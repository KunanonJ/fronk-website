import { readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test, type Locator, type Page } from "@playwright/test";
import { extractPage } from "../../lib/parity/parity.mjs";

/**
 * Profile redesign, Phase 7 lane D1: the topic hubs in English and Thai and
 * the reading pages (/learn, /examples, /stack, /proof, /build), moved into
 * the redesign's token scope (plan steps 7a, 7b, 7d and 7i).
 *
 * - The content contract: each page's server HTML keeps the h1, title,
 *   languages and JSON-LD the parity reference holds, the way
 *   scripts/parity-crawl.mjs reads them.
 * - The device matrix (design spec 10.1): every page at 344, 390, 820, 882,
 *   1180 and 1440 px, with no sideways scroll, nothing in the side gutter,
 *   no text under 12 px and no control under 24 px.
 * - The best-practice checks (forced colors, text spacing, zoom, request
 *   origins) on a hub in each language, the short Thai hub and two reading
 *   pages (plan gate 7: one page per family, the Thai hubs among them).
 * - Thai typography (plan step 7b): Noto Sans Thai, body text at 1.7 or
 *   more, no tracking or capitals on Thai labels, no slanted Thai, English
 *   chrome marked as English.
 * - The hubs' FAQ disclosures and language switch by keyboard.
 *
 * profile.spec.ts holds every scoped page to the fit check in each project,
 * a11y.spec.ts runs axe with WCAG 2.2 on them (routes.ts), and smoke.spec.ts
 * covers the filters after hydration and the recruiter path.
 */

const HUBS = [
  "/topics/ai-transformation-thailand",
  "/topics/erp-crm-internal-systems",
  "/topics/tech-startup-thailand-sea",
  "/topics/forward-deployed-ai-engineering",
  "/th/topics/ai-transformation-thailand",
  "/th/topics/erp-crm-internal-systems",
  "/th/topics/tech-startup-thailand-sea",
  "/th/topics/forward-deployed-ai-engineering",
] as const;
const READING = ["/learn", "/examples", "/stack", "/proof", "/build"] as const;
const PAGES = [...HUBS, ...READING];
const FDE = "/topics/forward-deployed-ai-engineering";
const FDE_TH = "/th/topics/forward-deployed-ai-engineering";
/** Plan gate 7: one page per family, the Thai hubs among them. */
const BEST_PRACTICE_PAGES = [
  FDE,
  FDE_TH,
  "/th/topics/tech-startup-thailand-sea",
  "/stack",
  "/proof",
] as const;

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

/**
 * Puts the keyboard's starting point on `place` (a heading, say), as reading
 * up to it would: a script focus on plain text, which the next Tab leaves.
 */
async function startAt(place: Locator) {
  await place.evaluate((el) => {
    if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "-1");
    (el as HTMLElement).focus({ preventScroll: true });
  });
}

/**
 * Presses Tab until `target` has focus, as a keyboard reader moves; WebKit
 * moves to links and buttons with Option+Tab, as Safari does by default.
 */
async function tabTo(page: Page, target: Locator, most = 12) {
  const webkit = page.context().browser()?.browserType().name() === "webkit";
  for (let presses = 0; presses < most; presses += 1) {
    if (await target.evaluate((el) => el === document.activeElement)) break;
    await page.keyboard.press(webkit ? "Alt+Tab" : "Tab");
  }
  await expect(target).toBeFocused();
}

function only(projects: ReadonlySet<string>, why: string) {
  test.skip(!projects.has(test.info().project.name), `runs in ${why}`);
}
const DESKTOP = new Set(["desktop"]);
const BEHAVIOUR = new Set(["desktop", "webkit-phone"]);

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
    // A part that crosses its .ds-wrap's padding into the side gutter. Font
    // metrics differ between machines, so a part 19 px into the gutter on a
    // Mac was 8 px past the screen in CI. A rotated mark's box overhangs by
    // up to 3 px, hence the 4 px allowance.
    for (const wrap of document.querySelectorAll<HTMLElement>(".ds-wrap")) {
      const box = wrap.getBoundingClientRect();
      const style = getComputedStyle(wrap);
      const start = box.left + parseFloat(style.paddingLeft) - 4;
      const end = box.right - parseFloat(style.paddingRight) + 4;
      for (const el of wrap.querySelectorAll<HTMLElement>("*")) {
        const rect = el.getBoundingClientRect();
        if (rect.width <= 1 || rect.height <= 1) continue; // visually hidden
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

const reference = JSON.parse(
  readFileSync(join(process.cwd(), "tests/fixtures/site-parity.json"), "utf8"),
) as Record<
  string,
  {
    title: string;
    h1: string;
    htmlLang: string;
    mainLang: string | null;
    jsonLd: string[];
  }
>;

test.describe("the content contract: what the parity gate reads stays (desktop Chromium)", () => {
  for (const path of PAGES) {
    test(`${path} keeps its h1, title, languages and JSON-LD`, async ({
      page,
    }) => {
      only(DESKTOP, "desktop Chromium");
      // The server's HTML, as a crawler that runs no script sees it.
      const response = await page.request.get(path);
      expect(response.status()).toBe(200);
      const seen = extractPage(await response.text());
      const want = reference[path]!;
      expect(seen.h1, "h1").toBe(want.h1);
      expect(seen.title, "title").toBe(want.title);
      expect(seen.htmlLang, "<html lang>").toBe(want.htmlLang);
      expect(seen.mainLang, "<main lang>").toBe(want.mainLang);
      expect(seen.jsonLd, "JSON-LD").toEqual(want.jsonLd);
      // And the page is in the redesign's token scope.
      await prepare(page);
      await page.goto(path, { waitUntil: "domcontentloaded" });
      await expect(page.locator("html")).toHaveAttribute(
        "data-design",
        "profile",
      );
    });
  }
});

test.describe("the device matrix (desktop Chromium)", () => {
  for (const path of PAGES) {
    test(`${path} holds at 344, 390, 820, 882, 1180 and 1440 px`, async ({
      page,
    }) => {
      only(DESKTOP, "desktop Chromium");
      await page.emulateMedia({ reducedMotion: "reduce" });
      await prepare(page);
      await page.goto(path, { waitUntil: "networkidle" });
      for (const width of [344, 390, 820, 882, 1180, 1440]) {
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

/** In forced colors, ringed parts keep an edge and pixel art goes away. */
async function forcedColorsProblems(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const out: string[] = [];
    const ringed = document.querySelectorAll<HTMLElement>(
      "main :is(.ds-pill, .ds-chip, .ds-badge, .ds-tile, .pf-filter, .pf-case-hire, .pf-read-stat, .pf-read-ticket)",
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
      "main :is(.ds-px-mark, .ds-px-dot, .ds-dither, .pf-page-hero__sky)",
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
    for (const el of document.querySelectorAll<HTMLElement>("main *")) {
      const ownText = [...el.childNodes].some(
        (n) => n.nodeType === Node.TEXT_NODE && n.textContent?.trim(),
      );
      if (!ownText) continue;
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

/**
 * WCAG 1.4.4 and 1.4.10 through zoom: at 500% (a 1280 px window shows 256
 * CSS px) text reaches twice its size at 100%, and at 200% (640 px) nothing
 * scrolls sideways.
 */
async function zoomShortfalls(page: Page): Promise<string[]> {
  const sizes = () =>
    page.evaluate(() => {
      const out: Record<string, number> = {};
      document.querySelectorAll<HTMLElement>("main *").forEach((el, i) => {
        const style = [...el.classList].find((c) => c.startsWith("t-"));
        if (style)
          out[`${i} .${style}`] = parseFloat(getComputedStyle(el).fontSize);
      });
      return out;
    });
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

test.describe("best practices on a page per family (desktop Chromium)", () => {
  for (const path of BEST_PRACTICE_PAGES) {
    test(`forced colors keep edges and drop the pixel art (${path})`, async ({
      page,
    }) => {
      only(DESKTOP, "desktop Chromium");
      await page.emulateMedia({ forcedColors: "active" });
      await prepare(page);
      await page.goto(path, { waitUntil: "networkidle" });
      expect(await forcedColorsProblems(page)).toEqual([]);
    });

    test(`text spacing clips no text (${path})`, async ({ page }) => {
      only(DESKTOP, "desktop Chromium");
      await page.emulateMedia({ reducedMotion: "reduce" });
      await prepare(page);
      await page.goto(path, { waitUntil: "networkidle" });
      expect(await clippedText(page)).toEqual([]);
    });

    test(`zoom doubles the text and scrolls nothing sideways (${path})`, async ({
      page,
    }) => {
      only(DESKTOP, "desktop Chromium");
      await prepare(page);
      await page.goto(path, { waitUntil: "networkidle" });
      expect(await zoomShortfalls(page)).toEqual([]);
    });
  }

  test("no page asks another origin for anything", async ({
    page,
    baseURL,
  }) => {
    only(DESKTOP, "desktop Chromium");
    const origins = new Set<string>();
    page.on("request", (request) => {
      const url = request.url();
      if (/^https?:/.test(url)) origins.add(new URL(url).origin);
    });
    await prepare(page);
    for (const path of PAGES)
      await page.goto(path, { waitUntil: "networkidle" });
    const allowed = new Set([
      new URL(baseURL!).origin,
      "https://static.cloudflareinsights.com",
      "https://cloudflareinsights.com",
    ]);
    expect([...origins].filter((origin) => !allowed.has(origin))).toEqual([]);
  });
});

test.describe("Thai typography (plan step 7b)", () => {
  test("Thai pages say so, and the English chrome says it is English", async ({
    page,
  }) => {
    only(BEHAVIOUR, "desktop Chromium and the WebKit phone");
    await prepare(page);
    await page.goto(FDE_TH, { waitUntil: "networkidle" });
    await expect(page.locator("html")).toHaveAttribute("lang", "th");
    await expect(page.locator("main")).toHaveAttribute("lang", "th");
    for (const chrome of [
      "header[data-site-chrome]",
      "footer[data-site-chrome]",
      "a.ds-skip",
    ]) {
      await expect(page.locator(chrome), chrome).toHaveAttribute("lang", "en");
    }
    // English words on the page are marked: the switch, Share, the address.
    await expect(
      page.getByRole("navigation", { name: "Language" }),
    ).toHaveAttribute("lang", "en");
    await expect(page.getByText("Share", { exact: true })).toHaveAttribute(
      "lang",
      "en",
    );
  });

  test("Thai text sets loose and upright, its labels without capitals or tracking", async ({
    page,
  }) => {
    only(BEHAVIOUR, "desktop Chromium and the WebKit phone");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await prepare(page);
    await page.goto(FDE_TH, { waitUntil: "networkidle" });
    const styles = await page.evaluate(() => {
      const ratio = (el: Element) => {
        const s = getComputedStyle(el);
        return parseFloat(s.lineHeight) / parseFloat(s.fontSize);
      };
      const all = (selector: string) => [
        ...document.querySelectorAll(selector),
      ];
      const body = [
        ".pf-page-hero__lead",
        ".pf-read-avail",
        ".pf-case-prose p",
        ".pf-hub-facts__item",
        ".pf-faq__answer",
        ".pf-hub-contact__text",
      ].flatMap((selector) =>
        all(selector).map((el) => ({ selector, ratio: ratio(el) })),
      );
      const labels = all(".t-meta, .t-kicker").filter((el) =>
        /[฀-๿]/.test(el.textContent ?? ""),
      );
      const h1 = document.querySelector("h1")!;
      return {
        body,
        labels: labels.map((el) => {
          const s = getComputedStyle(el);
          return `${s.textTransform} ${s.letterSpacing}`;
        }),
        h1: {
          spacing: getComputedStyle(h1).letterSpacing,
          ratio: ratio(h1),
          synthesis: getComputedStyle(h1.lastElementChild!).fontSynthesisStyle,
        },
      };
    });
    expect(styles.body.length).toBeGreaterThan(4);
    for (const { selector, ratio } of styles.body) {
      expect(ratio, selector).toBeGreaterThanOrEqual(1.7);
    }
    expect(styles.labels.length).toBeGreaterThan(1);
    for (const label of styles.labels) expect(label).toBe("none normal");
    expect(styles.h1.spacing).toBe("normal");
    expect(styles.h1.ratio).toBeGreaterThanOrEqual(1.35);
    // Noto Sans Thai has no italic: the accent line stays upright.
    expect(styles.h1.synthesis).toBe("none");
  });

  test("Thai glyphs render in Noto Sans Thai, in the serif's lines and the mono labels", async ({
    page,
  }) => {
    only(DESKTOP, "desktop Chromium (the DevTools protocol)");
    await prepare(page);
    await page.goto(FDE_TH, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    const client = await page.context().newCDPSession(page);
    await client.send("DOM.enable");
    await client.send("CSS.enable");
    const { root } = await client.send("DOM.getDocument", { depth: -1 });
    const fontsOf = async (selector: string) => {
      const { nodeId } = await client.send("DOM.querySelector", {
        nodeId: root.nodeId,
        selector,
      });
      const { fonts } = await client.send("CSS.getPlatformFontsForNode", {
        nodeId,
      });
      return fonts.map((font) => font.familyName);
    };
    // The h1's first line: Thai, then "AI" in the serif.
    expect(await fontsOf("h1 > .pf-page-hero__line")).toEqual(
      expect.arrayContaining(["Noto Sans Thai", "Instrument Serif"]),
    );
    // A mono label: JetBrains Mono has no Thai, so Thai falls back.
    expect(await fontsOf("#card-proof > span:last-child")).toContain(
      "Noto Sans Thai",
    );
    // Body text and a chapter's heading.
    expect(await fontsOf(".pf-page-hero__lead")).toContain("Noto Sans Thai");
    expect(await fontsOf("section.pf-case-chapter h2")).toContain(
      "Noto Sans Thai",
    );
  });
});

test.describe("the hubs by keyboard", () => {
  test("Tab reaches the FAQ's questions; Space and Enter open and close them", async ({
    page,
  }) => {
    only(BEHAVIOUR, "desktop Chromium and the WebKit phone");
    await prepare(page);
    await page.goto(FDE, { waitUntil: "networkidle" });
    const faq = page.getByRole("region", { name: "FAQ" });
    const items = faq.locator("details");
    await expect(items).toHaveCount(3);
    await expect(items.first()).toHaveAttribute("open", "");
    // Closed answers are still in the HTML: the FAQPage JSON-LD's text.
    await expect(items.nth(1).locator(".pf-faq__answer")).toBeAttached();
    const first = items.nth(0).locator("summary");
    const second = items.nth(1).locator("summary");
    // From the FAQ's heading, as a reader arrives at it.
    await startAt(page.locator("#card-faq"));
    await tabTo(page, first);
    await page.keyboard.press("Space");
    await expect(items.nth(0)).not.toHaveAttribute("open", "");
    await tabTo(page, second);
    await page.keyboard.press("Enter");
    await expect(items.nth(1)).toHaveAttribute("open", "");
    await expect(items.nth(1).locator(".pf-faq__answer")).toBeVisible();
    await page.keyboard.press("Space");
    await expect(items.nth(1)).not.toHaveAttribute("open", "");
  });

  test("Tab reaches the language switch, and Enter on ไทย opens the Thai hub", async ({
    page,
  }) => {
    only(BEHAVIOUR, "desktop Chromium and the WebKit phone");
    await prepare(page);
    await page.goto(FDE, { waitUntil: "networkidle" });
    const nav = page.getByRole("navigation", { name: "Language" });
    await expect(nav.getByRole("link", { name: "English" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    // From the eyebrow beside the switch: English, then ไทย.
    await startAt(page.locator(".pf-page-hero__eyebrow"));
    const thai = nav.getByRole("link", { name: "ไทย" });
    await tabTo(page, thai);
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(new RegExp(`${FDE_TH}$`));
    await expect(page.locator("main")).toHaveAttribute("lang", "th");
    await expect(page.locator("html")).toHaveAttribute("lang", "th");
    await expect(
      page
        .getByRole("navigation", { name: "Language" })
        .getByRole("link", { name: "ไทย" }),
    ).toHaveAttribute("aria-current", "page");
  });
});

test.describe("the FDE hub's hiring path and printing", () => {
  test("the hiring buttons and the contact panel lead to the hiring form", async ({
    page,
  }) => {
    only(BEHAVIOUR, "desktop Chromium and the WebKit phone");
    await prepare(page);
    await page.goto(FDE, { waitUntil: "networkidle" });
    const hero = page.locator('section[aria-labelledby="hero-title"]');
    await expect(hero.getByRole("link", { name: "Résumé" })).toHaveAttribute(
      "href",
      "/resume",
    );
    const panel = page.getByRole("article", { name: "Contact", exact: true });
    await expect(panel.getByRole("link", { name: "Contact" })).toHaveAttribute(
      "href",
      "/contact?topic=hiring",
    );
    await expect(
      panel.getByRole("link", { name: "fronk.kunanon@gmail.com" }),
    ).toHaveAttribute("href", "mailto:fronk.kunanon@gmail.com");
  });

  // The hubs and About share the FAQ list: printing opens every answer.
  for (const path of [FDE, "/th/topics/ai-transformation-thailand", "/about"]) {
    test(`printing opens every FAQ answer, and closes them after (${path})`, async ({
      page,
    }) => {
      only(DESKTOP, "desktop Chromium");
      await prepare(page);
      await page.goto(path, { waitUntil: "networkidle" });
      const items = page.locator(".pf-faq details");
      expect(await items.count()).toBeGreaterThan(1);
      const states = () =>
        items.evaluateAll((all) =>
          all.map((item) => (item as HTMLDetailsElement).open),
        );
      const before = await states();
      expect(before).toContain(false);
      await page.evaluate(() => window.dispatchEvent(new Event("beforeprint")));
      expect(await states()).toEqual(before.map(() => true));
      await page.evaluate(() => window.dispatchEvent(new Event("afterprint")));
      expect(await states()).toEqual(before);
    });
  }
});

test.describe("the reading pages' pickable tiles (desktop Chromium)", () => {
  test("Proof's metrics and Examples' personas keep the site's hand cursor", async ({
    page,
  }) => {
    only(DESKTOP, "desktop Chromium");
    await prepare(page);
    for (const [path, name] of [
      ["/proof", /220\+/],
      ["/examples", /Founders/],
    ] as const) {
      await page.goto(path, { waitUntil: "networkidle" });
      const cursor = await page
        .getByRole("button", { name })
        .evaluate((el) => getComputedStyle(el).cursor);
      expect(cursor, path).toContain("hand.svg");
    }
  });
});

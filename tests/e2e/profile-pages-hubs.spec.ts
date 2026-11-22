import { readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test, type Locator } from "@playwright/test";
import {
  clippedText,
  forcedColorsProblems,
  layoutProblems,
  prepare,
  tabTo,
  zoomShortfalls,
} from "./matrix";
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
const READING = [
  "/learn",
  "/examples",
  "/stack",
  "/proof",
  "/build",
  "/open-source",
] as const;
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
  "/open-source",
] as const;

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

function only(projects: ReadonlySet<string>, why: string) {
  test.skip(!projects.has(test.info().project.name), `runs in ${why}`);
}
const DESKTOP = new Set(["desktop"]);
const BEHAVIOUR = new Set(["desktop", "webkit-phone"]);

/** The hubs' choices for the shared checks (./matrix.ts). */
const HUB_LAYOUT = { moreTargets: "[role='button']" };
const HUB_FORCED = {
  ringed:
    "main :is(.ds-pill, .ds-chip, .ds-badge, .ds-tile, .pf-filter, .pf-case-work, .pf-read-stat, .pf-read-ticket)",
  art: "main :is(.ds-px-mark, .ds-px-dot, .ds-dither, .pf-page-hero__sky)",
};

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
        expect(
          await layoutProblems(page, HUB_LAYOUT),
          `${path} at ${width}px`,
        ).toEqual([]);
      }
    });
  }
});

test.describe("best practices on a page per family (desktop Chromium)", () => {
  for (const path of BEST_PRACTICE_PAGES) {
    test(`forced colors keep edges and drop the pixel art (${path})`, async ({
      page,
    }) => {
      only(DESKTOP, "desktop Chromium");
      await page.emulateMedia({ forcedColors: "active" });
      await prepare(page);
      await page.goto(path, { waitUntil: "networkidle" });
      expect(await forcedColorsProblems(page, HUB_FORCED)).toEqual([]);
    });

    test(`text spacing clips no text (${path})`, async ({ page }) => {
      only(DESKTOP, "desktop Chromium");
      await page.emulateMedia({ reducedMotion: "reduce" });
      await prepare(page);
      await page.goto(path, { waitUntil: "networkidle" });
      expect(await clippedText(page, { scope: "main" })).toEqual([]);
    });

    test(`zoom doubles the text and scrolls nothing sideways (${path})`, async ({
      page,
    }) => {
      only(DESKTOP, "desktop Chromium");
      await prepare(page);
      await page.goto(path, { waitUntil: "networkidle" });
      expect(await zoomShortfalls(page, "main")).toEqual([]);
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
  test("a Thai path typed in another case still says Thai", async ({
    page,
  }) => {
    only(BEHAVIOUR, "desktop Chromium and the WebKit phone");
    await prepare(page);
    // The router matches paths in any case; <html lang> must agree (WCAG 3.1.1).
    await page.goto(FDE_TH.toUpperCase().replace("/TOPICS/", "/Topics/"), {
      waitUntil: "networkidle",
    });
    await expect(page.locator("html")).toHaveAttribute("lang", "th");
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

/*
 * UX hunt 22-11-26. A browser breaks Thai with a dictionary, which split
 * compounds such as ลงทะเบียน (ลง|ทะเบียน) and the h1's การเปลี่ยนผ่าน
 * across lines, differently in each engine; the hubs keep them whole
 * (lib/content/keepThaiWhole.tsx, and the h1's lines). The words here are
 * the ones the hunt saw split, and two that split inside a syllable.
 */
const THAI_WORDS = [
  "การเปลี่ยนผ่าน",
  "สตาร์ทอัพ",
  "สต็อก",
  "ตัดสินใจ",
  "ลงทะเบียน",
  "กระจัดกระจาย",
  "แชทบอท",
  "ฟินเทค",
];
const THAI_HUBS = HUBS.filter((path) => path.startsWith("/th/"));

test.describe("Thai words stay whole (UX hunt 22-11-26)", () => {
  for (const path of THAI_HUBS) {
    test(`${path}, 320 to 1920 px`, async ({ page }) => {
      only(new Set(["desktop", "webkit", "firefox"]), "each engine");
      await page.emulateMedia({ reducedMotion: "reduce" });
      await prepare(page);
      await page.goto(path, { waitUntil: "networkidle" });
      await page.evaluate(() => document.fonts.ready);
      for (const width of [320, 390, 768, 1024, 1280, 1440, 1920]) {
        await page.setViewportSize({ width, height: 900 });
        // Let vw units and the layout settle at the new width (WebKit and
        // Chromium can measure a frame at the old one).
        await page.evaluate(
          () =>
            new Promise<void>((done) =>
              requestAnimationFrame(() => requestAnimationFrame(() => done())),
            ),
        );
        const split = await page.evaluate((words) => {
          const out: string[] = [];
          const blocks = document.querySelectorAll(
            "main :is(h1, h2, h3, p, li, dd, summary)",
          );
          for (const block of blocks) {
            // The innermost block that holds the text, once.
            if (block.querySelector("p, li, h2, h3, dd")) continue;
            const text = block.textContent ?? "";
            for (const word of words) {
              for (
                let at = text.indexOf(word);
                at >= 0;
                at = text.indexOf(word, at + 1)
              ) {
                const tops: number[] = [];
                const walker = document.createTreeWalker(
                  block,
                  NodeFilter.SHOW_TEXT,
                );
                let seen = 0;
                for (let node = walker.nextNode(); node;) {
                  const length = node.textContent!.length;
                  const from = Math.max(at, seen);
                  const to = Math.min(at + word.length, seen + length);
                  if (from < to) {
                    const range = document.createRange();
                    range.setStart(node, from - seen);
                    range.setEnd(node, to - seen);
                    for (const rect of range.getClientRects()) {
                      if (rect.width > 0) tops.push(rect.top);
                    }
                  }
                  seen += length;
                  node = walker.nextNode();
                }
                if (tops.length && Math.max(...tops) - Math.min(...tops) > 8) {
                  out.push(`${word} in ${block.tagName.toLowerCase()}`);
                }
              }
            }
          }
          return out;
        }, THAI_WORDS);
        expect(split, `${path} at ${width} px`).toEqual([]);
      }
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth - window.innerWidth,
        ),
        "no sideways scroll",
      ).toBeLessThanOrEqual(1);
    });
  }
});

/*
 * UX hunt 22-11-26: while Noto Sans Thai loads, Thai is drawn in a system
 * Thai face sized to Noto (src/styles/fonts.css), so the Thai hubs keep
 * their lines when Noto arrives; the h1 lost one before (a layout shift of
 * 0.02 to 0.2). Desktop Chromium: Firefox skips later web-font families
 * while one loads, and WebKit keeps a line that is within 2% of full only
 * with Noto. The system faces differ by machine, so the check runs where
 * one of the faces the fallback names is installed.
 */
test.describe("the Thai hubs keep their lines when Noto Sans Thai arrives (UX hunt 22-11-26)", () => {
  for (const path of [
    "/th/topics/ai-transformation-thailand",
    "/th/topics/tech-startup-thailand-sea",
  ]) {
    test(`${path} at 390, 1024 and 1440 px`, async ({ page }) => {
      only(DESKTOP, "desktop Chromium");
      await page.emulateMedia({ reducedMotion: "reduce" });
      await prepare(page);
      for (const width of [390, 1024, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        let release: () => void = () => {};
        const held = new Promise<void>((done) => (release = done));
        await page.route(/noto-sans-thai-thai[^/]*\.woff2/, async (route) => {
          await held;
          await route.continue();
        });
        await page.goto(path, { waitUntil: "domcontentloaded" });
        const installed = await page.evaluate(async () => {
          const sources = [
            'local("Noto Sans Thai Regular")',
            "local(Thonburi)",
            "local(Tahoma)",
          ];
          const found = await Promise.all(
            sources.map((source) =>
              new FontFace("probe", source).load().then(
                () => true,
                () => false,
              ),
            ),
          );
          return found.includes(true);
        });
        test.skip(!installed, "no system Thai face the fallback names");
        const heights = () =>
          page.evaluate(() =>
            ["main h1", ".pf-page-hero__lead"].map(
              (selector) =>
                document.querySelector(selector)!.getBoundingClientRect()
                  .height,
            ),
          );
        const thaiLoaded = () =>
          page.evaluate(() =>
            document.fonts.check('16px "Noto Sans Thai"', "ไทย"),
          );
        await page.waitForTimeout(300);
        expect(await thaiLoaded(), "Noto is held").toBe(false);
        const before = await heights();
        release();
        await expect.poll(thaiLoaded).toBe(true);
        await page.evaluate(
          () =>
            new Promise<void>((done) =>
              requestAnimationFrame(() => requestAnimationFrame(() => done())),
            ),
        );
        const after = await heights();
        for (const [index, height] of after.entries()) {
          expect(
            Math.abs(height - before[index]!),
            `${["h1", "lede"][index]} at ${width} px`,
          ).toBeLessThan(2);
        }
        await page.unrouteAll({ behavior: "ignoreErrors" });
      }
    });
  }
});

/*
 * UX hunt 22-11-26: the reading pages' h1 measure was 18ch, and ch is
 * measured on the face in use, so before Instrument Serif arrived the
 * measure was 9% narrower and /build's h1 took a line more (a layout shift
 * of 0.12 to 0.14 when it arrived). In em, the lines hold.
 */
test.describe("the reading pages' h1 keeps its lines when its face arrives (UX hunt 22-11-26)", () => {
  test("/build at 390 and 1440 px", async ({ page }) => {
    // Desktop Chromium, where the shift was measured. Firefox leaves the
    // size-adjusted "Instrument Serif Fallback" unloaded while the face
    // loads, so it draws the system serif until then, measure or not; and
    // WebKit marks a font file held here as failed, so it cannot be held.
    only(DESKTOP, "desktop Chromium");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await prepare(page);
    for (const width of [390, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      let release: () => void = () => {};
      const held = new Promise<void>((done) => (release = done));
      await page.route(/instrument-serif-latin[^/]*\.woff2/, async (route) => {
        await held;
        await route.continue();
      });
      await page.goto("/build", { waitUntil: "domcontentloaded" });
      const h1 = page.getByRole("heading", { level: 1 });
      await expect(h1).toBeVisible();
      const loaded = () =>
        page.evaluate(() =>
          document.fonts.check('400 48px "Instrument Serif"', "Build"),
        );
      expect(await loaded(), "the face is held").toBe(false);
      // The fallback face is Times New Roman sized to the serif; where it
      // is not installed (most Linux), the system serif differs in width
      // whatever the measure, so only the measure is held to account there.
      const sized = await page.evaluate(() =>
        new FontFace("probe", 'local("Times New Roman")').load().then(
          () => true,
          () => false,
        ),
      );
      const read = () =>
        h1.evaluate((el) => ({
          measure: getComputedStyle(el).maxInlineSize,
          height: el.getBoundingClientRect().height,
        }));
      const before = await read();
      release();
      await expect.poll(loaded).toBe(true);
      await page.evaluate(
        () =>
          new Promise<void>((done) =>
            requestAnimationFrame(() => requestAnimationFrame(() => done())),
          ),
      );
      const after = await read();
      expect(after.measure, `the measure at ${width} px`).toBe(before.measure);
      if (sized) {
        expect(
          Math.abs(after.height - before.height),
          `the h1's height at ${width} px`,
        ).toBeLessThan(2);
      }
      await page.unrouteAll({ behavior: "ignoreErrors" });
    }
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

test.describe("the FDE hub's work path and printing", () => {
  test("the work buttons and the contact panel lead to the project form", async ({
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
    await expect(
      hero.getByRole("link", { name: "Work with me" }),
    ).toHaveAttribute("href", "/contact?topic=project");
    const panel = page.getByRole("article", { name: "Contact", exact: true });
    await expect(
      panel.getByRole("link", { name: "Work with me" }),
    ).toHaveAttribute("href", "/contact?topic=project");
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

import { expect, test, type Locator, type Page } from "@playwright/test";
import {
  clippedText,
  forcedColorsProblems,
  layoutProblems,
  prepare,
  tabTo,
  zoomShortfalls,
} from "./matrix";

/**
 * Profile redesign, Phase 7 group D2 (process/features/profile-site-redesign,
 * phase 7 steps 7c, 7e to 7i): /skills and the skill pages, /resume, the 404,
 * /design, and the hidden /blog and /press, in the new design. axe runs
 * WCAG 2.2 on every route in both themes (a11y.spec.ts) and profile.spec.ts
 * checks their fit on every project. Here,
 * in desktop Chromium:
 *
 * - the device matrix (design spec 10.1): every page holds at 344, 390, 820,
 *   882, 1180 and 1440 px, with nothing in the side gutter;
 * - one page per family through the best-practice checks of
 *   references/best-practices-audit_18-11-26.md (forced colors, text
 *   spacing, zoom, more contrast, request origins; plan gate 7). Each check
 *   first fails a fixture, so a check that stops catching anything fails;
 * - what jsdom cannot see: the résumé's layout, its print, the 404's scope,
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

/** Opens a page and checks it answered (the 404 answers 404, on purpose). */
async function open(page: Page, path: string) {
  const res = await page.goto(path, { waitUntil: "networkidle" });
  expect(res?.status(), path).toBe(path === PAGES.notFound ? 404 : 200);
  await page.evaluate(() => document.fonts.ready);
}

/**
 * Parts that leave the column on purpose: the notebook bleeds to the left
 * edge on phones (design spec 8.7), a marquee's track runs past its clipped
 * frame, and the skill credits' links widen their hit area with a -6 px
 * margin while their text stays on the edge.
 */
const BLEEDS = ".pf-book, .ds-marquee__track, .pf-skill-credits__skill";
/** Pixel art that forced colours hide. */
const ART = ".ds-px-mark, .ds-px-dot, .ds-word-mark, .ds-dither, .pf-art";

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
  ".pf-resume-card",
  ".pf-resume-card__venture",
  ".pf-resume__card",
  ".pf-resume__tile",
  ".pf-resume__badge",
  ".pf-press-card__banner",
  ".pf-blog-banner",
].join(", ");

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
        expect(
          await layoutProblems(page, { bleeds: BLEEDS }),
          `${path} at ${width}px`,
        ).toEqual([]);
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
      expect(
        await forcedColorsProblems(page, { ringed: RINGED, art: ART }),
      ).not.toEqual([]);

      await prepare(page);
      await open(page, path);
      expect(
        await forcedColorsProblems(page, { ringed: RINGED, art: ART }),
      ).toEqual([]);
    });

    test(`text spacing (WCAG 1.4.12) clips no text (${path})`, async ({
      page,
    }) => {
      desktopOnly();
      await page.setContent(
        `<div style="width:120px;height:20px;overflow:hidden;font-size:16px">Text that cannot fit in this box</div>`,
      );
      expect(await clippedText(page, { skip: ".ds-marquee" })).not.toEqual([]);

      await prepare(page);
      await open(page, path);
      expect(await clippedText(page, { skip: ".ds-marquee" })).toEqual([]);
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

  test("the résumé: the facts card beside the copy from 1024 px, under the h1 on phones", async ({
    page,
  }) => {
    await prepare(page);
    await open(page, PAGES.resume);
    const box = async (locator: Locator) => (await locator.boundingBox())!;
    const h1 = page.getByRole("heading", { level: 1 });
    const card = page.locator("section.pf-resume-card");
    const lead = page.locator(".pf-resume__lead");

    await page.setViewportSize({ width: 1440, height: 900 });
    let [title, facts, summary] = await Promise.all([h1, card, lead].map(box));
    // Beside: the card to the right of the h1 and the summary, from the top.
    expect(facts.x).toBeGreaterThan(title.x + title.width);
    expect(facts.x).toBeGreaterThan(summary.x + summary.width);
    expect(facts.y).toBeLessThan(title.y + title.height);
    expect(summary.y).toBeGreaterThan(title.y + title.height);

    await page.setViewportSize({ width: 390, height: 844 });
    [title, facts, summary] = await Promise.all([h1, card, lead].map(box));
    // Under: the h1, then the card, then the summary, in one column.
    expect(facts.y).toBeGreaterThan(title.y + title.height);
    expect(summary.y).toBeGreaterThan(facts.y + facts.height);
    expect(facts.x).toBeCloseTo(summary.x, 0);
  });

  test("the résumé: one timeline, the period left of the role from 768 px and above it on phones", async ({
    page,
  }) => {
    await prepare(page);
    await open(page, PAGES.resume);
    const experience = page.getByRole("article", {
      name: "Experience",
      exact: true,
    });
    await expect(experience.locator("ol")).toHaveCount(1);
    const first = experience.locator(".pf-resume__entry").first();
    const parts = async () => {
      const [when, role] = await Promise.all([
        first.locator(".pf-resume__when").boundingBox(),
        first.locator("h3").boundingBox(),
      ]);
      return { when: when!, role: role! };
    };

    await page.setViewportSize({ width: 1440, height: 900 });
    let { when, role } = await parts();
    expect(when.x + when.width).toBeLessThan(role.x);
    expect(Math.abs(when.y - role.y)).toBeLessThan(8);
    // Periods read as text: 14 px, not uppercase.
    const style = await first.locator(".pf-resume__when").evaluate((el) => {
      const s = getComputedStyle(el);
      return { size: s.fontSize, transform: s.textTransform };
    });
    expect(style).toEqual({ size: "14px", transform: "none" });

    await page.setViewportSize({ width: 390, height: 844 });
    ({ when, role } = await parts());
    expect(when.y + when.height).toBeLessThanOrEqual(role.y + 1);

    // Education beside Training from 768 px, the earlier entries folded.
    await page.setViewportSize({ width: 1440, height: 900 });
    const education = (await page
      .getByRole("article", { name: "Education", exact: true })
      .boundingBox())!;
    const training = (await page
      .getByRole("article", { name: "Training", exact: true })
      .boundingBox())!;
    expect(training.x).toBeGreaterThan(education.x + education.width);
    expect(training.y).toBeCloseTo(education.y, 0);
    const fold = page.locator("details.pf-resume__more");
    await expect(fold).not.toHaveAttribute("open");
    await expect(
      fold.getByRole("heading", { name: "University-era" }),
    ).toBeHidden();
    await fold.locator("summary").click();
    await expect(fold).toHaveAttribute("open");
    await expect(
      fold.getByRole("heading", { name: "University-era" }),
    ).toBeVisible();
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
    // The facts card, its Copy and the folded entries are screen only too.
    await expect(page.locator("section.pf-resume-card")).toBeHidden();
    await expect(page.locator("details.pf-resume__more")).toBeHidden();
    // The bar's offset never reaches the paper.
    const top = await page
      .locator("main#main")
      .evaluate((el) => parseFloat(getComputedStyle(el).paddingTop));
    expect(top).toBe(0);
  });

  test("the 404 is the new status page, with its pixel picture", async ({
    page,
  }) => {
    await prepare(page);
    await open(page, PAGES.notFound);
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

  test("a route that fails shows the new error page, and Try again recovers", async ({
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

  test("the skills pipeline: nine steps in order, each a link to its skill", async ({
    page,
  }) => {
    await prepare(page);
    await open(page, PAGES.skills);
    const steps = page
      .getByRole("article", { name: "The pipeline" })
      .getByRole("listitem");
    await expect(steps).toHaveCount(9);
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
    await tabTo(page, tabs.getByRole("tab", { name: "Claude Code" }), 60);
    await page.keyboard.press("ArrowRight");
    const codex = tabs.getByRole("tab", { name: "Codex" });
    await expect(codex).toHaveAttribute("aria-selected", "true");
    await expect(codex).toBeFocused();
  });

  test("the skills pipeline leaves no step alone on a row, 320 to 1920 px", async ({
    page,
  }) => {
    await prepare(page);
    await open(page, PAGES.skills);
    const steps = page
      .getByRole("article", { name: "The pipeline" })
      .getByRole("listitem");
    await expect(steps).toHaveCount(9);
    /** How many steps sit on each row, top to bottom. */
    const rows = () =>
      steps.evaluateAll((items) => {
        const counts = new Map<number, number>();
        for (const item of items) {
          const top = Math.round(item.getBoundingClientRect().top);
          counts.set(top, (counts.get(top) ?? 0) + 1);
        }
        return [...counts.entries()]
          .sort(([a], [b]) => a - b)
          .map(([, n]) => n);
      });
    // One column on phones; three rows of three from 600 px (two or four
    // columns left the ninth step alone).
    const oneColumn = Array<number>(9).fill(1);
    for (const [width, expected] of [
      [320, oneColumn],
      [390, oneColumn],
      [599, oneColumn],
      [600, [3, 3, 3]],
      [768, [3, 3, 3]],
      [1023, [3, 3, 3]],
      [1024, [3, 3, 3]],
      [1440, [3, 3, 3]],
      [1920, [3, 3, 3]],
    ] as const) {
      await page.setViewportSize({ width, height: 900 });
      await expect
        .poll(rows, { message: `steps per row at ${width} px` })
        .toEqual(expected);
    }
  });
});

/*
 * UX hunt 22-11-26, /skills in each engine: the hero's meta line keeps the
 * maintainer's name whole and on the line of "maintained by" (from 768 px
 * it sat alone on a second line, and Firefox split it), and a tag that
 * wraps at 320 px keeps its two lines inside its box.
 */
test.describe("/skills' hero meta and tags in every engine (UX hunt 22-11-26)", () => {
  test.beforeEach(() => {
    test.skip(
      !["desktop", "webkit", "firefox"].includes(test.info().project.name),
      "runs in desktop Chromium, WebKit and Firefox",
    );
  });

  test("the maintainer's name stays whole, on the line of 'maintained by'", async ({
    page,
  }) => {
    await prepare(page);
    await open(page, PAGES.skills);
    const meta = page.locator(".pf-page-hero .pf-cat-hero__meta");
    for (const width of [390, 768, 1024, 1440, 1920]) {
      await page.setViewportSize({ width, height: 900 });
      // Let vw units and the layout settle at the new width (WebKit and
      // Chromium can measure a frame at the old one).
      await page.evaluate(
        () =>
          new Promise<void>((done) =>
            requestAnimationFrame(() => requestAnimationFrame(() => done())),
          ),
      );
      const lines = await meta.evaluate((p) => {
        const link = p.querySelector("a")!;
        const name = document.createRange();
        name.selectNodeContents(link);
        const nameTops = [
          ...new Set(
            [...name.getClientRects()]
              .filter((rect) => rect.width > 0)
              .map((rect) => Math.round(rect.top)),
          ),
        ];
        // The text before the name, "... maintained by ", ends on this line.
        const before = document.createRange();
        before.setStart(p, 0);
        before.setEndBefore(link);
        const rects = [...before.getClientRects()].filter(
          (rect) => rect.width > 0,
        );
        const byTop = rects[rects.length - 1]!.top;
        return {
          nameRows: nameTops.length,
          sameLine: Math.abs(byTop - nameTops[0]!) < 4,
        };
      });
      expect(lines, `at ${width} px`).toEqual({
        nameRows: 1,
        sameLine: true,
      });
    }
  });

  test("at 320 px a tag that wraps keeps its lines inside its box", async ({
    page,
  }) => {
    await prepare(page);
    await page.setViewportSize({ width: 320, height: 700 });
    await open(page, PAGES.skills);
    const tags = await page.evaluate(() =>
      [...document.querySelectorAll<HTMLElement>(".pf-skill-tag")]
        .filter((tag) => tag.getBoundingClientRect().width > 0)
        .map((tag) => {
          const box = tag.getBoundingClientRect();
          // The text's lines only, not the "Original" tag's drawn mark.
          const rects = [...tag.childNodes]
            .filter((node) => node.nodeType === Node.TEXT_NODE)
            .flatMap((node) => {
              const range = document.createRange();
              range.selectNodeContents(node);
              return [...range.getClientRects()];
            })
            .filter((rect) => rect.width > 0);
          return {
            text: tag.textContent ?? "",
            rows: new Set(rects.map((rect) => Math.round(rect.top))).size,
            inside:
              Math.min(...rects.map((rect) => rect.top)) >= box.top + 1 &&
              Math.max(...rects.map((rect) => rect.bottom)) <= box.bottom - 1,
            radius: parseFloat(getComputedStyle(tag).borderTopLeftRadius),
            height: box.height,
          };
        }),
    );
    const wrapped = tags.filter((tag) => tag.rows > 1);
    // "Adapted from pstack (cursor/plugins)" wraps at this width.
    expect(wrapped.length).toBeGreaterThan(0);
    for (const tag of wrapped) {
      expect(tag.inside, tag.text).toBe(true);
      // A rounded box's corners, not a pill's ends past the text.
      expect(tag.radius, tag.text).toBeLessThanOrEqual(14);
    }
    // A one-line tag stays a 26 px pill, fully round.
    for (const tag of tags.filter((t) => t.rows === 1)) {
      expect(Math.round(tag.height), tag.text).toBe(26);
      expect(tag.radius * 2, tag.text).toBeGreaterThanOrEqual(tag.height - 1);
    }
  });
});

/**
 * The filter rows on phones, one row that scrolls sideways (cutover.css,
 * usePressedInView.ts; UX hunt 2, U07 and U12), in Chromium, WebKit and
 * Firefox. Tab onto an option partly past the row's edge brings all of it
 * and its focus ring (2 px, 3 px out) into the row, which alone moves; and
 * a shade at the edge with more beyond it shows the row scrolls, where the
 * scrollbar shows only while it moves.
 */
test.describe("filter rows on phones", () => {
  const ROWS = ["/portfolio", "/skills", "/build", "/stack"] as const;
  /** How far the focus ring reaches past an option: its outline and offset. */
  const RING = 5;

  test.beforeEach(({ browserName: _browserName }, testInfo) => {
    test.skip(
      !["desktop", "webkit", "firefox"].includes(testInfo.project.name),
      "Chromium, WebKit and Firefox, at the phone widths each test sets",
    );
  });

  for (const path of ROWS) {
    test(`${path}: Tab brings each option wholly into the row at 390 and 320 px`, async ({
      page,
      browserName,
    }) => {
      await prepare(page);
      for (const size of [
        { width: 390, height: 844 },
        { width: 320, height: 640 },
      ]) {
        await page.setViewportSize(size);
        // Not open(): the second visit may answer 304 from the cache.
        await page.goto(path, { waitUntil: "networkidle" });
        await page.evaluate(() => document.fonts.ready);
        const row = page.locator('.pf-filter[role="group"]').first();
        const options = row.locator(".pf-filter__option");
        const count = await options.count();
        expect(count).toBeGreaterThan(2);
        // Room the ring lacks at the scrollport's edges (0 when it all shows).
        const clipped = () =>
          row.evaluate((el, ring) => {
            const option = document.activeElement as HTMLElement;
            const box = el.getBoundingClientRect();
            const at = option.getBoundingClientRect();
            const start = box.left + el.clientLeft;
            const end = start + el.clientWidth;
            return Math.max(0, start - (at.left - ring), at.right + ring - end);
          }, RING);
        const tab = browserName === "webkit" ? "Alt+Tab" : "Tab";
        await options.first().focus();
        // On along the row, then back: either edge.
        for (const [i, key] of [
          ...Array.from({ length: count - 1 }, (_, n) => [n + 1, tab] as const),
          ...Array.from(
            { length: count - 1 },
            (_, n) => [count - 2 - n, `Shift+${tab}`] as const,
          ),
        ]) {
          await page.keyboard.press(key);
          await expect(options.nth(i)).toBeFocused();
          await expect
            .poll(clipped, {
              message: `${path} option ${i + 1} at ${size.width} px (${key})`,
            })
            .toBeLessThanOrEqual(0.5);
        }
        // The row moved, never the page.
        expect(await page.evaluate(() => window.scrollX)).toBe(0);
      }
    });
  }

  test("a phone row draws its edge shades as background, under its options", async ({
    page,
  }) => {
    await prepare(page);
    await page.setViewportSize({ width: 390, height: 844 });
    await open(page, "/portfolio");
    const row = page.getByRole("group", {
      name: "Filter projects by category",
    });
    const style = () =>
      row.evaluate((el) => {
        const css = getComputedStyle(el);
        return {
          image: css.backgroundImage,
          attachment: css.backgroundAttachment,
        };
      });
    // Two covers that move with the options, over two shades that stay
    // (and the row's colour, the last layer).
    const { image, attachment } = await style();
    expect(image.match(/linear-gradient/g)).toHaveLength(2);
    expect(image.match(/radial-gradient/g)).toHaveLength(2);
    expect(attachment.replace(/\s/g, "")).toMatch(/^local,local,scroll,scroll/);
    // From 600 px the row wraps and draws no shade.
    await page.setViewportSize({ width: 600, height: 844 });
    expect((await style()).image).toBe("none");
  });
});

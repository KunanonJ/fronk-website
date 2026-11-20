import { readFileSync } from "node:fs";
import { join } from "node:path";
import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Locator, type Page } from "@playwright/test";
import { extractPage } from "../../lib/parity/parity.mjs";
import { settleDither } from "./screenshots";

/**
 * Profile redesign, Phase 5: the case-study template, on the live
 * /portfolio/<slug> and /ventures/<slug> pages since the Phase 6 cutover (on
 * hidden /preview copies before it; process/features/profile-site-redesign,
 * phase 5 gates 2 to 7, and the device matrix of design spec 10.1).
 *
 * Behaviour runs in desktop Chromium (1440 px) and the WebKit phone (390 px);
 * the widths, the tap areas and the best-practice checks set their own
 * viewports in desktop Chromium; the matrix projects hold the baselines of
 * one case. profile.spec.ts holds what every profile page must meet, and
 * routes.ts gives four of these pages to smoke, axe and visual.
 */

const CASES = [
  { path: "/portfolio/tbh-intranet", name: "TBH Intranet" },
  {
    path: "/portfolio/node-validator-automation",
    name: "Node Validator Automation",
  },
  {
    path: "/portfolio/email-signature-generator",
    name: "Email Signature Generator",
  },
  { path: "/portfolio/ai-automation", name: "AI Automation" },
  { path: "/portfolio/kunanonj-com", name: "kunanonj.com" },
  { path: "/ventures/gogocash", name: "GoGoCash" },
  { path: "/ventures/manut", name: "Manut AI" },
] as const;
const INTRANET = CASES[0].path;
const GOGOCASH = "/ventures/gogocash";
const BEHAVIOUR = new Set(["desktop", "webkit-phone"]);
const MATRIX = new Set(["fold-closed", "fold-open", "tablet-landscape"]);
/** The fixed bar's bottom edge: 32 px down and 48 px tall. */
const BAR_BOTTOM = 80;
/** Where the contents land a chapter: 96 px padding and 16 px margin. */
const CHAPTER_TOP = 112;
/** How long each workflow step stays current (FLOW_TICK, useFlowStep.ts). */
const FLOW_TICK = 1200;
/** axe's WCAG 2.2 AA run, as a11y.spec.ts gives the preview pages. */
const WCAG_22 = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];
/** WCAG 1.4.12's text spacing, as a reader's stylesheet applies it. */
const TEXT_SPACING =
  "*, *::before, *::after { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; } p { margin-bottom: 2em !important; }";

type Theme = "light" | "dark";

async function prepare(page: Page, theme: Theme = "light") {
  await page.addInitScript((value) => {
    try {
      localStorage.setItem("theme", value);
      sessionStorage.setItem("fronk-intro-seen", "1");
    } catch {
      // Storage can be unavailable; the site then uses its default theme.
    }
  }, theme);
}

async function visit(page: Page, path: string = INTRANET) {
  const response = await page.goto(path, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  return response;
}

function only(projects: ReadonlySet<string>, why: string) {
  test.skip(!projects.has(test.info().project.name), why);
}

/** Waits until the page stops scrolling: eight frames at the same place. */
function settle(page: Page) {
  return page.evaluate(
    () =>
      new Promise<void>((done) => {
        let last = -1;
        let still = 0;
        const tick = () => {
          const y = window.scrollY;
          still = y === last ? still + 1 : 0;
          last = y;
          if (still >= 8) done();
          else requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }),
  );
}

function sideways(page: Page): Promise<number> {
  return page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
}

/** Presses Tab until `target` has focus, as a keyboard reader moves. */
async function tabTo(page: Page, target: Locator, most = 12) {
  for (let presses = 0; presses < most; presses += 1) {
    if (await target.evaluate((el) => el === document.activeElement)) return;
    await page.keyboard.press("Tab");
  }
  await expect(target).toBeFocused();
}

/**
 * With motion allowed: scrolls through the page so every waiting block
 * shows, back to the top, and waits until their rise has ended.
 */
async function revealAll(page: Page) {
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
    window.scrollTo({ top: 0, behavior: "instant" });
  });
  await expect(page.locator("[data-reveal].is-pending")).toHaveCount(0);
  await stillFrame(page);
}

/**
 * Waits for a moment when nothing finite is moving: the rises, and the bar
 * fading back in at the top. The workflow's steps change colour every 1.2 s,
 * so such a moment comes quickly. An animation on a scroll or view timeline
 * (the reading line) runs for as long as its timeline is active and moves
 * only with scrolling, so it does not count.
 */
function stillFrame(page: Page) {
  return page.waitForFunction(() =>
    document
      .getAnimations()
      .every(
        (animation) =>
          animation.playState !== "running" ||
          animation.effect?.getTiming().iterations === Infinity ||
          animation.timeline !== document.timeline,
      ),
  );
}

/** The cover's visible SVG labels and the size each one renders at. */
function coverLabels(page: Page) {
  return page.locator(".pf-case-cover").evaluate((cover) =>
    [...cover.querySelectorAll<SVGTextElement>("text")]
      .filter((el) => {
        const box = el.getBoundingClientRect();
        return box.width > 0 && box.height > 0;
      })
      .map((el) => {
        const matrix = el.getScreenCTM();
        const scale = matrix ? Math.hypot(matrix.a, matrix.b) : 1;
        return {
          text: el.textContent ?? "",
          px: parseFloat(getComputedStyle(el).fontSize) * scale,
        };
      }),
  );
}

/**
 * Text that a box with hidden or clipped overflow cuts off. Each run of text
 * is measured against its nearest clipping ancestor on each axis (itself
 * included), so text clipped by a tile it sits in counts too.
 */
function clippedText(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const out: string[] = [];
    const clips = (el: Element, axis: "x" | "y") =>
      /hidden|clip/.test(
        getComputedStyle(el)[axis === "x" ? "overflowX" : "overflowY"],
      );
    // The page itself scrolls: html and body never count as clipping boxes.
    const clipper = (from: Element, axis: "x" | "y") => {
      for (
        let el: Element | null = from;
        el && el !== document.body && el !== document.documentElement;
        el = el.parentElement
      ) {
        if (clips(el, axis)) return el;
      }
      return null;
    };
    const range = document.createRange();
    for (const el of document.querySelectorAll(".pf-case *")) {
      // Visually hidden text (a 1 px box, such as the Share pill's label on
      // phones) is clipped on purpose; a shut disclosure's content is not
      // drawn.
      if (el.closest(".sr-only, details:not([open]) > :not(summary)")) continue;
      const own = el.getBoundingClientRect();
      if (own.width <= 1 || own.height <= 1) continue;
      for (const node of el.childNodes) {
        if (node.nodeType !== Node.TEXT_NODE || !node.textContent?.trim()) {
          continue;
        }
        range.selectNodeContents(node);
        const text = range.getBoundingClientRect();
        if (text.width < 1 || text.height < 1) continue;
        for (const axis of ["x", "y"] as const) {
          const box = clipper(el, axis);
          if (!box) continue;
          // The clipping box's padding box: inside its borders.
          const edge = box.getBoundingClientRect();
          const start =
            axis === "x"
              ? edge.left + box.clientLeft
              : edge.top + box.clientTop;
          const end =
            start + (axis === "x" ? box.clientWidth : box.clientHeight);
          const [from, to] =
            axis === "x" ? [text.left, text.right] : [text.top, text.bottom];
          if (from < start - 1 || to > end + 1) {
            out.push(
              `${axis === "x" ? "sideways" : "downward"} by .${[
                ...box.classList,
              ].join(".")}: "${node.textContent.trim().slice(0, 30)}"`,
            );
          }
        }
      }
    }
    return out;
  });
}

/** A chapter's top edge in the viewport. */
function chapterTop(page: Page, id: string): Promise<number> {
  return page.evaluate(
    (chapter) => document.getElementById(chapter)!.getBoundingClientRect().top,
    id,
  );
}

/**
 * Small, overlapping and covered targets in the template, each scrolled into
 * view first (as the tap-area test in smoke.spec does).
 */
function tapProblems(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const problems: string[] = [];
    const scope = document.querySelector(".pf-case");
    if (!scope) return ["no .pf-case"];
    const name = (el: HTMLElement) =>
      (el.getAttribute("aria-label") || el.innerText || el.tagName)
        .trim()
        .slice(0, 30);
    const targets = [
      ...scope.querySelectorAll<HTMLElement>("a[href], button, summary"),
    ].filter((el) => {
      const box = el.getBoundingClientRect();
      const style = getComputedStyle(el);
      // A closed disclosure's links keep a box in Chromium (its content is
      // skipped, not removed), but nobody can tap them.
      const shut = el.closest("details:not([open])");
      return (
        style.display !== "none" &&
        style.visibility !== "hidden" &&
        !el.closest("[aria-hidden='true']") &&
        !(shut && !el.matches("summary")) &&
        box.width > 1 &&
        box.height > 1
      );
    });
    for (const el of targets) {
      const box = el.getBoundingClientRect();
      // WCAG 2.5.8 exempts links that sit inside a run of text.
      if (getComputedStyle(el).display === "inline" && el.closest("p, li")) {
        continue;
      }
      if (Math.min(box.width, box.height) < 24) {
        problems.push(
          `small ${name(el)} ${box.width.toFixed(0)}x${box.height.toFixed(0)}`,
        );
      }
    }
    for (let i = 0; i < targets.length; i += 1) {
      for (let j = i + 1; j < targets.length; j += 1) {
        const a = targets[i]!.getBoundingClientRect();
        const b = targets[j]!.getBoundingClientRect();
        const x = Math.min(a.right, b.right) - Math.max(a.left, b.left);
        const y = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
        if (x > 0.5 && y > 0.5) {
          problems.push(`overlap ${name(targets[i]!)} / ${name(targets[j]!)}`);
        }
      }
    }
    for (const el of targets) {
      el.scrollIntoView({
        block: "center",
        inline: "center",
        behavior: "instant",
      });
      const box = el.getBoundingClientRect();
      const x = (box.left + box.right) / 2;
      const y = (box.top + box.bottom) / 2;
      const hit = document.elementFromPoint(x, y);
      if (!hit || !el.contains(hit)) {
        problems.push(`covered ${name(el)} by ${hit?.className ?? "nothing"}`);
      }
    }
    // At once: with motion allowed the page's own scrolling is smooth.
    window.scrollTo({ top: 0, behavior: "instant" });
    return problems;
  });
}

test.describe("case pages render (plan gate 2)", () => {
  test.beforeEach(() => only(BEHAVIOUR, "desktop and the WebKit phone"));

  for (const { path, name } of CASES) {
    test(`${path} renders its h1 and throws no JS errors`, async ({ page }) => {
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      page.on("console", (message) => {
        if (
          message.type() === "error" &&
          !/Failed to load resource|net::ERR_/.test(message.text())
        ) {
          errors.push(message.text());
        }
      });
      await prepare(page);
      const response = await visit(page, path);
      expect(response?.status()).toBe(200);
      const h1 = page.getByRole("heading", { level: 1 });
      await expect(h1).toBeVisible();
      await expect(h1).toContainText(name);
      // Live and indexable since the cutover: no noindex.
      await expect(
        page.locator('meta[name="robots"][content*="noindex"]'),
      ).toHaveCount(0);
      expect(errors).toEqual([]);
    });
  }

  test("an unknown case is a 404", async ({ page }) => {
    const project = await page.goto("/portfolio/not-a-case");
    expect(project?.status()).toBe(404);
    const venture = await page.goto("/ventures/not-a-case");
    expect(venture?.status()).toBe(404);
  });
});

test.describe("links into the case pages", () => {
  test.beforeEach(() => only(new Set(["desktop"]), "desktop Chromium"));

  test("every case link on Home resolves to a case page with an h1", async ({
    page,
  }) => {
    await prepare(page);
    await visit(page, "/");
    const hrefs = await page
      .locator('a[href^="/portfolio/"], a[href^="/ventures/"]')
      .evaluateAll((links) => [
        ...new Set(links.map((link) => link.getAttribute("href")!)),
      ]);
    // The canvas mock's frames and the work stack's cards (Phases 2 and 3).
    expect(hrefs.length).toBeGreaterThanOrEqual(5);
    for (const href of hrefs) {
      const response = await page.goto(href, { waitUntil: "networkidle" });
      expect(response?.status(), href).toBe(200);
      await expect(page.getByRole("heading", { level: 1 }), href).toBeVisible();
    }
  });

  test("More projects links each case to another case page", async ({
    page,
  }) => {
    await prepare(page);
    for (const { path } of CASES) {
      await visit(page, path);
      const more = page.getByRole("region", { name: "More projects" });
      const hrefs = await more
        .getByRole("link", { name: /^Read the case study: / })
        .evaluateAll((links) => links.map((l) => l.getAttribute("href")!));
      expect(hrefs, path).toHaveLength(2);
      for (const href of hrefs) {
        expect(href).toMatch(/^\/(portfolio|ventures)\/[a-z-]+$/);
        expect(href).not.toBe(path);
      }
    }
  });
});

test.describe("the evidence rule (plan gate 3)", () => {
  test.beforeEach(() => only(new Set(["desktop"]), "desktop Chromium"));

  // Two cases have cleared outcomes (portfolio.ts); the other two show none.
  for (const [path, outcomes] of [
    [INTRANET, 1],
    ["/portfolio/ai-automation", 1],
    ["/portfolio/node-validator-automation", 0],
    ["/portfolio/email-signature-generator", 0],
  ] as const) {
    test(`${path}: what changed and his part come first, within a screen and a half at 1440 x 900`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.emulateMedia({ reducedMotion: "reduce" });
      await prepare(page);
      await visit(page, path);
      const outcome = page.getByRole("article", {
        name: "Outcome",
        exact: true,
      });
      const part = page.getByRole("article", { name: "My part", exact: true });
      const cover = page.getByRole("article", {
        name: "Interface",
        exact: true,
      });
      const m = (await part.boundingBox())!;
      const c = (await cover.boundingBox())!;
      expect(m.height).toBeLessThan(260);
      expect(c.y).toBeGreaterThanOrEqual(m.y + m.height);
      expect(m.y + m.height).toBeLessThan(1.5 * 900);
      await expect(outcome).toHaveCount(outcomes);
      if (outcomes > 0) {
        const o = (await outcome.boundingBox())!;
        expect(m.y).toBeGreaterThanOrEqual(o.y + o.height);
        expect(Math.abs(o.width - m.width)).toBeLessThan(2);
        expect(o.height).toBeLessThan(260);
        expect(o.y + o.height).toBeLessThan(1.5 * 900);
        await expect(
          outcome.getByRole("link", { name: "As stated in the résumé →" }),
        ).toHaveAttribute("href", "/resume");
      }
    });
  }

  for (const width of [800, 375, 320]) {
    test(`the outcome and his part stack and fit at ${width} px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      await prepare(page);
      await visit(page);
      const o = (await page
        .getByRole("article", { name: "Outcome", exact: true })
        .boundingBox())!;
      const m = (await page
        .getByRole("article", { name: "My part", exact: true })
        .boundingBox())!;
      expect(m.y).toBeGreaterThanOrEqual(o.y + o.height);
      expect(Math.abs(o.width - m.width)).toBeLessThan(2);
      expect(await sideways(page)).toBeLessThanOrEqual(0);
    });
  }

  // The longest figures: drawn, wrapped and inside the screen.
  for (const [path, figure] of [
    ["/portfolio/ai-automation", "10 people to 1 operator"],
    [GOGOCASH, "THB 169,000"],
    [GOGOCASH, "THB 13 million"],
  ] as const) {
    for (const width of [375, 320]) {
      test(`${path} shows "${figure}" on a ${width} px screen without sideways scroll`, async ({
        page,
      }) => {
        await page.setViewportSize({ width, height: 812 });
        await prepare(page);
        await visit(page, path);
        const shown = page.getByText(figure, { exact: true }).first();
        await shown.scrollIntoViewIfNeeded();
        await expect(shown).toBeVisible();
        const box = (await shown.boundingBox())!;
        expect(box.x).toBeGreaterThanOrEqual(0);
        expect(box.x + box.width).toBeLessThanOrEqual(width);
        expect(await sideways(page)).toBeLessThanOrEqual(0);
      });
    }
  }

  test("a venture dates its running totals and counts its users as 1,000", async ({
    page,
  }) => {
    await prepare(page);
    await visit(page, GOGOCASH);
    for (const [label, value] of [
      ["Cumulative gross merchandise value", "THB 13 million"],
      ["Cashback paid", "THB 169,000"],
    ]) {
      const item = page.locator("dl > div", { hasText: label });
      await expect(item).toContainText(value!);
      await expect(item).toContainText("As of October 2026");
    }
    const text = await page.locator("main").innerText();
    const counts = [
      ...text.matchAll(/([\d,.]*\d\+?)\s+registered users/gi),
    ].map((match) => match[1]);
    expect(counts.length).toBeGreaterThan(1);
    expect([...new Set(counts)]).toEqual(["1,000"]);
  });
});

test.describe("the contents (plan gate 4)", () => {
  test("scrolling to a chapter marks it in the rail", async ({ page }) => {
    only(new Set(["desktop", "tablet-landscape"]), "the rail is from 1100 px");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await prepare(page);
    await visit(page);
    const rail = page.locator(".pf-case-rail");
    await expect(rail).toBeVisible();
    await expect(page.locator(".pf-case-contents")).toBeHidden();
    for (const [id, name] of [
      ["ch-02", "What it does"],
      ["ch-04", "Architecture"],
    ] as const) {
      await page.evaluate((chapter) => {
        const el = document.getElementById(chapter)!;
        window.scrollTo({
          top: el.getBoundingClientRect().top + window.scrollY - 200,
          behavior: "instant",
        });
      }, id);
      await expect(rail.getByRole("link", { name })).toHaveAttribute(
        "aria-current",
        "location",
      );
      await expect(rail.locator('[aria-current="location"]')).toHaveCount(1);
    }
    // The rail stays in view beside the column (sticky).
    const nav = (await rail.locator("nav").boundingBox())!;
    expect(nav.y).toBeGreaterThanOrEqual(BAR_BOTTOM);
  });

  test("a case opened from More projects starts afresh: the last case's chapter is not marked", async ({
    page,
  }) => {
    only(new Set(["desktop", "tablet-landscape"]), "the rail is from 1100 px");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await prepare(page);
    await visit(page);
    const rail = page.locator(".pf-case-rail");
    await page.evaluate(() => {
      const el = document.getElementById("ch-04")!;
      window.scrollTo({
        top: el.getBoundingClientRect().top + window.scrollY - 200,
        behavior: "instant",
      });
    });
    await expect(rail.locator('[aria-current="location"]')).toHaveCount(1);
    const card = page
      .getByRole("region", { name: "More projects" })
      .getByRole("link", { name: /^Read the case study: / })
      .first();
    const href = (await card.getAttribute("href"))!;
    await card.click();
    await expect(page).toHaveURL(new RegExp(`${href}$`));
    await expect(page.getByRole("heading", { level: 1 })).not.toContainText(
      "TBH Intranet",
    );
    await expect(rail.locator('[aria-current="location"]')).toHaveCount(0);
  });

  for (const motion of ["reduce", "no-preference"] as const) {
    test(`a click lands the chapter 112 px down, below the bar, and replaces the hash (motion: ${motion})`, async ({
      page,
    }) => {
      only(
        new Set(["desktop", "tablet-landscape"]),
        "the rail is from 1100 px",
      );
      await page.emulateMedia({ reducedMotion: motion });
      await prepare(page);
      await visit(page);
      const before = await page.evaluate(() => history.length);
      const link = page
        .locator(".pf-case-rail")
        .getByRole("link", { name: "Architecture" });
      await link.click();
      await settle(page);
      await expect(page).toHaveURL(/#ch-04$/);
      expect(await page.evaluate(() => history.length)).toBe(before);
      const top = await chapterTop(page, "ch-04");
      expect(Math.abs(top - CHAPTER_TOP)).toBeLessThanOrEqual(3);
      expect(top).toBeGreaterThan(BAR_BOTTOM);
      await expect(link).toHaveAttribute("aria-current", "location");
      await expect(page.locator("#ch-04")).toBeFocused();
    });
  }

  test("under 1100 px the contents are a closed disclosure that lands a chapter and closes", async ({
    page,
  }) => {
    only(BEHAVIOUR, "desktop and the WebKit phone");
    if (test.info().project.name === "desktop") {
      await page.setViewportSize({ width: 820, height: 1180 });
    }
    await page.emulateMedia({ reducedMotion: "reduce" });
    await prepare(page);
    await visit(page);
    await expect(page.locator(".pf-case-rail")).toBeHidden();
    const contents = page.locator(".pf-case-contents");
    const details = contents.locator("details");
    await expect(details).not.toHaveAttribute("open");
    await contents.getByText("On this page").click();
    await expect(details).toHaveAttribute("open");
    await contents.getByRole("link", { name: "Tech stack" }).click();
    await settle(page);
    await expect(details).not.toHaveAttribute("open");
    await expect(page).toHaveURL(/#ch-06$/);
    const top = await chapterTop(page, "ch-06");
    expect(Math.abs(top - CHAPTER_TOP)).toBeLessThanOrEqual(3);
  });

  test("a chapter address lands below the bar without script help", async ({
    page,
  }) => {
    only(BEHAVIOUR, "desktop and the WebKit phone");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await prepare(page);
    await visit(page, `${INTRANET}#ch-03`);
    await settle(page);
    const top = await chapterTop(page, "ch-03");
    expect(Math.abs(top - CHAPTER_TOP)).toBeLessThanOrEqual(3);
  });
});

test.describe("the viewer (plan gate 5)", () => {
  test.beforeEach(() =>
    only(new Set(["desktop"]), "the viewer is from 810 px"),
  );

  test("opens from Enlarge by keyboard, holds the page still, and Escape gives focus back", async ({
    page,
  }) => {
    await prepare(page);
    await visit(page);
    const enlarge = page.getByRole("button", {
      name: "Enlarge: Approval flow",
    });
    // By keyboard all the way: the contents move focus to the chapter, and
    // Tab goes on from there to the tile's buttons.
    await page
      .locator(".pf-case-rail")
      .getByRole("link", { name: "What it does" })
      .focus();
    await page.keyboard.press("Enter");
    await settle(page);
    await tabTo(page, enlarge);
    await expect(enlarge).toHaveCSS("opacity", "1"); // shown on focus
    // The tile in the middle of the screen, as a reader looking at it has
    // it: focus moving back to Enlarge then has nothing to scroll.
    await enlarge.evaluate((el) =>
      el.scrollIntoView({ block: "center", behavior: "instant" }),
    );
    await settle(page);
    const y = await page.evaluate(() => window.scrollY);
    await page.keyboard.press("Enter");
    const dialog = page.getByRole("dialog", { name: "Approval flow" });
    await expect(dialog).toBeVisible();
    await expect(
      dialog.getByRole("button", { name: "Pause the animation" }),
    ).toBeFocused();
    await expect(page.locator('[data-sc-tile="flow"]')).toHaveCSS(
      "visibility",
      "hidden",
    );
    // Nothing behind it scrolls: keys, the wheel.
    for (const key of ["PageDown", "ArrowDown", "End"]) {
      await page.keyboard.press(key);
    }
    await page.mouse.wheel(0, 600);
    await settle(page);
    expect(await page.evaluate(() => window.scrollY)).toBe(y);
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(enlarge).toBeFocused();
    await expect(page.locator('[data-sc-tile="flow"]')).toHaveCSS(
      "visibility",
      "visible",
    );
    expect(await page.evaluate(() => window.scrollY)).toBe(y);
  });

  test("closes from its close button and from a press on the empty stage", async ({
    page,
  }) => {
    await prepare(page);
    await visit(page);
    const enlarge = page.getByRole("button", { name: "Enlarge: Architecture" });
    await enlarge.scrollIntoViewIfNeeded();
    // The page's tile opens the viewer from 810 px; the viewer's copy opens
    // nothing, so it keeps the plain cursor.
    await expect(page.locator('[data-sc-tile="layers"]')).toHaveCSS(
      "cursor",
      "zoom-in",
    );
    await enlarge.click();
    const dialog = page.getByRole("dialog", { name: "Architecture" });
    await expect(dialog).toBeVisible();
    await expect(dialog.locator(".pf-lightbox__tile")).toHaveCSS(
      "cursor",
      "default",
    );
    await expect(dialog.getByRole("button", { name: "Close" })).toBeFocused();
    await dialog.getByRole("button", { name: "Close" }).click();
    await expect(dialog).toBeHidden();
    // A press on the tile itself opens it from 810 px; a press beside it closes.
    await page.locator('[data-sc-tile="layers"]').click();
    await expect(dialog).toBeVisible();
    await page.mouse.click(8, 8);
    await expect(dialog).toBeHidden();
  });

  test("grows the tile from its place, and only fades it under reduced motion", async ({
    page,
  }) => {
    // Every animation started on the viewer's tile, recorded as it starts.
    await page.addInitScript(() => {
      const started: string[] = [];
      (window as unknown as { tileKeys: string[] }).tileKeys = started;
      const animate = Element.prototype.animate;
      Element.prototype.animate = function (
        this: Element,
        keyframes: Keyframe[] | PropertyIndexedKeyframes | null,
        options?: number | KeyframeAnimationOptions,
      ) {
        if (this.classList.contains("pf-lightbox__tile")) {
          const frames = Array.isArray(keyframes)
            ? keyframes
            : [keyframes ?? {}];
          for (const frame of frames) {
            for (const key of Object.keys(frame)) {
              if (!["offset", "easing", "composite"].includes(key)) {
                started.push(key);
              }
            }
          }
        }
        return animate.call(this, keyframes, options);
      };
    });
    for (const motion of ["no-preference", "reduce"] as const) {
      await page.emulateMedia({ reducedMotion: motion });
      await prepare(page);
      await visit(page);
      const enlarge = page.getByRole("button", {
        name: "Enlarge: Architecture",
      });
      await enlarge.scrollIntoViewIfNeeded();
      await enlarge.click();
      await expect(page.getByRole("dialog")).toBeVisible();
      const keys = await page.evaluate(
        () => (window as unknown as { tileKeys: string[] }).tileKeys,
      );
      if (motion === "reduce") {
        expect(new Set(keys)).toEqual(new Set(["opacity"]));
      } else {
        expect(keys).toContain("transform");
      }
      await page.keyboard.press("Escape");
      await expect(page.getByRole("dialog")).toBeHidden();
    }
  });

  test("closes under 810 px with focus on the tile's figure, not lost to the page", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1024, height: 800 });
    await prepare(page);
    await visit(page);
    const enlarge = page.getByRole("button", { name: "Enlarge: Architecture" });
    await enlarge.scrollIntoViewIfNeeded();
    await enlarge.click();
    const dialog = page.getByRole("dialog", { name: "Architecture" });
    await expect(dialog).toBeVisible();
    // The screen narrows under 810 px, where Enlarge is not drawn.
    await page.setViewportSize({ width: 700, height: 800 });
    await expect(enlarge).toBeHidden();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    expect(
      await page.evaluate(() => document.activeElement === document.body),
    ).toBe(false);
    await expect(
      page.getByRole("figure", { name: "Architecture" }),
    ).toBeFocused();
  });

  test("draws a still workflow with no pause control under reduced motion", async ({
    page,
  }) => {
    // The page's own clock: its timers run when the test moves it on.
    await page.clock.install();
    const flowStates = () =>
      page
        .getByRole("figure", { name: "Approval flow" })
        .locator(".pf-flow__step")
        .evaluateAll((steps) =>
          steps.map((step) => step.getAttribute("data-state")),
        );

    await page.emulateMedia({ reducedMotion: "reduce" });
    await prepare(page);
    await visit(page);
    await expect(
      page
        .getByRole("figure", { name: "Approval flow" })
        .getByRole("button", { name: /the animation/ }),
    ).toHaveCount(0);
    await page.clock.runFor(FLOW_TICK * 3);
    expect(new Set(await flowStates())).toEqual(new Set(["done"]));

    // The control: with motion allowed, the same clock moves it on a step.
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await visit(page);
    await page.clock.runFor(FLOW_TICK);
    expect(await flowStates()).toContain("now");
  });
});

test.describe("the cover's labels (spec 12 item 5)", () => {
  test.beforeEach(() => only(new Set(["desktop"]), "desktop Chromium"));

  // The picture is 640 px wide from a screen of about 892 px: the drawing
  // writes its labels from there, and draws them as bars before.
  for (const width of [820, 882, 900, 1024, 1440]) {
    test(`at ${width} px every label drawn on the cover renders at 12 px or more`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      await prepare(page);
      await visit(page);
      const labels = await coverLabels(page);
      expect(labels.length > 0, "labels written").toBe(width >= 900);
      for (const label of labels) {
        expect(label.px, label.text).toBeGreaterThanOrEqual(12);
      }
    });
  }
});

test.describe("with motion allowed: the pause control is measured and audited", () => {
  test.beforeEach(() => only(new Set(["desktop"]), "desktop Chromium"));

  // At 390 px, where the pause control is at its smallest (30 px).
  for (const { path } of CASES) {
    test(`${path}: every target 24 px or more, and no serious axe violations`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: 390, height: 800 });
      await page.emulateMedia({ reducedMotion: "no-preference" });
      await prepare(page);
      await visit(page, path);
      await revealAll(page);
      expect(await tapProblems(page)).toEqual([]);
      // The tap check scrolled through the page and back to the top: the bar
      // fades back in there; axe reads it once the page is still.
      await settle(page);
      expect(await page.evaluate(() => window.scrollY)).toBe(0);
      await expect(page.locator(".pf-nav__row")).toHaveCSS("opacity", "1");
      await stillFrame(page);
      const results = await new AxeBuilder({ page })
        .withTags(WCAG_22)
        .analyze();
      expect(
        results.violations
          .filter((v) => ["serious", "critical"].includes(v.impact ?? ""))
          .map((v) => ({
            id: v.id,
            nodes: v.nodes.map((n) => n.target.join(" ")).slice(0, 5),
          })),
      ).toEqual([]);
    });
  }
});

test.describe("the device matrix and the tap areas (plan gate 6, spec 10.1)", () => {
  test.beforeEach(() => only(new Set(["desktop"]), "desktop Chromium"));
  /**
   * The intranet and GoGoCash, and the two projects that routes.ts does not
   * give to smoke and the fit check (review finding 8).
   */
  const MATRIX_CASES = [
    INTRANET,
    "/portfolio/node-validator-automation",
    "/portfolio/email-signature-generator",
    GOGOCASH,
  ];

  for (const width of [344, 390, 820, 882, 1180, 1440]) {
    test(`at ${width} px nothing scrolls sideways and the grids follow spec 10.1`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ reducedMotion: "reduce" });
      await prepare(page);
      for (const path of MATRIX_CASES) {
        await visit(page, path);
        expect(await sideways(page), path).toBeLessThanOrEqual(0);
        const columns = await page
          .locator(".pf-case-meta")
          .evaluate(
            (el) => getComputedStyle(el).gridTemplateColumns.split(" ").length,
          );
        expect(columns, `${path} meta`).toBe(width >= 1024 ? 4 : 2);
        await expect(page.locator(".pf-case-rail")).toBeVisible({
          visible: width >= 1100,
        });
        await expect(page.locator(".pf-case-contents")).toBeVisible({
          visible: width < 1100,
        });
      }
      const steps = await page.goto(INTRANET).then(() =>
        page
          .locator(".pf-case-steps__list")
          .first()
          .evaluate(
            (el) => getComputedStyle(el).gridTemplateColumns.split(" ").length,
          ),
      );
      if (width >= 600 && width < 1024) expect(steps).toBe(2);
      if (width < 600) expect(steps).toBe(1);
    });
  }

  for (const width of [320, 344, 390]) {
    test(`at ${width} px every target is 24 px or more, apart and uncovered`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.emulateMedia({ reducedMotion: "reduce" });
      await prepare(page);
      for (const path of MATRIX_CASES) {
        await visit(page, path);
        expect(await tapProblems(page), path).toEqual([]);
      }
    });
  }

  test("the share panel opens under its pill and fits a 320 px screen", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await prepare(page);
    await visit(page, GOGOCASH);
    await page.getByRole("button", { name: "Share" }).click();
    const panel = page.getByRole("region", { name: "Share this page" });
    await expect(panel).toBeVisible();
    const box = (await panel.boundingBox())!;
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(320);
    expect(await sideways(page)).toBeLessThanOrEqual(0);
    await page.keyboard.press("Escape");
    await expect(panel).toBeHidden();
    await expect(page.getByRole("button", { name: "Share" })).toBeFocused();
  });

  test("Tab past the share panel closes it, so it covers nothing focus moves to (WCAG 2.4.11)", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 720, height: 900 });
    await prepare(page);
    await visit(page);
    await page.getByRole("button", { name: "Share" }).click();
    const panel = page.getByRole("region", { name: "Share this page" });
    await expect(panel).toBeVisible();
    // Out of the panel's last row, onward in the page.
    const outside = () =>
      page.evaluate(
        () =>
          !document.activeElement?.closest(".pf-case-actions") &&
          document.activeElement !== document.body,
      );
    for (let presses = 0; presses < 12 && !(await outside()); presses += 1) {
      await page.keyboard.press("Tab");
    }
    expect(await outside()).toBe(true);
    await expect(panel).toBeHidden();
    const focused = page.locator(":focus");
    await expect(focused).toHaveAccessibleName("As stated in the résumé →");
    // What has focus is what is drawn at its centre.
    expect(
      await focused.evaluate((el) => {
        const box = el.getBoundingClientRect();
        const hit = document.elementFromPoint(
          box.left + box.width / 2,
          box.top + box.height / 2,
        );
        return Boolean(hit && el.contains(hit));
      }),
    ).toBe(true);
  });

  test("every case keeps the head the parity reference holds, indexable, so Share copies the live address", async ({
    page,
  }) => {
    // The head after hydration, which Share reads, normalised as
    // scripts/parity-crawl.mjs normalised the reference: the title, the
    // canonical, the Open Graph and Twitter tags, the description and robots.
    const reference = JSON.parse(
      readFileSync(
        join(process.cwd(), "tests/fixtures/site-parity.json"),
        "utf8",
      ),
    ) as Record<string, { title: string; tags: string[] }>;
    const shared = (tags: readonly string[]) =>
      tags.filter((tag) =>
        /^link href=\S+ rel="canonical"$|^meta content=.* (property="og:[\w:]+"|name="(description|robots|twitter:[\w:]+)")$/.test(
          tag,
        ),
      );
    for (const { path } of CASES) {
      const response = await page.goto(path, { waitUntil: "networkidle" });
      const own = extractPage(await page.content());
      const ref = reference[path]!;
      expect(own.title, path).toBe(ref.title);
      expect(shared(own.tags), path).toEqual(shared(ref.tags));
      expect(
        own.tags.filter((tag) => tag.endsWith('rel="canonical"')),
        path,
      ).toEqual([`link href="https://kunanonj.com${path}" rel="canonical"`]);
      // Indexable: no noindex in a meta tag or in a response header.
      expect(
        own.tags.filter((tag) => /noindex/i.test(tag)),
        path,
      ).toEqual([]);
      expect(own.tags, path).toContain(
        'meta content="index, follow" name="robots"',
      );
      expect(response?.headers()["x-robots-tag"] ?? "", path).not.toMatch(
        /noindex/i,
      );
    }
    await prepare(page);
    await visit(page);
    await page.getByRole("button", { name: "Share" }).click();
    // The copy row prints the address it copies, without its scheme.
    await expect(
      page
        .getByRole("region", { name: "Share this page" })
        .getByText("kunanonj.com/portfolio/tbh-intranet", { exact: true }),
    ).toBeAttached();
  });
});

test.describe("best practices on the case pages (desktop Chromium)", () => {
  test.beforeEach(() => only(new Set(["desktop"]), "desktop Chromium"));

  test("forced colors: ringed parts keep an edge, pixel art hides", async ({
    page,
  }) => {
    await page.emulateMedia({ forcedColors: "active" });
    await prepare(page);
    for (const path of [INTRANET, GOGOCASH]) {
      await visit(page, path);
      const problems = await page.evaluate(() => {
        const out: string[] = [];
        const ringed = document.querySelectorAll<HTMLElement>(
          ".ds-pill, .ds-chip, .pf-case-cover__frame, .pf-sc__tile, .pf-case-steps__item, .pf-case-layers__layer, .pf-case-hire, .pf-lift__mat, .pf-flow",
        );
        for (const el of ringed) {
          const s = getComputedStyle(el);
          const edge =
            s.borderTopStyle !== "none" &&
            parseFloat(s.borderTopWidth) >= 1 &&
            s.borderTopColor !== "rgba(0, 0, 0, 0)";
          if (!edge) out.push(`no edge: .${[...el.classList].join(".")}`);
        }
        for (const el of document.querySelectorAll<HTMLElement>(
          ".pf-case .ds-px-mark, .pf-case .ds-px-dot, .pf-case .ds-dither",
        )) {
          if (getComputedStyle(el).display !== "none") {
            out.push(`still drawn: .${[...el.classList].join(".")}`);
          }
        }
        return out;
      });
      expect(problems, path).toEqual([]);
    }
  });

  test("the text-spacing check sees text a tile clips", async ({ page }) => {
    // A fixture it must fail: words clipped by the box around them, not by
    // their own box.
    await page.setContent(
      `<div class="pf-case"><div style="width:120px;height:20px;overflow:hidden"><span style="font-size:16px">Words that cannot fit in this tile</span></div></div>`,
    );
    expect(await clippedText(page)).not.toEqual([]);
  });

  for (const width of [1440, 600, 390]) {
    test(`text spacing (WCAG 1.4.12) clips no text at ${width} px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ reducedMotion: "reduce" });
      await prepare(page);
      for (const path of [INTRANET, GOGOCASH]) {
        await visit(page, path);
        await page.addStyleTag({ content: TEXT_SPACING });
        expect(await clippedText(page), path).toEqual([]);
      }
    });
  }

  test("forced colors: the rail's current chapter is underlined, not only coloured", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await prepare(page);
    await visit(page);
    await page.evaluate(() => {
      const el = document.getElementById("ch-02")!;
      window.scrollTo({
        top: el.getBoundingClientRect().top + window.scrollY - 200,
        behavior: "instant",
      });
    });
    const current = page.locator(
      '.pf-case-rail .pf-case-toc__link[aria-current="location"]',
    );
    await expect(current).toHaveCount(1);
    // Colour marks it in ordinary colours; forced colours take the colour away.
    await expect(current).toHaveCSS("text-decoration-line", "none");
    await page.emulateMedia({ forcedColors: "active" });
    await expect(current).toHaveCSS("text-decoration-line", "underline");
  });

  test("at 200% zoom (720 x 450) nothing scrolls sideways and the h1 keeps 42 px", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 720, height: 450 });
    await prepare(page);
    for (const path of [INTRANET, GOGOCASH]) {
      await visit(page, path);
      expect(await sideways(page), path).toBeLessThanOrEqual(0);
      const size = await page
        .getByRole("heading", { level: 1 })
        .evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
      expect(size).toBeGreaterThanOrEqual(42);
    }
  });

  test("requests stay on the site", async ({ page, baseURL }) => {
    const origins = new Set<string>();
    page.on("request", (request) => {
      const url = request.url();
      if (/^https?:/.test(url)) origins.add(new URL(url).origin);
    });
    await prepare(page);
    for (const { path } of CASES) await visit(page, path);
    const allowed = new Set([
      new URL(baseURL!).origin,
      "https://static.cloudflareinsights.com",
      "https://cloudflareinsights.com",
    ]);
    expect([...origins].filter((origin) => !allowed.has(origin))).toEqual([]);
  });

  test("the structured data is the pre-cutover page's, script for script", async ({
    page,
  }) => {
    // The parity reference holds every case page's JSON-LD as it was before
    // the template replaced the body (normalised and sorted the way
    // scripts/parity-crawl.mjs records it); the cutover keeps it unchanged.
    const reference = JSON.parse(
      readFileSync(
        join(process.cwd(), "tests/fixtures/site-parity.json"),
        "utf8",
      ),
    ) as Record<string, { jsonLd: string[] }>;
    for (const { path } of CASES) {
      await page.goto(path, { waitUntil: "domcontentloaded" });
      const scripts = await page
        .locator('script[type="application/ld+json"]')
        .evaluateAll((nodes) =>
          nodes.map((node) =>
            JSON.stringify(JSON.parse(node.textContent ?? "{}")),
          ),
        );
      expect(scripts.sort(), path).toEqual(reference[path]!.jsonLd);
    }
  });
});

test.describe("axe on the cases routes.ts does not list (WCAG 2.2 AA)", () => {
  test.use({ reducedMotion: "reduce" });

  for (const theme of ["light", "dark"] as const) {
    for (const path of [
      "/portfolio/node-validator-automation",
      "/portfolio/email-signature-generator",
      "/ventures/manut",
    ]) {
      test(`${path} has no serious or critical axe violations (${theme})`, async ({
        page,
      }) => {
        only(new Set(["desktop", "mobile"]), "desktop and mobile");
        await prepare(page, theme);
        await visit(page, path);
        await expect(page.locator("html")).toHaveClass(
          new RegExp(`(^|\\s)${theme}(\\s|$)`),
        );
        const results = await new AxeBuilder({ page })
          .withTags(WCAG_22)
          .analyze();
        expect(
          results.violations
            .filter((v) => ["serious", "critical"].includes(v.impact ?? ""))
            .map((v) => ({
              id: v.id,
              nodes: v.nodes.map((n) => n.target.join(" ")).slice(0, 5),
            })),
        ).toEqual([]);
      });
    }
  }
});

for (const theme of ["light", "dark"] as const) {
  test(`preview-case matches its baseline at this width (${theme})`, async ({
    page,
  }) => {
    only(MATRIX, "the matrix projects");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await prepare(page, theme);
    await visit(page);
    await settleDither(page);
    await expect(page).toHaveScreenshot(`preview-case-${theme}.png`, {
      fullPage: true,
      animations: "disabled",
      // The footer's clock moves on every minute.
      stylePath: join(process.cwd(), "tests/e2e/screenshot-no-clock.css"),
    });
  });
}

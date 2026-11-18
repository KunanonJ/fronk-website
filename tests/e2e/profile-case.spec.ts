import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

/**
 * Profile redesign, Phase 5: the case-study template on the hidden
 * /preview/portfolio/<slug> and /preview/ventures/<slug> pages
 * (process/features/profile-site-redesign, phase 5 gates 2 to 7, and the
 * device matrix of design spec 10.1).
 *
 * Behaviour runs in desktop Chromium (1440 px) and the WebKit phone (390 px);
 * the widths, the tap areas and the best-practice checks set their own
 * viewports in desktop Chromium; the matrix projects hold the baselines of
 * one case. profile.spec.ts holds what every preview page must meet, and
 * routes.ts gives four of these pages to smoke, axe and visual.
 */

const CASES = [
  { path: "/preview/portfolio/tbh-intranet", name: "TBH Intranet" },
  {
    path: "/preview/portfolio/node-validator-automation",
    name: "Node Validator Automation",
  },
  {
    path: "/preview/portfolio/email-signature-generator",
    name: "Email Signature Generator",
  },
  { path: "/preview/portfolio/ai-automation", name: "AI Automation" },
  { path: "/preview/portfolio/kunanonj-com", name: "kunanonj.com" },
  { path: "/preview/ventures/gogocash", name: "GoGoCash" },
  { path: "/preview/ventures/manut", name: "Manut AI" },
] as const;
const INTRANET = CASES[0].path;
const GOGOCASH = "/preview/ventures/gogocash";
const BEHAVIOUR = new Set(["desktop", "webkit-phone"]);
const MATRIX = new Set(["fold-closed", "fold-open", "tablet-landscape"]);
/** The fixed bar's bottom edge: 32 px down and 48 px tall. */
const BAR_BOTTOM = 80;
/** Where the contents land a chapter: 96 px padding and 16 px margin. */
const CHAPTER_TOP = 112;

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
    window.scrollTo(0, 0);
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
      await expect(page.locator("html")).toHaveAttribute(
        "data-design",
        "profile",
      );
      // Hidden like every preview.
      await expect(page.locator('meta[name="robots"]').first()).toHaveAttribute(
        "content",
        /noindex/,
      );
      expect(errors).toEqual([]);
    });
  }

  test("an unknown case is a 404", async ({ page }) => {
    const project = await page.goto("/preview/portfolio/not-a-case");
    expect(project?.status()).toBe(404);
    const venture = await page.goto("/preview/ventures/not-a-case");
    expect(venture?.status()).toBe(404);
  });
});

test.describe("links into the case pages", () => {
  test.beforeEach(() => only(new Set(["desktop"]), "desktop Chromium"));

  test("every case link on the preview Home resolves to a case page with an h1", async ({
    page,
  }) => {
    await prepare(page);
    await visit(page, "/preview");
    const hrefs = await page
      .locator('a[href^="/preview/portfolio/"], a[href^="/preview/ventures/"]')
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
        expect(href).toMatch(/^\/preview\/(portfolio|ventures)\/[a-z-]+$/);
        expect(href).not.toBe(path);
      }
    }
  });
});

test.describe("the evidence rule (plan gate 3)", () => {
  test.beforeEach(() => only(new Set(["desktop"]), "desktop Chromium"));

  for (const path of [
    INTRANET,
    "/preview/portfolio/ai-automation",
    "/preview/portfolio/node-validator-automation",
    "/preview/portfolio/email-signature-generator",
  ]) {
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
      if ((await outcome.count()) > 0) {
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
    ["/preview/portfolio/ai-automation", "10 people to 1 operator"],
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
    await enlarge.scrollIntoViewIfNeeded();
    await enlarge.focus();
    await expect(enlarge).toBeVisible(); // shown on focus
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
    await page.waitForTimeout(300);
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
    await enlarge.click({ force: true });
    const dialog = page.getByRole("dialog", { name: "Architecture" });
    await expect(dialog).toBeVisible();
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
    for (const motion of ["no-preference", "reduce"] as const) {
      await page.emulateMedia({ reducedMotion: motion });
      await prepare(page);
      await visit(page);
      const keyframes = await page.evaluate(async () => {
        const button = document.querySelector<HTMLButtonElement>(
          '[data-sc-enlarge="layers"]',
        )!;
        button.click();
        // React renders the viewer in a task after the click; the opening
        // runs for 200 ms at least, so it is still under way here.
        await new Promise((done) => setTimeout(done, 30));
        const tile = document.querySelector(".pf-lightbox__tile")!;
        return tile
          .getAnimations()
          .flatMap((animation) =>
            (animation.effect as KeyframeEffect).getKeyframes(),
          )
          .flatMap((frame) => Object.keys(frame))
          .filter(
            (key) =>
              !["offset", "easing", "composite", "computedOffset"].includes(
                key,
              ),
          );
      });
      if (motion === "reduce") {
        expect(new Set(keyframes)).toEqual(new Set(["opacity"]));
      } else {
        expect(keyframes).toContain("transform");
      }
      await page.keyboard.press("Escape");
      await expect(page.getByRole("dialog")).toBeHidden();
    }
  });

  test("draws a still workflow with no pause control under reduced motion", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await prepare(page);
    await visit(page);
    const flow = page.getByRole("figure", { name: "Approval flow" });
    await expect(
      flow.getByRole("button", { name: /the animation/ }),
    ).toHaveCount(0);
    await page.waitForTimeout(1500);
    const states = await flow
      .locator(".pf-flow__step")
      .evaluateAll((steps) => steps.map((s) => s.getAttribute("data-state")));
    expect(new Set(states)).toEqual(new Set(["done"]));
  });
});

test.describe("the device matrix and the tap areas (plan gate 6, spec 10.1)", () => {
  test.beforeEach(() => only(new Set(["desktop"]), "desktop Chromium"));

  for (const width of [344, 390, 820, 882, 1180, 1440]) {
    test(`at ${width} px nothing scrolls sideways and the grids follow spec 10.1`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ reducedMotion: "reduce" });
      await prepare(page);
      for (const path of [INTRANET, GOGOCASH]) {
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
      for (const path of [INTRANET, GOGOCASH]) {
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

  test("text spacing (WCAG 1.4.12) clips no text", async ({ page }) => {
    await prepare(page);
    for (const path of [INTRANET, GOGOCASH]) {
      await visit(page, path);
      await page.addStyleTag({
        content:
          "*, *::before, *::after { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; } p { margin-bottom: 2em !important; }",
      });
      const clipped = await page.evaluate(() => {
        const out: string[] = [];
        for (const el of document.querySelectorAll<HTMLElement>(".pf-case *")) {
          const own = [...el.childNodes].some(
            (n) => n.nodeType === Node.TEXT_NODE && n.textContent?.trim(),
          );
          if (!own) continue;
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
      expect(clipped, path).toEqual([]);
    }
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

  test("the structured data is the live page's, script for script", async ({
    page,
  }) => {
    const scripts = (path: string) =>
      page
        .goto(path, { waitUntil: "domcontentloaded" })
        .then(() =>
          page
            .locator('script[type="application/ld+json"]')
            .evaluateAll((nodes) =>
              nodes.map((node) => JSON.parse(node.textContent ?? "{}")),
            ),
        );
    for (const [live, preview] of [
      ["/portfolio/tbh-intranet", INTRANET],
      ["/portfolio/kunanonj-com", "/preview/portfolio/kunanonj-com"],
      ["/ventures/gogocash", GOGOCASH],
      ["/ventures/manut", "/preview/ventures/manut"],
    ] as const) {
      const own = (list: Record<string, unknown>[]) =>
        list.filter((data) =>
          ["CreativeWork", "SoftwareApplication", "BreadcrumbList"].includes(
            data["@type"] as string,
          ),
        );
      expect(own(await scripts(preview)), preview).toEqual(
        own(await scripts(live)),
      );
    }
  });
});

test.describe("axe on the cases routes.ts does not list (WCAG 2.2 AA)", () => {
  test.use({ reducedMotion: "reduce" });

  for (const theme of ["light", "dark"] as const) {
    for (const path of [
      "/preview/portfolio/node-validator-automation",
      "/preview/portfolio/email-signature-generator",
      "/preview/ventures/manut",
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
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
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
    await expect(page).toHaveScreenshot(`preview-case-${theme}.png`, {
      fullPage: true,
      animations: "disabled",
    });
  });
}

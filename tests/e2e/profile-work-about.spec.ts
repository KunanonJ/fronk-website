import { expect, test, type Page } from "@playwright/test";
import { settleDither } from "./screenshots";

/**
 * Profile redesign, Phase 3: the Home work stack and About bento on the
 * Home, live since the Phase 6 cutover (the hidden /preview Home before
 * it; process/features/profile-site-redesign, phase 3
 * gates 2 to 7, and the device matrix of design spec 10.1).
 *
 * Behaviour runs in desktop Chromium (1440 px) and the WebKit phone (390 px);
 * the matrix widths and the tap areas set their own viewports in desktop
 * Chromium; the matrix projects hold the baselines of both sections.
 * profile.spec.ts holds what every profile page must meet (no sideways
 * scroll, 12 px text, 24 px targets, forced colours, zoom, text spacing).
 *
 * The case links point at /portfolio/<slug> and /ventures/<slug>; these
 * tests read the addresses, and profile-case.spec.ts follows them.
 */

const HOME = "/";
const BEHAVIOUR = new Set(["desktop", "webkit-phone"]);
const MATRIX = new Set(["fold-closed", "fold-open", "tablet-landscape"]);
/** The fixed bar's bottom edge: 32 px down and 48 px tall. */
const BAR_BOTTOM = 80;
const CASES = [
  "TBH Intranet",
  "AI Automation",
  "Node Validator Automation",
  "GoGoCash",
  "Manut AI",
];

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

async function visit(page: Page, path = HOME) {
  await page.goto(path, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
}

/** Two frames: a scroll's event, then the depth update it schedules. */
function settle(page: Page) {
  return page.evaluate(
    () =>
      new Promise((done) =>
        requestAnimationFrame(() => requestAnimationFrame(() => done(null))),
      ),
  );
}

/** Scrolls without the page's smooth scrolling. */
async function scrollToY(page: Page, y: number) {
  await page.evaluate(
    (top) => window.scrollTo({ top, behavior: "instant" }),
    y,
  );
  await settle(page);
}

/** Within a pixel: layout lands on sub-pixel offsets. */
function near(actual: number | undefined, expected: number, label: string) {
  expect(
    Math.abs((actual ?? Number.NaN) - expected),
    `${label}: ${actual} against ${expected}`,
  ).toBeLessThanOrEqual(1);
}

/** The scale WorkStack's depth gives a card (1 when nothing covers it). */
function cardScale(page: Page, index: number): Promise<number> {
  return page.evaluate((i) => {
    const card = document.querySelectorAll(".pf-card")[i]!;
    const transform = getComputedStyle(card).transform;
    return transform === "none" ? 1 : new DOMMatrix(transform).a;
  }, index);
}

/**
 * Where card `index` rests: stuck at its sticky top, nothing over it yet. Read
 * from the list, which is not sticky, so a stuck item's box does not mislead.
 */
function restingY(page: Page, index: number): Promise<number> {
  return page.evaluate((i) => {
    const list = document.querySelector<HTMLElement>(".pf-stack")!;
    const items = [...list.children] as HTMLElement[];
    const gap = parseFloat(getComputedStyle(list).rowGap) || 0;
    let top = list.getBoundingClientRect().top + window.scrollY;
    // Fractional heights: offsetHeight rounds, and the error adds up.
    for (let k = 0; k < i; k += 1)
      top += items[k]!.getBoundingClientRect().height + gap;
    return top - (parseFloat(getComputedStyle(items[i]!).top) || 0);
  }, index);
}

/** The case cards' list items, top to bottom, as the viewport sees them. */
function itemTops(page: Page): Promise<number[]> {
  return page.evaluate(() =>
    [...document.querySelectorAll(".pf-stack__item")].map(
      (item) => item.getBoundingClientRect().top,
    ),
  );
}

/**
 * Resolves once the page has stopped scrolling: scrollY unchanged for
 * `quiet` ms, read every frame. A smooth scroll the page started (the
 * browser's own, the router's or the stack's) has then ended.
 */
function scrollSettles(page: Page, quiet = 500): Promise<number> {
  return page.evaluate(
    (ms) =>
      new Promise<number>((done) => {
        let last = window.scrollY;
        let since = performance.now();
        const tick = () => {
          if (window.scrollY !== last) {
            last = window.scrollY;
            since = performance.now();
          }
          if (performance.now() - since >= ms) done(last);
          else requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }),
    quiet,
  );
}

/** The GoGoCash card (`#ventures`): where it sits, and what covers it. */
async function venturesAtRest(page: Page) {
  await scrollSettles(page);
  near((await page.locator("#ventures").boundingBox())?.y, 146, "#ventures");
  expect(await uncovered(page, "#ventures")).toEqual([]);
  expect(await uncovered(page, "#ventures .pf-card__link")).toEqual([]);
}

/** True when the element's centre and edges are the topmost thing there. */
function uncovered(page: Page, selector: string): Promise<string[]> {
  return page.evaluate((sel) => {
    const el = document.querySelector<HTMLElement>(sel)!;
    const box = el.getBoundingClientRect();
    const x = box.left + box.width / 2;
    const y = box.top + box.height / 2;
    const points: [number, number][] = [
      [x, y],
      [box.left + 2, y],
      [box.right - 2, y],
      [x, box.top + 2],
      [x, box.bottom - 2],
    ];
    return points
      .filter(([px, py]) => {
        const hit = document.elementFromPoint(px, py);
        return !(hit && (el === hit || el.contains(hit)));
      })
      .map(([px, py]) => `${Math.round(px)},${Math.round(py)}`);
  }, selector);
}

test.describe("work stack: sticking, depth and focus", () => {
  test.beforeEach(({ browserName: _browserName }, testInfo) => {
    test.skip(
      !BEHAVIOUR.has(testInfo.project.name),
      "desktop and the WebKit phone",
    );
  });

  test("the work article is named Selected work and shows the first outcome", async ({
    page,
  }) => {
    await prepare(page);
    await visit(page);
    const work = page.getByRole("article", { name: "Selected work" });
    await expect(work).toHaveAttribute("id", "work");
    await expect(work).toContainText("Adoption: 50+ employees");
    for (const name of CASES) {
      await expect(work.getByRole("article", { name })).toHaveCount(1);
    }
  });

  test("each card sticks 14 px lower than the one before, and the last leaves with the section", async ({
    page,
  }) => {
    await prepare(page);
    await visit(page);
    const last = CASES.length - 1;
    // Each card stays at its offset while the page scrolls on under it.
    for (let i = 0; i < last; i += 1) {
      await scrollToY(page, (await restingY(page, i)) + 40);
      near((await itemTops(page))[i], 104 + 14 * i, `card ${i}`);
    }
    // The list ends with the last card: it reaches its offset, then the
    // whole stack scrolls away with the section.
    await scrollToY(page, await restingY(page, last));
    near((await itemTops(page))[last], 104 + 14 * last, "last card");
    await scrollToY(page, (await restingY(page, last)) + 200);
    const tops = await itemTops(page);
    near(tops[last], 104 + 14 * last - 200, "last card, scrolled on");
    expect(tops[0]!).toBeLessThan(104);
    const sideways = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(sideways).toBeLessThanOrEqual(1);
  });

  test("/#ventures lands on the GoGoCash card, below the bar", async ({
    page,
  }) => {
    // Under reduced motion: the jump is instant. The test after this one
    // opens the same address with motion allowed.
    await page.emulateMedia({ reducedMotion: "reduce" });
    await prepare(page);
    await visit(page, `${HOME}#ventures`);
    const card = page.locator("#ventures");
    await expect(card).toHaveAttribute("aria-labelledby", "stack-gogocash");
    // It lands at its own sticky offset (the fourth card: 104 + 3 x 14 px),
    // so it does not move after the jump.
    await expect
      .poll(async () => Math.abs(((await card.boundingBox())?.y ?? 0) - 146), {
        timeout: 5_000,
        message: "the GoGoCash card's top reaches 146 px",
      })
      .toBeLessThanOrEqual(1);
    expect((await card.boundingBox())!.y).toBeGreaterThanOrEqual(BAR_BOTTOM);
    // Nothing lies over it: its centre and its edges are its own.
    expect(await uncovered(page, "#ventures")).toEqual([]);
  });

  test("/#ventures with motion allowed: once the page stops scrolling, the card rests at 146 px", async ({
    page,
  }) => {
    // The default path: smooth scrolling, in Chromium and WebKit. The browser
    // jumps on load, and the stack places the card again once the fonts are
    // in (WorkStack), so a jump that measured early or stopped short ends
    // where the list says the card rests.
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await prepare(page);
    await visit(page, `${HOME}#ventures`);
    await venturesAtRest(page);
  });

  test("a jump to #ventures while GoGoCash lies covered lands it uncovered", async ({
    page,
  }) => {
    await prepare(page);
    await visit(page);
    // Manut AI rests on GoGoCash: the jump starts from inside the stack,
    // where the browser and the router measure GoGoCash where it is stuck.
    await scrollToY(page, (await restingY(page, CASES.length - 1)) + 20);
    expect(
      (await uncovered(page, "#ventures .pf-card__link")).length,
    ).toBeGreaterThan(0);
    // The in-app navigation a /#ventures link makes (TanStack Router's own).
    await page.evaluate(() =>
      (
        window as unknown as {
          __TSR_ROUTER__: { navigate: (to: object) => Promise<void> };
        }
      ).__TSR_ROUTER__.navigate({ to: "/", hash: "ventures" }),
    );
    await expect(page).toHaveURL(/\/#ventures$/);
    await venturesAtRest(page);
  });

  test("a jump to #ventures from the footer, below the stack, lands it uncovered", async ({
    page,
  }) => {
    await prepare(page);
    await visit(page);
    // The footer's Ventures link points at the live Home (/#ventures) until
    // Phase 6 serves this Home there; it then makes this navigation.
    const footerLink = page
      .getByRole("contentinfo")
      .getByRole("link", { name: "Ventures", exact: true });
    await footerLink.scrollIntoViewIfNeeded();
    await scrollSettles(page);
    await expect(footerLink).toBeInViewport();
    const href = await footerLink.getAttribute("href");
    expect(href).toBe("/#ventures");
    await page.evaluate(
      (hash) =>
        (
          window as unknown as {
            __TSR_ROUTER__: { navigate: (to: object) => Promise<void> };
          }
        ).__TSR_ROUTER__.navigate({ to: "/", hash }),
      href!.split("#")[1],
    );
    await expect(page).toHaveURL(/\/#ventures$/);
    await venturesAtRest(page);
  });

  test("a link to /#ventures from another page, before Home has rendered, lands the card at rest", async ({
    page,
  }) => {
    // Home's stylesheet comes with Home: its loader waits for it, so Home
    // renders whole and the card is there to land on (UX hunt 2, U01).
    await prepare(page);
    await visit(page, "/about");
    await page.evaluate(() =>
      (
        window as unknown as {
          __TSR_ROUTER__: { navigate: (to: object) => Promise<void> };
        }
      ).__TSR_ROUTER__.navigate({ to: "/", hash: "ventures" }),
    );
    await expect(page).toHaveURL(/\/#ventures$/);
    await venturesAtRest(page);
  });

  test("Back to /#ventures, and a reload of it, keep the place the visitor scrolled to", async ({
    page,
  }) => {
    const router = () =>
      page.evaluate(() =>
        (
          window as unknown as {
            __TSR_ROUTER__: { navigate: (to: object) => Promise<void> };
          }
        ).__TSR_ROUTER__.navigate({ to: "/about" }),
      );
    await prepare(page);
    await visit(page, `${HOME}#ventures`);
    await venturesAtRest(page);
    // The visitor reads on, past the stack, then leaves and comes back: the
    // router puts the page back, and the stack must not land on the card.
    const strip = await page.evaluate(
      () =>
        document.getElementById("open-source")!.getBoundingClientRect().top +
        window.scrollY,
    );
    await scrollToY(page, Math.round(strip));
    const left = await scrollSettles(page);
    await router();
    await expect(page).toHaveURL(/\/about$/);
    await page.goBack();
    await expect(page).toHaveURL(/\/#ventures$/);
    await page.evaluate(() => document.fonts.ready);
    near(await scrollSettles(page, 1000), left, "back on /#ventures");

    await page.reload({ waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    near(await scrollSettles(page, 1000), left, "reloaded /#ventures");
  });

  test("Tab from above into the first card, then on from card to card: each focused link rests uncovered (1440 x 900)", async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== "desktop",
      "the 1440 x 900 screen the review measured",
    );
    await prepare(page);
    await visit(page);
    // The keyboard path starts on the control just before the stack, the
    // hero's motion toggle; the first Tab then enters the first card. (A
    // click on the section's heading would focus <main>, the skip link's
    // target, and start the path at the top of the page.)
    await page.locator("section.pf-hero .ds-motion-toggle").focus();
    await scrollSettles(page);
    for (let i = 0; i < CASES.length; i += 1) {
      await page.keyboard.press("Tab");
      const link = page.getByRole("link", {
        name: `Read the case study: ${CASES[i]}`,
      });
      await expect(link).toBeFocused();
      await scrollSettles(page);
      const selector = `.pf-stack__item:nth-child(${i + 1}) .pf-card__link`;
      expect(await uncovered(page, selector), `${CASES[i]} covered`).toEqual(
        [],
      );
      const box = (await link.boundingBox())!;
      expect(box.y, `${CASES[i]} under the bar`).toBeGreaterThanOrEqual(
        BAR_BOTTOM,
      );
      expect(box.y + box.height, `${CASES[i]} below the screen`).toBeLessThan(
        page.viewportSize()!.height,
      );
    }
  });

  test("Shift+Tab back from About through the cards: each focused link rests uncovered (1440 x 900)", async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== "desktop",
      "the 1440 x 900 screen the review measured",
    );
    await prepare(page);
    await visit(page);
    // The keyboard path starts on the first link after the stack, in About's
    // story, and walks back up the cards.
    await page.locator("#about a[href]").first().focus();
    await scrollSettles(page);
    for (let i = CASES.length - 1; i >= 0; i -= 1) {
      await page.keyboard.press("Shift+Tab");
      const link = page.getByRole("link", {
        name: `Read the case study: ${CASES[i]}`,
      });
      await expect(link).toBeFocused();
      await scrollSettles(page);
      const selector = `.pf-stack__item:nth-child(${i + 1}) .pf-card__link`;
      expect(await uncovered(page, selector), `${CASES[i]} covered`).toEqual(
        [],
      );
      const box = (await link.boundingBox())!;
      expect(box.y, `${CASES[i]} under the bar`).toBeGreaterThanOrEqual(
        BAR_BOTTOM,
      );
      expect(box.y + box.height, `${CASES[i]} below the screen`).toBeLessThan(
        page.viewportSize()!.height,
      );
    }
  });

  test("a press anywhere on a card opens its case: the media's centre and its chip are the card's link", async ({
    page,
  }) => {
    // 1440 px in desktop Chromium, 390 px on the WebKit phone.
    await prepare(page);
    await visit(page);
    for (let i = 0; i < CASES.length; i += 1) {
      await scrollToY(page, await restingY(page, i));
      const misses = await page.evaluate((n) => {
        const item = document.querySelectorAll(".pf-stack__item")[n]!;
        const link = item.querySelector(".pf-card__link")!;
        const centre = (el: Element) => {
          const box = el.getBoundingClientRect();
          return [box.left + box.width / 2, box.top + box.height / 2] as const;
        };
        return [".pf-card__media", ".ds-chip--illustration"].filter((part) => {
          const [x, y] = centre(item.querySelector(part)!);
          const hit = document.elementFromPoint(x, y);
          return !(hit && (hit === link || link.contains(hit)));
        });
      }, i);
      expect(misses, CASES[i]).toEqual([]);
    }
  });

  test("a link that takes focus in a covered card brings its card back", async ({
    page,
  }) => {
    await prepare(page);
    await visit(page);
    // Every card stuck: the first lies under the other four.
    await scrollToY(page, (await restingY(page, CASES.length - 1)) + 20);
    const link = page.getByRole("link", {
      name: `Read the case study: ${CASES[0]}`,
    });
    const target = ".pf-stack__item:first-child .pf-card__link";
    expect((await uncovered(page, target)).length).toBeGreaterThan(0);
    await link.focus();
    await expect
      .poll(() => uncovered(page, target), { timeout: 5_000 })
      .toEqual([]);
    await expect(link).toBeFocused();
    const box = (await link.boundingBox())!;
    expect(box.y).toBeGreaterThanOrEqual(BAR_BOTTOM);
    expect(box.y + box.height).toBeLessThanOrEqual(page.viewportSize()!.height);
  });

  test("covered cards scale back under a veil; under reduced motion they stack but never scale", async ({
    page,
  }) => {
    await prepare(page);
    await visit(page);
    await scrollToY(page, (await restingY(page, 2)) + 20);
    const first = page.locator(".pf-stack__item:first-child .pf-card");
    await expect
      .poll(() =>
        first.evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).a),
      )
      .toBeLessThan(0.95);
    expect(
      await first.evaluate((el) => getComputedStyle(el, "::after").opacity),
    ).not.toBe("0");

    await page.emulateMedia({ reducedMotion: "reduce" });
    await visit(page);
    await scrollToY(page, (await restingY(page, 2)) + 20);
    expect(await first.evaluate((el) => getComputedStyle(el).transform)).toBe(
      "none",
    );
    expect(
      await first.evaluate((el) => getComputedStyle(el, "::after").opacity),
    ).toBe("0");
    const tops = await itemTops(page);
    near(tops[0], 104, "first card");
    near(tops[2], 132, "third card");
  });

  test("print lays the stack and the mess out flat, as the page sets them, not as the screen last showed them", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "one engine is enough");
    await prepare(page);
    await visit(page);
    // Two cards covered (scaled and veiled), the mess still scattered.
    await scrollToY(page, (await restingY(page, 2)) + 20);
    const read = () =>
      page.evaluate(() => {
        const all = (selector: string) => [
          ...document.querySelectorAll<HTMLElement>(selector),
        ];
        return {
          positions: all(".pf-stack__item").map(
            (el) => getComputedStyle(el).position,
          ),
          transforms: all(".pf-card").map(
            (el) => getComputedStyle(el).transform,
          ),
          veils: all(".pf-card").map(
            (el) => getComputedStyle(el, "::after").opacity,
          ),
          chips: all(".pf-mess__chip").map((el) => {
            const style = getComputedStyle(el);
            return `${style.translate} ${style.rotate}`;
          }),
          state: document.querySelector(".pf-mess")!.getAttribute("data-state"),
        };
      });
    await expect
      .poll(async () => (await read()).transforms[0])
      .not.toBe("none");
    const screen = await read();
    expect(screen.state).toBe("mess");
    expect(screen.positions[0]).toBe("sticky");
    expect(screen.veils[0]).not.toBe("0");
    expect(screen.chips[0]).not.toBe("none none");

    await page.emulateMedia({ media: "print" });
    const paper = await read();
    expect(new Set(paper.positions)).toEqual(new Set(["static"]));
    expect(new Set(paper.transforms)).toEqual(new Set(["none"]));
    expect(new Set(paper.veils)).toEqual(new Set(["0"]));
    expect(new Set(paper.chips)).toEqual(new Set(["none none"]));
  });

  test("the cards link to the live case pages", async ({ page }) => {
    await prepare(page);
    await visit(page);
    const hrefs = await page
      .locator(".pf-card__link")
      .evaluateAll((links) => links.map((link) => link.getAttribute("href")));
    expect(hrefs).toEqual([
      "/portfolio/tbh-intranet",
      "/portfolio/ai-automation",
      "/portfolio/node-validator-automation",
      "/ventures/gogocash",
      "/ventures/manut",
    ]);
  });
});

test.describe("about bento: the mess, the stats and the motion", () => {
  test.beforeEach(({ browserName: _browserName }, testInfo) => {
    test.skip(
      !BEHAVIOUR.has(testInfo.project.name),
      "desktop and the WebKit phone",
    );
  });

  test("the mess tile tidies as it comes into view", async ({ page }) => {
    await prepare(page);
    await visit(page);
    const mess = page.locator(".pf-mess");
    await expect(mess).toHaveAttribute("data-state", "mess");
    await mess.scrollIntoViewIfNeeded();
    await expect(mess).toHaveAttribute("data-state", "tidy");
    const chip = page.locator(".pf-mess__chip").nth(3);
    await expect
      .poll(() => chip.evaluate((el) => getComputedStyle(el).rotate), {
        timeout: 5_000,
      })
      .toMatch(/^(none|0deg)$/);
  });

  test("under reduced motion the chips are tidy from the start, and the loop is still", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await prepare(page);
    await visit(page);
    await expect(page.locator(".pf-mess")).toHaveAttribute(
      "data-state",
      "tidy",
    );
    const rotations = await page
      .locator(".pf-mess__chip")
      .evaluateAll((chips) => chips.map((el) => getComputedStyle(el).rotate));
    for (const rotate of rotations) expect(rotate).toMatch(/^(none|0deg)$/);
    const motion = page.locator(".pf-motion");
    expect(await motion.getAttribute("data-running")).toBeNull();
    await expect(motion.getByRole("button")).toHaveCount(0);
    expect(
      await page
        .locator(".pf-motion__block")
        .first()
        .evaluate((el) => getComputedStyle(el).animationName),
    ).toBe("none");
  });

  test("the motion tile loops until its pause button stops it", async ({
    page,
  }) => {
    await prepare(page);
    await visit(page);
    const motion = page.locator(".pf-motion");
    await motion.scrollIntoViewIfNeeded();
    const block = page.locator(".pf-motion__block").first();
    const play = () =>
      block.evaluate((el) => ({
        name: getComputedStyle(el).animationName,
        state: getComputedStyle(el).animationPlayState,
      }));
    expect(await play()).toEqual({ name: "kj-gather", state: "running" });
    await motion.getByRole("button", { name: "Pause the animation" }).click();
    expect(await play()).toEqual({ name: "kj-gather", state: "paused" });
    await expect(
      motion.getByRole("button", { name: "Play the animation" }),
    ).toBeVisible();
  });

  test("the stats are text beside their pixel drawings, and the story's links say they open a tab", async ({
    page,
  }) => {
    await prepare(page);
    await visit(page);
    const about = page.getByRole("region", { name: "About" });
    for (const figure of ["50+", "1,000", "220+"]) {
      await expect(
        about.locator(".pf-stats__item .sr-only", { hasText: figure }),
      ).toHaveCount(1);
    }
    await expect(
      about.getByRole("link", { name: "GoGoCash (opens in a new tab)" }),
    ).toHaveAttribute("target", "_blank");
  });
});

/**
 * The four principles line up row by row (UX hunt 22-11-26, U31): a title
 * that wraps to one more line than its neighbours (Firefox at 1366 px wraps
 * "Ship the smallest thing that proves the bet." to three, the other engines
 * to two; every engine has uneven titles from 1024 to 1440 px) used to start
 * its body lower than theirs. Each tile is a subgrid of the bento's rows, so
 * a row's bodies start at one height, its tiles are one height, and from
 * 810 px none is under the 330 px floor. Line breaks differ by engine, so
 * all three run it.
 */
test.describe("about bento: the principles line up in every row", () => {
  test.beforeEach(({ browserName: _browserName }, testInfo) => {
    test.skip(
      !["desktop", "webkit", "firefox"].includes(testInfo.project.name),
      "desktop Chromium, WebKit and Firefox; the test sets its widths",
    );
  });

  test("a row's bodies start at one height and its tiles are one height", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await prepare(page);
    const sizes: readonly (readonly [number, number])[] = [
      [700, 900],
      [900, 900],
      [1024, 768],
      [1280, 800],
      [1366, 768],
      [1440, 900],
    ];
    for (const [width, height] of sizes) {
      // A load at each width: after a resize Chromium at times keeps every
      // tile's 2.4vw padding at the old width's value (seen 700 to 900 px),
      // which moves the floor by a few pixels; the rows still line up.
      await page.setViewportSize({ width, height });
      await visit(page);
      const rows = await page.evaluate(() => {
        const byTop = new Map<number, { body: number; height: number }[]>();
        for (const tile of document.querySelectorAll(".pf-principle")) {
          const box = tile.getBoundingClientRect();
          const body = tile
            .querySelector(".pf-principle__body")!
            .getBoundingClientRect();
          const top = Math.round(box.top);
          byTop.set(top, [
            ...(byTop.get(top) ?? []),
            { body: body.top - box.top, height: box.height },
          ]);
        }
        return [...byTop.values()];
      });
      const at = `at ${width} px`;
      expect(rows.length, `rows ${at}`).toBe(width < 1024 ? 2 : 1);
      for (const row of rows) {
        const bodies = row.map((tile) => tile.body);
        const heights = row.map((tile) => tile.height);
        expect(
          Math.max(...bodies) - Math.min(...bodies),
          `bodies in a row ${at}: ${bodies.map(Math.round).join(", ")}`,
        ).toBeLessThanOrEqual(0.5);
        expect(
          Math.max(...heights) - Math.min(...heights),
          `tiles in a row ${at}`,
        ).toBeLessThanOrEqual(0.5);
        if (width >= 810)
          expect(Math.min(...heights), `the floor ${at}`).toBeGreaterThan(
            329.5,
          );
      }
    }
  });
});

test.describe("work and about: the device matrix and the tap areas", () => {
  test.beforeEach(({ browserName: _browserName }, testInfo) => {
    test.skip(
      testInfo.project.name !== "desktop",
      "widths are set by the test itself",
    );
  });

  test("at each width nothing scrolls sideways or overlaps, and the bento has the spec's columns", async ({
    page,
  }) => {
    await prepare(page);
    await visit(page);
    // Columns per width (spec 4.2, 10.1): one under 600, two from 600, pairs
    // from 810, then 7 + 5 and four principles in a row from 1024.
    const expected: Record<number, number> = {
      344: 1,
      390: 1,
      700: 2,
      820: 2,
      882: 2,
      1180: 4,
      1440: 4,
    };
    for (const [width, principlesPerRow] of Object.entries(expected)) {
      await page.setViewportSize({ width: Number(width), height: 900 });
      await settle(page);
      // A resize moves the scattered chips with their .75 s transition, so
      // they are measured once they have settled.
      await expect
        .poll(
          () =>
            page.evaluate(() => {
              const tile = document
                .querySelector(".pf-bento__mess")!
                .getBoundingClientRect();
              return [...document.querySelectorAll(".pf-mess__chip")]
                .map((chip) => chip.getBoundingClientRect())
                .filter(
                  (chip) =>
                    chip.left < tile.left - 1 ||
                    chip.right > tile.right + 1 ||
                    chip.top < tile.top - 1 ||
                    chip.bottom > tile.bottom + 1,
                ).length;
            }),
          { timeout: 3_000, message: `chips outside the tile at ${width}` },
        )
        .toBe(0);
      const report = await page.evaluate(() => {
        const rect = (el: Element) => el.getBoundingClientRect();
        const overlap = (a: DOMRect, b: DOMRect) =>
          Math.min(a.right, b.right) - Math.max(a.left, b.left) > 0.5 &&
          Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 0.5;
        const tiles = [...document.querySelectorAll(".pf-bento__tile")].map(
          rect,
        );
        const overlaps: string[] = [];
        tiles.forEach((a, i) =>
          tiles.slice(i + 1).forEach((b, j) => {
            if (overlap(a, b)) overlaps.push(`tile ${i} / tile ${i + j + 1}`);
          }),
        );
        for (const card of document.querySelectorAll(".pf-card")) {
          const body = card.querySelector(".pf-card__body");
          const media = card.querySelector(".pf-card__media");
          if (body && media && overlap(rect(body), rect(media)))
            overlaps.push(`card body / media`);
        }
        const principles = [
          ...document.querySelectorAll(".pf-bento__principle"),
        ].map((el) => Math.round(rect(el).top));
        return {
          sideways: document.documentElement.scrollWidth - window.innerWidth,
          overlaps,
          state: document.querySelector(".pf-mess")!.getAttribute("data-state"),
          perRow: principles.filter((top) => top === principles[0]).length,
        };
      });
      expect(report.sideways, `sideways at ${width}`).toBeLessThanOrEqual(1);
      expect(report.overlaps, `overlaps at ${width}`).toEqual([]);
      // Still scattered: the tile has not been in view, the harder case.
      expect(report.state, `mess state at ${width}`).toBe("mess");
      expect(report.perRow, `principles per row at ${width}`).toBe(
        principlesPerRow,
      );
    }
  });

  test("at 820 and 882 px the nav's About link lands the eyebrow below the bar", async ({
    page,
  }) => {
    // shell.css gives #about a scroll margin of -176 px from 810 px, so the
    // section needs its 176 px top padding from 810 px, not from 1024, or
    // the eyebrow lands under the nav pill on tablets and the open Fold.
    await page.emulateMedia({ reducedMotion: "reduce" });
    await prepare(page);
    for (const width of [820, 882]) {
      await page.setViewportSize({ width, height: 1104 });
      await visit(page);
      expect(
        await page
          .locator("#about")
          .evaluate((el) => getComputedStyle(el).paddingTop),
      ).toBe("176px");
      await page
        .getByRole("navigation", { name: "Primary" })
        .getByRole("link", { name: "About", exact: true })
        .click();
      await expect(page).toHaveURL(/#about$/);
      const eyebrow = page.locator("#about-eyebrow");
      await expect
        .poll(async () => (await eyebrow.boundingBox())?.y ?? -1, {
          timeout: 5_000,
        })
        .toBeGreaterThanOrEqual(BAR_BOTTOM);
      await settle(page);
      // 96 px down: the bar's scroll padding, then the section's padding.
      near((await eyebrow.boundingBox())?.y, 96, `the eyebrow at ${width}`);
    }
  });

  test("at 320, 344 and 390 px every card's arrow and the pause button are 24 px or more and uncovered where they rest", async ({
    page,
  }) => {
    await prepare(page);
    await page.setViewportSize({ width: 320, height: 800 });
    await visit(page);
    // One load, then each width: a reload would let the router restore the
    // last scroll position after the test has scrolled.
    for (const width of [320, 344, 390]) {
      await page.setViewportSize({ width, height: 800 });
      await settle(page);
      for (let i = 0; i < CASES.length; i += 1) {
        await scrollToY(page, await restingY(page, i));
        // Nothing covers a resting card, so its depth comes back to 0.
        await expect.poll(() => cardScale(page, i), { timeout: 3_000 }).toBe(1);
        // The link itself: its ::after spans the card, so it is what a tap
        // anywhere on the card reaches.
        const selector = `.pf-stack__item:nth-child(${i + 1}) .pf-card__link`;
        const box = (await page.locator(selector).boundingBox())!;
        expect(box.width, `${CASES[i]} at ${width}`).toBeGreaterThanOrEqual(40);
        expect(box.height, `${CASES[i]} at ${width}`).toBeGreaterThanOrEqual(
          40,
        );
        expect(box.y, `${CASES[i]} at ${width}`).toBeGreaterThanOrEqual(
          BAR_BOTTOM,
        );
        expect(
          await uncovered(page, selector),
          `${CASES[i]} covered at ${width}`,
        ).toEqual([]);
      }
      const pause = page.getByRole("button", { name: "Pause the animation" });
      await pause.evaluate((el) =>
        el.scrollIntoView({ block: "center", behavior: "instant" }),
      );
      const box = (await pause.boundingBox())!;
      expect(Math.min(box.width, box.height)).toBeGreaterThanOrEqual(24);
      expect(
        await uncovered(page, ".pf-motion__toggle button"),
        `pause covered at ${width}`,
      ).toEqual([]);
    }
  });
});

test.describe("work and about: baselines on the device matrix", () => {
  test.beforeEach(({ browserName: _browserName }, testInfo) => {
    test.skip(!MATRIX.has(testInfo.project.name), "the matrix projects");
  });

  for (const theme of ["light", "dark"] as const) {
    for (const id of ["work", "about"] as const) {
      test(`#${id} matches its baseline at this width (${theme})`, async ({
        page,
      }) => {
        await page.emulateMedia({ reducedMotion: "reduce" });
        await prepare(page, theme);
        await visit(page);
        // A section taller than the viewport is captured beyond it, where
        // the parked skip link and the fixed bar would be drawn over it,
        // and where the sticky cards would stack mid-capture. The cards are
        // laid out in flow here, as in print; the stacking itself has its
        // own behaviour tests above.
        await page.addStyleTag({
          content: [
            "[data-site-chrome], .ds-skip { visibility: hidden !important; }",
            ...(id === "work"
              ? [
                  ".pf-stack__item { position: static !important; }",
                  ".pf-card { transform: none !important; }",
                  ".pf-card::after { opacity: 0 !important; }",
                ]
              : []),
          ].join("\n"),
        });
        await settleDither(page);
        await expect(page.locator(`#${id}`)).toHaveScreenshot(
          `preview-${id}-${theme}.png`,
        );
      });
    }
  }
});

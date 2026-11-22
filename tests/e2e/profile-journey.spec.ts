import { expect, test, type Locator, type Page } from "@playwright/test";
import { notebookEntries } from "../../lib/content/testimonials";
import { settleDither } from "./screenshots";

/**
 * Profile redesign, Phase 4: the Journey (stage, tool orbit, story, records
 * card) on Home (live since the Phase 6 cutover), and the testimonial
 * notebook, reviewed with labelled samples on /design (on /preview/system
 * until the Phase 6 cutover deleted it; Phase 7g brought the samples back)
 * (process/features/profile-site-redesign, phase 4 gates 2 to 7, and the
 * device matrix and dual screen of design spec 10.1).
 *
 * Behaviour runs in desktop Chromium (1440 px) and the WebKit phone (390 px);
 * the matrix widths, the tap areas and the hinge set their own viewports in
 * desktop Chromium; the matrix projects hold the baselines.
 * profile.spec.ts holds what every profile page must meet (no sideways
 * scroll, 12 px text, 24 px targets, forced colours, zoom, text spacing).
 */

const HOME = "/";
/** The notebook's sample page: /design since Phase 7g (see below). */
const SYSTEM = "/design";
const BEHAVIOUR = new Set(["desktop", "webkit-phone"]);
const MATRIX = new Set(["fold-closed", "fold-open", "tablet-landscape"]);
/** The fixed bar's bottom edge: 32 px down and 48 px tall. */
const BAR_BOTTOM = 80;
const NOTEBOOK = "section[aria-labelledby='notebook']";
const MATRIX_SIZES: readonly [number, number][] = [
  [344, 882],
  [390, 844],
  [820, 1180],
  [882, 1104],
  [1180, 820],
  [1440, 900],
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

/**
 * Opens a page and waits until it has hydrated: the orbit's controls (the
 * Home) and the notebook's ready mark (/design) render only on the
 * client, after the router's own restore has run.
 */
async function visit(page: Page, path = HOME) {
  // A fresh navigation each time: the same address again counts as a
  // reload, after which the browser restores the last scroll position on its
  // own, late, over the test's own scroll.
  if (page.url() !== "about:blank") await page.goto("about:blank");
  await page.goto(path, { waitUntil: "networkidle" });
  await expect(
    page.locator(
      path === SYSTEM
        ? `${NOTEBOOK} .pf-book[data-ready]`
        : ".pf-orbit__controls",
    ),
  ).toBeAttached();
  await page.evaluate(() => document.fonts.ready);
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
 * Moves focus to `target` with real Tab presses, as a keyboard reader does,
 * from `from` when given (see startAt); Shift+Tab when `backward`.
 */
async function tabTo(
  page: Page,
  target: Locator,
  { from, backward = false }: { from?: Locator; backward?: boolean } = {},
) {
  if (from) await startAt(from);
  for (let presses = 0; presses < 30; presses += 1) {
    if (await target.evaluate((el) => el === document.activeElement)) return;
    await page.keyboard.press(tabKey(page, backward));
  }
  await expect(target).toBeFocused();
}

/**
 * The key that moves focus to the next control. Safari's Tab reaches only
 * text fields unless a setting is on; Option+Tab reaches every control, and
 * is what a keyboard reader there presses.
 */
function tabKey(page: Page, backward = false): string {
  const webkit = page.context().browser()?.browserType().name() === "webkit";
  return `${webkit ? "Alt+" : ""}${backward ? "Shift+" : ""}Tab`;
}

/** The orbit's spin, as its animation runs: "running", "paused" or "none". */
const spinState = (page: Page) =>
  page
    .locator(".pf-orbit")
    .evaluate(
      (el) =>
        el
          .getAnimations()
          .find(
            (animation) =>
              (animation as CSSAnimation).animationName === "kj-orbit-spin",
          )?.playState ?? "none",
    );

/**
 * Waits until the orbit stands still: no rise-in, turn or spin under way in
 * it (the spin held by its button, hover or focus).
 */
function orbitStill(page: Page) {
  return page.waitForFunction(() =>
    document.getAnimations().every((animation) => {
      const target = (animation.effect as KeyframeEffect | null)?.target;
      return (
        !(target instanceof Element && target.closest(".pf-orbit")) ||
        animation.playState !== "running"
      );
    }),
  );
}

function only(projects: readonly string[]) {
  test.skip(
    !projects.includes(test.info().project.name),
    `runs in ${projects.join(" and ")}`,
  );
}

/** Two frames, so a style change has been applied. */
function settle(page: Page) {
  return page.evaluate(
    () =>
      new Promise((done) =>
        requestAnimationFrame(() => requestAnimationFrame(() => done(null))),
      ),
  );
}

/**
 * Puts an element's top at `offset` px from the viewport's, without
 * smoothing. `visit` waits for hydration, after which nothing moves the
 * page on its own (src/lib/scrollRestoration.ts keeps an early scroll too).
 */
async function scrollTop(page: Page, selector: string, offset = 0) {
  // Scrolls again on each look, in case the page grew after the first one
  // (an image or a font arriving): it ends as soon as the place holds.
  await expect
    .poll(
      () =>
        page.evaluate(
          ([sel, off]) => {
            const el = document.querySelector(sel as string)!;
            const top = () => el.getBoundingClientRect().top;
            window.scrollTo({
              top: top() + window.scrollY - (off as number),
              behavior: "instant",
            });
            // How far it still is from its place, in px.
            return Math.abs(top() - (off as number));
          },
          [selector, offset] as const,
        ),
      { message: `${selector} at ${offset}px` },
    )
    .toBeLessThanOrEqual(1);
}

const orbitValue = (page: Page, property: string) =>
  page.evaluate(
    (name) =>
      parseFloat(
        getComputedStyle(document.querySelector(".pf-orbit")!).getPropertyValue(
          name,
        ),
      ),
    property,
  );

/** Points of the element that something else covers. */
function covered(page: Page, selector: string): Promise<string[]> {
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

/** The open page's name: the one article not hidden. */
const openPage = (page: Page) =>
  page
    .locator(`${NOTEBOOK} article:not([aria-hidden='true'])`)
    .getAttribute("aria-label");

/**
 * The orbit's names as a reader sees them: every label shown, whether two
 * overlap, whether one overlaps the copy, and whether anything covers one.
 */
function labelReport(page: Page) {
  return page.evaluate(() => {
    const rect = (el: Element) => el.getBoundingClientRect();
    const overlap = (a: DOMRect, b: DOMRect) =>
      Math.min(a.right, b.right) - Math.max(a.left, b.left) > 0.5 &&
      Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 0.5;
    const shown = [...document.querySelectorAll(".pf-orbit__label")].filter(
      (el) => parseFloat(getComputedStyle(el).opacity) > 0.01,
    );
    const half = shown.filter(
      (el) => parseFloat(getComputedStyle(el).opacity) < 0.99,
    ).length;
    // The words' own boxes: the name and, where it shows, the kind.
    const boxes = shown.map((label) => {
      const parts = [
        ...label.querySelectorAll(".pf-orbit__name, .pf-orbit__kind"),
      ]
        .map(rect)
        .filter((box) => box.width > 1);
      const left = Math.min(...parts.map((b) => b.left));
      const top = Math.min(...parts.map((b) => b.top));
      const right = Math.max(...parts.map((b) => b.right));
      const bottom = Math.max(...parts.map((b) => b.bottom));
      return new DOMRect(left, top, right - left, bottom - top);
    });
    const copy = [
      ...document.querySelectorAll(
        ".pf-journey__copy :is(p, h2, a), .pf-orbit__controls :is(button)",
      ),
    ].map(rect);
    const problems: string[] = [];
    boxes.forEach((a, i) => {
      boxes.slice(i + 1).forEach((b) => {
        if (overlap(a, b)) problems.push(`label ${i} overlaps another`);
      });
      if (copy.some((c) => overlap(a, c)))
        problems.push(`label ${i} overlaps the copy or the controls`);
      // A tool's name, or a file tile's extension. A word kept only for
      // screen readers (1 px, on phones) is not drawn, so nothing covers it.
      const words = shown[i]!.querySelector(
        ".pf-orbit__name, .pf-orbit__kind",
      )!;
      const box = rect(words);
      if (box.width <= 1 || box.height <= 1) return;
      // A name faded out to nothing (a neighbour's, when the ring stops
      // between slots) is not drawn: look through it.
      const hit = document
        .elementsFromPoint(box.left + box.width / 2, box.top + box.height / 2)
        .find((el) => {
          const label = el.closest(".pf-orbit__label");
          return !label || parseFloat(getComputedStyle(label).opacity) > 0.01;
        });
      if (
        box.top >= 0 &&
        box.bottom <= innerHeight &&
        !words.contains(hit ?? null)
      )
        problems.push(
          `label ${i} is covered by .${[...(hit?.classList ?? [])].join(".")}`,
        );
    });
    return { shown: shown.length, half, problems };
  });
}

/**
 * The orbit's shown names and its control buttons, each against every box
 * that clips it: the stage, any ancestor whose overflow is not visible or
 * that contains its paint, and the viewport, which clips the page itself.
 * An element screenshot in Chromium draws only what the viewport holds when
 * the element is no taller than it (Playwright compares sizes, not places),
 * so a name past the screen's edge comes out cut.
 */
function clipReport(page: Page) {
  return page.evaluate(() => {
    const stage = document.querySelector(".pf-journey__stage")!;
    const names = [...document.querySelectorAll(".pf-orbit__label")].filter(
      (el) => parseFloat(getComputedStyle(el).opacity) > 0.01,
    );
    const buttons = [
      ...document.querySelectorAll(".pf-orbit__controls button"),
    ];
    const problems: string[] = [];
    for (const el of [...names, ...buttons]) {
      const what = names.includes(el)
        ? `the name "${el.textContent!.trim()}"`
        : `the button "${el.getAttribute("aria-label") ?? el.textContent!.trim()}"`;
      const clips = new Map<string, DOMRect>([
        ["the stage", stage.getBoundingClientRect()],
        ["the viewport", new DOMRect(0, 0, innerWidth, innerHeight)],
      ]);
      for (let box = el.parentElement; box; box = box.parentElement) {
        const style = getComputedStyle(box);
        if (
          box !== stage &&
          (style.overflowX !== "visible" ||
            style.overflowY !== "visible" ||
            /paint|strict|content/.test(style.contain))
        )
          clips.set(
            `.${[...box.classList].join(".") || box.localName}`,
            box.getBoundingClientRect(),
          );
      }
      const own = el.getBoundingClientRect();
      for (const [name, clip] of clips) {
        const past = Math.max(
          clip.left - own.left,
          clip.top - own.top,
          own.right - clip.right,
          own.bottom - clip.bottom,
        );
        if (past > 0.5)
          problems.push(`${what} reaches ${past.toFixed(1)} px past ${name}`);
      }
    }
    return { names: names.length, buttons: buttons.length, problems };
  });
}

test.describe("journey: the stage and its orbit", () => {
  test.beforeEach(({ browserName: _browserName }, testInfo) => {
    test.skip(
      !BEHAVIOUR.has(testInfo.project.name),
      "desktop and the WebKit phone",
    );
  });

  test("section#journey is named by its h2 and links to the story below the bar", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await prepare(page);
    await visit(page);
    const section = page.getByRole("region", {
      name: "From smart contracts to AI engineering.",
    });
    await expect(section).toHaveAttribute("id", "journey");
    await scrollTop(page, "#journey");
    await page.getByRole("link", { name: "Read the story" }).click();
    await expect(page).toHaveURL(/#story$/);
    await expect
      .poll(async () => (await page.locator("#story").boundingBox())?.y ?? -1, {
        timeout: 5_000,
      })
      .toBeGreaterThanOrEqual(BAR_BOTTOM);
  });

  test("under reduced motion the ring is still and placed, and the buttons turn it one slot", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await prepare(page);
    await visit(page);
    await scrollTop(page, "#journey");
    const orbit = page.locator(".pf-orbit");
    expect(
      await orbit.evaluate((el) => getComputedStyle(el).animationName),
    ).toBe("none");
    await expect(
      page.getByRole("button", { name: "Pause the orbit" }),
    ).toHaveCount(0);
    const first = page.locator(".pf-orbit__item").first();
    const before = (await first.boundingBox())!;
    await page.getByRole("button", { name: "Turn the tools right" }).click();
    // At once: under reduced motion the ring has no transition at all (not
    // even the global rule's 0.01 ms one); the 0.7 s turn of the motion
    // layout would still be under way after 300 ms.
    await expect
      .poll(() => orbitValue(page, "--orbit-offset"), { timeout: 300 })
      .toBe(-18);
    await expect
      .poll(
        async () => {
          const after = (await first.boundingBox())!;
          return Math.hypot(after.x - before.x, after.y - before.y);
        },
        { timeout: 300 },
      )
      .toBeGreaterThan(10);
    await page.getByRole("button", { name: "Turn the tools left" }).click();
    await page.getByRole("button", { name: "Turn the tools left" }).click();
    await expect
      .poll(() => orbitValue(page, "--orbit-offset"), { timeout: 300 })
      .toBe(18);
  });

  test("a pointer drag turns the ring, and the copy beside it does not start one", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await prepare(page);
    await visit(page);
    await scrollTop(page, "#journey");
    const stage = (await page.locator(".pf-journey__stage").boundingBox())!;
    // The ring's left edge, level with the stage's middle: outside the copy.
    const x = stage.x + 12;
    const y = stage.y + stage.height / 2;
    await page.mouse.move(x, y);
    await page.mouse.down();
    for (let step = 1; step <= 8; step += 1)
      await page.mouse.move(x + step * 15, y);
    await expect(page.locator(".pf-journey__stage")).toHaveAttribute(
      "data-dragging",
      "",
    );
    await page.mouse.up();
    await expect(page.locator(".pf-journey__stage")).not.toHaveAttribute(
      "data-dragging",
    );
    // Dragging right brings the near tiles right: the turn goes negative.
    // The turn the script set: under reduced motion the computed angle can
    // trail it by a few frames in WebKit (the global 0.01 ms transition),
    // so a busy machine would read a stale value.
    const offset = () =>
      page
        .locator(".pf-orbit")
        .evaluate((el) =>
          parseFloat(
            (el as HTMLElement).style.getPropertyValue("--orbit-offset") || "0",
          ),
        );
    expect(await offset()).toBeLessThan(-5);
    // A drag that starts on the heading selects text instead.
    const turned = await offset();
    const heading = (await page.locator("#journey-title").boundingBox())!;
    expect(
      await page.evaluate(
        ([px, py]) =>
          document.elementFromPoint(px!, py!)?.closest(".pf-journey__copy") !==
          null,
        [heading.x + 4, heading.y + heading.height / 2],
      ),
      "the press lands on the copy",
    ).toBe(true);
    await page.mouse.move(heading.x + 4, heading.y + heading.height / 2);
    await page.mouse.down();
    await page.mouse.move(heading.x + 120, heading.y + heading.height / 2, {
      steps: 6,
    });
    await page.mouse.up();
    expect(await offset()).toBe(turned);
  });

  test("with motion allowed the ring turns while in view, and holds by its button, with focus inside and on hover", async ({
    page,
  }) => {
    await prepare(page);
    await visit(page);
    const stage = page.locator(".pf-journey__stage");
    const spin = () => orbitValue(page, "--orbit-spin");
    const inStage = () =>
      stage.evaluate((el) => el.contains(document.activeElement));
    // The stage in view, 300 px down, and the pointer on the section above
    // it. A real click scrolls its button into view, so this comes again.
    const away = async () => {
      await scrollTop(page, "#journey", 300);
      await page.mouse.move(5, 5);
    };
    await away();
    await expect.poll(() => spinState(page)).toBe("running");
    const a = await spin();
    await expect.poll(spin).toBeGreaterThan(a);
    // The pause button holds it, and names what the next press will do.
    await page.getByRole("button", { name: "Pause the orbit" }).click();
    await expect(
      page.getByRole("button", { name: "Play the orbit" }),
    ).toHaveCount(1);
    await expect.poll(() => spinState(page)).toBe("paused");
    // Play plays at once, though the pointer is on the stage and the focus
    // may be on the button.
    await page.getByRole("button", { name: "Play the orbit" }).click();
    await expect.poll(() => spinState(page)).toBe("running");
    const playing = await spin();
    await expect.poll(spin).toBeGreaterThan(playing);
    // Once the pointer and the focus have left (to the story, after the
    // stage), it turns; the keyboard back to its controls holds it again.
    await away();
    await startAt(page.locator("#story"));
    expect(await inStage()).toBe(false);
    await expect.poll(() => spinState(page)).toBe("running");
    await page.keyboard.press(tabKey(page, true));
    expect(await inStage()).toBe(true);
    await expect.poll(() => spinState(page)).toBe("paused");
    if (test.info().project.name === "desktop") {
      // Hover holds it too: focus out of the stage, the pointer onto it.
      await startAt(page.locator("#story"));
      await away();
      await expect.poll(() => spinState(page)).toBe("running");
      const box = (await stage.boundingBox())!;
      await page.mouse.move(box.x + 20, box.y + 20);
      await expect.poll(() => spinState(page)).toBe("paused");
    }
  });

  test("with motion allowed, names stay fully drawn wherever the ring stops: on hover, and after drags of 5, 9 and 13 degrees", async ({
    page,
  }) => {
    await prepare(page);
    await visit(page);
    await scrollTop(page, "#journey", 300);
    await page.mouse.move(5, 5);
    const stage = page.locator(".pf-journey__stage");
    const spin = () => orbitValue(page, "--orbit-spin");
    if (test.info().project.name === "desktop") {
      // Hover holds the ring wherever its turn has got to: three moments.
      const box = (await stage.boundingBox())!;
      for (let moment = 0; moment < 3; moment += 1) {
        const from = await spin();
        await expect.poll(spin).toBeGreaterThan(from + 4);
        await page.mouse.move(box.x + 20, box.y + 20);
        await expect.poll(() => spinState(page)).toBe("paused");
        await orbitStill(page);
        const report = await labelReport(page);
        expect(report.half, `half-drawn names at moment ${moment}`).toBe(0);
        expect(report.shown).toBeGreaterThan(0);
        await page.mouse.move(5, 5);
      }
    }
    // Drags that end between slots, with the spin paused by its button. The
    // click scrolls the button into view: the stage is placed again, its top
    // at the screen's, and measured there.
    await page.getByRole("button", { name: "Pause the orbit" }).click();
    await scrollTop(page, ".pf-journey__stage");
    await orbitStill(page);
    const box = (await stage.boundingBox())!;
    const radius = await page
      .locator(".pf-orbit")
      .evaluate((el) => el.clientWidth * 0.43);
    // The ring's left edge, level with the stage's middle: outside the copy.
    const y = box.y + box.height / 2;
    for (const degrees of [5, 9, 13]) {
      const dx = (degrees * Math.PI * radius) / 180;
      const before = await orbitValue(page, "--orbit-offset");
      await page.mouse.move(box.x + 12, y);
      await page.mouse.down();
      await page.mouse.move(box.x + 12 + dx, y, { steps: 8 });
      await page.mouse.up();
      await orbitStill(page);
      // The drag turned the ring.
      expect(await orbitValue(page, "--orbit-offset")).toBeLessThan(before);
      const report = await labelReport(page);
      expect(report.half, `half-drawn names after ${degrees} degrees`).toBe(0);
      expect(report.shown).toBeGreaterThan(0);
    }
  });

  test("tiles waiting below the fold rise in as the stage comes into view", async ({
    page,
  }) => {
    await prepare(page);
    await visit(page);
    const stage = page.locator(".pf-journey__stage");
    await expect(stage).toHaveAttribute("data-pending", "");
    await scrollTop(page, "#journey");
    await expect(stage).toHaveAttribute("data-entering", "");
    await expect(stage).not.toHaveAttribute("data-pending");
    await expect
      .poll(
        () =>
          page
            .locator(".pf-orbit__item")
            .last()
            .evaluate((el) => getComputedStyle(el).opacity),
        { timeout: 4_000 },
      )
      .toBe("1");
  });

  test("names show on the near arc only, all fully drawn, none colliding or covered", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await prepare(page);
    await visit(page);
    await scrollTop(page, "#journey");
    const report = await labelReport(page);
    expect(report.shown).toBeGreaterThan(0);
    expect(report.half, "half-drawn labels at rest").toBe(0);
    expect(report.problems).toEqual([]);
  });
});

test.describe("journey: device matrix, tap areas and the story's layout (desktop Chromium)", () => {
  test.beforeEach(() => only(["desktop"]));

  test("at 344, 390, 820, 882, 1180 and 1440 px nothing scrolls sideways and no name collides", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await prepare(page);
    for (const [width, height] of MATRIX_SIZES) {
      await page.setViewportSize({ width, height });
      await visit(page);
      await scrollTop(page, "#journey");
      const sideways = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      );
      expect(sideways, `sideways at ${width}`).toBeLessThanOrEqual(1);
      const report = await labelReport(page);
      expect(report.half, `half-drawn labels at ${width}`).toBe(0);
      expect(report.problems, `labels at ${width}`).toEqual([]);
      // One name at a time under 1180 px; the near arc from 1180.
      if (width < 1180) expect(report.shown, `labels at ${width}`).toBe(1);
      else expect(report.shown, `labels at ${width}`).toBeGreaterThan(3);
      for (const [index, name] of [
        "Turn the tools left",
        "Turn the tools right",
      ].entries()) {
        const selector = `.pf-orbit__controls > :nth-child(${index + 1})`;
        await expect(page.getByRole("button", { name })).toBeVisible();
        await page
          .locator(selector)
          .evaluate((el) =>
            el.scrollIntoView({ block: "center", behavior: "instant" }),
          );
        await settle(page);
        expect(await covered(page, selector), `${name} at ${width}`).toEqual(
          [],
        );
      }
    }
  });

  test("with motion allowed, held by its button at each width, the ring's names are whole and collide with nothing", async ({
    page,
  }) => {
    await prepare(page);
    for (const [width, height] of MATRIX_SIZES) {
      await page.setViewportSize({ width, height });
      await visit(page);
      await scrollTop(page, "#journey");
      await page.getByRole("button", { name: "Pause the orbit" }).click();
      await page.mouse.move(0, 0);
      await orbitStill(page);
      const report = await labelReport(page);
      expect(report.half, `half-drawn labels at ${width}`).toBe(0);
      expect(report.problems, `labels at ${width}`).toEqual([]);
    }
  });

  test("at 1180 x 820 and 1440 x 900, scrolled into view as an element screenshot does, the stage shows its near names and its controls whole", async ({
    page,
  }) => {
    await prepare(page);
    const stage = page.locator(".pf-journey__stage");
    for (const motion of ["reduce", "no-preference"] as const) {
      await page.emulateMedia({ reducedMotion: motion });
      for (const [width, height] of [
        [1180, 820],
        [1440, 900],
      ] as const) {
        const at = `${width} x ${height}, motion ${motion}`;
        await page.setViewportSize({ width, height });
        await visit(page);
        if (motion === "no-preference")
          await page.getByRole("button", { name: "Pause the orbit" }).click();
        // toHaveScreenshot's own first step. The root's 96 px scroll padding
        // (the bar) counts, so a stage a screen tall lands whole only if its
        // scroll margin cancels it (home-journey.css).
        await stage.scrollIntoViewIfNeeded();
        await orbitStill(page);
        await settle(page);
        const report = await clipReport(page);
        expect(report.names, `near names at ${at}`).toBeGreaterThan(3);
        expect(report.buttons, `buttons at ${at}`).toBe(
          motion === "reduce" ? 2 : 3,
        );
        expect(report.problems, at).toEqual([]);
      }
    }
  });

  for (const width of [344, 390]) {
    test(`at ${width} px, with motion allowed, no name slides under the controls in any of the 20 positions`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 800 });
      await prepare(page);
      await visit(page);
      await scrollTop(page, "#journey");
      await page.getByRole("button", { name: "Pause the orbit" }).click();
      const right = page.getByRole("button", { name: "Turn the tools right" });
      for (let position = 0; position < 20; position += 1) {
        await orbitStill(page);
        const report = await labelReport(page);
        expect(report.problems, `position ${position}`).toEqual([]);
        expect(report.half, `position ${position}`).toBe(0);
        expect(report.shown, `position ${position}`).toBe(1);
        await right.click();
      }
    });
  }

  test("the story sits beside the records card from 1024 px, and above it below", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await prepare(page);
    for (const [width, height] of MATRIX_SIZES) {
      await page.setViewportSize({ width, height });
      await visit(page);
      const text = (await page.locator(".pf-story__text").boundingBox())!;
      const card = (await page.locator(".pf-records").boundingBox())!;
      if (width >= 1024) {
        expect(card.x, `card beside the text at ${width}`).toBeGreaterThan(
          text.x + text.width,
        );
      } else {
        expect(card.y, `card under the text at ${width}`).toBeGreaterThan(
          text.y + text.height,
        );
      }
      // Employment and Education side by side from 600 to 1023 px.
      const groups = await page
        .locator(".pf-records__group")
        .evaluateAll((els) => els.map((el) => el.getBoundingClientRect().top));
      const sideBySide = Math.abs(groups[0]! - groups[1]!) < 1;
      expect(sideBySide, `records columns at ${width}`).toBe(
        width >= 600 && width < 1024,
      );
    }
  });

  test("at 320, 344 and 390 px the Journey's controls are 24 px or more and uncovered", async ({
    page,
  }) => {
    await prepare(page);
    await page.setViewportSize({ width: 320, height: 700 });
    await visit(page);
    const targets = [
      ".pf-journey__copy a",
      ".pf-orbit__controls button:nth-child(1)",
      ".pf-orbit__controls button:nth-child(2)",
      ".pf-orbit__controls .ds-motion-toggle",
      ".pf-records__more a",
    ];
    for (const width of [320, 344, 390]) {
      await page.setViewportSize({ width, height: 800 });
      await settle(page);
      for (const selector of targets) {
        await page
          .locator(selector)
          .evaluate((el) =>
            el.scrollIntoView({ block: "center", behavior: "instant" }),
          );
        await settle(page);
        const box = (await page.locator(selector).boundingBox())!;
        expect(
          Math.min(box.width, box.height),
          `${selector} at ${width}`,
        ).toBeGreaterThanOrEqual(24);
        expect(
          await covered(page, selector),
          `${selector} covered at ${width}`,
        ).toEqual([]);
      }
    }
  });
});

test.describe("the Home's notebook: hidden below three cleared quotes", () => {
  test.beforeEach(({ browserName: _browserName }, testInfo) => {
    test.skip(
      !BEHAVIOUR.has(testInfo.project.name),
      "desktop and the WebKit phone",
    );
  });

  test("Home has no notebook section, heading or link while fewer than three are cleared", async ({
    page,
  }) => {
    await prepare(page);
    await visit(page);
    const notes = page.locator("section.pf-notes");
    if (notebookEntries().length > 0) {
      await expect(notes).toHaveCount(1);
      return;
    }
    await expect(notes).toHaveCount(0);
    await expect(
      page.getByRole("heading", { name: "What it is like to work with me." }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("group", { name: "Recommendations" }),
    ).toHaveCount(0);
    await expect(page.locator("a[href*='#notes']")).toHaveCount(0);
    // No notebook follows the story (the open-source strip does, since
    // 21-11-26), so its padding, set for the notebook, stays 48 px.
    expect(
      await page
        .locator("#story")
        .evaluate((el) => getComputedStyle(el).paddingBottom),
    ).toBe("48px");
  });
});

/*
 * The notebook with its labelled samples lived on /preview/system, which the
 * Phase 6 cutover deleted with the other previews. No live page renders the
 * notebook until three quotes are cleared (umbrella input R11); Phase 7g
 * brought the samples back on /design, where these checks run again.
 */
test.describe("the notebook, with sample notes on /design", () => {
  test.beforeEach(({ browserName: _browserName }, testInfo) => {
    test.skip(
      !BEHAVIOUR.has(testInfo.project.name),
      "desktop and the WebKit phone",
    );
  });

  test("previous, next and pause work from the keyboard; only the open page is reachable", async ({
    page,
  }) => {
    // Motion allowed, so the pause button is there to reach.
    await prepare(page);
    await visit(page, SYSTEM);
    await scrollTop(page, NOTEBOOK, 100);
    expect(await openPage(page)).toBe("Note 1 of 3");
    await expect(page.locator(`${NOTEBOOK} article[inert]`)).toHaveCount(2);
    const heading = page.locator(`${NOTEBOOK} h2`);
    await tabTo(page, page.getByRole("button", { name: "Next page" }), {
      from: heading,
    });
    await page.keyboard.press("Enter");
    await expect.poll(() => openPage(page)).toBe("Note 2 of 3");
    await expect(page.locator(`${NOTEBOOK} [aria-live='polite']`)).toHaveText(
      "Note 2 of 3: Sample person",
    );
    await tabTo(page, page.getByRole("button", { name: "Previous page" }), {
      backward: true,
    });
    await page.keyboard.press("Enter");
    await expect.poll(() => openPage(page)).toBe("Note 1 of 3");
    await page.keyboard.press("Enter");
    await expect.poll(() => openPage(page)).toBe("Note 3 of 3");
    // The pause button, between them, names what the next press will do.
    await tabTo(page, page.getByRole("button", { name: "Pause notes" }));
    await page.keyboard.press("Enter");
    await expect(
      page.getByRole("button", { name: "Play notes" }),
    ).toBeFocused();
  });

  test("turns on its own after the page's wait, holds while focus is inside, and the pause button names what it does", async ({
    page,
  }) => {
    await page.clock.install();
    await prepare(page);
    await visit(page, SYSTEM);
    // Installed clocks keep running in real time until paused, so on a busy
    // runner real seconds would count toward the autoplay wait. Pause now,
    // before the notebook comes into view and arms its timer; from here only
    // runFor moves time.
    await page.clock.pauseAt(await page.evaluate(() => Date.now() + 100));
    await scrollTop(page, NOTEBOOK, 100);
    await page.mouse.move(0, 0);
    // The scroll's intersection and the re-render it causes.
    await page.clock.runFor(50);
    // Sample note one has 23 words: max(7000, 2000 + 180 x 23) = 7000 ms.
    await page.clock.runFor(6_500);
    expect(await openPage(page)).toBe("Note 1 of 3");
    await page.clock.runFor(1_000);
    await expect.poll(() => openPage(page)).toBe("Note 2 of 3");
    // The live region stays silent while the notebook turns on its own.
    await expect(page.locator(`${NOTEBOOK} [aria-live='polite']`)).toHaveText(
      "",
    );
    await tabTo(page, page.getByRole("button", { name: "Next page" }), {
      from: page.locator(`${NOTEBOOK} h2`),
    });
    await page.clock.runFor(30_000);
    expect(await openPage(page)).toBe("Note 2 of 3");
    const pause = page.getByRole("button", { name: "Pause notes" });
    await tabTo(page, pause, { backward: true });
    await page.keyboard.press("Space");
    await expect(
      page.getByRole("button", { name: "Play notes" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Play notes" }),
    ).not.toHaveAttribute("aria-pressed");
    await page.evaluate(() => (document.activeElement as HTMLElement).blur());
    await page.clock.runFor(30_000);
    expect(await openPage(page)).toBe("Note 2 of 3");
  });

  const turnOf = (page: Page, index: number) =>
    page
      .locator(`${NOTEBOOK} article[data-page='${index}']`)
      .evaluate((el) =>
        parseFloat(getComputedStyle(el).getPropertyValue("--turn")),
      );

  test("with motion allowed a page turns over in about a second", async ({
    page,
  }) => {
    await prepare(page);
    await visit(page, SYSTEM);
    await scrollTop(page, NOTEBOOK, 100);
    await page.getByRole("button", { name: "Next page" }).click();
    // The turn is a 1 s transition of the page's --turn, under way now.
    const turning = await page
      .locator(`${NOTEBOOK} article[data-page='0']`)
      .evaluate((el) =>
        el.getAnimations().map((animation) => ({
          property: (animation as CSSTransition).transitionProperty,
          duration: animation.effect?.getTiming().duration,
          state: animation.playState,
        })),
      );
    expect(turning).toContainEqual({
      property: "--turn",
      duration: 1000,
      state: "running",
    });
    await expect.poll(() => turnOf(page, 0), { timeout: 3_000 }).toBe(1);
  });

  test("under reduced motion a page turns at once, and nothing turns on its own", async ({
    page,
  }) => {
    await page.clock.install();
    await page.emulateMedia({ reducedMotion: "reduce" });
    await prepare(page);
    await visit(page, SYSTEM);
    await scrollTop(page, NOTEBOOK, 100);
    await expect(page.getByRole("button", { name: "Pause notes" })).toHaveCount(
      0,
    );
    await page.getByRole("button", { name: "Next page" }).click();
    // At once: the global reduced-motion rule leaves the page a 0.01 ms
    // transition in place of the 1 s turn. That is checked directly, not by
    // racing a short timer (on a busy runner WebKit's next frame can come
    // later than any small window). The default would read 0 s, the motion
    // path 1 s; only the reduced-motion rule reads just above 0.
    const durationsMs = await page
      .locator(`${NOTEBOOK} article[data-page='0']`)
      .evaluate((el) =>
        getComputedStyle(el)
          .transitionDuration.split(",")
          .map((value) => {
            const trimmed = value.trim();
            const amount = parseFloat(trimmed);
            return trimmed.endsWith("ms") ? amount : amount * 1000;
          }),
      );
    for (const ms of durationsMs) {
      expect(ms).toBeGreaterThan(0);
      expect(ms).toBeLessThanOrEqual(0.011);
    }
    await expect.poll(() => turnOf(page, 0), { timeout: 3_000 }).toBe(1);
    await page.clock.runFor(60_000);
    expect(await openPage(page)).toBe("Note 2 of 3");
  });

  test("dragging the page past a quarter turns it; a short, slow drag springs back", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await prepare(page);
    await visit(page, SYSTEM);
    await scrollTop(page, NOTEBOOK, 100);
    const leaf = (await page
      .locator(`${NOTEBOOK} .pf-book__pages`)
      .boundingBox())!;
    const y = leaf.y + leaf.height / 2;
    const from = leaf.x + leaf.width * 0.8;
    // Short and slow: about 12% of the leaf, then a pause before release.
    await page.mouse.move(from, y);
    await page.mouse.down();
    await page.mouse.move(from - leaf.width * 0.12, y, { steps: 12 });
    await page.waitForTimeout(150);
    await page.mouse.up();
    expect(await openPage(page)).toBe("Note 1 of 3");
    // Past a quarter of the leaf: the page turns.
    await page.mouse.move(from, y);
    await page.mouse.down();
    await page.mouse.move(from - leaf.width * 0.45, y, { steps: 10 });
    await page.mouse.up();
    await expect.poll(() => openPage(page)).toBe("Note 2 of 3");
  });
});

test.describe("the notebook's layout (desktop Chromium)", () => {
  test.beforeEach(() => {
    only(["desktop"]);
  });

  test("its arrows sit beside the book from 1180 px and under it below, 88 px apart", async ({
    page,
  }) => {
    await prepare(page);
    for (const [width, height] of MATRIX_SIZES) {
      await page.setViewportSize({ width, height });
      await visit(page, SYSTEM);
      await scrollTop(page, NOTEBOOK, 100);
      const sideways = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      );
      expect(sideways, `sideways at ${width}`).toBeLessThanOrEqual(1);
      const book = (await page.locator(`${NOTEBOOK} .pf-book`).boundingBox())!;
      const prev = (await page
        .getByRole("button", { name: "Previous page" })
        .boundingBox())!;
      const next = (await page
        .getByRole("button", { name: "Next page" })
        .boundingBox())!;
      const pause = (await page
        .getByRole("button", { name: "Pause notes" })
        .boundingBox())!;
      for (const box of [prev, next, pause]) {
        expect(box.width, `button size at ${width}`).toBe(48);
      }
      expect(pause.y, `pause under the book at ${width}`).toBeGreaterThan(
        book.y + book.height,
      );
      if (width >= 1180) {
        expect(prev.x + prev.width).toBeLessThanOrEqual(book.x);
        expect(next.x).toBeGreaterThanOrEqual(book.x + book.width);
        const middle = book.y + book.height / 2;
        expect(Math.abs(prev.y + prev.height / 2 - middle)).toBeLessThan(2);
      } else {
        expect(prev.y, `prev under the book at ${width}`).toBeGreaterThan(
          book.y + book.height,
        );
        expect(Math.round(pause.x - prev.x), `prev to pause at ${width}`).toBe(
          88,
        );
        expect(Math.round(next.x - pause.x), `pause to next at ${width}`).toBe(
          88,
        );
      }
      if (width < 810) {
        // One page that bleeds to the left edge, with a 36 px cover strip.
        expect(Math.round(book.x), `bleed at ${width}`).toBe(0);
        const strip = (await page
          .locator(`${NOTEBOOK} .pf-book__cover`)
          .boundingBox())!;
        expect([Math.round(strip.x), Math.round(strip.width)]).toEqual([0, 36]);
      }
    }
  });

  test("spanned across a vertical hinge, the spread opens across both screens", async ({
    page,
    context,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await prepare(page);
    // Surface Duo spanned: two 540 px screens and a 34 px hinge.
    const cdp = await context.newCDPSession(page);
    await cdp.send("Emulation.setDeviceMetricsOverride", {
      width: 1114,
      height: 720,
      deviceScaleFactor: 1,
      mobile: false,
      displayFeature: { orientation: "vertical", offset: 540, maskLength: 34 },
    });
    await visit(page, SYSTEM);
    expect(
      await page.evaluate(
        () => matchMedia("(horizontal-viewport-segments: 2)").matches,
      ),
    ).toBe(true);
    const cover = (await page
      .locator(`${NOTEBOOK} .pf-book__cover`)
      .boundingBox())!;
    const pages = (await page
      .locator(`${NOTEBOOK} .pf-book__pages`)
      .boundingBox())!;
    expect(cover.x + cover.width).toBeLessThanOrEqual(541);
    expect(pages.x).toBeGreaterThanOrEqual(573);
    await expect(page.locator(`${NOTEBOOK} .pf-book__spiral`)).toBeHidden();
  });
});

/**
 * Element baselines hide the fixed chrome: an element taller than the
 * viewport is captured beyond it, where the skip link (parked above the
 * viewport) and the bar would be drawn over the section.
 */
const hideChrome = (page: Page) =>
  page.addStyleTag({
    content: "[data-site-chrome], .ds-skip { visibility: hidden !important; }",
  });

test.describe("journey and notebook: baselines on the device matrix", () => {
  test.beforeEach(({ browserName: _browserName }, testInfo) => {
    test.skip(!MATRIX.has(testInfo.project.name), "the matrix projects");
  });

  for (const theme of ["light", "dark"] as const) {
    test(`the Journey's stage matches its baseline at this width (${theme})`, async ({
      page,
    }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await prepare(page, theme);
      await visit(page);
      await hideChrome(page);
      await settleDither(page);
      await expect(page.locator(".pf-journey__stage")).toHaveScreenshot(
        `preview-journey-${theme}.png`,
      );
    });

    test(`#story matches its baseline at this width (${theme})`, async ({
      page,
    }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await prepare(page, theme);
      await visit(page);
      await hideChrome(page);
      await settleDither(page);
      await expect(page.locator("#story")).toHaveScreenshot(
        `preview-story-${theme}.png`,
      );
    });

    test(`the sample notebook matches its baseline at this width (${theme})`, async ({
      page,
    }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await prepare(page, theme);
      await visit(page, SYSTEM);
      await hideChrome(page);
      await settleDither(page);
      await expect(page.locator(`${NOTEBOOK} .pf-book-wrap`)).toHaveScreenshot(
        `preview-notebook-${theme}.png`,
      );
    });
  }
});

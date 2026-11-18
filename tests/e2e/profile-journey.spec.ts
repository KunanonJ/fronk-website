import { expect, test, type Page } from "@playwright/test";
import { notebookEntries } from "../../lib/content/testimonials";

/**
 * Profile redesign, Phase 4: the Journey (stage, tool orbit, story, records
 * card) on the hidden /preview Home, and the testimonial notebook, reviewed
 * on /preview/system with labelled samples (process/features/
 * profile-site-redesign, phase 4 gates 2 to 7, and the device matrix and
 * dual screen of design spec 10.1).
 *
 * Behaviour runs in desktop Chromium (1440 px) and the WebKit phone (390 px);
 * the matrix widths, the tap areas and the hinge set their own viewports in
 * desktop Chromium; the matrix projects hold the baselines.
 * profile.spec.ts holds what every preview page must meet (no sideways
 * scroll, 12 px text, 24 px targets, forced colours, zoom, text spacing).
 */

const HOME = "/preview";
const SYSTEM = "/preview/system";
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

async function visit(page: Page, path = HOME) {
  await page.goto(path, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
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
 * smoothing, and checks it stays there: WebKit restores the scroll position
 * once more as the page hydrates, so an early scroll can snap back to the
 * top. Waits use real time, so this works with a fake clock installed too.
 */
async function scrollTop(page: Page, selector: string, offset = 0) {
  const top = () =>
    page.evaluate(
      (sel) => document.querySelector(sel)!.getBoundingClientRect().top,
      selector,
    );
  await expect
    .poll(
      async () => {
        await page.evaluate(
          ([sel, off]) => {
            const el = document.querySelector(sel as string)!;
            window.scrollTo({
              top:
                el.getBoundingClientRect().top +
                window.scrollY -
                (off as number),
              behavior: "instant",
            });
          },
          [selector, offset] as const,
        );
        await page.waitForTimeout(150);
        return Math.abs((await top()) - offset) <= 1;
      },
      { timeout: 10_000, message: `${selector} held at ${offset}px` },
    )
    .toBe(true);
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
      // A tool's name, or a file tile's extension.
      const words = shown[i]!.querySelector(
        ".pf-orbit__name, .pf-orbit__kind",
      )!;
      const box = rect(words);
      const hit = document.elementFromPoint(
        box.left + box.width / 2,
        box.top + box.height / 2,
      );
      if (box.top >= 0 && box.bottom <= innerHeight && !words.contains(hit))
        problems.push(`label ${i} is covered`);
    });
    return { shown: shown.length, half, problems };
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
    // At once: within a frame or two (the global reduced-motion rule leaves
    // a 0.01 ms transition, which WebKit ends on a later frame); the 0.7 s
    // turn of the motion layout would still be under way after 300 ms.
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

  test("with motion allowed the ring turns while in view, and pauses by its button, on hover and on focus", async ({
    page,
  }) => {
    await prepare(page);
    await visit(page);
    // The stage in view, 300 px down, and the pointer above it: hovering the
    // stage would hold the ring too. The buttons are pressed from script, so
    // neither the pointer nor the focus moves onto the stage, and the page
    // does not scroll to them.
    await scrollTop(page, "#journey", 300);
    await page.mouse.move(5, 5);
    const press = (name: string) =>
      page.evaluate((label) => {
        const button = [
          ...document.querySelectorAll<HTMLButtonElement>(
            ".pf-orbit__controls button",
          ),
        ].find(
          (el) =>
            el.getAttribute("aria-label") === label ||
            el.textContent?.trim() === label,
        )!;
        button.click();
      }, name);
    const spin = () => orbitValue(page, "--orbit-spin");
    const a = await spin();
    await page.waitForTimeout(400);
    expect(await spin()).toBeGreaterThan(a);
    // The pause button holds it, and names what the next press will do.
    await press("Pause the orbit");
    await expect(
      page.getByRole("button", { name: "Play the orbit" }),
    ).toHaveCount(1);
    // A running animation still ticks once as the pause applies.
    await settle(page);
    const held = await spin();
    await page.waitForTimeout(400);
    expect(await spin()).toBe(held);
    await press("Play the orbit");
    const playing = await spin();
    await page.waitForTimeout(400);
    expect(await spin()).toBeGreaterThan(playing);
    // Focus inside the stage holds it too.
    await page.evaluate(() =>
      document
        .querySelector<HTMLButtonElement>(".pf-orbit__controls button")!
        .focus({ preventScroll: true }),
    );
    await settle(page);
    const focused = await spin();
    await page.waitForTimeout(400);
    expect(await spin()).toBe(focused);
    if (test.info().project.name === "desktop") {
      await page.evaluate(() => (document.activeElement as HTMLElement).blur());
      const stage = (await page.locator(".pf-journey__stage").boundingBox())!;
      await page.mouse.move(stage.x + 20, stage.y + 20);
      await settle(page);
      const hovered = await spin();
      await page.waitForTimeout(400);
      expect(await spin()).toBe(hovered);
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

  test("/preview has no notebook section, heading or link while fewer than three are cleared", async ({
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
  });
});

test.describe("the notebook, with sample notes on /preview/system", () => {
  test.beforeEach(({ browserName: _browserName }, testInfo) => {
    test.skip(
      !BEHAVIOUR.has(testInfo.project.name),
      "desktop and the WebKit phone",
    );
  });

  test("previous, next and pause work from the keyboard; only the open page is reachable", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await prepare(page);
    await visit(page, SYSTEM);
    await scrollTop(page, NOTEBOOK, 100);
    expect(await openPage(page)).toBe("Note 1 of 3");
    await expect(page.locator(`${NOTEBOOK} article[inert]`)).toHaveCount(2);
    await page.getByRole("button", { name: "Next page" }).focus();
    await page.keyboard.press("Enter");
    await expect.poll(() => openPage(page)).toBe("Note 2 of 3");
    await expect(page.locator(`${NOTEBOOK} [aria-live='polite']`)).toHaveText(
      "Note 2 of 3: Sample person",
    );
    await page.getByRole("button", { name: "Previous page" }).focus();
    await page.keyboard.press("Enter");
    await expect.poll(() => openPage(page)).toBe("Note 1 of 3");
    await page.keyboard.press("Enter");
    await expect.poll(() => openPage(page)).toBe("Note 3 of 3");
  });

  test("turns on its own after the page's wait, holds while focus is inside, and the pause button names what it does", async ({
    page,
  }) => {
    await page.clock.install();
    await prepare(page);
    await visit(page, SYSTEM);
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
    await page.getByRole("button", { name: "Next page" }).focus();
    await page.clock.runFor(30_000);
    expect(await openPage(page)).toBe("Note 2 of 3");
    const pause = page.getByRole("button", { name: "Pause notes" });
    await pause.focus();
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
    await page.waitForTimeout(300);
    const mid = await turnOf(page, 0);
    expect(mid).toBeGreaterThan(0);
    expect(mid).toBeLessThan(1);
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
    // At once: within a frame (the global reduced-motion rule leaves a
    // 0.01 ms transition, which WebKit ends on the next frame). The 1 s turn
    // would still be near its start after 300 ms.
    await expect.poll(() => turnOf(page, 0), { timeout: 300 }).toBe(1);
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
  test.beforeEach(() => only(["desktop"]));

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
      await expect(page.locator(`${NOTEBOOK} .pf-book-wrap`)).toHaveScreenshot(
        `preview-notebook-${theme}.png`,
      );
    });
  }
});

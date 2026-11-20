import { expect, test, type Page } from "@playwright/test";

/**
 * The hero canvas's tools (now-building-and-genz Phase 4): from 810 px with
 * a mouse the canvas mock's toolbar is real. The Pen draws doodles that fade,
 * Stickers stamp by mouse or keyboard (the first finds the Headphones trait),
 * Clear empties the canvas, and Move, the default, keeps the frame links
 * working. On touch screens and narrow ones it stays decoration. Nothing of
 * it loads until the toolbar is reached for.
 *
 * Named profile-*.spec.ts so it runs on the profile device matrix too: the
 * tools where the toolbar is real (desktop, webkit, firefox, fold-open,
 * tablet-landscape), the decoration everywhere else.
 */

const FRAME = "TBH Intranet: open the case study";

/** Opens Home without the first-visit intro, motion as asked. */
async function visit(
  page: Page,
  { motion = "reduce" }: { motion?: "reduce" | "no-preference" } = {},
) {
  await page.emulateMedia({ reducedMotion: motion });
  await page.addInitScript(() => {
    try {
      sessionStorage.setItem("fronk-intro-seen", "1");
    } catch {
      // Storage can be unavailable; the intro then plays first.
    }
  });
  await page.goto("/", { waitUntil: "networkidle" });
  // The canvas's entrance over: a press during it can scroll the page.
  await page.locator(".pf-mock-wrap").evaluate(async (el) => {
    await Promise.all(el.getAnimations().map((motion) => motion.finished));
  });
}

/** The tools work here: 810 px and up, with a pointer that can hover. */
const toolsHere = (page: Page) =>
  page.evaluate(
    () =>
      matchMedia("(min-width: 50.625rem)").matches &&
      matchMedia("(hover: hover) and (pointer: fine)").matches,
  );

async function onlyWithTools(page: Page) {
  test.skip(!(await toolsHere(page)), "the toolbar is decoration here");
}

const toolbar = (page: Page) =>
  page.getByRole("toolbar", { name: "Canvas tools" });
const tool = (page: Page, name: string | RegExp) =>
  toolbar(page).getByRole("button", { name, exact: typeof name === "string" });

/** A point on the canvas, as fractions of its box. */
async function canvasPoint(page: Page, x: number, y: number) {
  const box = (await page.locator(".pf-mock__canvas").boundingBox())!;
  return [box.x + box.width * x, box.y + box.height * y] as const;
}

/** The live line under the canvas. */
const live = (page: Page) => page.locator(".pf-mock-wrap > [aria-live]");

test.describe("hero canvas tools (now-building-and-genz Phase 4)", () => {
  test("with a mouse from 810 px a toolbar of five buttons, else decoration with none", async ({
    page,
  }) => {
    await visit(page);
    const group = page.getByRole("group", { name: "Featured projects" });
    if (await toolsHere(page)) {
      expect(
        await toolbar(page)
          .getByRole("button")
          .evaluateAll((all) => all.map((el) => el.getAttribute("aria-label"))),
      ).toEqual(["Move", "Stickers", "Pen", "Ink: violet", "Clear the canvas"]);
      await expect(group.getByRole("button")).toHaveCount(5);
      await expect(tool(page, "Move")).toHaveAttribute("aria-pressed", "true");
      await expect(tool(page, "Clear the canvas")).toHaveAttribute(
        "aria-disabled",
        "true",
      );
      // 26 px targets (WCAG 2.5.8 asks 24).
      for (const box of await toolbar(page)
        .getByRole("button")
        .evaluateAll((all) =>
          all.map((el) => el.getBoundingClientRect().toJSON()),
        )) {
        expect(Math.min(box.width, box.height)).toBeGreaterThanOrEqual(24);
      }
    } else {
      await expect(page.getByRole("toolbar")).toHaveCount(0);
      await expect(group.getByRole("button")).toHaveCount(0);
      await expect(page.locator(".pf-mock__tools")).toHaveAttribute(
        "aria-hidden",
        "true",
      );
    }
    // Nothing of the tools has loaded, nor is in the canvas.
    await expect(page.locator(".pf-ink")).toHaveCount(0);
    await expect(page.locator("link[href*='canvas-tools']")).toHaveCount(0);
  });

  test("the Pen draws with the mouse and never opens a case; the doodle fades; Move keeps the links", async ({
    page,
  }) => {
    const loaded: string[] = [];
    page.on("request", (request) => {
      if (/CanvasInk|canvas-tools/.test(request.url()))
        loaded.push(request.url());
    });
    await visit(page, { motion: "no-preference" });
    await onlyWithTools(page);
    expect(loaded).toEqual([]);

    await tool(page, "Pen").click();
    await expect(tool(page, "Pen")).toHaveAttribute("aria-pressed", "true");
    await expect(tool(page, "Move")).toHaveAttribute("aria-pressed", "false");
    await expect(page.locator(".pf-ink[data-tool='pen']")).toBeAttached();
    expect(loaded.some((url) => url.includes("canvas-tools"))).toBe(true);

    // A stroke that starts on the first frame and crosses the canvas.
    const frame = page.getByRole("link", { name: FRAME });
    const start = (await frame.boundingBox())!;
    await page.mouse.move(
      start.x + start.width / 2,
      start.y + start.height / 2,
    );
    await page.mouse.down();
    await page.mouse.move(...(await canvasPoint(page, 0.7, 0.62)), {
      steps: 12,
    });
    await page.mouse.move(...(await canvasPoint(page, 0.86, 0.8)), {
      steps: 12,
    });
    await page.mouse.up();
    const stroke = page.locator(".pf-ink__stroke[d]");
    await expect(stroke).toHaveCount(1);
    const drawn = (await stroke.boundingBox())!;
    expect(drawn.width).toBeGreaterThan(100);
    expect(drawn.height).toBeGreaterThan(40);
    await expect(page).toHaveURL(/\/$/);
    await expect(tool(page, "Clear the canvas")).not.toHaveAttribute(
      "aria-disabled",
    );

    // It fades after about 4 s, and then there is nothing to clear.
    await expect(stroke).toHaveCount(0, { timeout: 7000 });
    await expect(tool(page, "Clear the canvas")).toHaveAttribute(
      "aria-disabled",
      "true",
    );

    // Esc puts the Pen down: under Move the frames are links again.
    await page.keyboard.press("Escape");
    await expect(tool(page, "Move")).toHaveAttribute("aria-pressed", "true");
    await frame.click();
    await expect(page).toHaveURL(/\/portfolio\/tbh-intranet$/);
  });

  test("Stickers stamp by mouse and by keyboard, Clear empties the canvas, and the first finds Headphones, once", async ({
    page,
  }) => {
    await visit(page);
    await onlyWithTools(page);
    const stickers = page.locator(".pf-sticker");
    const toast = page.getByTestId("trait-toast");

    await tool(page, "Stickers").click();
    await expect(tool(page, "Stickers")).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(page.locator(".pf-ink[data-tool='stickers']")).toBeAttached();
    await page.mouse.click(...(await canvasPoint(page, 0.84, 0.76)));
    await expect(stickers).toHaveCount(1);
    await expect(stickers.first()).toHaveText("ship it");
    await expect(live(page)).toHaveText("Sticker placed: ship it");
    await expect(page).toHaveURL(/\/$/);
    await expect(toast).toContainText("You found Headphones · 1/6");
    expect(
      await page.evaluate(() => localStorage.getItem("pf-portrait-found")),
    ).toBe('["headphones"]');
    await toast.getByRole("button", { name: "Dismiss" }).click();
    await expect(toast).toHaveCount(0);

    // From the keyboard: Stickers pressed again stamps at a free spot.
    await tool(page, "Stickers").focus();
    await page.keyboard.press("Enter");
    await expect(stickers).toHaveCount(2);
    await expect(live(page)).toHaveText("Sticker placed: a heart");
    await page.keyboard.press("Space");
    await expect(stickers).toHaveCount(3);
    await expect(live(page)).toHaveText("Sticker placed: gm");
    // Each in a place of its own, inside the canvas.
    const boxes = await stickers.evaluateAll((all) =>
      all.map((el) => el.getBoundingClientRect().toJSON()),
    );
    const canvas = (await page.locator(".pf-mock__canvas").boundingBox())!;
    for (const [at, box] of boxes.entries()) {
      expect(box.left).toBeGreaterThanOrEqual(canvas.x);
      expect(box.right).toBeLessThanOrEqual(canvas.x + canvas.width);
      expect(box.bottom).toBeLessThanOrEqual(canvas.y + canvas.height);
      for (const other of boxes.slice(at + 1)) {
        const apart =
          box.right <= other.left ||
          other.right <= box.left ||
          box.bottom <= other.top ||
          other.bottom <= box.top;
        expect(apart).toBe(true);
      }
    }
    // Found once: no toast for the stickers after the first.
    await page.waitForTimeout(400);
    await expect(toast).toHaveCount(0);

    // Clear, by keyboard: along the toolbar to it.
    await page.keyboard.press("End");
    await expect(tool(page, "Clear the canvas")).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(stickers).toHaveCount(0);
    await expect(live(page)).toHaveText("Canvas cleared");
    await expect(tool(page, "Clear the canvas")).toHaveAttribute(
      "aria-disabled",
      "true",
    );

    // On a later visit the first sticker finds nothing new.
    await page.reload({ waitUntil: "networkidle" });
    await tool(page, "Stickers").click();
    await expect(page.locator(".pf-ink[data-tool='stickers']")).toBeAttached();
    await page.mouse.click(...(await canvasPoint(page, 0.84, 0.76)));
    await expect(stickers).toHaveCount(1);
    await page.waitForTimeout(400);
    await expect(toast).toHaveCount(0);
  });

  test("one tab stop with a visible ring, the arrows move along, Esc puts a tool down", async ({
    page,
  }) => {
    await visit(page);
    await onlyWithTools(page);
    await page
      .getByRole("link", {
        name: "Node Validator Automation: open the case study",
      })
      .focus();
    await page.keyboard.press("Tab");
    await expect(tool(page, "Move")).toBeFocused();
    const ring = await tool(page, "Move").evaluate((el) => {
      const style = getComputedStyle(el);
      return { style: style.outlineStyle, width: style.outlineWidth };
    });
    expect(ring.style).not.toBe("none");
    expect(parseFloat(ring.width)).toBeGreaterThanOrEqual(2);
    // Awake under focus: the slots show their tools.
    await expect(toolbar(page)).toHaveAttribute("data-awake", "");
    await expect(toolbar(page).locator(".lucide-sticker")).toHaveCount(1);

    await page.keyboard.press("ArrowRight");
    await expect(tool(page, "Stickers")).toBeFocused();
    await page.keyboard.press("ArrowRight");
    await expect(tool(page, "Pen")).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(tool(page, "Pen")).toHaveAttribute("aria-pressed", "true");
    await page.keyboard.press("Escape");
    await expect(tool(page, "Move")).toHaveAttribute("aria-pressed", "true");
    // One stop: Tab leaves the toolbar.
    await page.keyboard.press("Tab");
    await expect(toolbar(page).locator(":focus")).toHaveCount(0);
  });

  test("forced colours: each button keeps an edge, the pressed one in Highlight", async ({
    page,
  }) => {
    await page.emulateMedia({ forcedColors: "active" });
    await visit(page);
    await onlyWithTools(page);
    await tool(page, "Pen").click();
    await expect(tool(page, "Pen")).toHaveAttribute("aria-pressed", "true");
    await page.mouse.move(2, 2);
    // Read once the press has settled.
    await page.waitForTimeout(300);
    const looks = await toolbar(page)
      .getByRole("button")
      .evaluateAll((all) =>
        all.map((el) => {
          const style = getComputedStyle(el);
          return {
            pressed: el.getAttribute("aria-pressed") === "true",
            border: style.borderTopStyle,
            edge: style.borderTopColor,
            background: style.backgroundColor,
          };
        }),
      );
    const transparent = /^(transparent|rgba\(0, 0, 0, 0\))$/;
    for (const look of looks) {
      expect(look.border).toBe("solid");
      expect(look.edge).not.toMatch(transparent);
    }
    const [pressed] = looks.filter((look) => look.pressed);
    expect(pressed!.background).not.toMatch(transparent);
  });
});

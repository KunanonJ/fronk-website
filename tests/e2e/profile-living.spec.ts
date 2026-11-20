import { expect, test, type Page } from "@playwright/test";
import { prepare, tabTo } from "./matrix";

/**
 * The living status (now-building-and-genz Phase 5): the guess beside the
 * footer's Bangkok clock, the ship log where it pushes nothing (the latest
 * commit on main, from /api/github/shipped, mocked here) and the nav
 * avatar's wink.
 * All of it client-only and lazy: the server HTML and a page at rest are as
 * they were. Behaviour runs in desktop Chromium and the WebKit phone; the
 * hover wink needs a mouse, so it runs on desktop only.
 */

const BEHAVIOUR = new Set(["desktop", "webkit-phone"]);
const SHIPPED_ROUTE = "**/api/github/shipped";
const SHA = "0123456789abcdef0123456789abcdef01234567";
/** 03:30 UTC is 10:30 in Bangkok (GMT+7). */
const MORNING = new Date("2026-11-20T03:30:00Z");
const SHIPPED = {
  subject: "the Layers panel selects its frame (#157)",
  // Three hours before MORNING.
  date: "2026-11-20T00:30:00.000Z",
  url: `https://github.com/KunanonJ/fronk-website/commit/${SHA}`,
};

/** Opens a page and waits for hydration (the clock is client-only). */
async function visit(page: Page, path = "/") {
  await page.goto(path, { waitUntil: "load" });
  await expect(page.locator("time[data-clock]")).toBeAttached();
}

/** Counts the requests the page makes for the ship log. */
function countShipLogRequests(page: Page) {
  const seen = { count: 0 };
  page.on("request", (request) => {
    if (new URL(request.url()).pathname === "/api/github/shipped")
      seen.count += 1;
  });
  return seen;
}

test.describe("living status > the footer", () => {
  test.beforeEach(({ browserName: _browserName }, testInfo) => {
    test.skip(
      !BEHAVIOUR.has(testInfo.project.name),
      "desktop and the WebKit phone",
    );
  });

  test("the server HTML carries none of it", async ({ page }) => {
    const html = await (await page.request.get("/")).text();
    expect(html).not.toContain("pf-footer__guess");
    expect(html).not.toContain("pf-footer__shipped");
    expect(html).not.toContain("/api/github/shipped");
    // Its chunk and stylesheet are in no page's first load.
    expect(html).not.toMatch(/Living-[\w-]+\.js|living-[\w-]+\.css/);
  });

  test("the guess sits beside the clock, worded for the hour in Bangkok", async ({
    page,
  }) => {
    await prepare(page);
    await page.route(SHIPPED_ROUTE, (route) => route.fulfill({ status: 503 }));
    await page.clock.setFixedTime(MORNING);
    await visit(page);
    const place = page.locator(".pf-footer__name-block p", {
      has: page.locator("time[data-clock]"),
    });
    await expect(place.locator("time[data-clock]")).toHaveText("10:30");
    await expect(place.locator(".pf-footer__guess")).toHaveText(
      "probably shipping",
    );
    // The chip is styled: its lazy sheet came with it.
    await expect(place.locator(".pf-footer__guess")).not.toHaveCSS(
      "background-color",
      "rgba(0, 0, 0, 0)",
    );
  });

  test("late at night, the guess is that he is asleep", async ({ page }) => {
    await prepare(page);
    await page.route(SHIPPED_ROUTE, (route) => route.fulfill({ status: 503 }));
    // 16:30 UTC is 23:30 in Bangkok.
    await page.clock.setFixedTime(new Date("2026-11-20T16:30:00Z"));
    await visit(page, "/contact");
    await expect(page.locator(".pf-footer__guess")).toHaveText(
      "probably asleep",
    );
  });

  test("the ship log is asked for only near the footer, then shows the commit", async ({
    page,
  }) => {
    await prepare(page);
    const requests = countShipLogRequests(page);
    await page.route(SHIPPED_ROUTE, (route) =>
      route.fulfill({ json: SHIPPED }),
    );
    await page.clock.setFixedTime(MORNING);
    await visit(page);
    await expect(page.locator(".pf-footer__guess")).toBeAttached();
    expect(requests.count).toBe(0);
    await expect(page.locator(".pf-footer__shipped")).toHaveCount(0);

    await page.locator(".pf-footer__card").scrollIntoViewIfNeeded();
    const log = page.locator(".pf-footer__shipped");
    await expect(log).toBeVisible();
    await expect(log).toHaveCount(1);
    expect(requests.count).toBe(1);
    // Where it pushes nothing (UX sweep 21-11-26): under the place's line
    // where the card has columns (desktop), at the end of the card where it
    // is one column (the phone).
    if (
      await page.evaluate(() => matchMedia("(min-width: 50.625rem)").matches)
    ) {
      await expect(
        page.locator(".pf-footer__name-block > :last-child"),
      ).toHaveClass("pf-footer__shipped");
      await expect(
        page.locator(".pf-footer__name-block > :nth-last-child(2)"),
      ).toContainText("Bangkok, GMT+7");
    } else {
      await expect(page.locator(".pf-footer__card > :last-child")).toHaveClass(
        "pf-footer__shipped",
      );
    }
    await expect(log).toContainText(
      /^Shipped 3\s?h\S* ago: the Layers panel selects its frame \(#157\)/,
    );
    await expect(log.locator("time")).toHaveAttribute("datetime", SHIPPED.date);
    const link = log.getByRole("link", {
      name: /^the Layers panel selects its frame \(#157\)/,
    });
    await expect(link).toHaveAttribute("href", SHIPPED.url);
    await expect(link).toHaveAttribute("target", "_blank");
  });

  test("a ship log that arrives with the card in view pushes nothing in it (UX sweep 21-11-26)", async ({
    page,
  }) => {
    // Still: the card's rise into view would move it while it is measured.
    await page.emulateMedia({ reducedMotion: "reduce" });
    await prepare(page);
    // The answer is held until the reader is at the card, as on a slow
    // network (under the Now line it pushed the page list and the
    // copyright down by up to 67 px, a layout shift of 0.04 to 0.06).
    let answer = () => {};
    const held = new Promise<void>((done) => (answer = done));
    await page.route(SHIPPED_ROUTE, async (route) => {
      await held;
      await route.fulfill({ json: SHIPPED });
    });
    await page.clock.setFixedTime(MORNING);
    await visit(page, "/does-not-exist");
    const asked = page.waitForRequest("**/api/github/shipped");
    await page.evaluate(() =>
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: "instant",
      }),
    );
    await asked;
    /** Where the card's lines and lists stand, and the copyright under it. */
    const places = () =>
      page.evaluate(() =>
        [
          ...document.querySelectorAll(
            ".pf-footer__name-block > :not(.pf-footer__shipped), .pf-footer__block, .pf-footer__copyright",
          ),
        ].map((el) => ({
          part: el.className,
          top: Math.round(el.getBoundingClientRect().top),
        })),
      );
    const before = await places();
    answer();
    await expect(page.locator(".pf-footer__shipped")).toBeVisible();
    const after = await places();
    // Nothing in the card moves, nor does the page scroll to follow the
    // dither (the footer's sheet is never the scroll anchor). Under 810 px
    // the log ends the card, so the copyright line under it may move down;
    // from 810 px nothing does.
    const columns = await page.evaluate(
      () => matchMedia("(min-width: 50.625rem)").matches,
    );
    const inCard = (list: typeof before) =>
      list.filter((p) => columns || !p.part.includes("copyright"));
    expect(inCard(after)).toEqual(inCard(before));
  });

  test("when the endpoint fails, the footer shows no ship log and nothing breaks", async ({
    page,
  }) => {
    await prepare(page);
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.route(SHIPPED_ROUTE, (route) => route.fulfill({ status: 503 }));
    await visit(page);
    const answered = page.waitForResponse("**/api/github/shipped");
    await page.locator(".pf-footer__card").scrollIntoViewIfNeeded();
    expect((await answered).status()).toBe(503);
    // A beat for anything that would render.
    await page.waitForTimeout(300);
    await expect(page.locator(".pf-footer__shipped")).toHaveCount(0);
    await expect(page.locator(".pf-footer__name-block")).toContainText(
      "Now: building GoGoCash and Manut AI",
    );
    expect(errors).toEqual([]);
  });

  test("whatever the Worker answers, the request ends: a short page goes network-idle", async ({
    page,
  }) => {
    // The real endpoint, not a mock: a mocked answer arrives whole and ends
    // its request at once, but the Worker's 503 (GitHub refusing a build
    // with no token, say) stayed open while its body went unread, and
    // every networkidle wait on the page timed out. In a window as tall as
    // the 404 itself, its footer card is near the screen at once, so the
    // ship log is asked for while the page loads (the 404 grew with its
    // pixel game, so the height is the page's, not a phone's or a laptop's).
    await page.setViewportSize({ width: 882, height: 2600 });
    await prepare(page);
    const answered = page.waitForResponse("**/api/github/shipped");
    await page.goto("/does-not-exist", {
      waitUntil: "networkidle",
      timeout: 15_000,
    });
    const status = (await answered).status();
    expect([200, 503]).toContain(status);
    await expect(page.locator(".pf-footer__shipped")).toHaveCount(
      status === 200 ? 1 : 0,
    );
  });
});

/** Records each start of the wink's animation, from the first paint. */
async function watchWinks(page: Page) {
  await page.addInitScript(() => {
    const winks: number[] = [];
    Object.assign(window, { __winks: winks });
    document.addEventListener("animationstart", (event) => {
      if (event.animationName === "kj-wink") winks.push(performance.now());
    });
  });
}

const winks = (page: Page) =>
  page.evaluate(() => (window as unknown as { __winks: number[] }).__winks);

const wink = (page: Page) => page.locator(".pf-nav__avatar .pf-nav__wink");

const visibility = (page: Page) =>
  wink(page).evaluate((el) => getComputedStyle(el).visibility);

test.describe("living status > the nav avatar winks", () => {
  test.beforeEach(({ browserName: _browserName }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "a mouse and a keyboard");
  });

  test("at rest the wink is there but hidden", async ({ page }) => {
    await prepare(page);
    await visit(page);
    await expect(wink(page)).toHaveCount(1);
    expect(await visibility(page)).toBe("hidden");
    expect(await wink(page).evaluate((el) => el.getAnimations().length)).toBe(
      0,
    );
  });

  test("once on hover, for a quarter second, never looping; again on the next hover", async ({
    page,
  }) => {
    await prepare(page);
    await watchWinks(page);
    await visit(page);
    const home = page.getByRole("link", { name: "Kunanon Jarat, home" });
    await home.hover();
    await expect.poll(() => winks(page)).toHaveLength(1);
    // Over in 250 ms, and the pointer still resting on the link starts no more.
    await page.waitForTimeout(700);
    expect(await winks(page)).toHaveLength(1);
    expect(await visibility(page)).toBe("hidden");
    await page.mouse.move(700, 600);
    await home.hover();
    await expect.poll(() => winks(page)).toHaveLength(2);
  });

  test("the eye is shut while it winks", async ({ page }) => {
    await prepare(page);
    await page.addInitScript(() => {
      document.addEventListener("animationstart", (event) => {
        if (event.animationName !== "kj-wink") return;
        // Hold the wink where it is, to look at it.
        for (const animation of (event.target as Element).getAnimations())
          animation.pause();
      });
    });
    await visit(page);
    await page.getByRole("link", { name: "Kunanon Jarat, home" }).hover();
    await expect.poll(() => visibility(page)).toBe("visible");
  });

  test("once on keyboard focus", async ({ page }) => {
    await prepare(page);
    await watchWinks(page);
    await visit(page);
    await tabTo(page, page.getByRole("link", { name: "Kunanon Jarat, home" }));
    await expect.poll(() => winks(page)).toHaveLength(1);
  });

  test("never under reduced motion", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await prepare(page);
    await watchWinks(page);
    await visit(page);
    const home = page.getByRole("link", { name: "Kunanon Jarat, home" });
    await home.hover();
    await page.waitForTimeout(500);
    await page.mouse.move(700, 600);
    await tabTo(page, home);
    await page.waitForTimeout(500);
    expect(await winks(page)).toEqual([]);
    expect(await visibility(page)).toBe("hidden");
  });

  test("keeps the worn trait, and does not wink behind shades", async ({
    page,
  }) => {
    await prepare(page);
    await page.addInitScript(() => {
      localStorage.setItem("pf-portrait-found", '["shades"]');
      localStorage.setItem("pf-portrait-worn", "shades");
    });
    await visit(page);
    await expect
      .poll(() =>
        page
          .locator(".pf-nav__avatar path[fill]")
          .evaluateAll((paths) =>
            paths.map((path) => path.getAttribute("fill")),
          ),
      )
      .toContain("#2a2440");
    await expect(wink(page)).toHaveCount(0);
  });
});

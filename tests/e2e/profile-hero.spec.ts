import { expect, test, type Page } from "@playwright/test";
import { settleDither } from "./screenshots";

/**
 * Profile redesign, Phase 2: the Home hero, its canvas mock and the logo strip
 * on Home since the Phase 6 cutover, on the hidden /preview before it
 * (process/features/profile-site-redesign, phase 2
 * gates 2 to 9 and the device matrix of design spec 10.1).
 *
 * Most checks set their own viewport and run once, in desktop Chromium; the
 * phone row, the pager and the recruiter facts also run on the WebKit phone.
 * profile.spec.ts runs the page-wide checks on Home (12 px text, 24 px
 * targets, forced colours, text spacing, zoom, request origins) and a11y.spec
 * runs axe with WCAG 2.2 in both themes.
 */

const HOME = "/";
/** Home's address with nothing after the slash: no hash, no query. */
const HOME_URL = /^https?:\/\/[^/]+\/$/;
const HERO = "section.pf-hero";
const TITLE =
  "Hi, I’m Kunanon Jarat. Forward deployed AI engineering from Bangkok.";
const FRAMES = [
  "TBH Intranet",
  "AI Automation",
  "Node Validator Automation",
] as const;

type Theme = "light" | "dark";

/** Theme, and the intro marked as seen unless a test wants it to play. */
async function prepare(
  page: Page,
  { theme = "light", intro = false }: { theme?: Theme; intro?: boolean } = {},
) {
  await page.addInitScript(
    ([value, seen]) => {
      try {
        localStorage.setItem("theme", value);
        if (seen) sessionStorage.setItem("fronk-intro-seen", "1");
      } catch {
        // Storage can be unavailable; the site then uses its defaults.
      }
    },
    [theme, !intro] as const,
  );
}

async function visit(page: Page) {
  await page.goto(HOME, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
}

function only(projects: readonly string[]) {
  test.skip(
    !projects.includes(test.info().project.name),
    `runs in ${projects.join(" and ")} only`,
  );
}

/**
 * Resolves once the page has stopped scrolling: scrollY unchanged for
 * `quiet` ms, read every frame.
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

/**
 * Where the focused element stands: its box, and whether its centre and
 * edges are its own (nothing over them).
 */
function focusedView(page: Page) {
  return page.evaluate(() => {
    const el = document.activeElement as HTMLElement;
    const box = el.getBoundingClientRect();
    const x = box.left + box.width / 2;
    const y = box.top + box.height / 2;
    const covered = (
      [
        [x, y],
        [box.left + 2, y],
        [box.right - 2, y],
        [x, box.top + 2],
        [x, box.bottom - 2],
      ] as const
    ).filter(([px, py]) => {
      const hit = document.elementFromPoint(px, py);
      return !(hit && (hit === el || el.contains(hit)));
    }).length;
    return {
      name: el.getAttribute("aria-label") ?? el.textContent?.trim() ?? "",
      top: box.top,
      bottom: box.bottom,
      covered,
    };
  });
}

/** The CSS animation running on an element, or "none". */
function animationOf(page: Page, selector: string) {
  return page
    .locator(selector)
    .first()
    .evaluate((el) => getComputedStyle(el).animationName);
}

/**
 * Small, overlapping and covered targets inside the hero, each scrolled into
 * view first (as the tap-area test in smoke.spec does).
 */
async function heroTapProblems(page: Page): Promise<string[]> {
  return page.evaluate((root) => {
    const problems: string[] = [];
    const scope = document.querySelector(root);
    if (!scope) return [`no ${root}`];
    const name = (el: HTMLElement) =>
      (el.getAttribute("aria-label") || el.innerText || el.tagName)
        .trim()
        .slice(0, 30);
    const targets = [
      ...scope.querySelectorAll<HTMLElement>("a[href], button"),
    ].filter((el) => {
      const box = el.getBoundingClientRect();
      const style = getComputedStyle(el);
      return (
        style.display !== "none" &&
        style.visibility !== "hidden" &&
        !el.closest("[aria-hidden='true']") &&
        box.width > 1 &&
        box.height > 1
      );
    });
    for (const el of targets) {
      const box = el.getBoundingClientRect();
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
  }, HERO);
}

test.describe("hero: the recruiter facts (plan gate 2)", () => {
  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 375, height: 812 },
  ]) {
    test(`at ${viewport.width} px the h1, Currently building, Contact me and Résumé are fully in view`, async ({
      page,
    }) => {
      only(["desktop", "webkit-phone"]);
      await page.setViewportSize(viewport);
      await prepare(page);
      await visit(page);
      const hero = page.locator('section[aria-labelledby="hero-title"]');
      const h1 = hero.getByRole("heading", { level: 1 });
      await expect(h1).toHaveAccessibleName(TITLE);
      await expect(h1).toContainText(
        "Forward deployed AI engineering from Bangkok.",
      );
      await expect(h1).toBeInViewport({ ratio: 1 });
      await expect(hero.getByText("Currently building")).toBeInViewport({
        ratio: 1,
      });
      await expect(
        hero.getByRole("link", { name: "Contact me" }),
      ).toBeInViewport({ ratio: 1 });
      await expect(
        hero.getByRole("link", { name: "Résumé", exact: true }),
      ).toBeInViewport({ ratio: 1 });
    });
  }
});

test.describe("hero: the h1 holds still (plan gates 3 and 4)", () => {
  test("with one phrase, line 2 never swaps, and the h1 never animates", async ({
    page,
  }) => {
    only(["desktop"]);
    await page.clock.install();
    await prepare(page);
    await visit(page);
    await page.clock.fastForward(15_000);
    await expect(page.locator(".pf-hero__phrase[data-stamp]")).toHaveCount(0);
    await expect(page.locator(".pf-hero__phrase")).toHaveText(
      "Forward deployed AI engineering from Bangkok.",
    );
    const moving = await page
      .locator("h1")
      .evaluate((h1) => h1.getAnimations({ subtree: true }).length);
    expect(moving).toBe(0);
    await expect(page.locator("h1")).toHaveCSS("opacity", "1");
  });

  test("the h1's text is the largest paint, painted once at full opacity", async ({
    page,
  }) => {
    only(["desktop"]);
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await prepare(page);
    // Each LCP candidate, as the h1 it sits in (its lines are block spans,
    // so the browser names a line; the live Home's h1 is built the same way),
    // and the h1's opacity at the time.
    await page.addInitScript(() => {
      const log: { in: string; opacity: string }[] = [];
      (window as unknown as { __lcp: typeof log }).__lcp = log;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const el = (entry as PerformanceEntry & { element?: Element })
            .element;
          const h1 = el?.closest("h1");
          log.push({
            in: h1 ? `h1#${h1.id}` : (el?.tagName.toLowerCase() ?? "?"),
            opacity: h1 ? getComputedStyle(h1).opacity : "",
          });
        }
      }).observe({ type: "largest-contentful-paint", buffered: true });
    });
    await visit(page);
    await page.waitForTimeout(500);
    const entries = await page.evaluate(
      () =>
        (window as unknown as { __lcp: { in: string; opacity: string }[] })
          .__lcp,
    );
    expect(entries.at(-1)).toEqual({ in: "h1#hero-title", opacity: "1" });
  });
});

test.describe("hero: the entrance and the intro (plan step 2f)", () => {
  test("on a first visit the hero waits, still, until the intro ends", async ({
    page,
  }) => {
    only(["desktop"]);
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await prepare(page, { intro: true });
    await page.goto(HOME);
    const overlay = page.getByTestId("intro-overlay");
    await expect(overlay).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("data-intro", "pending");
    expect(await animationOf(page, ".pf-hero__chips")).toBe("none");
    expect(await animationOf(page, ".pf-mock-wrap")).toBe("none");

    await page.getByRole("button", { name: "Skip intro" }).click();
    await expect(page.locator("html")).toHaveAttribute("data-intro", "done");
    expect(await animationOf(page, ".pf-hero__chips")).toBe("kj-fade-up");
    expect(await animationOf(page, ".pf-mock-wrap")).toBe("kj-file-in");
    expect(await animationOf(page, ".pf-logos")).toBe("kj-fade-up");
    await expect(overlay).toBeHidden();
    expect(await animationOf(page, "h1")).toBe("none");
  });

  test("a first visit made in the app (from another page) still waits, still, under the intro", async ({
    page,
  }) => {
    only(["desktop"]);
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await prepare(page, { intro: true });
    // A full load of another page: no intro there, and no inline script on
    // the Home's hero runs in a visit made in the app.
    await page.goto("/skills", { waitUntil: "networkidle" });
    await expect(page.locator("html")).not.toHaveAttribute("data-intro", /.*/);
    await page.getByRole("link", { name: "Kunanon Jarat, home" }).click();
    await expect(page).toHaveURL(HOME_URL);
    const overlay = page.getByTestId("intro-overlay");
    await expect(overlay).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("data-intro", "pending");
    expect(await animationOf(page, ".pf-hero__chips")).toBe("none");
    expect(await animationOf(page, ".pf-mock-wrap")).toBe("none");
    // The cursor waits too. By the fourth greeting (1.2 s in) a tour that
    // had started at once would have made its first stop (0.9 s). The
    // greeting is on screen for a moment only, so it is watched on every
    // frame (expect's back-off polls could step over it on a slow machine),
    // and the cursor is read at once: the tour itself ends on frame 0.
    await page.waitForFunction(
      () =>
        document
          .querySelector('[data-testid="intro-overlay"]')
          ?.textContent?.includes("こんにちは") ?? false,
      null,
      { polling: "raf", timeout: 5_000 },
    );
    expect(
      await page.locator(".pf-mock__cursor").getAttribute("data-frame"),
    ).toBe("0");

    await page.getByRole("button", { name: "Skip intro" }).click();
    await expect(page.locator("html")).toHaveAttribute("data-intro", "done");
    expect(await animationOf(page, ".pf-hero__chips")).toBe("kj-fade-up");
  });

  test("the portrait mints, then flies into the nav's avatar", async ({
    page,
  }) => {
    only(["desktop"]);
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await prepare(page, { intro: true });
    // What the hand-over names: the intro's portrait in the old state, the
    // nav's avatar in the new one.
    await page.addInitScript(() => {
      const log: string[] = [];
      (window as unknown as { __morph: string[] }).__morph = log;
      const doc = document as unknown as {
        startViewTransition?: (update: () => void) => unknown;
      };
      const start = doc.startViewTransition?.bind(document);
      if (!start) return;
      const name = (selector: string) => {
        const el = document.querySelector(selector);
        return el ? getComputedStyle(el).viewTransitionName : "missing";
      };
      doc.startViewTransition = (update) =>
        start(() => {
          if (document.documentElement.dataset.introMorph) {
            log.push(`from ${name(".intro-portrait")}`);
          }
          update();
          if (document.documentElement.dataset.introMorph) {
            log.push(`to ${name(".pf-nav__avatar")}`);
            log.push(`portrait ${name(".intro-portrait")}`);
          }
        });
    });
    await page.goto(HOME);
    const overlay = page.getByTestId("intro-overlay");
    await expect(overlay).toContainText("Minting");
    await expect(overlay).toContainText("Minted 576 / 576");
    await expect(page.getByTestId("intro-pixels")).toBeAttached();
    await expect(overlay).toBeHidden();
    await expect(page.locator("html")).toHaveAttribute("data-intro", "done");
    await expect(page.locator("html")).not.toHaveAttribute(
      "data-intro-morph",
      /.*/,
    );
    expect(
      await page.evaluate(
        () => (window as unknown as { __morph: string[] }).__morph,
      ),
    ).toEqual(["from pf-avatar", "to pf-avatar", "portrait missing"]);
  });

  test("on a later visit the entrance plays at once, and reduced motion has none", async ({
    page,
  }) => {
    only(["desktop"]);
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await prepare(page);
    await visit(page);
    await expect(page.locator("html")).not.toHaveAttribute("data-intro", /.*/);
    expect(await animationOf(page, ".pf-hero__actions")).toBe("kj-fade-up");
    await expect(page.getByTestId("intro-overlay")).toHaveCount(0);

    await page.emulateMedia({ reducedMotion: "reduce" });
    expect(await animationOf(page, ".pf-hero__actions")).toBe("none");
    expect(await animationOf(page, ".pf-mock-wrap")).toBe("none");
  });
});

test.describe("hero: the canvas mock (plan step 2d, gate 6)", () => {
  test("exposes only its three frame links, named, and the toolbar's five buttons, and selects on hover and focus", async ({
    page,
  }) => {
    only(["desktop"]);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await prepare(page);
    await visit(page);
    const group = page.getByRole("group", { name: "Featured projects" });
    await expect(group.getByRole("link")).toHaveCount(3);
    // From 810 px with a mouse the toolbar is real (now-building-and-genz
    // Phase 4): its buttons are the group's only ones. On a phone there are
    // none (the phone row's test below).
    const tools = group.getByRole("toolbar", { name: "Canvas tools" });
    expect(
      await group
        .getByRole("button")
        .evaluateAll((all) => all.map((el) => el.getAttribute("aria-label"))),
    ).toEqual(["Move", "Stickers", "Pen", "Ink: violet", "Clear the canvas"]);
    await expect(tools.getByRole("button")).toHaveCount(5);
    for (const [index, name] of FRAMES.entries()) {
      const link = group.getByRole("link", {
        name: `${name}: open the case study`,
      });
      await expect(link).toHaveAttribute("href", /^\/portfolio\/[a-z-]+$/);
      if (index === 1) await link.hover();
      if (index === 2) await link.focus();
      if (index > 0) {
        await expect(link).toHaveAttribute("data-selected", "");
        await expect(page.locator(".pf-mock__inspector")).toContainText(name);
      }
    }
    const snapshot = await group.ariaSnapshot();
    expect(snapshot).not.toMatch(/Layers|Prototype|Kunanon|just now/);
    // Nothing inside the hidden panels can take focus (Chrome warns when
    // aria-hidden holds a focusable element).
    const focusable = await page.evaluate(
      () =>
        [
          ...document.querySelectorAll<HTMLElement>(
            ".pf-mock [aria-hidden='true'] :is(a[href], button, input, select, textarea, [tabindex])",
          ),
        ].length,
    );
    expect(focusable).toBe(0);
  });

  test("the inspector's Open project is for a pointer: no link of its own, and a press opens the selected frame's case", async ({
    page,
  }) => {
    only(["desktop"]);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await prepare(page);
    await visit(page);
    const open = page.locator(".pf-mock__open");
    expect(await open.evaluate((el) => el.tagName)).toBe("SPAN");
    const second = page.getByRole("link", {
      name: `${FRAMES[1]}: open the case study`,
    });
    await second.hover();
    await expect(second).toHaveAttribute("data-selected", "");
    const href = await second.getAttribute("href");
    await open.click();
    await expect(page).toHaveURL(new RegExp(`${href}$`));
  });

  test("a layer outlines its frame on hover and selects it on a press, the named cursor following; the dots drift with a mouse", async ({
    page,
  }) => {
    only(["desktop"]);
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await prepare(page);
    await visit(page);
    const frame = (index: number) =>
      page.getByRole("link", {
        name: `${FRAMES[index]}: open the case study`,
      });
    const layer = page.locator(".pf-mock__layer").nth(2);
    // The rows sit inside the hidden decoration: a pointer's shortcut only.
    await expect(layer).not.toHaveAttribute("tabindex");
    await layer.hover();
    await expect(frame(2)).toHaveAttribute("data-hovered", "");
    await expect(frame(2)).not.toHaveAttribute("data-selected");
    await layer.click();
    await expect(frame(2)).toHaveAttribute("data-selected", "");
    await expect(page.locator(".pf-mock__inspector")).toContainText(FRAMES[2]);
    await expect(page.locator(".pf-mock__cursor")).toHaveAttribute(
      "data-frame",
      "2",
    );

    const canvas = page.locator(".pf-mock__canvas");
    const position = () =>
      canvas.evaluate((el) => getComputedStyle(el).backgroundPosition);
    const box = (await canvas.boundingBox())!;
    // Over the comment, bottom left, clear of the frames and panels.
    await page.mouse.move(box.x + 24, box.y + box.height - 24, { steps: 4 });
    await expect.poll(position).not.toBe("0px 0px");
    await page.mouse.move(2, 2);
    await expect.poll(position).toBe("0px 0px");

    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.mouse.move(box.x + 24, box.y + box.height - 24, { steps: 4 });
    await page.waitForTimeout(300);
    expect(await position()).toBe("0px 0px");
  });

  test("the named cursor tours once in under 5 s and rests on the first frame", async ({
    page,
  }) => {
    only(["desktop"]);
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await prepare(page);
    // Every stop the cursor makes, with its time, from the first paint on.
    await page.addInitScript(() => {
      const log: { frame: string | null; at: number }[] = [];
      (window as unknown as { __tour: typeof log }).__tour = log;
      new MutationObserver((records) => {
        for (const record of records) {
          const el = record.target as Element;
          if (el.classList.contains("pf-mock__cursor")) {
            log.push({
              frame: el.getAttribute("data-frame"),
              at: performance.now(),
            });
          }
        }
      }).observe(document, {
        attributes: true,
        attributeFilter: ["data-frame"],
        subtree: true,
      });
    });
    await page.goto(HOME);
    const tour = () =>
      page.evaluate(
        () =>
          (window as unknown as { __tour: { frame: string; at: number }[] })
            .__tour,
      );
    await expect
      .poll(async () => (await tour()).length, { timeout: 10_000 })
      .toBe(3);
    const stops = await tour();
    expect(stops.map((stop) => stop.frame)).toEqual(["2", "1", "0"]);
    // From the first stop to the end of the last glide (0.9 s, the cursor's
    // transition), all under the 5 s that would need a pause control.
    expect(stops.at(-1)!.at - stops[0]!.at + 900).toBeLessThan(5000);
    await expect(
      page.getByRole("link", { name: `${FRAMES[0]}: open the case study` }),
    ).toHaveAttribute("data-selected", "");
  });

  test("on a phone the frames swipe, and the pager turns them", async ({
    page,
  }) => {
    only(["desktop", "webkit-phone"]);
    if (test.info().project.name === "desktop") {
      await page.setViewportSize({ width: 390, height: 844 });
    }
    await page.emulateMedia({ reducedMotion: "reduce" });
    await prepare(page);
    await visit(page);
    await expect(page.locator(".pf-mock__inspector")).toBeHidden();
    // No tools on a phone: the group holds links only.
    await expect(
      page
        .getByRole("group", { name: "Featured projects" })
        .getByRole("button"),
    ).toHaveCount(0);
    await expect(page.getByRole("toolbar")).toHaveCount(0);
    const pager = page.locator(".pf-mock__pager");
    await expect(pager.getByRole("button")).toHaveCount(3);
    const last = pager.getByRole("button", { name: `Show ${FRAMES[2]}` });
    await last.click();
    await expect(last).toHaveAttribute("aria-current", "true");
    await expect(
      page.getByRole("link", { name: `${FRAMES[2]}: open the case study` }),
    ).toBeInViewport({ ratio: 0.9 });
    await expect(page.getByText(`${FRAMES[2]}, 3 of 3`)).toBeAttached();
  });

  for (const size of [
    { width: 768, height: 1024 },
    { width: 640, height: 450 },
  ]) {
    test(`at ${size.width} x ${size.height}, Tab onto each frame brings all of it and its ring into the row`, async ({
      page,
      browserName,
    }) => {
      // Browsers scroll a focused frame into the row only when none of it
      // shows, so one partly past the edge kept focus there (UX hunt 2, U22).
      only(["desktop", "webkit", "firefox"]);
      await page.setViewportSize(size);
      await prepare(page);
      await visit(page);
      const row = page.locator(".pf-mock__frames");
      const links = row.locator("a.pf-mock__frame");
      // Room the ring (2 px, 3 px out) lacks at the row's edges.
      const clipped = () =>
        row.evaluate((el) => {
          const link = document.activeElement as HTMLElement;
          const box = el.getBoundingClientRect();
          const at = link.getBoundingClientRect();
          return Math.max(
            0,
            box.left - (at.left - 5),
            at.right + 5 - box.right,
          );
        });
      await links.first().focus();
      for (let i = 1; i < FRAMES.length; i += 1) {
        await page.keyboard.press(browserName === "webkit" ? "Alt+Tab" : "Tab");
        await expect(links.nth(i)).toBeFocused();
        await expect
          .poll(clipped, { message: `${FRAMES[i]} at ${size.width} px` })
          .toBeLessThanOrEqual(0.5);
        // Focus names the frame; the pager's "n of 3" is for its buttons.
        await expect(page.getByText(`${FRAMES[i]}, ${i + 1} of 3`)).toHaveCount(
          0,
        );
      }
      expect(await page.evaluate(() => window.scrollX)).toBe(0);
    });
  }
});

test.describe("hero: the logo strip (plan step 2e)", () => {
  test("moves after hydration, pauses on hover and from the hero's one toggle", async ({
    page,
  }) => {
    only(["desktop"]);
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await prepare(page);
    await visit(page);
    const strip = page.locator(".pf-logos .ds-marquee");
    const track = strip.locator(".ds-marquee__track");
    await expect(strip).toHaveAttribute("data-running", "");
    await expect(track).toHaveCSS("animation-name", "kj-marquee");
    await expect(
      page.getByRole("list", { name: "Where I’ve worked" }),
    ).toBeAttached();
    await expect(
      page.getByRole("list", { name: "Where I’ve worked" }),
    ).toContainText("GoGoCash");

    await strip.hover();
    await expect(track).toHaveCSS("animation-play-state", "paused");
    await page.mouse.move(0, 0);
    await expect(track).toHaveCSS("animation-play-state", "running");

    const toggles = page.locator(HERO).getByRole("button", { name: /motion/ });
    await expect(toggles).toHaveCount(1);
    await toggles.click();
    await expect(track).toHaveCSS("animation-play-state", "paused");
    await expect(
      page.locator(HERO).getByRole("button", { name: "Play motion" }),
    ).toBeVisible();
  });

  test("under reduced motion it is one still, centred list with no toggle", async ({
    page,
  }) => {
    only(["desktop"]);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await prepare(page);
    await visit(page);
    const strip = page.locator(".pf-logos .ds-marquee");
    await expect(strip).not.toHaveAttribute("data-running", /.*/);
    await expect(
      page.locator(".pf-logos .ds-marquee__list[aria-hidden='true']"),
    ).toBeHidden();
    await expect(
      page.locator(HERO).getByRole("button", { name: /motion/ }),
    ).toHaveCount(0);
  });
});

test.describe("hero: the device matrix and the tap areas (spec 10.1, plan gates 5 and 9)", () => {
  test("at each width of spec 10.1 nothing scrolls sideways and nothing overlaps", async ({
    page,
  }) => {
    only(["desktop"]);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await prepare(page);
    await visit(page);
    for (const width of [344, 390, 820, 882, 1024, 1180, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.evaluate(
        () => new Promise((done) => requestAnimationFrame(() => done(null))),
      );
      const layout = await page.evaluate(() => {
        const box = (selector: string) =>
          document.querySelector(selector)!.getBoundingClientRect();
        const parts = [
          ".pf-hero__chips",
          "h1",
          ".pf-hero__lead",
          ".pf-hero__actions",
        ].map(box);
        const stacked = parts.every(
          (part, i) => i === 0 || part.top >= parts[i - 1]!.bottom - 0.5,
        );
        return {
          sideways: document.documentElement.scrollWidth - window.innerWidth,
          stacked,
          copy: box(".pf-hero__copy").toJSON(),
          mock: box(".pf-mock-wrap").toJSON(),
          logos: box(".pf-logos").toJSON(),
        };
      });
      expect(layout.sideways, `sideways at ${width}`).toBeLessThanOrEqual(1);
      expect(layout.stacked, `copy in order at ${width}`).toBe(true);
      // Side by side from 1180, and from 1024 on a landscape screen such
      // as this loop's 1024 x 900 (UX sweep 21-11-26).
      if (width >= 1024) {
        expect(layout.mock.left, `beside at ${width}`).toBeGreaterThanOrEqual(
          layout.copy.right,
        );
      } else {
        expect(layout.mock.top, `below at ${width}`).toBeGreaterThanOrEqual(
          layout.copy.bottom,
        );
      }
      expect(
        layout.logos.top,
        `strip under the hero's content at ${width}`,
      ).toBeGreaterThanOrEqual(
        Math.max(layout.copy.bottom, layout.mock.bottom) - 1,
      );
    }
  });

  test("at 320, 344 and 390 px the hero's targets are 24 px or more, apart and uncovered", async ({
    page,
  }) => {
    only(["desktop"]);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await prepare(page);
    for (const width of [320, 344, 390]) {
      await page.setViewportSize({ width, height: 800 });
      await visit(page);
      expect(await heroTapProblems(page), `hero at ${width}`).toEqual([]);
    }
  });

  test("at 200% zoom (720 x 450) the h1 keeps 42 px or more and nothing overlaps", async ({
    page,
  }) => {
    only(["desktop"]);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width: 720, height: 450 });
    await prepare(page);
    await visit(page);
    const size = await page
      .locator("h1")
      .evaluate((h1) => parseFloat(getComputedStyle(h1).fontSize));
    expect(size).toBeGreaterThanOrEqual(42);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      ),
    ).toBeLessThanOrEqual(1);
    expect(await heroTapProblems(page)).toEqual([]);
  });

  test("spanned across a vertical hinge, the copy and the canvas sit on either screen", async ({
    page,
    context,
  }) => {
    only(["desktop"]);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await prepare(page);
    // Surface Duo spanned: two 540 px screens and a 34 px hinge. A plain
    // viewport cannot set viewport segments; Chromium's device-metrics
    // override with a display feature does.
    const cdp = await context.newCDPSession(page);
    await cdp.send("Emulation.setDeviceMetricsOverride", {
      width: 1114,
      height: 720,
      deviceScaleFactor: 1,
      mobile: false,
      displayFeature: { orientation: "vertical", offset: 540, maskLength: 34 },
    });
    await visit(page);
    expect(
      await page.evaluate(
        () => matchMedia("(horizontal-viewport-segments: 2)").matches,
      ),
    ).toBe(true);
    const copy = await page.locator(".pf-hero__copy").boundingBox();
    const mock = await page.locator(".pf-mock-wrap").boundingBox();
    expect(copy!.x + copy!.width).toBeLessThanOrEqual(540);
    expect(mock!.x).toBeGreaterThanOrEqual(574);
    // The logo strip keeps to the first screen: its centred label and its
    // row never sit on the hinge.
    for (const part of [".pf-logos", ".pf-logos__label"]) {
      const box = (await page.locator(part).boundingBox())!;
      expect(box.x + box.width, part).toBeLessThanOrEqual(540);
    }
  });
});

test.describe("hero: side by side from 1024 px on a landscape screen (UX sweep 21-11-26)", () => {
  test("at 1024 x 768 the copy, the canvas and the strip's pause share the first screen", async ({
    page,
  }) => {
    only(["desktop"]);
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.setViewportSize({ width: 1024, height: 768 });
    await prepare(page);
    await visit(page);
    const hero = page.locator(HERO);
    // Two columns; the canvas about as wide as at 1180 (503 px). Read from
    // the grid, not the boxes, which the entrance still scales.
    const columns = await page
      .locator(".pf-hero__grid")
      .evaluate((grid) =>
        getComputedStyle(grid).gridTemplateColumns.split(" ").map(parseFloat),
      );
    expect(columns).toHaveLength(2);
    expect(columns[1]).toBeGreaterThanOrEqual(500);
    const h1 = hero.getByRole("heading", { level: 1 });
    const size = await h1.evaluate((el) =>
      parseFloat(getComputedStyle(el).fontSize),
    );
    expect(size).toBeGreaterThanOrEqual(52);
    expect(size).toBeLessThanOrEqual(72);
    // Line 1, "Hi, I’m Kunanon Jarat.", stays one line.
    const lineOne = await page
      .locator(".pf-hero__line")
      .first()
      .evaluate(
        (line) =>
          line.getBoundingClientRect().height /
          parseFloat(getComputedStyle(line).lineHeight),
      );
    expect(lineOne).toBeLessThan(1.5);
    for (const part of [
      h1,
      hero.getByText("Currently building"),
      hero.getByRole("link", { name: "Contact me", exact: true }),
      hero.getByRole("link", { name: "Résumé", exact: true }),
      page.locator(".pf-mock"),
      hero.getByRole("button", { name: "Pause motion" }),
    ]) {
      await expect(part).toBeInViewport({ ratio: 1 });
    }
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      ),
    ).toBeLessThanOrEqual(1);
  });

  test("a 1024 x 1366 portrait screen keeps the stack, the canvas under the copy", async ({
    page,
  }) => {
    only(["desktop"]);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width: 1024, height: 1366 });
    await prepare(page);
    await visit(page);
    const copy = (await page.locator(".pf-hero__copy").boundingBox())!;
    const mock = (await page.locator(".pf-mock-wrap").boundingBox())!;
    expect(mock.y).toBeGreaterThanOrEqual(copy.y + copy.height);
  });
});

/*
 * UX hunt 22-11-26, Home's hero and open-source strip in each engine: the
 * canvas's drawn screens inside their frames (WebKit ran them 13 to 19 px
 * past the foot), the h1's first line whole on large screens, the canvas
 * uncramped from 1024 px, its title clear of Share at 320 px, and each
 * release mark beside its tag.
 */
test.describe("hero: in every engine and size (UX hunt 22-11-26)", () => {
  const ENGINES = ["desktop", "webkit", "firefox"];

  /**
   * One visit, then each size by resizing: the parts measured here are laid
   * out by CSS alone. Two frames let vw units and the layout settle.
   */
  async function resize(page: Page, size: { width: number; height: number }) {
    await page.setViewportSize(size);
    await page.evaluate(
      () =>
        new Promise<void>((done) =>
          requestAnimationFrame(() => requestAnimationFrame(() => done())),
        ),
    );
  }

  test("the canvas's drawn screens stay inside their frames", async ({
    page,
  }) => {
    only([...ENGINES, "webkit-phone"]);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await prepare(page);
    const sizes =
      test.info().project.name === "webkit-phone"
        ? [{ width: 390, height: 844 }]
        : [
            { width: 1440, height: 900 },
            { width: 1024, height: 768 },
            { width: 834, height: 1112 },
          ];
    await visit(page);
    for (const size of sizes) {
      await resize(page, size);
      const overflow = await page.evaluate(() =>
        [...document.querySelectorAll(".pf-thumb")]
          .filter((thumb) => thumb.getBoundingClientRect().width > 0)
          .map((thumb) => {
            const frame = thumb.getBoundingClientRect();
            const screen = thumb
              .querySelector(".pf-thumb__screen")!
              .getBoundingClientRect();
            return Math.round((screen.bottom - frame.bottom) * 10) / 10;
          }),
      );
      expect(overflow, `at ${size.width} px`).toHaveLength(3);
      for (const past of overflow) {
        expect(past, `at ${size.width} px`).toBeLessThanOrEqual(0.5);
      }
    }
  });

  test("on large screens the h1's first line stays one line, at most 90 px", async ({
    page,
  }) => {
    only(ENGINES);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await prepare(page);
    await visit(page);
    for (const size of [
      { width: 1680, height: 1050 },
      { width: 1920, height: 1080 },
      { width: 2560, height: 1440 },
    ]) {
      await resize(page, size);
      const { fontSize, rows } = await page
        .locator(".pf-hero__line")
        .first()
        .evaluate((line) => {
          const range = document.createRange();
          range.selectNodeContents(line);
          const tops = new Set(
            [...range.getClientRects()]
              .filter((rect) => rect.width > 0)
              .map((rect) => Math.round(rect.top)),
          );
          return {
            fontSize: parseFloat(getComputedStyle(line).fontSize),
            rows: tops.size,
          };
        });
      const at = `at ${size.width} x ${size.height}`;
      expect(rows, at).toBe(1);
      expect(fontSize, at).toBeLessThanOrEqual(90);
    }
  });

  /*
   * From 1180 px the copy's column is 503 px and grows with the window,
   * but --type-hero grows faster: at 1180 x 820 the h1 was 72.9 px and its
   * first line, 7.07em wide, broke at "Jarat." in every engine, as it did
   * on 58 of 161 sizes from 1100 to 1280 px wide and 720 to 1000 tall (and
   * at 1366 x 1024 and 1440 x 1200). The h1 is now at most the column over
   * 7.2. Line 2 keeps its three lines.
   */
  test("around 1180 px, and on taller screens up to 1440 px, the h1's first line stays one line", async ({
    page,
  }) => {
    only(ENGINES);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await prepare(page);
    await visit(page);
    const sizes = [
      { width: 1366, height: 1024 },
      { width: 1440, height: 1200 },
    ];
    for (let width = 1100; width <= 1280; width += 20) {
      for (const height of [720, 820, 1000]) sizes.push({ width, height });
    }
    sizes.push({ width: 1180, height: 820 });
    for (const size of sizes) {
      await resize(page, size);
      // The rows each line's text takes (line 2's text is its phrase).
      const [first, second] = await page
        .locator(".pf-hero__line:first-child, .pf-hero__phrase")
        .evaluateAll((lines) =>
          lines.map((line) => {
            const range = document.createRange();
            range.selectNodeContents(line);
            return new Set(
              [...range.getClientRects()]
                .filter((rect) => rect.width > 0)
                .map((rect) => Math.round(rect.top)),
            ).size;
          }),
        );
      const at = `at ${size.width} x ${size.height}`;
      expect(first, `line 1 ${at}`).toBe(1);
      expect(second, `line 2 ${at}`).toBe(3);
    }
  });

  test("from 1024 px the canvas's tabs fit their panel and the second frame's label clears the inspector", async ({
    page,
  }) => {
    only(ENGINES);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await prepare(page);
    await visit(page);
    for (const size of [
      { width: 1024, height: 768 },
      { width: 1180, height: 820 },
      { width: 1280, height: 800 },
      { width: 1366, height: 768 },
      { width: 1440, height: 900 },
    ]) {
      await resize(page, size);
      const room = await page.evaluate(() => {
        const inspector = document
          .querySelector(".pf-mock__inspector")!
          .getBoundingClientRect();
        const range = document.createRange();
        range.selectNodeContents(
          document.querySelector(".pf-mock__inspector .pf-mock__tabs")!,
        );
        const tabs = range.getBoundingClientRect();
        const items = [...document.querySelectorAll(".pf-mock__item")];
        const thumb = (i: number) =>
          items[i]!.querySelector(".pf-thumb")!.getBoundingClientRect();
        const label = items[1]!
          .querySelector(".pf-mock__label")!
          .getBoundingClientRect();
        return {
          tabsToEdge: inspector.right - tabs.right,
          labelToInspector: inspector.left - label.right,
          framesApart: thumb(1).left - thumb(0).right,
        };
      });
      const at = `at ${size.width} x ${size.height}`;
      expect(room.tabsToEdge, `tabs ${at}`).toBeGreaterThanOrEqual(6);
      expect(room.labelToInspector, `label ${at}`).toBeGreaterThanOrEqual(2);
      expect(room.framesApart, `frames ${at}`).toBeGreaterThanOrEqual(8);
    }
  });

  test("at 320 px the canvas's title keeps clear of its Share pill", async ({
    page,
  }) => {
    only(ENGINES);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width: 320, height: 568 });
    await prepare(page);
    await visit(page);
    const gap = await page.evaluate(() => {
      const title = document
        .querySelector(".pf-mock__title")!
        .getBoundingClientRect();
      const share = document
        .querySelector(".pf-mock__share")!
        .getBoundingClientRect();
      return share.left - title.right;
    });
    expect(gap).toBeGreaterThanOrEqual(4);
  });

  test("the open-source strip keeps each release mark beside its tag's first line", async ({
    page,
  }) => {
    only(ENGINES);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await prepare(page);
    await visit(page);
    for (const size of [
      { width: 320, height: 568 },
      { width: 1024, height: 768 },
      { width: 1440, height: 900 },
    ]) {
      await resize(page, size);
      const marks = await page.evaluate(() =>
        [...document.querySelectorAll(".pf-oss__release")].map((release) => {
          const mark = release
            .querySelector(".pf-skill-tag__mark")!
            .getBoundingClientRect();
          const range = document.createRange();
          range.selectNodeContents(release.querySelector(".pf-cat-code")!);
          const first = [...range.getClientRects()].find(
            (rect) => rect.width > 0,
          )!;
          const middle = mark.top + mark.height / 2;
          return {
            tag: release.textContent,
            before: mark.right <= first.left + 0.5,
            onFirstLine: middle > first.top && middle < first.bottom,
          };
        }),
      );
      expect(marks.length, `at ${size.width} px`).toBeGreaterThan(0);
      for (const mark of marks) {
        expect(mark, `at ${size.width} px`).toMatchObject({
          before: true,
          onFirstLine: true,
        });
      }
    }
  });
});

test.describe("hero: the sticky stage (plan step 2a, spec 12 item 9)", () => {
  test("a hero taller than the screen scrolls until its last line shows, then the next section slides over it", async ({
    page,
  }) => {
    only(["desktop"]);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width: 820, height: 1000 });
    await prepare(page);
    await visit(page);
    const hero = page.locator(HERO);
    const height = (await hero.boundingBox())!.height;
    expect(height).toBeGreaterThan(1000);

    // Scrolled to where the stage's bottom meets the screen's, its last
    // line is in view and nothing covers it.
    await page.evaluate((y) => window.scrollTo(0, y), height - 1000);
    const toggleFree = await page.evaluate(() => {
      const strip = document.querySelector(".pf-logos")!;
      const box = strip.getBoundingClientRect();
      const hit = document.elementFromPoint(
        box.left + box.width / 2,
        box.bottom - 12,
      );
      return box.bottom <= window.innerHeight + 1 && strip.contains(hit);
    });
    expect(toggleFree).toBe(true);

    // Further down, the stage holds while #work slides over it.
    const before = (await hero.boundingBox())!.y;
    await page.evaluate((y) => window.scrollTo(0, y), height - 1000 + 300);
    expect((await hero.boundingBox())!.y).toBeCloseTo(before, 0);
    const work = (await page.locator("#work").boundingBox())!.y;
    expect(work).toBeLessThan(1000);
  });

  for (const [width, height] of [
    [1024, 768],
    [1440, 900],
  ] as const) {
    test(`at ${width} x ${height} the logo strip's pause stays in view and pressable while #work's empty top passes over it (WCAG 2.2.2)`, async ({
      page,
    }) => {
      // Firefox (157) has no scroll-driven animations: there the hero's
      // script draws Work's top in their place (useWorkTop, Hero.tsx);
      // without it Work covered the pause 50 px past the hold.
      only(["desktop", "webkit", "firefox"]);
      await page.emulateMedia({ reducedMotion: "no-preference" });
      await page.setViewportSize({ width, height });
      await prepare(page);
      await visit(page);
      // The strip's entrance over: a press while it still rises finds the
      // pause unstable, and the retry scrolls the page until Work covers it.
      await page.locator(".pf-logos").evaluate(async (el) => {
        await Promise.all(el.getAnimations().map((motion) => motion.finished));
      });
      const stage = (await page.locator(HERO).boundingBox())!.height;
      const pause = page
        .locator(HERO)
        .getByRole("button", { name: "Pause motion" });
      // The stage holds once its last line shows; from there #work slides
      // over it. While its empty first 112 px pass over the strip they
      // draw nothing and take no press (the pause was pressable for 50 px
      // at 1024 x 768; UX sweep 21-11-26), until Work's content reaches
      // the pause, about 160 px past the hold in all three engines.
      const hold = Math.max(0, stage - height);
      const workTop = () =>
        page.evaluate(() => {
          const work = document.getElementById("work")!;
          const box = work.getBoundingClientRect();
          const hit = document.elementFromPoint(
            box.left + box.width / 2,
            box.top + 20,
          );
          return {
            opacity: getComputedStyle(work, "::before").opacity,
            drawn: !!hit && work.contains(hit),
          };
        });
      for (const past of [0, 30, 60, 90, 120, 150]) {
        await page.evaluate(
          (y) => window.scrollTo({ top: y, behavior: "instant" }),
          hold + past,
        );
        // In view, and what is drawn at its centre is the pause itself.
        await expect
          .poll(
            () =>
              pause.evaluate((el) => {
                const box = el.getBoundingClientRect();
                const hit = document.elementFromPoint(
                  box.left + box.width / 2,
                  box.top + box.height / 2,
                );
                return box.bottom <= window.innerHeight && el.contains(hit);
              }),
            { message: `${past} px past the hold` },
          )
          .toBe(true);
      }
      // Once Work's content has covered the strip, its empty top is drawn
      // again and takes presses: Work rises over the rest of the hero, and
      // lands from the nav, as before.
      await page.evaluate(
        (y) => window.scrollTo({ top: y, behavior: "instant" }),
        hold + 300,
      );
      // (A scroll timeline, or the script, moves on with the next frame.)
      await expect.poll(workTop).toEqual({ opacity: "1", drawn: true });
      // A press on the pause, back where it shows, pauses the row.
      await page.evaluate(
        (y) => window.scrollTo({ top: y, behavior: "instant" }),
        hold + 60,
      );
      await pause.click();
      await expect(
        page.locator(HERO).getByRole("button", { name: "Play motion" }),
      ).toBeVisible();
      await expect(page.locator(".pf-logos .ds-marquee__track")).toHaveCSS(
        "animation-play-state",
        "paused",
      );
    });
  }

  test("with reduced motion, #work's top is drawn whole as it rises over the still strip, as before", async ({
    page,
  }) => {
    only(["desktop", "webkit", "firefox"]);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width: 1024, height: 768 });
    await prepare(page);
    await visit(page);
    const stage = (await page.locator(HERO).boundingBox())!.height;
    await page.evaluate(
      (y) => window.scrollTo({ top: y, behavior: "instant" }),
      Math.max(0, stage - 768) + 60,
    );
    // Work's own paper and no pseudo-element, in every engine (the hero's
    // script stays out), and what is drawn just under its top is Work.
    await expect
      .poll(() =>
        page.evaluate(() => {
          const work = document.getElementById("work")!;
          const box = work.getBoundingClientRect();
          const hit = document.elementFromPoint(
            box.left + box.width / 2,
            box.top + 20,
          );
          return {
            paper:
              getComputedStyle(work).backgroundColor !== "rgba(0, 0, 0, 0)",
            top: getComputedStyle(work, "::before").content,
            script: work.hasAttribute("data-top"),
            drawn: !!hit && work.contains(hit),
          };
        }),
      )
      .toEqual({ paper: true, top: "none", script: false, drawn: true });
    // The strip stands still, with no pause to keep in reach.
    await expect(
      page.locator(HERO).getByRole("button", { name: /motion/ }),
    ).toHaveCount(0);
  });

  test("at 1024 x 768, Shift+Tab from the stack back onto a frame link leaves each stop in view and uncovered (WCAG 2.4.11)", async ({
    page,
  }) => {
    only(["desktop"]);
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.setViewportSize({ width: 1024, height: 768 });
    await prepare(page);
    await visit(page);
    // The stage fills the screen (side by side from 1024 px on a landscape
    // screen; UX sweep 21-11-26) and is stuck under #work, which covers
    // its lower part.
    const height = (await page.locator(HERO).boundingBox())!.height;
    expect(height).toBeGreaterThanOrEqual(768);
    await page.evaluate(
      (y) => window.scrollTo({ top: y, behavior: "instant" }),
      height - 768 + 400,
    );
    // The keyboard path starts on the first control after the hero, the
    // first case card's link, and walks back into the hero. (A click on a
    // heading would focus <main>, the skip link's target.)
    await page.locator(".pf-card__link").first().focus();
    await scrollSettles(page);
    const stops: string[] = [];
    for (let presses = 0; presses < 12; presses += 1) {
      await page.keyboard.press("Shift+Tab");
      await scrollSettles(page);
      const view = await focusedView(page);
      stops.push(view.name);
      expect(view.covered, `${view.name} covered`).toBe(0);
      expect(view.top, `${view.name} under the bar`).toBeGreaterThanOrEqual(80);
      expect(view.bottom, `${view.name} below the screen`).toBeLessThanOrEqual(
        768,
      );
      if (view.name.endsWith(": open the case study")) break;
    }
    expect(stops.at(-1)).toBe(`${FRAMES[2]}: open the case study`);
  });

  test("at 1024 x 768, Tab from above into Contact me leaves it in view and uncovered (WCAG 2.4.11)", async ({
    page,
  }) => {
    only(["desktop"]);
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.setViewportSize({ width: 1024, height: 768 });
    await prepare(page);
    await visit(page);
    // Scrolled down until the stage is stuck and #work covers part of it;
    // the bar's own links come before the hero in the tab order.
    const height = (await page.locator(HERO).boundingBox())!.height;
    await page.evaluate(
      (y) => window.scrollTo({ top: y, behavior: "instant" }),
      height - 768 + 400,
    );
    const contact = page
      .locator(HERO)
      .getByRole("link", { name: "Contact me", exact: true });
    await page
      .getByRole("navigation", { name: "Primary" })
      .getByRole("link", { name: "Journey", exact: true })
      .focus();
    for (let presses = 0; presses < 12; presses += 1) {
      await page.keyboard.press("Tab");
      if (await contact.evaluate((el) => el === document.activeElement)) break;
    }
    await expect(contact).toBeFocused();
    await scrollSettles(page);
    const view = await focusedView(page);
    expect(view.covered, "Contact me covered").toBe(0);
    expect(view.top, "Contact me under the bar").toBeGreaterThanOrEqual(80);
    expect(view.bottom, "Contact me below the screen").toBeLessThanOrEqual(768);
  });
});

test.describe("hero: forced colours (spec 12 item 26)", () => {
  test("the canvas mock's window, panels, bubble and toolbar keep an edge", async ({
    page,
  }) => {
    only(["desktop"]);
    await page.emulateMedia({
      forcedColors: "active",
      reducedMotion: "reduce",
    });
    await prepare(page);
    await visit(page);
    const edgeless = await page.evaluate(() =>
      [
        ...document.querySelectorAll<HTMLElement>(
          ".pf-mock, .pf-mock__panel, .pf-mock__bubble, .pf-mock__tools",
        ),
      ]
        .filter((el) => getComputedStyle(el).display !== "none")
        .filter((el) => {
          const s = getComputedStyle(el);
          return (
            s.borderTopStyle === "none" ||
            parseFloat(s.borderTopWidth) < 1 ||
            s.borderTopColor === "rgba(0, 0, 0, 0)"
          );
        })
        .map((el) => el.className),
    );
    expect(edgeless).toEqual([]);
  });

  test("on a phone the pager's dots stay drawn, the current one in Highlight", async ({
    page,
  }) => {
    only(["desktop"]);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({
      forcedColors: "active",
      reducedMotion: "reduce",
    });
    await prepare(page);
    await visit(page);
    const dots = await page.evaluate(() =>
      [...document.querySelectorAll(".pf-mock__dot")].map((dot) => {
        const mark = getComputedStyle(dot.querySelector("span")!);
        return {
          current: dot.getAttribute("aria-current") === "true",
          adjust: mark.getPropertyValue("forced-color-adjust"),
          background: mark.backgroundColor,
        };
      }),
    );
    expect(dots).toHaveLength(3);
    const transparent = /^(transparent|rgba\(0, 0, 0, 0\))$/;
    for (const dot of dots) {
      expect(dot.adjust).toBe("none");
      expect(dot.background).not.toMatch(transparent);
    }
    const [current] = dots.filter((dot) => dot.current);
    const others = dots.filter((dot) => !dot.current);
    expect(current).toBeDefined();
    for (const other of others)
      expect(other.background).not.toBe(current!.background);
  });
});

for (const theme of ["light", "dark"] as const) {
  for (const viewport of [
    { width: 1280, height: 800 },
    { width: 390, height: 844 },
  ]) {
    test(`preview hero matches its baseline at ${viewport.width} px (${theme})`, async ({
      page,
    }) => {
      only(["desktop"]);
      await page.setViewportSize(viewport);
      await page.emulateMedia({ reducedMotion: "reduce" });
      await prepare(page, { theme });
      await visit(page);
      await expect(page.locator("html")).toHaveClass(
        new RegExp(`(^|\\s)${theme}(\\s|$)`),
      );
      await settleDither(page);
      await expect(page.locator(HERO)).toHaveScreenshot(
        `preview-hero-${viewport.width}-${theme}.png`,
      );
    });
  }
}

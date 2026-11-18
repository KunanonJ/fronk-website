import { expect, test, type Locator, type Page } from "@playwright/test";

/**
 * Profile redesign, Phase 1: the site chrome on the hidden /preview Home
 * (process/features/profile-site-redesign, phase 1 gates 3, 4, 8 and 9, and the
 * device matrix of design spec 10.1).
 *
 * Behaviour runs in desktop Chromium (1440 px) and the WebKit phone (390 px),
 * which set their own viewports; the matrix widths and the tap areas run in
 * desktop Chromium only. profile.spec.ts holds the widths every preview page
 * must fit, and the best-practice checks.
 */

const HOME = "/preview";
const BEHAVIOUR = new Set(["desktop", "webkit-phone"]);
const DESKTOP = { width: 1440, height: 900 };
const PHONE = { width: 390, height: 844 };
/** The fixed bar's bottom edge: 32 px down and 48 px tall. */
const BAR_BOTTOM = 80;

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

/** The computed value of one CSS property of an element, read at the call. */
function computed(locator: Locator, property: string) {
  return locator.evaluate(
    (el, prop) => getComputedStyle(el).getPropertyValue(prop),
    property,
  );
}

function bar(page: Page): Locator {
  return page.locator("header[data-site-chrome]");
}

function row(page: Page): Locator {
  return page.locator(".pf-nav__row");
}

/** Follows a chrome link: the pill's on desktop, the phone menu's below 810 px. */
async function followChrome(page: Page, label: string) {
  if (await page.getByRole("navigation", { name: "Primary" }).isVisible()) {
    await page
      .getByRole("navigation", { name: "Primary" })
      .getByRole("link", { name: label, exact: true })
      .click();
    return;
  }
  await page.getByRole("button", { name: "Open menu" }).click();
  await page
    .getByRole("navigation", { name: "Site" })
    .getByRole("link", { name: label, exact: true })
    .click();
}

/**
 * Targets under 24 px, overlapping targets, and targets covered at their
 * visible centre or edge, within the given roots. Each target is scrolled
 * into view first, as the tap-area test in smoke.spec does.
 */
async function tapProblems(page: Page, roots: string[]): Promise<string[]> {
  return page.evaluate((selectors) => {
    const SELECTOR =
      "a[href], button, input:not([type=hidden]), summary, [role=button]";
    const problems: string[] = [];
    const name = (el: HTMLElement) =>
      (el.innerText || el.getAttribute("aria-label") || el.tagName)
        .trim()
        .slice(0, 30);
    const targets: HTMLElement[] = [];
    for (const selector of selectors) {
      const scope = document.querySelector(selector);
      if (!scope) {
        problems.push(`no ${selector}`);
        continue;
      }
      for (const el of scope.querySelectorAll<HTMLElement>(SELECTOR)) {
        const box = el.getBoundingClientRect();
        const style = getComputedStyle(el);
        if (
          style.display !== "none" &&
          style.visibility !== "hidden" &&
          box.width > 1 &&
          box.height > 1
        ) {
          targets.push(el);
        }
      }
    }
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
        const a = targets[i]!;
        const b = targets[j]!;
        if (a.contains(b) || b.contains(a)) continue;
        const r = a.getBoundingClientRect();
        const s = b.getBoundingClientRect();
        const x = Math.min(r.right, s.right) - Math.max(r.left, s.left);
        const y = Math.min(r.bottom, s.bottom) - Math.max(r.top, s.top);
        if (x > 0.5 && y > 0.5)
          problems.push(`overlap ${name(a)} / ${name(b)}`);
      }
    }
    for (const el of targets) {
      el.scrollIntoView({ block: "nearest", behavior: "instant" });
      const box = el.getBoundingClientRect();
      const left = Math.max(box.left, 0);
      const top = Math.max(box.top, 0);
      const right = Math.min(box.right, window.innerWidth);
      const bottom = Math.min(box.bottom, window.innerHeight);
      if (right - left < 2 || bottom - top < 2) continue;
      const x = (left + right) / 2;
      const y = (top + bottom) / 2;
      const points: [number, number][] = [
        [x, y],
        [left + 1, y],
        [right - 1, y],
        [x, top + 1],
        [x, bottom - 1],
      ];
      for (const [px, py] of points) {
        const hit = document.elementFromPoint(px, py);
        if (hit && el.contains(hit)) continue;
        problems.push(
          `covered ${name(el)} at ${Math.round(px)},${Math.round(py)} by ${hit?.tagName ?? "nothing"}`,
        );
        break;
      }
    }
    window.scrollTo(0, 0);
    return problems;
  }, roots);
}

test.describe("chrome: layout and the pill nav", () => {
  test.beforeEach(({ browserName: _browserName }, testInfo) => {
    test.skip(
      !BEHAVIOUR.has(testInfo.project.name),
      "desktop and the WebKit phone",
    );
  });

  test("the bar sits at the top on one row, with the links on desktop and the Menu button on a phone", async ({
    page,
  }) => {
    await prepare(page);
    await page.setViewportSize(DESKTOP);
    await visit(page);
    const header = bar(page);
    await expect(header).toHaveAttribute("lang", "en");
    const box = await header.boundingBox();
    expect(box?.y).toBeCloseTo(32, 0);
    expect(box?.height).toBeCloseTo(48, 0);
    await expect(
      page.getByRole("navigation", { name: "Primary" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Work", exact: true }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Open menu" })).toBeHidden();
    await expect(
      page.getByRole("button", { name: "Switch to night mode" }),
    ).toBeVisible();

    await page.setViewportSize(PHONE);
    await expect(
      page.getByRole("navigation", { name: "Primary" }),
    ).toBeHidden();
    await expect(page.getByRole("button", { name: "Open menu" })).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Switch to night mode" }),
    ).toBeHidden();
    await expect(
      page.getByRole("link", { name: "Kunanon Jarat, home" }),
    ).toBeVisible();
  });

  test("the page scrolls under the bar, and the anchors land below it", async ({
    page,
  }) => {
    await prepare(page);
    await page.setViewportSize(DESKTOP);
    await visit(page);
    expect(await computed(page.locator("html"), "scroll-padding-top")).toBe(
      "96px",
    );
    for (const [section, link] of [
      ["work", "Work"],
      ["about", "About"],
      ["journey", "Journey"],
    ] as const) {
      // Scrolling down hides the bar, so each step starts from the top.
      await page.evaluate(() =>
        window.scrollTo({ top: 0, behavior: "instant" }),
      );
      await followChrome(page, link);
      await expect(page).toHaveURL(new RegExp(`#${section}$`));
      const heading = page.locator(`#${section} h2`);
      await expect
        .poll(async () => (await heading.boundingBox())?.y ?? 0, {
          timeout: 5_000,
        })
        .toBeGreaterThanOrEqual(BAR_BOTTOM);
    }
  });

  test("the scrollspy marks the section in view and slides the pill under its link", async ({
    page,
  }) => {
    await prepare(page);
    await page.setViewportSize(DESKTOP);
    await visit(page);
    await page.evaluate(() =>
      document
        .getElementById("about")!
        .scrollIntoView({ block: "start", behavior: "instant" }),
    );
    const about = page
      .getByRole("navigation", { name: "Primary" })
      .getByRole("link", { name: "About", exact: true });
    await expect(about).toHaveAttribute("aria-current", "location");
    const pill = page.locator(".pf-nav__active");
    await expect(pill).toHaveAttribute("data-visible", "");
    await expect
      .poll(async () => (await pill.boundingBox())?.width ?? 0)
      .toBeCloseTo((await about.boundingBox())?.width ?? -1, 0);
  });

  test("the bar hides on the way down and shows again 6 px up", async ({
    page,
  }) => {
    await prepare(page);
    await page.setViewportSize(PHONE);
    await visit(page);
    const header = bar(page);
    await page.evaluate(() =>
      window.scrollTo({ top: 200, behavior: "instant" }),
    );
    await expect(header).toHaveAttribute("data-away", "");
    await expect.poll(() => computed(row(page), "opacity")).toBe("0");
    await page.evaluate(() =>
      window.scrollTo({ top: 190, behavior: "instant" }),
    );
    await expect(header).not.toHaveAttribute("data-away", "");
    await expect.poll(() => computed(row(page), "opacity")).toBe("1");
  });

  test("the bar stays in view while Say hello is open, however far the page moves", async ({
    page,
  }) => {
    await prepare(page);
    await page.setViewportSize(DESKTOP);
    await visit(page);
    await page.getByRole("button", { name: "Say hello" }).first().click();
    await expect(
      page.getByRole("dialog", { name: "Email Kunanon Jarat" }),
    ).toBeVisible();
    await page.evaluate(() =>
      window.scrollTo({ top: 400, behavior: "instant" }),
    );
    await expect(bar(page)).not.toHaveAttribute("data-away", "");
    await expect.poll(() => computed(row(page), "opacity")).toBe("1");
    await page.keyboard.press("Escape");
  });

  test("focus inside the bar brings it back while the page is scrolled down", async ({
    page,
  }) => {
    await prepare(page);
    await page.setViewportSize(DESKTOP);
    await visit(page);
    await page.evaluate(() =>
      window.scrollTo({ top: 400, behavior: "instant" }),
    );
    await expect(bar(page)).toHaveAttribute("data-away", "");
    await page
      .getByRole("navigation", { name: "Primary" })
      .getByRole("link", { name: "Work", exact: true })
      .focus();
    await expect.poll(() => computed(row(page), "opacity")).toBe("1");
  });
});

test.describe("chrome: the phone menu", () => {
  test.beforeEach(({ browserName: _browserName }, testInfo) => {
    test.skip(
      !BEHAVIOUR.has(testInfo.project.name),
      "desktop and the WebKit phone",
    );
  });

  test("Menu opens six links in view, moves focus to the first, and Escape closes it", async ({
    page,
  }) => {
    await prepare(page);
    await page.setViewportSize(PHONE);
    await visit(page);
    const menuButton = page.getByRole("button", { name: "Open menu" });
    await menuButton.click();
    const menu = page.getByRole("navigation", { name: "Site" });
    await expect(menu).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Close menu" }),
    ).toHaveAttribute("aria-expanded", "true");
    await expect(
      page.getByRole("link", { name: "Work", exact: true }),
    ).toBeFocused();

    const links = menu.locator(".pf-menu__link");
    await expect(links).toHaveCount(6);
    for (let i = 0; i < 6; i += 1) {
      const box = await links.nth(i).boundingBox();
      expect(box?.y ?? -1).toBeGreaterThanOrEqual(0);
      expect((box?.y ?? 0) + (box?.height ?? 0)).toBeLessThanOrEqual(
        PHONE.height,
      );
    }
    await expect(links.nth(4)).toHaveText("AI engineering");
    await expect(links.nth(5)).toHaveText("Contact");

    await page.keyboard.press("Escape");
    await expect(menu).toBeHidden();
    await expect(page.getByRole("button", { name: "Open menu" })).toBeFocused();
  });

  test("the phone theme switch moves with the arrow keys and changes the theme", async ({
    page,
  }) => {
    await prepare(page);
    await page.setViewportSize(PHONE);
    await visit(page);
    await page.getByRole("button", { name: "Open menu" }).click();
    const light = page.getByRole("radio", { name: "Light" });
    await light.focus();
    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("radio", { name: "Dark" })).toBeChecked();
    await expect(page.locator("html")).toHaveClass(/(^|\s)dark(\s|$)/);
  });

  test("a click on a menu link closes the menu and goes there", async ({
    page,
  }) => {
    await prepare(page);
    await page.setViewportSize(PHONE);
    await visit(page);
    await page.getByRole("button", { name: "Open menu" }).click();
    await page
      .getByRole("navigation", { name: "Site" })
      .getByRole("link", { name: "About", exact: true })
      .click();
    await expect(page.getByRole("navigation", { name: "Site" })).toBeHidden();
    await expect(page).toHaveURL(/#about$/);
  });
});

test.describe("chrome: Say hello and the theme", () => {
  test.beforeEach(({ browserName: _browserName }, testInfo) => {
    test.skip(
      !BEHAVIOUR.has(testInfo.project.name),
      "desktop and the WebKit phone",
    );
  });

  test("Say hello opens its four actions, reachable by keyboard, and Escape returns focus", async ({
    page,
  }, testInfo) => {
    await prepare(page);
    await page.setViewportSize(DESKTOP);
    await visit(page);
    const trigger = page.getByRole("button", { name: "Say hello" }).first();
    await trigger.click();
    const dialog = page.getByRole("dialog", { name: "Email Kunanon Jarat" });
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText("fronk.kunanon@gmail.com");
    await expect(
      page.getByRole("button", { name: "Copy email" }),
    ).toBeFocused();

    // Safari tabs past links unless the reader turns on full keyboard access,
    // so the order is walked in Chromium; WebKit checks the first row only.
    if (testInfo.project.name === "desktop") {
      await page.keyboard.press("Tab");
      await expect(
        dialog.getByRole("link", { name: /Compose in Gmail/ }),
      ).toBeFocused();
      await page.keyboard.press("Tab");
      await expect(
        dialog.getByRole("link", { name: "Open your mail app" }),
      ).toBeFocused();
      await page.keyboard.press("Tab");
      await expect(
        dialog.getByRole("link", { name: "Use the contact form" }),
      ).toBeFocused();
    }

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test("a click outside Say hello closes it", async ({ page }) => {
    await prepare(page);
    await page.setViewportSize(DESKTOP);
    await visit(page);
    await page.getByRole("button", { name: "Say hello" }).first().click();
    const dialog = page.getByRole("dialog", { name: "Email Kunanon Jarat" });
    await expect(dialog).toBeVisible();
    await page.getByRole("heading", { level: 1 }).click();
    await expect(dialog).toBeHidden();
  });

  test("the footer's Say hello opens above its trigger", async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== "desktop",
      "anchor placement is checked once, in Chromium",
    );
    await prepare(page);
    await page.setViewportSize(DESKTOP);
    await visit(page);
    const trigger = page.locator(".pf-say__trigger--footer");
    await trigger.scrollIntoViewIfNeeded();
    await trigger.click();
    const dialog = page.locator(".pf-say__panel--footer");
    await expect(dialog).toBeVisible();
    const panel = await dialog.boundingBox();
    const button = await trigger.boundingBox();
    expect(panel!.y + panel!.height).toBeLessThanOrEqual(button!.y + 1);
    await page.keyboard.press("Escape");
  });

  test("the nav's theme toggle switches the theme and keeps the choice", async ({
    page,
  }) => {
    await page.setViewportSize(DESKTOP);
    await page.addInitScript(() => {
      try {
        if (!sessionStorage.getItem("seeded")) {
          localStorage.setItem("theme", "light");
          sessionStorage.setItem("fronk-intro-seen", "1");
          sessionStorage.setItem("seeded", "1");
        }
      } catch {
        // Storage can be unavailable.
      }
    });
    await visit(page);
    const toggle = page.getByRole("button", { name: "Switch to night mode" });
    await toggle.click();
    await expect(page.locator("html")).toHaveClass(/(^|\s)dark(\s|$)/);
    await expect(
      page.getByRole("button", { name: "Switch to day mode" }),
    ).toBeVisible();
    await page.reload({ waitUntil: "networkidle" });
    await expect(page.locator("html")).toHaveClass(/(^|\s)dark(\s|$)/);
  });

  test("the preview's stylesheet is linked on /preview only", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "one check is enough");
    await page.goto("/", { waitUntil: "networkidle" });
    expect(await page.locator('link[href*="/assets/profile"]').count()).toBe(0);
    await page.goto(HOME, { waitUntil: "networkidle" });
    await expect(page.locator('link[href*="/assets/profile"]')).toHaveCount(1);
  });
});

test.describe("chrome: reduced motion", () => {
  test("the bar fades without transform or blur, and the theme changes with no view transition", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "one check is enough");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await prepare(page);
    await page.setViewportSize(DESKTOP);
    await visit(page);
    await page.evaluate(() =>
      window.scrollTo({ top: 300, behavior: "instant" }),
    );
    await expect(bar(page)).toHaveAttribute("data-away", "");
    await expect.poll(() => computed(row(page), "opacity")).toBe("0");
    expect(await computed(row(page), "transform")).toBe("none");
    expect(await computed(row(page), "filter")).toBe("none");
    // A hidden bar takes no taps, so the reader scrolls back up first.
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await expect(bar(page)).not.toHaveAttribute("data-away", "");

    await page.evaluate(() => {
      (window as unknown as { viewTransitions: number }).viewTransitions = 0;
      (
        document as unknown as { startViewTransition: unknown }
      ).startViewTransition = () => {
        (window as unknown as { viewTransitions: number }).viewTransitions += 1;
        return {
          finished: Promise.resolve(),
          ready: Promise.resolve(),
          updateCallbackDone: Promise.resolve(),
        };
      };
    });
    await page.getByRole("button", { name: "Switch to night mode" }).click();
    await expect(page.locator("html")).toHaveClass(/(^|\s)dark(\s|$)/);
    expect(
      await page.evaluate(
        () =>
          (window as unknown as { viewTransitions: number }).viewTransitions,
      ),
    ).toBe(0);
  });
});

test.describe("chrome: with JavaScript off", () => {
  for (const [name, viewport] of [
    ["desktop", DESKTOP],
    ["phone", PHONE],
  ] as const) {
    test(`links, Say hello and the phone menu work without script (${name})`, async ({
      browser,
    }, testInfo) => {
      test.skip(
        !BEHAVIOUR.has(testInfo.project.name),
        "desktop and the WebKit phone",
      );
      const context = await browser.newContext({
        javaScriptEnabled: false,
        viewport,
      });
      const page = await context.newPage();
      try {
        await page.goto(HOME, { waitUntil: "load" });
        await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

        const footer = page.locator("footer[data-site-chrome]");
        const pages = footer
          .getByRole("navigation", { name: "Pages" })
          .getByRole("link");
        await expect(pages).toHaveCount(13);
        for (const href of [
          "/",
          "/about",
          "/portfolio",
          "/resume",
          "/contact",
        ]) {
          await expect(
            footer.locator(`a[href="${href}"]`).first(),
          ).toBeAttached();
        }
        await expect(
          page.locator('a[href="/blog"], a[href="/press"]'),
        ).toHaveCount(0);

        // Say hello: the popover opens natively and shows the address and links.
        await page.getByRole("button", { name: "Say hello" }).first().click();
        const dialog = page
          .getByRole("dialog", { name: "Email Kunanon Jarat" })
          .first();
        await expect(dialog).toBeVisible();
        await expect(dialog).toContainText("fronk.kunanon@gmail.com");
        await expect(
          dialog.getByRole("link", { name: "Open your mail app" }),
        ).toHaveAttribute("href", "mailto:fronk.kunanon@gmail.com");
        await expect(
          dialog.getByRole("link", { name: "Use the contact form" }),
        ).toHaveAttribute("href", "/contact");
        await expect(
          dialog.getByRole("button", { name: "Copy email" }),
        ).toHaveCount(0);
        await page.keyboard.press("Escape");
        await expect(dialog).toBeHidden();

        if (name === "phone") {
          await page.getByRole("button", { name: "Open menu" }).click();
          const menu = page.getByRole("navigation", { name: "Site" });
          await expect(menu).toBeVisible();
          await page.keyboard.press("Escape");
          await expect(menu).toBeHidden();
        }
      } finally {
        await context.close();
      }
    });
  }
});

test.describe("chrome: the device matrix and the tap areas", () => {
  test.beforeEach(({ browserName: _browserName }, testInfo) => {
    test.skip(
      testInfo.project.name !== "desktop",
      "widths are set by the test itself",
    );
  });

  test("at each width of design spec 10.1 the bar fits one row and nothing scrolls sideways", async ({
    page,
  }) => {
    await prepare(page);
    await visit(page);
    for (const width of [344, 390, 820, 882, 1180, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.evaluate(
        () => new Promise((done) => requestAnimationFrame(() => done(null))),
      );
      const sideways = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      );
      expect(sideways, `sideways at ${width}`).toBeLessThanOrEqual(1);
      const pill = await page.locator(".pf-nav__pill").boundingBox();
      const right = await page.locator(".pf-nav__right").boundingBox();
      expect(pill, `pill at ${width}`).not.toBeNull();
      expect(right, `right at ${width}`).not.toBeNull();
      expect(
        Math.abs(pill!.y - right!.y),
        `one row at ${width}`,
      ).toBeLessThanOrEqual(1);
      expect(right!.x + right!.width, `inside ${width}`).toBeLessThanOrEqual(
        width,
      );
      if (width < 370) {
        const say = await page.locator(".pf-say__trigger--nav").boundingBox();
        expect(say?.width ?? 0, `round at ${width}`).toBeCloseTo(48, 0);
      }
    }
  });

  test("at 320 and 390 px the bar, the open menu and the open Say hello have no small, overlapping or covered targets", async ({
    page,
  }) => {
    await prepare(page);
    for (const width of [320, 390]) {
      await page.setViewportSize({ width, height: 800 });
      await visit(page);
      expect(
        await tapProblems(page, ["header.pf-nav"]),
        `bar at ${width}`,
      ).toEqual([]);

      await page.getByRole("button", { name: "Open menu" }).click();
      const menu = page.getByRole("navigation", { name: "Site" });
      await expect(menu).toBeVisible();
      // The menu drops 16 px into place, over the bar's lower edge, while it
      // opens (spec 7.6); its targets are measured once it has settled.
      await expect.poll(() => computed(menu, "transform")).toBe("none");
      expect(
        await tapProblems(page, ["header.pf-nav", "#site-menu"]),
        `menu at ${width}`,
      ).toEqual([]);
      await page.keyboard.press("Escape");

      await page.getByRole("button", { name: "Say hello" }).first().click();
      const sayDialog = page.getByRole("dialog", {
        name: "Email Kunanon Jarat",
      });
      await expect(sayDialog).toBeVisible();
      await expect.poll(() => computed(sayDialog, "transform")).toBe("none");
      expect(
        await tapProblems(page, ["header.pf-nav", ".pf-say__panel--nav"]),
        `popover at ${width}`,
      ).toEqual([]);
      await page.keyboard.press("Escape");
    }
  });
});

test.describe("chrome: the layer order of the preview stylesheet", () => {
  test("component rules lose to Tailwind utilities and beat the base layer", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "one check is enough");
    await prepare(page);
    await visit(page);
    const probe = await page.evaluate(() => {
      // Base (Tailwind preflight) resets a list's margin to 0; the component
      // rule sets 12 px; a utility (`hidden`) beats the component's display.
      const list = document.createElement("ul");
      list.className = "pf-footer__list";
      const span = document.createElement("span");
      span.className = "pf-nav__name hidden";
      const plain = document.createElement("span");
      plain.className = "pf-nav__name";
      document.body.append(list, span, plain);
      const result = {
        componentOverBase: getComputedStyle(list).marginTop,
        utilityOverComponent: getComputedStyle(span).display,
        componentDisplay: getComputedStyle(plain).display,
      };
      list.remove();
      span.remove();
      plain.remove();
      return result;
    });
    expect(probe).toEqual({
      componentOverBase: "12px",
      utilityOverComponent: "none",
      // The page body is a flex column, so the span blockifies to flex.
      componentDisplay: "flex",
    });
  });
});

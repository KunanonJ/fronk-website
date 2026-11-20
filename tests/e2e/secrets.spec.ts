import { expect, test, type Page } from "@playwright/test";

/**
 * Secrets and collectibles (now-building-and-genz Phase 3): ⌘K commands with
 * hidden ones, the Konami code's pixel party from the nav's avatar, the trait
 * hunt across the site with the avatar wearing the visitor's trait, and the
 * found-trait toast. All found by the visitor: a page at rest is as it was.
 */

const KONAMI = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];

/** The colours the nav's avatar is drawn in (lib/brand/pixelPortrait.ts). */
const LENSES = "#2a2440"; // Shades
const GOLD = "#e3b341"; // the earring, the glasses, the gold edition
const CORAL = "#ff7a3d"; // the cap

/** Opens a page without the first-visit intro, and waits for hydration. */
async function visit(page: Page, path = "/") {
  await page.addInitScript(() => {
    try {
      sessionStorage.setItem("fronk-intro-seen", "1");
    } catch {
      // Storage can be unavailable; the intro then plays first.
    }
  });
  await page.goto(path, { waitUntil: "load" });
  // The footer's clock is client-only: the page has hydrated.
  await expect(page.locator("time[data-clock]")).toBeAttached();
}

const avatarFills = (page: Page) =>
  page
    .locator(".pf-nav__avatar path[fill]")
    .evaluateAll((paths) => paths.map((path) => path.getAttribute("fill")));

const found = (page: Page) =>
  page.evaluate(
    () =>
      JSON.parse(localStorage.getItem("pf-portrait-found") ?? "[]") as string[],
  );

/** Watches for the party's burst from the start, so a short one is seen. */
async function watchBursts(page: Page) {
  await page.addInitScript(() => {
    const seen = { party: 0 };
    Object.assign(window, { __bursts: seen });
    new MutationObserver((records) => {
      for (const record of records)
        for (const node of record.addedNodes)
          if (
            node instanceof Element &&
            node.matches('[data-testid="party-pixels"]')
          )
            seen.party += 1;
    }).observe(document, { childList: true, subtree: true });
  });
}

const bursts = (page: Page) =>
  page.evaluate(
    () => (window as unknown as { __bursts: { party: number } }).__bursts.party,
  );

async function command(page: Page, text: string) {
  await page.keyboard.press("ControlOrMeta+k");
  const field = page.getByRole("combobox", { name: "Search the site" });
  await expect(field).toBeFocused();
  await field.fill(text);
  return field;
}

test.describe("secrets > a page at rest is as it was", () => {
  test("the avatar is the plain cut and no toast shows", async ({ page }) => {
    await visit(page);
    expect(await avatarFills(page)).not.toContain(LENSES);
    expect(await avatarFills(page)).not.toContain(GOLD);
    await expect(page.getByTestId("trait-toast")).toHaveCount(0);
  });

  test("a trait found before: the server draws the plain cut, the page dresses it", async ({
    page,
  }) => {
    const html = await (await page.request.get("/")).text();
    const nav = html.slice(
      html.indexOf("pf-nav__avatar"),
      html.indexOf("pf-nav__word"),
    );
    expect(nav).not.toContain(CORAL);
    await page.addInitScript(() => {
      localStorage.setItem("pf-portrait-found", '["cap"]');
      localStorage.setItem("pf-portrait-worn", "cap");
    });
    await visit(page);
    await expect.poll(() => avatarFills(page)).toContain(CORAL);
    // Found on an earlier visit: no toast now.
    await expect(page.getByTestId("trait-toast")).toHaveCount(0);
  });
});

test.describe("secrets > ⌘K commands", () => {
  test("a slash lists the commands, the hint says so", async ({ page }) => {
    await visit(page);
    const field = await command(page, "/");
    const group = page.getByRole("group", { name: "Commands" });
    await expect(group.getByRole("option")).toHaveCount(9);
    await expect(group.getByRole("option").first()).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await field.fill("/th");
    await expect(group.getByRole("option")).toHaveText([
      /\/theme light/,
      /\/theme dark/,
    ]);
    if (await page.evaluate(() => matchMedia("(pointer: fine)").matches))
      await expect(page.locator(".pf-search__foot")).toContainText(
        "Type / for commands",
      );
  });

  test("/party awards Shades, and the nav avatar puts them on", async ({
    page,
  }) => {
    await watchBursts(page);
    await visit(page);
    expect(await avatarFills(page)).not.toContain(LENSES);
    await command(page, "/party");
    await page.keyboard.press("Enter");
    await expect(page.locator("dialog.pf-search")).toHaveCount(0);
    await expect.poll(() => bursts(page)).toBe(1);
    // The burst is over in under 3 s, then the avatar wears Shades.
    await expect(page.getByTestId("party-pixels")).toHaveCount(0, {
      timeout: 3000,
    });
    await expect.poll(() => avatarFills(page)).toContain(LENSES);
    expect(await found(page)).toEqual(["shades"]);
    await expect(
      page.getByTestId("trait-toast").getByRole("status"),
    ).toHaveText("You found Shades · 1/6");
  });

  test("sudo hire kunanon answers, finds the Gold earring; the toast follows and Esc closes it", async ({
    page,
  }) => {
    await visit(page);
    await command(page, "sudo hire kunanon");
    await expect(
      page.getByRole("group", { name: "Commands" }).getByRole("option"),
    ).toHaveCount(1);
    await page.keyboard.press("Enter");
    const answer =
      "Permission denied: currently building GoGoCash and Manut AI. Try /contact.";
    await expect(page.locator(".pf-search__answer")).toHaveText(answer);
    await expect(page.locator('dialog [aria-live="polite"]')).toHaveText(
      answer,
    );
    expect(await found(page)).toEqual(["earring"]);
    await expect.poll(() => avatarFills(page)).toContain(GOLD);
    // The toast waits for the dialog: the page behind it is inert.
    await expect(page.getByTestId("trait-toast")).toHaveCount(0);
    await page.keyboard.press("Escape");
    await expect(page.locator("dialog.pf-search")).toHaveCount(0);
    const toast = page.getByTestId("trait-toast");
    await expect(toast.getByRole("status")).toHaveText(
      "You found Gold earring · 1/6",
    );
    await expect(
      toast.getByRole("link", { name: "See your portrait" }),
    ).toHaveAttribute("href", "/about#portrait");
    await page.keyboard.press("Escape");
    await expect(toast).toHaveCount(0);
  });
});

test.describe("secrets > the Konami code", () => {
  test("works from the page, and never from the search field", async ({
    page,
  }) => {
    await watchBursts(page);
    await visit(page);
    const field = await command(page, "");
    for (const key of KONAMI) await field.press(key);
    await page.keyboard.press("Escape");
    await expect(page.locator("dialog.pf-search")).toHaveCount(0);
    // Long enough for a party to have ended.
    await page.waitForTimeout(2500);
    expect(await bursts(page)).toBe(0);
    expect(await found(page)).toEqual([]);

    await page.evaluate(() => (document.activeElement as HTMLElement).blur());
    for (const key of KONAMI) await page.keyboard.press(key);
    await expect.poll(() => bursts(page)).toBe(1);
    await expect.poll(() => found(page)).toEqual(["shades"]);
    await expect.poll(() => avatarFills(page)).toContain(LENSES);
  });

  test("under reduced motion: no burst, the trait and a polite message", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await watchBursts(page);
    await visit(page);
    await page.evaluate(() => (document.activeElement as HTMLElement).blur());
    for (const key of KONAMI) await page.keyboard.press(key);
    await expect(
      page.getByTestId("trait-toast").getByRole("status"),
    ).toHaveText("You found Shades · 1/6");
    expect(await bursts(page)).toBe(0);
    await expect(page.getByTestId("party-pixels")).toHaveCount(0);
    expect(await found(page)).toEqual(["shades"]);
  });
});

test.describe("secrets > the trait hunt", () => {
  test("the end of a case study finds the Gold glasses", async ({ page }) => {
    await visit(page, "/portfolio/tbh-intranet");
    expect(await found(page)).toEqual([]);
    await page
      .getByRole("article", { name: "Work together", exact: true })
      .scrollIntoViewIfNeeded();
    await expect(
      page.getByTestId("trait-toast").getByRole("status"),
    ).toHaveText("You found Gold glasses · 1/6");
    expect(await found(page)).toEqual(["glasses"]);
  });

  test("a contact draft ready stamps it and finds the Lapel pin", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      // The email app opens nothing here.
      const click = HTMLAnchorElement.prototype.click;
      HTMLAnchorElement.prototype.click = function (this: HTMLAnchorElement) {
        if (this.protocol !== "mailto:") click.call(this);
      };
    });
    await visit(page, "/contact");
    await page.locator("#contact-name").fill("Ada Lovelace");
    await page
      .locator("#contact-message")
      .fill("Hello! I would like to talk about a project with your team.");
    await page.locator("#contact-send").click();
    const card = page.getByRole("article", { name: "Say hello", exact: true });
    await expect(card.getByRole("status")).toContainText(
      "Your email is ready.",
    );
    await expect(card.locator(".pf-ready-stamp")).toHaveText("Draft ready");
    await expect(
      page.getByTestId("trait-toast").getByRole("status"),
    ).toHaveText("You found Lapel pin · 1/6");
    expect(await found(page)).toEqual(["pin"]);
  });
});

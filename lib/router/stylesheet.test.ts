import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { stylesheetReady } from "@/lib/router/stylesheet";

/*
 * Home's loader waits for the hero's stylesheet (lib/router/stylesheet.ts),
 * so a client navigation commits Home whole and the router's hash scroll
 * finds its section (UX hunt 2, U01). A sheet that fails, has failed, or
 * stalls must not hold the navigation.
 */

// React's preinit, as it inserts a `precedence` stylesheet on the client.
vi.mock("react-dom", () => ({
  preinit: vi.fn((href: string, { precedence }: { precedence: string }) => {
    if (document.querySelector(`link[href="${href}"]`)) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.setAttribute("href", href);
    link.dataset.precedence = precedence;
    document.head.append(link);
  }),
}));

let id = 0;
/** A sheet no test has asked for: the helper keeps each sheet's answer. */
const fresh = () => `/assets/sheet-${(id += 1)}.css`;
const linkOf = (href: string) =>
  document.querySelector<HTMLLinkElement>(`link[href="${href}"]`)!;
/** Whether the promise has settled, once pending callbacks have run. */
async function settled(promise: Promise<void>) {
  let done = false;
  void promise.then(() => (done = true));
  await vi.advanceTimersByTimeAsync(0);
  return done;
}

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  vi.useRealTimers();
  document.head.replaceChildren();
});

describe("stylesheetReady", () => {
  it("inserts the sheet with its precedence, and settles once it has loaded", async () => {
    const href = fresh();
    const ready = stylesheetReady(href, "pf-test");
    expect(linkOf(href).dataset.precedence).toBe("pf-test");
    expect(await settled(ready)).toBe(false);
    linkOf(href).dispatchEvent(new Event("load"));
    expect(await settled(ready)).toBe(true);
    // Asked again (the next visit, a hover's preload): at once.
    expect(await settled(stylesheetReady(href, "pf-test"))).toBe(true);
  });

  it("settles when the sheet fails, and does not wait for it again", async () => {
    const href = fresh();
    const ready = stylesheetReady(href, "pf-test");
    linkOf(href).dispatchEvent(new Event("error"));
    expect(await settled(ready)).toBe(true);
    expect(await settled(stylesheetReady(href, "pf-test"))).toBe(true);
  });

  it("does not wait for a sheet the page's HTML linked once the document has loaded", async () => {
    // Served with the page (a visit that opened on Home), and loaded or
    // failed with the document: a failed one never fires again.
    const href = fresh();
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.setAttribute("href", href);
    document.head.append(link);
    expect(document.readyState).toBe("complete");
    expect(await settled(stylesheetReady(href, "pf-test"))).toBe(true);
  });

  it("gives up on a sheet that stalls after the cap", async () => {
    const href = fresh();
    const ready = stylesheetReady(href, "pf-test", 4000);
    await vi.advanceTimersByTimeAsync(3999);
    expect(await settled(ready)).toBe(false);
    await vi.advanceTimersByTimeAsync(1);
    expect(await settled(ready)).toBe(true);
  });
});

import { afterEach, describe, expect, it } from "vitest";
import { restoreScrollAfterHydration } from "@/src/lib/scrollRestoration";

/*
 * The router's scroll restoration (src/router.tsx): the restore that runs as
 * the page hydrates is skipped once the visitor has scrolled, so an early
 * scroll survives hydration; a page the visitor has not moved, a deep link
 * included, is restored as before, and so is every later navigation.
 */

const at = (hash = "") => ({ location: { hash } });

function scrollTo(y: number) {
  Object.defineProperty(window, "scrollY", { value: y, configurable: true });
}

afterEach(() => scrollTo(0));

describe("the router's scroll restoration", () => {
  it("restores a page the visitor has not moved, and every later navigation", () => {
    const restore = restoreScrollAfterHydration();
    expect(restore(at())).toBe(true);
    scrollTo(900);
    expect(restore(at())).toBe(true);
    expect(restore(at("ch-03"))).toBe(true);
  });

  it("skips the restore at hydration once the page has left the top", () => {
    const restore = restoreScrollAfterHydration();
    scrollTo(200);
    expect(restore(at())).toBe(false);
    // Navigations in the app restore as before.
    expect(restore(at())).toBe(true);
  });

  it("lands a deep link the visitor has not moved from", () => {
    const restore = restoreScrollAfterHydration();
    // The browser has jumped to the hash's target itself.
    scrollTo(2400);
    expect(restore(at("ventures"))).toBe(true);
  });

  for (const [input, event] of [
    ["a wheel", new WheelEvent("wheel", { deltaY: 120 })],
    ["a touch move", new Event("touchmove")],
    ["a scroll key", new KeyboardEvent("keydown", { key: "PageDown" })],
  ] as const) {
    it(`skips it after ${input}, a deep link too`, () => {
      const restore = restoreScrollAfterHydration();
      window.dispatchEvent(event);
      expect(restore(at("ch-03"))).toBe(false);
      expect(restore(at("ch-03"))).toBe(true);
    });
  }

  it("does not count a key that does not scroll", () => {
    const restore = restoreScrollAfterHydration();
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "a" }));
    expect(restore(at("ch-03"))).toBe(true);
  });

  it("stops listening once hydration has passed", () => {
    const restore = restoreScrollAfterHydration();
    expect(restore(at())).toBe(true);
    window.dispatchEvent(new WheelEvent("wheel", { deltaY: 120 }));
    expect(restore(at("ch-03"))).toBe(true);
  });
});

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { switchTheme } from "@/components/profile/site/themeTransition";

/*
 * The theme switch (design spec 7.5): a view transition when the reader allows
 * motion and the browser has one; otherwise the theme changes at once.
 */

type Transition = { finished: Promise<void> };

function stubReducedMotion(reduce: boolean) {
  vi.spyOn(window, "matchMedia").mockImplementation(
    (query: string) =>
      ({
        matches: reduce && query.includes("reduce"),
        media: query,
        addEventListener: () => {},
        removeEventListener: () => {},
      }) as unknown as MediaQueryList,
  );
}

beforeEach(() => {
  document.documentElement.className = "light";
  stubReducedMotion(false);
});

afterEach(() => {
  delete (document as { startViewTransition?: unknown }).startViewTransition;
  vi.restoreAllMocks();
});

describe("switchTheme", () => {
  it("changes the theme at once where view transitions are missing", () => {
    const setTheme = vi.fn();
    switchTheme("dark", setTheme);
    expect(setTheme).toHaveBeenCalledWith("dark");
    expect(document.documentElement).toHaveClass("theme-switching");
  });

  it("does not start a view transition under reduced motion", () => {
    const start = vi.fn();
    (document as { startViewTransition?: unknown }).startViewTransition = start;
    stubReducedMotion(true);
    const setTheme = vi.fn();
    switchTheme("dark", setTheme);
    expect(start).not.toHaveBeenCalled();
    expect(setTheme).toHaveBeenCalledWith("dark");
  });

  it("runs the switch as a view transition, and clears its classes when it ends", async () => {
    let finish: () => void = () => {};
    const start = vi.fn((arg: { update: () => void } | (() => void)) => {
      // Engines without view-transition types get the callback itself.
      (typeof arg === "function" ? arg : arg.update)();
      const transition: Transition = {
        finished: new Promise<void>((resolve) => {
          finish = resolve;
        }),
      };
      return transition;
    });
    (document as { startViewTransition?: unknown }).startViewTransition = start;
    const setTheme = vi.fn();

    switchTheme("dark", setTheme);
    expect(start).toHaveBeenCalledTimes(1);
    expect(document.documentElement).toHaveClass("dark");
    expect(document.documentElement).toHaveClass("kj-vt");
    expect(setTheme).toHaveBeenCalledWith("dark");

    finish();
    await Promise.resolve();
    await Promise.resolve();
    expect(document.documentElement).not.toHaveClass("kj-vt");
    expect(document.documentElement).not.toHaveClass("theme-switching");
  });
});

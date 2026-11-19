import { afterEach, describe, expect, it, vi } from "vitest";
import { FILTER_NAVIGATION } from "@/src/lib/filterParam";

/*
 * A list filter's navigation (src/lib/filterParam.ts): it replaces the
 * history entry and keeps the scroll, and runs the "filter" view transition
 * only where the engine has view-transition types and motion is allowed.
 * The routes spread it at each click, so the getter decides then.
 */

function stubEngine({ reduced, types }: { reduced: boolean; types: boolean }) {
  vi.stubGlobal("window", {
    matchMedia: (query: string) => ({
      matches: reduced && query === "(prefers-reduced-motion: reduce)",
    }),
  });
  vi.stubGlobal("CSS", {
    supports: (test: string) =>
      types && test === "selector(:active-view-transition-type(a))",
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("FILTER_NAVIGATION", () => {
  it("replaces the entry and keeps the scroll", () => {
    stubEngine({ reduced: false, types: true });
    expect({ ...FILTER_NAVIGATION }).toMatchObject({
      replace: true,
      resetScroll: false,
    });
  });

  it("runs the filter transition where types are supported and motion is allowed", () => {
    stubEngine({ reduced: false, types: true });
    expect({ ...FILTER_NAVIGATION }.viewTransition).toEqual({
      types: ["filter"],
    });
  });

  it("runs none under reduced motion", () => {
    stubEngine({ reduced: true, types: true });
    expect({ ...FILTER_NAVIGATION }.viewTransition).toBe(false);
  });

  it("runs none without view-transition types, where the router would cross-fade the page", () => {
    stubEngine({ reduced: false, types: false });
    expect({ ...FILTER_NAVIGATION }.viewTransition).toBe(false);
  });

  it("runs none on the server", () => {
    expect({ ...FILTER_NAVIGATION }.viewTransition).toBe(false);
  });

  it("decides at each spread, not once at load", () => {
    stubEngine({ reduced: false, types: true });
    expect({ ...FILTER_NAVIGATION }.viewTransition).not.toBe(false);
    stubEngine({ reduced: true, types: true });
    expect({ ...FILTER_NAVIGATION }.viewTransition).toBe(false);
  });
});

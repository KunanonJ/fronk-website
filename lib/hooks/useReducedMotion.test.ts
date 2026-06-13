import { afterEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useReducedMotion } from "./useReducedMotion";

/**
 * Build a controllable `window.matchMedia` mock. jsdom does not implement
 * matchMedia, so every test that touches the hook must install one.
 * Returns helpers to flip the match state and to fire a `change` event,
 * mirroring how a real MediaQueryList notifies listeners.
 */
function installMatchMedia(initialMatches: boolean) {
  let matches = initialMatches;
  const listeners = new Set<(e: MediaQueryListEvent) => void>();

  const mql = {
    get matches() {
      return matches;
    },
    media: "(prefers-reduced-motion: reduce)",
    addEventListener: (_type: string, cb: (e: MediaQueryListEvent) => void) =>
      listeners.add(cb),
    removeEventListener: (_type: string, cb: (e: MediaQueryListEvent) => void) =>
      listeners.delete(cb),
  };

  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => mql),
  );

  return {
    mql,
    listenerCount: () => listeners.size,
    setMatches(next: boolean) {
      matches = next;
      const event = { matches: next } as MediaQueryListEvent;
      listeners.forEach((cb) => cb(event));
    },
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useReducedMotion > given the user prefers reduced motion > returns true", () => {
  it("reports true when the media query matches", () => {
    installMatchMedia(true);
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(true);
  });
});

describe("useReducedMotion > given the user allows motion > returns false", () => {
  it("reports false when the media query does not match", () => {
    installMatchMedia(false);
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(false);
  });
});

describe("useReducedMotion > when the preference changes at runtime > updates", () => {
  it("flips to true when a change event fires with matches=true", () => {
    const mm = installMatchMedia(false);
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(false);

    act(() => mm.setMatches(true));
    expect(result.current).toBe(true);
  });

  it("removes its listener on unmount (no leak)", () => {
    const mm = installMatchMedia(false);
    const { unmount } = renderHook(() => useReducedMotion());
    expect(mm.listenerCount()).toBe(1);

    unmount();
    expect(mm.listenerCount()).toBe(0);
  });
});

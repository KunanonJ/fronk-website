import { afterEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useFinePointer } from "./useFinePointer";

function installMatchMedia(initialMatches: boolean) {
  let matches = initialMatches;
  const listeners = new Set<(e: MediaQueryListEvent) => void>();

  const mql = {
    get matches() {
      return matches;
    },
    media: "(pointer: fine)",
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

describe("useFinePointer > given a mouse-class pointer > returns true", () => {
  it("reports true when the media query matches", () => {
    installMatchMedia(true);
    const { result } = renderHook(() => useFinePointer());
    expect(result.current).toBe(true);
  });
});

describe("useFinePointer > given a coarse pointer > returns false", () => {
  it("reports false when the media query does not match", () => {
    installMatchMedia(false);
    const { result } = renderHook(() => useFinePointer());
    expect(result.current).toBe(false);
  });
});

describe("useFinePointer > when the pointer type changes > updates", () => {
  it("flips to true when a change event fires with matches=true", () => {
    const mm = installMatchMedia(false);
    const { result } = renderHook(() => useFinePointer());
    expect(result.current).toBe(false);

    act(() => mm.setMatches(true));
    expect(result.current).toBe(true);
  });

  it("removes its listener on unmount (no leak)", () => {
    const mm = installMatchMedia(false);
    const { unmount } = renderHook(() => useFinePointer());
    expect(mm.listenerCount()).toBe(1);

    unmount();
    expect(mm.listenerCount()).toBe(0);
  });
});

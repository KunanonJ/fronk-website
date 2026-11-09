import { afterEach, describe, expect, it, vi } from "vitest";
import { prefersReducedMotion } from "./motionRuntime";

function installMatchMedia(matches: boolean) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => ({
      matches,
      media: "(prefers-reduced-motion: reduce)",
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetModules();
  vi.clearAllMocks();
});

describe("prefersReducedMotion > given reduce preference > returns true", () => {
  it("reads the media query", () => {
    installMatchMedia(true);
    expect(prefersReducedMotion()).toBe(true);
  });
});

describe("prefersReducedMotion > given motion allowed > returns false", () => {
  it("reads the media query", () => {
    installMatchMedia(false);
    expect(prefersReducedMotion()).toBe(false);
  });
});

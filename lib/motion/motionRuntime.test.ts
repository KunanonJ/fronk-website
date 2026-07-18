import { afterEach, describe, expect, it, vi } from "vitest";
import {
  prefersReducedMotion,
  createSmoothScroll,
  registerGsapPlugins,
} from "./motionRuntime";

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

describe("createSmoothScroll > given reduced motion > does not construct Lenis", () => {
  it("returns null without calling the factory", () => {
    installMatchMedia(true);
    const factory = vi.fn();
    expect(createSmoothScroll(factory)).toBeNull();
    expect(factory).not.toHaveBeenCalled();
  });
});

describe("createSmoothScroll > given motion allowed > constructs Lenis via factory", () => {
  it("returns the factory result", () => {
    installMatchMedia(false);
    const instance = { raf: vi.fn(), destroy: vi.fn() };
    const factory = vi.fn(() => instance);
    expect(createSmoothScroll(factory)).toBe(instance);
    expect(factory).toHaveBeenCalledTimes(1);
  });
});

describe("registerGsapPlugins > given reduced motion > does not register plugins", () => {
  it("returns false and skips registerPlugin", () => {
    installMatchMedia(true);
    const registerPlugin = vi.fn();
    expect(registerGsapPlugins({ registerPlugin }, [])).toBe(false);
    expect(registerPlugin).not.toHaveBeenCalled();
  });
});

describe("registerGsapPlugins > given motion allowed > registers plugins", () => {
  it("returns true and calls registerPlugin", () => {
    installMatchMedia(false);
    const registerPlugin = vi.fn();
    const plugin = { name: "ScrollTrigger" };
    expect(registerGsapPlugins({ registerPlugin }, [plugin])).toBe(true);
    expect(registerPlugin).toHaveBeenCalledWith(plugin);
  });
});

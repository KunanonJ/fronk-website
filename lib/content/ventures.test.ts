import { describe, expect, it } from "vitest";
import {
  getAllVentureSlugs,
  getAllVentures,
  getFeaturedVentures,
  getVentureBySlug,
} from "./ventures";

describe("ventures > getAllVentures", () => {
  it("returns ventures sorted by year descending", () => {
    const ventures = getAllVentures();
    expect(ventures.length).toBeGreaterThan(0);
    for (let i = 1; i < ventures.length; i++) {
      expect(ventures[i - 1]!.year).toBeGreaterThanOrEqual(ventures[i]!.year);
    }
  });

  it("does not mutate the underlying source on repeated calls", () => {
    const first = getAllVentures();
    const second = getAllVentures();
    expect(first).not.toBe(second);
    expect(first.map((v) => v.slug)).toEqual(second.map((v) => v.slug));
  });
});

describe("ventures > getFeaturedVentures", () => {
  it("returns only ventures marked featured", () => {
    const featured = getFeaturedVentures();
    expect(featured.every((v) => v.featured === true)).toBe(true);
  });

  it("respects the limit argument", () => {
    const limited = getFeaturedVentures(2);
    expect(limited.length).toBeLessThanOrEqual(2);
  });

  it("orders featured ventures flagship-first (by featuredOrder, not year)", () => {
    // Home leads with the flagship (GoGoCash) even though it isn't the newest;
    // getAllVentures stays year-descending for /ventures.
    const featured = getFeaturedVentures();
    expect(featured[0]?.slug).toBe("gogocash");
  });
});

describe("ventures > getVentureBySlug", () => {
  it("returns the venture matching a known slug", () => {
    const slug = getAllVentureSlugs()[0]!;
    const venture = getVentureBySlug(slug);
    expect(venture).not.toBeNull();
    expect(venture?.slug).toBe(slug);
  });

  it("returns null for an unknown slug", () => {
    expect(getVentureBySlug("does-not-exist")).toBeNull();
  });
});

describe("ventures > getAllVentureSlugs", () => {
  it("returns a unique set of slugs", () => {
    const slugs = getAllVentureSlugs();
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});

import { describe, expect, it } from "vitest";
import {
  getAllVentureSlugs,
  getAllVentures,
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

describe("ventures > offer", () => {
  it("states the owner-confirmed free start for both products", () => {
    for (const slug of ["gogocash", "manut"]) {
      expect(getVentureBySlug(slug)?.offer).toEqual({
        label: "Free to start",
        price: "0",
        priceCurrency: "THB",
      });
    }
  });
});

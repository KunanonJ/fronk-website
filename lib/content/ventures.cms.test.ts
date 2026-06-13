import { describe, expect, it } from "vitest";
import { resolveVentures, resolveFeaturedVentures } from "./ventures";

describe("resolveVentures", () => {
  const fallback = [
    {
      slug: "static",
      name: "Static Co",
      tagline: "tag",
      description: "desc",
      year: 2024,
      role: "Founder",
      status: "active" as const,
      stack: ["ts"],
      url: "https://example.com",
      urlLabel: "example.com",
      featured: true,
    },
  ];

  it("returns static ventures when CMS data is empty", () => {
    expect(resolveVentures([], fallback)).toEqual(fallback);
    expect(resolveVentures(null, fallback)).toEqual(fallback);
  });

  it("returns CMS ventures when present", () => {
    const cms = [{ ...fallback[0], slug: "cms", name: "CMS Co" }];
    expect(resolveVentures(cms, fallback)).toEqual(cms);
  });
});

describe("resolveFeaturedVentures", () => {
  const ventures = [
    {
      slug: "a",
      name: "A",
      tagline: "t",
      description: "d",
      year: 2024,
      role: "Founder",
      status: "active" as const,
      stack: [],
      url: "https://a.test",
      urlLabel: "a.test",
      featured: true,
    },
    {
      slug: "b",
      name: "B",
      tagline: "t",
      description: "d",
      year: 2023,
      role: "Founder",
      status: "active" as const,
      stack: [],
      url: "https://b.test",
      urlLabel: "b.test",
      featured: false,
    },
  ];

  it("limits featured ventures", () => {
    expect(resolveFeaturedVentures(ventures, [], 1)).toHaveLength(1);
  });
});

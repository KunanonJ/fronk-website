import { describe, expect, it } from "vitest";
import { profileDesign } from "@/lib/design/scope";

const page = (routeId: string, status = "success") => [
  { routeId: "__root__", status: "success" },
  { routeId: "/_landing", status: "success" },
  { routeId, status },
];

describe("profileDesign", () => {
  it("scopes the pages the cutover moved: Home, the portfolio, the cases, About and Contact", () => {
    for (const id of [
      "/_landing/",
      "/_landing/portfolio/",
      "/_landing/portfolio/$slug",
      "/_landing/ventures/$slug",
      "/_landing/about",
      "/_landing/contact",
    ]) {
      expect(profileDesign(page(id)), id).toBe("profile");
    }
  });

  it("scopes the topic hubs in both languages and the reading pages (Phase 7, D1)", () => {
    for (const id of [
      "/_landing/topics/$slug",
      "/_landing/th/topics/$slug",
      "/_landing/learn",
      "/_landing/examples",
      "/_landing/stack",
      "/_landing/proof",
      "/_landing/build",
    ]) {
      expect(profileDesign(page(id)), id).toBe("profile");
    }
  });

  it("scopes Phase 7 group D2: skills, résumé, /design, blog and press", () => {
    for (const id of [
      "/_landing/skills/",
      "/_landing/skills/$slug",
      "/_landing/resume",
      "/_system/design",
      "/_landing/blog/",
      "/_landing/blog/$slug",
      "/_landing/press",
    ]) {
      expect(profileDesign(page(id)), id).toBe("profile");
    }
  });

  it("leaves Sanity Studio, a bare layout and an empty match list unscoped", () => {
    const root = { routeId: "__root__", status: "success" };
    expect(
      profileDesign([root, { routeId: "/studio", status: "success" }]),
    ).toBe(undefined);
    expect(
      profileDesign([root, { routeId: "/_landing", status: "success" }]),
    ).toBe(undefined);
    expect(profileDesign([])).toBe(undefined);
  });

  it("scopes the new status page, whichever route ended in a 404 or an error", () => {
    // Phase 7f: the 404 and the error state are restyled.
    expect(profileDesign(page("/_landing/portfolio/$slug", "notFound"))).toBe(
      "profile",
    );
    expect(profileDesign(page("/_landing/proof", "error"))).toBe("profile");
    expect(profileDesign(page("/_landing/topics/$slug", "notFound"))).toBe(
      "profile",
    );
    // An unknown URL: the root match carries the not-found mark.
    expect(
      profileDesign([
        { routeId: "__root__", status: "success", _notFound: true },
      ]),
    ).toBe("profile");
  });

  it("has no preview scope left: the /preview routes are gone", () => {
    expect(profileDesign([{ routeId: "/preview" }])).toBe(undefined);
  });
});

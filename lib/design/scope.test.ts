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

  it("leaves the pages Phase 7 restyles on the old tokens", () => {
    for (const id of [
      "/_landing/resume",
      "/_landing/skills/",
      "/_landing/skills/$slug",
      "/_landing/topics/$slug",
      "/_landing/th/topics/$slug",
      "/_landing/proof",
      "/_system/design",
    ]) {
      expect(profileDesign(page(id)), id).toBe(undefined);
    }
    expect(profileDesign([])).toBe(undefined);
  });

  it("leaves a case that ended in a 404 or an error on the old status page", () => {
    expect(profileDesign(page("/_landing/portfolio/$slug", "notFound"))).toBe(
      undefined,
    );
    expect(profileDesign(page("/_landing/ventures/$slug", "error"))).toBe(
      undefined,
    );
  });

  it("has no preview scope left: the /preview routes are gone", () => {
    expect(profileDesign([{ routeId: "/preview" }])).toBe(undefined);
  });
});

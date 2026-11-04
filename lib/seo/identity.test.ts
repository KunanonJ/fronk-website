import { describe, expect, it } from "vitest";
import { IDENTITY_LINKS } from "@/lib/seo/identity";
import { getAllVentures } from "@/lib/content/ventures";

describe("rel=me identity links", () => {
  it("lists personal profiles only, no venture product domains", () => {
    const productHosts = getAllVentures().map((v) => new URL(v.url).host);
    for (const href of IDENTITY_LINKS) {
      if (href.startsWith("mailto:")) continue;
      expect(productHosts, href).not.toContain(new URL(href).host);
    }
    expect(IDENTITY_LINKS).not.toContain("https://gogocash.co");
  });

  it("keeps the email and the main profiles", () => {
    expect(IDENTITY_LINKS.some((h) => h.startsWith("mailto:"))).toBe(true);
    expect(IDENTITY_LINKS.length).toBeGreaterThanOrEqual(5);
  });
});

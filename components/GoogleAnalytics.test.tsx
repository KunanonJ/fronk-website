import { describe, expect, it } from "vitest";
import { productionHost, resolveGaId } from "./GoogleAnalytics";

describe("resolveGaId > gates GA4 loading", () => {
  it("returns the id for a valid GA id in production", () => {
    expect(resolveGaId("G-FRQ6HCZEHF", "production")).toBe("G-FRQ6HCZEHF");
  });

  it("returns null outside production (no localhost/CI/preview pollution)", () => {
    expect(resolveGaId("G-FRQ6HCZEHF", "development")).toBeNull();
    expect(resolveGaId("G-FRQ6HCZEHF", "test")).toBeNull();
  });

  it("returns null when the id is missing", () => {
    expect(resolveGaId(undefined, "production")).toBeNull();
    expect(resolveGaId("", "production")).toBeNull();
  });

  it("returns null for a malformed id (closes the injection surface)", () => {
    expect(resolveGaId("not-a-ga-id", "production")).toBeNull();
    expect(resolveGaId("G-abc'); alert(1)", "production")).toBeNull();
  });
});

describe("productionHost > gates GA to the real production domain", () => {
  it("returns the hostname for a real production URL", () => {
    expect(productionHost("https://kunanonj.com")).toBe("kunanonj.com");
    expect(productionHost("https://kunanonj.com/")).toBe("kunanonj.com");
  });

  it("returns null for placeholder, local, or missing URLs (so staging/preview can't track)", () => {
    expect(productionHost("https://fronk.example.com")).toBeNull();
    expect(productionHost("http://localhost:3000")).toBeNull();
    expect(productionHost(undefined)).toBeNull();
    expect(productionHost("not a url")).toBeNull();
  });
});

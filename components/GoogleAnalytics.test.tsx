import { describe, expect, it } from "vitest";
import { resolveGaId } from "./GoogleAnalytics";

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

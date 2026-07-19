import { describe, expect, it } from "vitest";
import { resolveGtmId } from "./GoogleTagManager";

describe("resolveGtmId > gates GTM loading", () => {
  it("returns the id for a valid GTM id in production", () => {
    expect(resolveGtmId("GTM-ABC1234", "production")).toBe("GTM-ABC1234");
  });

  it("returns null outside production", () => {
    expect(resolveGtmId("GTM-ABC1234", "development")).toBeNull();
  });

  it("returns null when missing or malformed", () => {
    expect(resolveGtmId(undefined, "production")).toBeNull();
    expect(resolveGtmId("G-FRQ6HCZEHF", "production")).toBeNull();
    expect(resolveGtmId("GTM-abc';alert(1)", "production")).toBeNull();
  });
});

import { describe, expect, it } from "vitest";
import { resolveExternalStudioUrl } from "./studio-url";

describe("resolveExternalStudioUrl", () => {
  it("studio_url__given_missing_url__then_returns_null", () => {
    expect(resolveExternalStudioUrl(undefined)).toBeNull();
  });

  it("studio_url__given_blank_url__then_returns_null", () => {
    expect(resolveExternalStudioUrl("   ")).toBeNull();
  });

  it("studio_url__given_configured_url__then_returns_trimmed_url", () => {
    expect(resolveExternalStudioUrl(" https://studio.example.com/ ")).toBe(
      "https://studio.example.com/",
    );
  });
});

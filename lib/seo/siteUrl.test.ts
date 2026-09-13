import { describe, expect, it } from "vitest";
import {
  CANONICAL_SITE_URL,
  PLACEHOLDER_SITE_URL,
  resolvePublicSiteUrl,
} from "./siteUrl";

describe("resolvePublicSiteUrl", () => {
  it("returns a real env URL when set", () => {
    expect(resolvePublicSiteUrl("https://kunanonj.com/", "development")).toBe(
      CANONICAL_SITE_URL,
    );
    expect(resolvePublicSiteUrl("https://staging.example.org", "production")).toBe(
      "https://staging.example.org",
    );
  });

  it("never emits the placeholder in production when env is missing", () => {
    expect(resolvePublicSiteUrl(undefined, "production")).toBe(CANONICAL_SITE_URL);
    expect(resolvePublicSiteUrl(PLACEHOLDER_SITE_URL, "production")).toBe(
      CANONICAL_SITE_URL,
    );
    expect(resolvePublicSiteUrl("http://localhost:3000", "production")).toBe(
      CANONICAL_SITE_URL,
    );
  });

  it("keeps the placeholder only outside production", () => {
    expect(resolvePublicSiteUrl(undefined, "development")).toBe(PLACEHOLDER_SITE_URL);
    expect(resolvePublicSiteUrl(PLACEHOLDER_SITE_URL, "test")).toBe(
      PLACEHOLDER_SITE_URL,
    );
  });
});

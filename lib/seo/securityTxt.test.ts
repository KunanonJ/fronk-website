import { describe, expect, it } from "vitest";
import { SECURITY_TXT_EXPIRES, buildSecurityTxt } from "@/lib/seo/securityTxt";

const DAY_MS = 24 * 60 * 60 * 1000;

describe("security.txt (RFC 9116)", () => {
  const body = buildSecurityTxt();
  const lines = body.trim().split("\n");

  it("has the required Contact and Expires fields", () => {
    expect(lines.some((l) => /^Contact: (mailto:|https:\/\/)/.test(l))).toBe(
      true,
    );
    expect(lines.filter((l) => l.startsWith("Expires: "))).toHaveLength(1);
  });

  it("expires in the future but under about a year out", () => {
    const expires = Date.parse(SECURITY_TXT_EXPIRES);
    expect(Number.isNaN(expires)).toBe(false);
    const remaining = expires - Date.now();
    // Fails 30 days ahead so the date gets bumped before it lapses.
    expect(remaining, "bump SECURITY_TXT_EXPIRES").toBeGreaterThan(30 * DAY_MS);
    expect(remaining).toBeLessThan(400 * DAY_MS);
  });

  it("points Canonical at the .well-known location over https", () => {
    expect(body).toMatch(
      /^Canonical: https:\/\/.+\/\.well-known\/security\.txt$/m,
    );
  });

  it("uses only `Field: value` lines", () => {
    for (const line of lines) {
      expect(line).toMatch(/^[A-Z][A-Za-z-]+: \S/);
    }
  });
});

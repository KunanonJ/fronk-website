import { describe, expect, it } from "vitest";
import { resolveCloudflareAnalyticsToken } from "./CloudflareAnalytics";

describe("resolveCloudflareAnalyticsToken", () => {
  it("cloudflare_analytics__given_missing_token__then_disables_beacon", () => {
    expect(resolveCloudflareAnalyticsToken(undefined, "production")).toBeNull();
  });

  it("cloudflare_analytics__given_non_production__then_disables_beacon", () => {
    expect(resolveCloudflareAnalyticsToken("token", "development")).toBeNull();
  });

  it("cloudflare_analytics__given_token_in_production__then_enables_beacon", () => {
    expect(resolveCloudflareAnalyticsToken(" token ", "production")).toBe(
      "token",
    );
  });
});

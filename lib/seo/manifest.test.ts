import { describe, expect, it } from "vitest";
import manifest from "./manifest";
import { siteConfig } from "@/lib/site";

describe("web app manifest", () => {
  const result = manifest();

  it("carries the site identity", () => {
    expect(result.name).toBe(siteConfig.name);
    expect(result.short_name).toBeTruthy();
    expect(result.start_url).toBe("/");
  });

  it("takes the profile palette: the light paper and the light theme colour", () => {
    // Phase 6 cutover (design spec 13 item 37): was #000000 for both.
    expect(result.background_color).toBe("#ffffff");
    expect(result.theme_color).toBe("#f7f3ff");
  });

  it("references at least one icon", () => {
    expect(result.icons?.length ?? 0).toBeGreaterThanOrEqual(1);
  });
});

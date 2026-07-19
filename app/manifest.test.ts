import { describe, expect, it } from "vitest";
import manifest from "@/app/manifest";
import { siteConfig } from "@/lib/site";

describe("web app manifest", () => {
  const result = manifest();

  it("carries the site identity", () => {
    expect(result.name).toBe(siteConfig.name);
    expect(result.short_name).toBeTruthy();
    expect(result.start_url).toBe("/");
  });

  it("matches the landing black brand canvas", () => {
    expect(result.background_color).toBe("#000000");
    expect(result.theme_color).toBe("#000000");
  });

  it("references at least one icon", () => {
    expect(result.icons?.length ?? 0).toBeGreaterThanOrEqual(1);
  });
});

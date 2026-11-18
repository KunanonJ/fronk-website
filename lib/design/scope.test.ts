import { describe, expect, it } from "vitest";
import { profileDesign } from "@/lib/design/scope";

describe("profileDesign", () => {
  it("scopes every page under the preview layout", () => {
    expect(profileDesign(["__root__", "/preview", "/preview/"])).toBe(
      "profile",
    );
    expect(profileDesign(["__root__", "/preview", "/preview/system"])).toBe(
      "profile",
    );
  });

  it("leaves live pages alone, even ones whose path starts with /preview", () => {
    expect(profileDesign(["__root__", "/_landing", "/_landing/contact"])).toBe(
      undefined,
    );
    expect(profileDesign(["__root__", "/previewer"])).toBe(undefined);
    expect(profileDesign([])).toBe(undefined);
  });
});

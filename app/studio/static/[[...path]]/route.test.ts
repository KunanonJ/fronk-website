import { describe, expect, it } from "vitest";
import { resolveStudioStaticAssetPath } from "./route";

describe("resolveStudioStaticAssetPath", () => {
  it("studio_manifest__given_missing_path__then_rejects_request", () => {
    expect(resolveStudioStaticAssetPath(undefined)).toBeNull();
  });

  it("studio_manifest__given_traversal_segment__then_rejects_request", () => {
    expect(resolveStudioStaticAssetPath(["..", "secret.json"])).toBeNull();
  });

  it("studio_manifest__given_valid_path__then_returns_static_asset_path", () => {
    expect(resolveStudioStaticAssetPath(["create-manifest.json"])).toBe(
      "/studio/static/create-manifest.json",
    );
  });
});

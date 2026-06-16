import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();

describe("Sanity Studio manifest static assets", () => {
  it("manifest__given_cloudflare_worker_runtime__then_uses_public_asset_not_node_fs_route", () => {
    const publicManifestPath = join(
      root,
      "public/studio/static/create-manifest.json",
    );
    const runtimeRoutePath = join(
      root,
      "app/studio/static/[[...path]]/route.ts",
    );

    expect(existsSync(publicManifestPath)).toBe(true);
    expect(() =>
      JSON.parse(readFileSync(publicManifestPath, "utf8")),
    ).not.toThrow();

    expect(existsSync(runtimeRoutePath)).toBe(true);
    expect(readFileSync(runtimeRoutePath, "utf8")).not.toContain("node:fs");
  });
});

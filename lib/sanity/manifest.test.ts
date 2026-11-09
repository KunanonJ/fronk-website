import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();

describe("Sanity Studio manifest static assets", () => {
  it("manifest__given_cloudflare_worker_runtime__then_generates_public_asset_before_build", () => {
    const packageJsonPath = join(root, "package.json");
    const runtimeRoutePath = join(
      root,
      "app/studio/static/[[...path]]/route.ts",
    );

    const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8")) as {
      scripts: Record<string, string>;
    };
    // The wrapper skips the extract when the schema inputs are unchanged.
    expect(packageJson.scripts["sanity:manifest"]).toBe(
      "node scripts/sanity-manifest.mjs",
    );
    const wrapper = readFileSync(join(root, "scripts/sanity-manifest.mjs"), "utf8");
    expect(wrapper).toContain('const OUT = "public/studio/static"');
    expect(wrapper).toMatch(/"manifest", "extract", "--path", OUT/);
    expect(packageJson.scripts.build).toMatch(
      /^pnpm sanity:manifest && next build/,
    );

    const runtimeRouteSource = readFileSync(runtimeRoutePath, "utf8");
    expect(runtimeRouteSource).not.toContain("node:fs");
    expect(runtimeRouteSource).toContain("env.ASSETS.fetch");
  });
});

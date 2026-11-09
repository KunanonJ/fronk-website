import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();

describe("Sanity Studio manifest static assets", () => {
  it("generates the Studio manifest into public/ before the Vite build", () => {
    const packageJson = JSON.parse(
      readFileSync(join(root, "package.json"), "utf8"),
    ) as {
      scripts: Record<string, string>;
    };
    // The wrapper skips the extract when the schema inputs are unchanged.
    expect(packageJson.scripts["sanity:manifest"]).toBe(
      "node scripts/sanity-manifest.mjs",
    );
    const wrapper = readFileSync(
      join(root, "scripts/sanity-manifest.mjs"),
      "utf8",
    );
    expect(wrapper).toContain('const OUT = "public/studio/static"');
    expect(wrapper).toMatch(/"manifest", "extract", "--path", OUT/);
    // public/ is copied into the static assets, so /studio/static/* never reaches the Worker.
    expect(packageJson.scripts.build).toMatch(
      /^pnpm sanity:manifest && vite build/,
    );
  });
});

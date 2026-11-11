import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

/**
 * Third-party text copied in by `pnpm skills:sync`. The site shows it, but it
 * is not the owner's wording, so the audits of his claims leave it out.
 */
const THIRD_PARTY = new Set(["lib/content/skills.generated.json"]);

export type SiteSource = { file: string; text: string };

let cached: readonly SiteSource[] | undefined;

/**
 * Every source file that can put the owner's words on the site: code,
 * content, the static files under public/ and the Sanity schemas, plus the
 * Sanity seed. For the audits that look for a figure or a claim in a place
 * it was not cleared for (recruiter-fit phase 3). Paths are relative to the
 * repository root, where the tests run.
 *
 * Not read: test files; docs/ and process/, which are notes; the third-party
 * text above; and binary files such as the project cover, a capture of Home
 * that repeats its outcome lines.
 */
export function siteSources(): readonly SiteSource[] {
  if (cached) return cached;
  const out: SiteSource[] = [];
  const walk = (dir: string) => {
    for (const name of readdirSync(dir)) {
      const file = join(dir, name);
      if (statSync(file).isDirectory()) walk(file);
      else if (
        /\.(ts|tsx|json|md|mdx|mjs)$/.test(name) &&
        !/\.test\.tsx?$/.test(name) &&
        !THIRD_PARTY.has(file)
      )
        out.push({ file, text: readFileSync(file, "utf8") });
    }
  };
  for (const dir of ["lib", "components", "src", "public", "sanity"]) walk(dir);
  out.push({
    file: "scripts/seed-content.mjs",
    text: readFileSync("scripts/seed-content.mjs", "utf8"),
  });
  cached = out;
  return out;
}

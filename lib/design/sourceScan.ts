import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

/** Lists .tsx source files (no tests) under the given repo-relative dirs. */
export function sourceFiles(dirs: readonly string[], root = process.cwd()): string[] {
  const out: string[] = [];
  const walk = (dir: string) => {
    for (const name of readdirSync(dir)) {
      const full = join(dir, name);
      if (statSync(full).isDirectory()) walk(full);
      else if (full.endsWith(".tsx") && !full.endsWith(".test.tsx")) out.push(relative(root, full));
    }
  };
  for (const d of dirs) walk(join(root, d));
  return out.sort();
}

export function read(path: string, root = process.cwd()): string {
  return readFileSync(join(root, path), "utf8");
}

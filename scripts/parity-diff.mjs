#!/usr/bin/env node
/**
 * Compares two parity crawls (scripts/parity-crawl.mjs). Exits 1 on any
 * difference not covered by --ignore entries ("path:field" or "*:field").
 *
 *   node scripts/parity-diff.mjs reference.json candidate.json [--ignore '*:csp'] [--only /,/about]
 */
import { readFileSync } from "node:fs";
import { diffRecord } from "../lib/parity/parity.mjs";

const args = process.argv.slice(2);
const files = args.filter(
  (a, i) => !a.startsWith("--") && !(args[i - 1] ?? "").startsWith("--"),
);
const flag = (name) =>
  args.flatMap((a, i) => (a === name ? [args[i + 1]] : []));
const ignore = flag("--ignore").flatMap((v) => v.split(","));
const only = flag("--only").flatMap((v) => v.split(","));
const [a, b] = files.map((f) => JSON.parse(readFileSync(f, "utf8")));

const paths = only.length
  ? only
  : [...new Set([...Object.keys(a), ...Object.keys(b)])].sort();
let failures = 0;
for (const path of paths) {
  const diffs = diffRecord(path, a[path], b[path], ignore);
  if (!diffs.length) continue;
  failures += 1;
  console.log(`\n${path}`);
  for (const d of diffs) {
    if (d.onlyA || d.onlyB) {
      for (const v of d.onlyA)
        console.log(`  - ${d.field}: ${v.slice(0, 240)}`);
      for (const v of d.onlyB)
        console.log(`  + ${d.field}: ${v.slice(0, 240)}`);
    } else {
      console.log(
        `  ${d.field}: ${JSON.stringify(d.a)?.slice(0, 160)} -> ${JSON.stringify(d.b)?.slice(0, 160)}`,
      );
    }
  }
}
console.log(
  `\n[parity] ${paths.length} URLs compared, ${failures} with differences`,
);
process.exit(failures ? 1 : 0);

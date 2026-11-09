#!/usr/bin/env node
/**
 * Extracts the Sanity Studio manifest (public/studio/static) only when its
 * inputs change. The extract takes about 10 s and ran before every build;
 * the schema rarely changes (visual-redesign Phase 6, dev speed).
 *
 * Inputs hashed: sanity.config.ts, sanity.cli.ts, everything under sanity/,
 * the lockfile (Sanity version) and the Sanity env vars. The stamp lives in
 * node_modules/.cache, so a fresh install always extracts.
 *
 * SANITY_MANIFEST_FORCE=1 always extracts.
 */
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";

const OUT = "public/studio/static";
const STAMP = "node_modules/.cache/sanity-manifest/inputs.sha256";
const ENV_KEYS = [
  "NEXT_PUBLIC_SANITY_PROJECT_ID",
  "NEXT_PUBLIC_SANITY_DATASET",
  "NEXT_PUBLIC_SANITY_API_VERSION",
  "SANITY_STUDIO_PROJECT_ID",
  "SANITY_STUDIO_DATASET",
];

function listFiles(dir) {
  return readdirSync(dir)
    .sort()
    .flatMap((name) => {
      const full = join(dir, name);
      return statSync(full).isDirectory() ? listFiles(full) : [full];
    });
}

const inputs = [
  "sanity.config.ts",
  "sanity.cli.ts",
  "pnpm-lock.yaml",
  ...listFiles("sanity"),
];
const hash = createHash("sha256");
for (const file of inputs) {
  hash.update(`${file}\0`);
  hash.update(readFileSync(file));
}
for (const key of ENV_KEYS) hash.update(`${key}=${process.env[key] ?? ""}\0`);
const digest = hash.digest("hex");

const upToDate =
  !process.env.SANITY_MANIFEST_FORCE &&
  existsSync(join(OUT, "create-manifest.json")) &&
  existsSync(STAMP) &&
  readFileSync(STAMP, "utf8").trim() === digest;

if (upToDate) {
  console.log("[sanity:manifest] inputs unchanged; skipping extract");
} else {
  execFileSync(
    "pnpm",
    ["exec", "sanity", "manifest", "extract", "--path", OUT],
    {
      stdio: "inherit",
    },
  );
  mkdirSync(dirname(STAMP), { recursive: true });
  writeFileSync(STAMP, `${digest}\n`);
}

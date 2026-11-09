#!/usr/bin/env node
/**
 * Per-route <head> snapshot from a production `next build` (visual-redesign
 * Phase 6): title, meta, link tags and JSON-LD for every prerendered route.
 * It is the SEO parity reference for the TanStack Start migration: build the
 * new app, snapshot it the same way, and diff the two JSON files.
 *
 *   pnpm build && node scripts/snapshot-heads.mjs [out.json]
 *
 * Framework asset tags (/_next/static, preload/preconnect hints) are dropped
 * and hashed OG image URLs are normalised, so only content-level differences
 * show up in a diff.
 */
import fs from "node:fs";
import path from "node:path";

const APP_DIR = ".next/server/app";
const out = process.argv[2] ?? "process/general-plans/references/head-snapshot_09-11-26.json";

if (!fs.existsSync(APP_DIR)) {
  console.error(`[heads] ${APP_DIR} not found. Run a production build first: pnpm build`);
  process.exit(2);
}

function htmlFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return htmlFiles(full);
    return entry.name.endsWith(".html") ? [full] : [];
  });
}

const FRAMEWORK = /\/_next\/static\/|rel="(preload|modulepreload|preconnect|dns-prefetch|stylesheet)"/;
const normalise = (tag) =>
  tag
    .replace(/(opengraph-image|twitter-image)-[a-z0-9]+\?[a-f0-9]+/g, "$1-HASH")
    .replace(/\s+/g, " ");

const routes = {};
for (const file of htmlFiles(APP_DIR).sort()) {
  if (/_global-error|_not-found/.test(file)) continue;
  const route =
    "/" +
    path
      .relative(APP_DIR, file)
      .replace(/\.html$/, "")
      .replace(/(^|\/)index$/, "");
  const html = fs.readFileSync(file, "utf8");
  const head = html.match(/<head>([\s\S]*?)<\/head>/)?.[1] ?? "";
  const title = head.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? null;
  const tags = [...head.matchAll(/<(meta|link)\b[^>]*>/g)]
    .map((m) => m[0])
    .filter((tag) => !FRAMEWORK.test(tag))
    .map(normalise);
  const jsonLd = [...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map(
    (m) => {
      try {
        return JSON.parse(m[1]);
      } catch {
        return m[1];
      }
    },
  );
  routes[route.replace(/\/$/, "") || "/"] = { title, tags, jsonLd };
}

fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, `${JSON.stringify(routes, null, 2)}\n`);
console.log(`[heads] ${Object.keys(routes).length} routes -> ${out}`);

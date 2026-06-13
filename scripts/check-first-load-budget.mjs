#!/usr/bin/env node
/**
 * Landing-JS perf gate (Phase 5).
 *
 * Why this exists: under the default Turbopack `next build`, Next 16 prints no
 * First-Load-JS table, and the classic `@next/bundle-analyzer` is a silent no-op
 * ("not compatible with Turbopack builds"). So the perf gate is measured here
 * directly from the SHIPPED output: a statically-prerendered route's HTML
 * references exactly the JS chunks the browser fetches on first load. Async /
 * dynamic-imported chunks (the Three.js hero field, the Sanity Studio) are not
 * referenced and so are correctly excluded.
 *
 * Run AFTER a production build:  next build  &&  node scripts/check-first-load-budget.mjs
 *
 * The budget is the measured React 19 + Next 16 App Router framework floor plus
 * a little headroom. Its job is to catch a REGRESSION — app code leaking a heavy
 * dependency into first load — not to chase a number that predates measuring the
 * framework cost. Treemap detail: `pnpm analyze` (forces the webpack analyzer).
 */
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

// Re-baselined 2026-06-13 from the measured floor (~194–197 KB gz, uniform
// across all routes, hero-independent). Raise deliberately and document why.
const BUDGET_KB = 205;
const APP_DIR = ".next/server/app";
// The Three.js chunk must never appear in the home route's first-load set.
const HERO_FIELD_HINT = "WebGLRenderer";

function chunksForHtml(htmlPath) {
  const html = fs.readFileSync(htmlPath, "utf8");
  const refs = [...html.matchAll(/\/_next\/static\/chunks\/([^"'\\]+?\.js)/g)].map(
    (m) => m[1],
  );
  return [...new Set(refs)];
}

function gzipKb(chunkNames) {
  let total = 0;
  for (const name of chunkNames) {
    const p = path.join(".next/static/chunks", name);
    if (!fs.existsSync(p)) continue;
    total += zlib.gzipSync(fs.readFileSync(p)).length;
  }
  return total / 1024;
}

function findRouteHtml() {
  if (!fs.existsSync(APP_DIR)) {
    console.error(
      `[perf] ${APP_DIR} not found. Run a production build first: pnpm exec next build`,
    );
    process.exit(2);
  }
  const out = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith(".html")) out.push(full);
    }
  };
  walk(APP_DIR);
  // Skip framework error boundaries — not user-navigable routes.
  return out.filter((p) => !/_global-error|_not-found/.test(p));
}

const routes = findRouteHtml()
  .map((htmlPath) => {
    const route =
      "/" +
      path
        .relative(APP_DIR, htmlPath)
        .replace(/\.html$/, "")
        .replace(/(^|\/)index$/, "");
    const chunks = chunksForHtml(htmlPath);
    return { route: route === "/" ? "/" : route.replace(/\/$/, ""), chunks, kb: gzipKb(chunks) };
  })
  .sort((a, b) => b.kb - a.kb);

console.log(`Landing-JS first-load budget: ${BUDGET_KB} KB gzip\n`);
let worst = 0;
for (const r of routes) {
  worst = Math.max(worst, r.kb);
  const flag = r.kb > BUDGET_KB ? "❌" : "✅";
  console.log(`  ${flag} ${r.kb.toFixed(1).padStart(6)} KB  ${r.route}`);
}

// Assert the hero's Three.js chunk is excluded from the home first-load set.
const home = routes.find((r) => r.route === "/");
const threeLeaked =
  home &&
  home.chunks.some((c) => {
    const p = path.join(".next/static/chunks", c);
    return fs.existsSync(p) && fs.readFileSync(p, "utf8").includes(HERO_FIELD_HINT);
  });

console.log(
  `\n  Three.js excluded from "/" first-load: ${threeLeaked ? "NO ❌ (leaked!)" : "yes ✅"}`,
);

const overBudget = worst > BUDGET_KB;
if (overBudget || threeLeaked) {
  console.error(
    `\n[perf] FAIL — ${overBudget ? `worst route ${worst.toFixed(1)}KB > ${BUDGET_KB}KB budget` : ""}${overBudget && threeLeaked ? "; " : ""}${threeLeaked ? "Three.js leaked into first load" : ""}`,
  );
  process.exit(1);
}
console.log(`\n[perf] PASS — worst route ${worst.toFixed(1)}KB within ${BUDGET_KB}KB; hero stays async.`);

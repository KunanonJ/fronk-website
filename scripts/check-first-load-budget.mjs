#!/usr/bin/env node
/**
 * Landing-JS perf gate, measured from the SHIPPED output: a prerendered page's
 * HTML (dist/client/*.html, TanStack Start) references exactly the JS the
 * browser fetches on first load (module script + modulepreload links). Lazy
 * chunks are not referenced and so are correctly excluded. Pages rendered on
 * request (Sanity-backed) are not prerendered and are not measured here.
 *
 * Run AFTER a production build:  pnpm build  &&  node scripts/check-first-load-budget.mjs
 *
 * The budget is the measured framework floor plus a little headroom. Its job is
 * to catch a REGRESSION (app code leaking a heavy dependency into first load),
 * not to chase a number that predates measuring the framework cost.
 */
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

// Budgets = measured worst route + about 5% (visual-redesign Phase 6,
// 09-11-26). Removing framer-motion took about 44 KB gz off every page with
// the landing nav, so pages with the nav and pages without it now sit within
// a few KB of each other. Lower these as routes get lighter; raise only
// deliberately, with the reason here.
//
// Default: system pages (/resume, /design) and the discovery hubs, which
// carry the landing nav since Phase 6 (worst 190.1 KB).
const DEFAULT_BUDGET_KB = 200;

// Marketing: pages with the landing nav plus heavier islands (next/image card
// chrome, forms, the blog's portable text). Worst: the hidden blog posts at
// 243.0 KB; the public pages are about 190-197 KB.
const MARKETING_BUDGET_KB = 255;

const MARKETING_EXACT = new Set([
  "/",
  "/about",
  "/contact",
  "/press",
  "/blog",
  "/learn",
  "/examples",
  "/stack",
  "/proof",
  "/build",
  // Portfolio (2026-11) uses LibraryPageShell like /stack and /proof: landing
  // nav + next/image card chrome on top of the marketing floor.
  "/portfolio",
  // Skills (2026-11): landing nav + small tabs/copy-button islands.
  "/skills",
]);

function isMarketingRoute(route) {
  if (MARKETING_EXACT.has(route)) return true;
  if (route.startsWith("/blog/")) return true;
  if (route.startsWith("/portfolio/")) return true;
  if (route.startsWith("/skills/")) return true;
  return false;
}

function budgetKbForRoute(route) {
  return isMarketingRoute(route) ? MARKETING_BUDGET_KB : DEFAULT_BUDGET_KB;
}
const APP_DIR = "dist/client";

function chunksForHtml(htmlPath) {
  const html = fs.readFileSync(htmlPath, "utf8");
  const refs = [...html.matchAll(/\/assets\/([^"'\\]+?\.js)/g)].map(
    (m) => m[1],
  );
  return [...new Set(refs)];
}

function gzipKb(chunkNames) {
  let total = 0;
  for (const name of chunkNames) {
    const p = path.join("dist/client/assets", name);
    if (!fs.existsSync(p)) continue;
    total += zlib.gzipSync(fs.readFileSync(p)).length;
  }
  return total / 1024;
}

function findRouteHtml() {
  if (!fs.existsSync(APP_DIR)) {
    console.error(
      `[perf] ${APP_DIR} not found. Run a production build first: pnpm build`,
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
  return out;
}

const seen = new Set();
const routes = findRouteHtml()
  .map((htmlPath) => {
    const route =
      "/" +
      path
        .relative(APP_DIR, htmlPath)
        .replace(/\.html$/, "")
        .replace(/(^|\/)index$/, "");
    const chunks = chunksForHtml(htmlPath);
    return {
      route: route === "/" ? "/" : route.replace(/\/$/, ""),
      chunks,
      kb: gzipKb(chunks),
    };
  })
  // /portfolio.html and /portfolio/index.html are the same route.
  .filter((r) => (seen.has(r.route) ? false : seen.add(r.route)))
  .sort((a, b) => b.kb - a.kb);

console.log(
  `Landing-JS first-load budget: ${DEFAULT_BUDGET_KB} KB gzip (default); marketing routes up to ${MARKETING_BUDGET_KB} KB\n`,
);
let worstOver = 0;
let worstOverRoute = "";
let worstOverBudget = 0;
for (const r of routes) {
  const budget = budgetKbForRoute(r.route);
  const over = r.kb - budget;
  if (over > worstOver) {
    worstOver = over;
    worstOverRoute = r.route;
    worstOverBudget = budget;
  }
  const flag = r.kb > budget ? "❌" : "✅";
  const budgetNote = budget !== DEFAULT_BUDGET_KB ? ` / ${budget} KB` : "";
  console.log(
    `  ${flag} ${r.kb.toFixed(1).padStart(6)} KB${budgetNote}  ${r.route}`,
  );
}

const overBudget = worstOver > 0;
if (overBudget) {
  console.error(
    `\n[perf] FAIL — ${worstOverRoute} ${routes.find((r) => r.route === worstOverRoute)?.kb.toFixed(1)}KB > ${worstOverBudget}KB budget`,
  );
  process.exit(1);
}
const worstKb = Math.max(...routes.map((r) => r.kb));
console.log(
  `\n[perf] PASS — all routes within budget (worst ${worstKb.toFixed(1)}KB on ${routes[0]?.route}).`,
);

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
// Default: system pages (/design) and the discovery hubs. Measured worst
// 155.2 KB (the topic hubs) on 10-11-26, after page metadata stopped pulling
// content modules (every SKILL.md, topics, portfolio) into the entry chunk
// through route head() options. An earlier raise to 210 KB blamed the bento
// chrome; that leak was the real cause.
const DEFAULT_BUDGET_KB = 165;

// Marketing: pages with heavier islands (forms, filters, skill sources, the
// blog's portable text). Measured worst 189.1 KB (the skill pages, which ship
// their SKILL.md) on 10-11-26.
const MARKETING_BUDGET_KB = 200;

// The entry chunk every page loads (React, the router, the shell). 113.7 KB on
// 10-11-26. A content module imported from a route's head() or the root route
// lands here and costs every page, so it gets its own cap.
const ENTRY_BUDGET_KB = 120;

// Stylesheets and preloaded fonts (profile redesign, Phase 0; best-practices
// audit, section 8): every stylesheet a page links (gzip), and the woff2
// files it preloads (already compressed, counted as served). Set at the
// 18-11-26 measurement plus 10%, with the scoped profile block in
// globals.css: 20.1 KB of stylesheets and 51.2 KB of preloaded fonts (both on
// /about). Every page preloads Onest and Instrument Serif; Geist went in
// Phase 8.
//
// Raised deliberately at the Phase 6 cutover (18-11-26), from 22 KB to 37 KB:
// every public page now renders the new chrome, so every page links
// src/styles/profile.css (15.2 KB gzip) beside globals.css (17.6 KB) and
// fonts.css (1.2 KB), while the pages Phase 7 has not restyled still need the
// old design in globals.css. Measured 34.0 KB (about.html, the worst page),
// plus 10%.
//
// Lowered in Phase 8 (19-11-26), once the old design's CSS and Geist were
// gone: 33.8 KB of stylesheets and 47.7 KB of preloaded fonts (about.html,
// the worst page for both), every page in the new design. 36 KB and 52 KB
// leave a little room; neither goes back up.
const CSS_BUDGET_KB = 36;
const FONT_PRELOAD_BUDGET_KB = 52;

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
  // Résumé (phase 7b): moved into the site layout with the header, footer
  // and Share. Rendered on request (Sanity), so this only classifies it;
  // measured by hand at 202.1 KB on 09-11-26, and at 164.5 KB of JS and
  // 37.1 KB of stylesheets on 20-11-26 ("Snapshot"): its own
  // src/styles/resume.css (2.5 KB) is linked by the page, not by profile.css.
  "/resume",
]);

function isMarketingRoute(route) {
  if (MARKETING_EXACT.has(route)) return true;
  if (route.startsWith("/blog/")) return true;
  if (route.startsWith("/portfolio/")) return true;
  // The venture pages (profile redesign, Phase 6 cutover): they render the
  // same case-study template as /portfolio/<slug> (the rail, the showcase
  // viewer, the More projects cards), so they take the same class. Measured
  // 176.1 KB on 18-11-26, as the project pages (176.2 KB). The budgets
  // themselves are unchanged.
  if (route.startsWith("/ventures/")) return true;
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

// The entry chunk: the one chunk every page references.
const shared = routes
  .map((r) => r.chunks)
  .reduce((a, b) => a.filter((name) => b.includes(name)));
const entry = shared.find((name) => /^index-.*\.js$/.test(name));
const entryKb = entry ? gzipKb([entry]) : 0;
console.log(
  `\n  ${entryKb > ENTRY_BUDGET_KB ? "❌" : "✅"} ${entryKb.toFixed(1).padStart(6)} KB / ${ENTRY_BUDGET_KB} KB  entry chunk (${entry ?? "not found"})`,
);
if (!entry || entryKb > ENTRY_BUDGET_KB) {
  console.error(
    `\n[perf] FAIL — entry chunk ${entryKb.toFixed(1)}KB > ${ENTRY_BUDGET_KB}KB budget: a content module is probably imported from a route head() or the root route.`,
  );
  process.exit(1);
}

// Stylesheets (gzip) and preloaded fonts (bytes), worst page each.
function assetRefs(htmlPath, pattern) {
  const html = fs.readFileSync(htmlPath, "utf8");
  return [...new Set([...html.matchAll(pattern)].map((m) => m[1]))];
}
// Both checks fail loudly rather than read 0 KB when the markup or the build
// layout changes: a missing asset or a page with no stylesheet is an error.
function failAssets(message) {
  console.error(`\n[perf] FAIL — ${message}`);
  process.exit(1);
}
function bytesKb(names, gzip) {
  let total = 0;
  for (const name of names) {
    const p = path.join("dist/client/assets", name);
    if (!fs.existsSync(p)) {
      failAssets(
        `${name} is referenced by a page but missing from dist/client/assets.`,
      );
    }
    const body = fs.readFileSync(p);
    total += gzip ? zlib.gzipSync(body).length : body.length;
  }
  return total / 1024;
}
const pages = findRouteHtml();
const cssWorst = pages
  .map((html) => {
    const refs = assetRefs(html, /href="\/assets\/([^"]+?\.css)"/g);
    if (refs.length === 0) {
      failAssets(
        `${html} links no stylesheet under /assets/: the markup probably changed.`,
      );
    }
    return { html, kb: bytesKb(refs, true) };
  })
  .sort((a, b) => b.kb - a.kb)[0];
const fontWorst = pages
  .map((html) => ({
    html,
    kb: bytesKb(
      assetRefs(
        html,
        /<link[^>]*rel="preload"[^>]*href="\/assets\/([^"]+?\.woff2)"/g,
      ),
      false,
    ),
  }))
  .sort((a, b) => b.kb - a.kb)[0];
if (!fontWorst || fontWorst.kb === 0) {
  failAssets(
    "no page preloads a font: the preload markup (rel before href) probably changed.",
  );
}
console.log(
  `\n  ${cssWorst.kb > CSS_BUDGET_KB ? "❌" : "✅"} ${cssWorst.kb.toFixed(1).padStart(6)} KB / ${CSS_BUDGET_KB} KB  stylesheets, worst page (${path.relative(APP_DIR, cssWorst.html)})`,
);
console.log(
  `  ${fontWorst.kb > FONT_PRELOAD_BUDGET_KB ? "❌" : "✅"} ${fontWorst.kb.toFixed(1).padStart(6)} KB / ${FONT_PRELOAD_BUDGET_KB} KB  preloaded fonts, worst page (${path.relative(APP_DIR, fontWorst.html)})`,
);
if (cssWorst.kb > CSS_BUDGET_KB || fontWorst.kb > FONT_PRELOAD_BUDGET_KB) {
  console.error(
    "\n[perf] FAIL — stylesheets or preloaded fonts over budget: the old design must shrink before the new one grows.",
  );
  process.exit(1);
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

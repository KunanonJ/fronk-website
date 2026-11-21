#!/usr/bin/env node
/**
 * Landing-JS perf gate, measured from the SHIPPED output: a prerendered page's
 * HTML (dist/client/*.html, TanStack Start) references exactly the JS the
 * browser fetches on first load (module script + modulepreload links). Lazy
 * chunks are not referenced and so are correctly excluded. Pages rendered on
 * request (Sanity-backed) are not prerendered: the script serves the build
 * with `vite preview` and measures the HTML it sends for them
 * (ON_REQUEST_ROUTES), against the same budgets.
 *
 * Run AFTER a production build:  pnpm build  &&  node scripts/check-first-load-budget.mjs
 * (PERF_PORT=4175 to serve on another port)
 *
 * The budget is the measured framework floor plus a little headroom. Its job is
 * to catch a REGRESSION (app code leaking a heavy dependency into first load),
 * not to chase a number that predates measuring the framework cost.
 */
import { spawn } from "node:child_process";
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
//
// /open-source (21-11-26) stays here too, though it uses /stack's reading
// shell: 162.0 KB at build. The default keeps it from taking in
// lib/content/skills or SkillParts (the skills snapshot, about 10 KB gzip
// since its SKILL.md bodies left it in #173), which the marketing cap would
// let through.
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
//
// UX sweep 21-11-26: /resume, measured from then on (ON_REQUEST_ROUTES), was
// 37.9 KB. Tailwind now reads only the app's code (1.5 KB off every page)
// and the Home hero's partial is a sheet of Home's own (2.9 KB off every
// other page): 34.9 KB on Home (with the hero's 1024 px rule), the worst
// page, 33.5 KB on /resume and 31.0 KB on the rest.
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
  // and Share. Rendered on request (Sanity), and measured from `vite preview`
  // since 21-11-26 (ON_REQUEST_ROUTES); by hand before that, at 202.1 KB on
  // 09-11-26 and at 164.5 KB of JS and 37.1 KB of stylesheets on 20-11-26
  // ("Snapshot"): its own src/styles/resume.css (2.5 KB) is linked by the
  // page, not by profile.css.
  "/resume",
]);

// Pages rendered on request (vite.config.mts keeps them out of the
// prerender), served by `vite preview` (workerd, as scripts/start-gates.mjs
// does) and held to the same budgets (UX sweep 21-11-26: /resume's
// stylesheets had grown to 37.9 KB unmeasured). Each must answer 200 with
// the same stylesheets and chunks whatever Sanity says: /resume falls back
// to the repo's résumé when Sanity fails (a hang past the fetch timeout
// below fails the step instead), and /learn reads no
// Sanity while the blog is hidden (lib/content/blogVisibility.ts). /blog is
// left out: a failed Sanity read renders its error state instead.
const ON_REQUEST_ROUTES = ["/resume", "/learn"];
const PREVIEW_PORT = Number(process.env.PERF_PORT ?? 4174);

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

function chunksForHtml(html) {
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

/** The build id a page carries (`<html data-build>`, src/lib/buildId.ts). */
function buildMark(html) {
  return /<html[^>]*\sdata-build="([^"]+)"/.exec(html)?.[1] ?? null;
}

/**
 * The on-request pages' HTML as the Worker sends it, from `vite preview` on
 * this build. Run directly (no pnpm wrapper) in its own process group, which
 * is ended whatever happens, as in scripts/start-gates.mjs.
 */
async function renderOnRequest(routes) {
  const base = `http://127.0.0.1:${PREVIEW_PORT}`;
  let log = "";
  const preview = spawn(
    "node_modules/.bin/vite",
    [
      "preview",
      "--host",
      "127.0.0.1",
      "--port",
      String(PREVIEW_PORT),
      "--strictPort",
    ],
    { stdio: ["ignore", "pipe", "pipe"], detached: true },
  );
  preview.stdout.on("data", (d) => (log += d));
  preview.stderr.on("data", (d) => (log += d));
  const stop = () => {
    try {
      process.kill(-preview.pid, "SIGTERM");
    } catch {
      // already gone
    }
  };
  process.on("exit", stop);
  try {
    let served = null;
    for (let i = 0; i < 120 && served === null; i += 1) {
      // Our preview died (the port is taken, say): never measure another server.
      if (preview.exitCode !== null) break;
      try {
        const res = await fetch(`${base}/`, {
          signal: AbortSignal.timeout(3000),
        });
        if (res.status < 500) served = await res.text();
      } catch {
        // not up yet
      }
      if (served === null) await new Promise((r) => setTimeout(r, 500));
    }
    if (served === null) {
      console.error(log);
      throw new Error(`[perf] vite preview did not start on ${base}`);
    }
    // Whatever answered must be this build: a server already on the port
    // answers before our preview has failed to bind it (--strictPort), and
    // its pages would be measured instead.
    const mark = buildMark(
      fs.readFileSync(path.join(APP_DIR, "index.html"), "utf8"),
    );
    if (mark !== buildMark(served)) {
      console.error(log);
      throw new Error(
        `[perf] ${base} is not serving this build (data-build ${buildMark(served) ?? "missing"}, expected ${mark ?? "missing"}): set PERF_PORT to a free port`,
      );
    }
    const pages = [];
    for (const route of routes) {
      // Longer than the Worker's Sanity reads can take before /resume falls
      // back to the repo's résumé (three tries of 10 s; lib/sanity/client.ts):
      // a Sanity error still measures the fallback, and only a longer hang
      // fails the step.
      const res = await fetch(`${base}${route}`, {
        headers: { accept: "text/html" },
        signal: AbortSignal.timeout(90_000),
      });
      if (res.status !== 200) {
        console.error(log);
        throw new Error(
          `[perf] ${route} answered ${res.status} from vite preview`,
        );
      }
      pages.push({
        route,
        label: `${route} (on request)`,
        html: await res.text(),
      });
    }
    return pages;
  } finally {
    stop();
  }
}

// Every page measured: the prerendered files, then the on-request pages.
const pages = [
  ...findRouteHtml().map((file) => {
    const route =
      "/" +
      path
        .relative(APP_DIR, file)
        .replace(/\.html$/, "")
        .replace(/(^|\/)index$/, "");
    return {
      route: route === "/" ? "/" : route.replace(/\/$/, ""),
      label: path.relative(APP_DIR, file),
      html: fs.readFileSync(file, "utf8"),
    };
  }),
  ...(await renderOnRequest(ON_REQUEST_ROUTES)),
];

const seen = new Set();
const routes = pages
  .map((page) => {
    const chunks = chunksForHtml(page.html);
    return { route: page.route, chunks, kb: gzipKb(chunks) };
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
function assetRefs(html, pattern) {
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
const cssWorst = pages
  .map(({ label, html }) => {
    const refs = assetRefs(html, /href="\/assets\/([^"]+?\.css)"/g);
    if (refs.length === 0) {
      failAssets(
        `${label} links no stylesheet under /assets/: the markup probably changed.`,
      );
    }
    return { label, kb: bytesKb(refs, true) };
  })
  .sort((a, b) => b.kb - a.kb)[0];
const fontWorst = pages
  .map(({ label, html }) => ({
    label,
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
  `\n  ${cssWorst.kb > CSS_BUDGET_KB ? "❌" : "✅"} ${cssWorst.kb.toFixed(1).padStart(6)} KB / ${CSS_BUDGET_KB} KB  stylesheets, worst page (${cssWorst.label})`,
);
console.log(
  `  ${fontWorst.kb > FONT_PRELOAD_BUDGET_KB ? "❌" : "✅"} ${fontWorst.kb.toFixed(1).padStart(6)} KB / ${FONT_PRELOAD_BUDGET_KB} KB  preloaded fonts, worst page (${fontWorst.label})`,
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

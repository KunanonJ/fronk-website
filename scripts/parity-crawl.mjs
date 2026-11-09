#!/usr/bin/env node
/**
 * Parity crawl (TanStack migration, Phase 0). Records what a crawler or user
 * can observe on every URL: status, redirect target, key headers, and for
 * HTML the normalised head tags, JSON-LD, <html>/<main> lang, title and h1;
 * for text endpoints the body. Runs against any base URL.
 *
 *   node scripts/parity-crawl.mjs http://127.0.0.1:4173 out.json
 *
 * Routes: the sitemap, links discovered from crawled pages, and fixed lists
 * (hidden/system pages, text endpoints, config redirects, 404s), plus every
 * OG image and icon URL referenced in a page head (status and type only).
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import {
  extractPage,
  internalLinks,
  normaliseBody,
  normaliseUrl,
} from "../lib/parity/parity.mjs";

const [baseArg, out = "parity.json"] = process.argv.slice(2);
if (!baseArg) {
  console.error("usage: node scripts/parity-crawl.mjs <base-url> [out.json]");
  process.exit(2);
}
const base = baseArg.replace(/\/$/, "");
const origin = new URL(base).origin;

const SEEDS = [
  "/",
  "/blog",
  "/press",
  "/resume",
  "/design",
  "/studio",
  "/th/topics/ai-transformation-thailand",
];
const TEXT = [
  "/robots.txt",
  "/sitemap.xml",
  "/feed.xml",
  "/llms.txt",
  "/skills.json",
  "/skills.md",
  "/sitemap.md",
  "/agents.md",
  "/.well-known/security.txt",
  "/manifest.webmanifest",
];
const REDIRECTS = [
  "/stock/asme",
  "/ventures",
  "/now",
  "/writing",
  "/writing/some-post",
  "/work",
  "/rss.xml",
  "/showcase",
  "/stock/velorah",
  "/about/",
];
const NOT_FOUND = [
  "/does-not-exist",
  "/skills/not-a-skill",
  "/topics/not-a-topic",
  "/portfolio/not-a-project",
];
const API_GET = ["/api/github/contributions"];

async function get(path) {
  const res = await fetch(base + path, {
    redirect: "manual",
    headers: { "user-agent": "fronk-parity-crawl/1" },
  });
  const loc = res.headers.get("location");
  return {
    res,
    record: {
      status: res.status,
      location: loc ? loc.replace(origin, "") : null,
      contentType:
        (res.headers.get("content-type") ?? "").split(";")[0] || null,
      robotsHeader: res.headers.get("x-robots-tag"),
      csp: res.headers.get("content-security-policy"),
    },
  };
}

const records = {};
// Extra seeds (comma-separated paths) for builds that have no sitemap yet.
const EXTRA = (process.env.PARITY_SEEDS ?? "").split(",").filter(Boolean);
const queue = new Set([...SEEDS, ...EXTRA]);
const seen = new Set();
const assets = new Map(); // normalised path -> real path + query

// Sitemap first: its URLs are the indexable set.
try {
  const sm = await (await fetch(base + "/sitemap.xml")).text();
  for (const m of sm.matchAll(/<loc>([^<]+)<\/loc>/g))
    queue.add(new URL(m[1]).pathname.replace(/(.)\/$/, "$1"));
} catch {
  console.warn("[parity] no sitemap");
}

async function crawlPage(path) {
  const { res, record } = await get(path);
  if (record.contentType === "text/html") {
    const html = await res.text();
    Object.assign(record, extractPage(html));
    for (const link of internalLinks(html))
      if (!seen.has(link)) queue.add(link);
    // Fetch metadata images by their real (hashed) URL; record them under the
    // normalised path so frameworks with different hashes compare.
    for (const m of html.matchAll(
      /(?:content|href)="((?:https?:\/\/[^"/]+)?\/[^"]*(?:opengraph-image|twitter-image|icon|apple-icon)[^"]*)"/g,
    )) {
      const real = new URL(m[1].replace(/&amp;/g, "&"), base);
      if (
        real.origin !== origin &&
        !real.href.startsWith("https://kunanonj.com")
      )
        continue;
      assets.set(normaliseUrl(real.pathname), real.pathname + real.search);
    }
  } else {
    await res.arrayBuffer().catch(() => {});
  }
  records[path] = record;
}

// Breadth-first over pages, 8 at a time.
while (queue.size) {
  const batch = [...queue].filter((p) => !seen.has(p)).slice(0, 8);
  for (const p of batch) {
    seen.add(p);
    queue.delete(p);
  }
  queue.forEach((p) => seen.has(p) && queue.delete(p));
  if (!batch.length) break;
  await Promise.all(batch.map(crawlPage));
  if (seen.size > 400) break;
}

for (const path of TEXT) {
  const { res, record } = await get(path);
  const body = normaliseBody(await res.text());
  record.body =
    body.length > 65536
      ? `sha:${(await import("node:crypto")).createHash("sha256").update(body).digest("hex")}`
      : body;
  records[path] = record;
}
for (const path of [...REDIRECTS, ...NOT_FOUND, ...API_GET]) {
  if (records[path]) continue;
  const { res, record } = await get(path);
  await res.arrayBuffer().catch(() => {});
  records[path] = record;
}
for (const [key, real] of assets) {
  if (records[key]) continue;
  const { res, record } = await get(real);
  await res.arrayBuffer().catch(() => {});
  records[key] = record;
}

const sorted = Object.fromEntries(
  Object.keys(records)
    .sort()
    .map((k) => [k, records[k]]),
);
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, `${JSON.stringify(sorted, null, 2)}\n`);
const pages = Object.values(sorted).filter(
  (r) => r.contentType === "text/html" && r.status === 200,
).length;
console.log(
  `[parity] ${Object.keys(sorted).length} URLs (${pages} HTML pages) -> ${out}`,
);

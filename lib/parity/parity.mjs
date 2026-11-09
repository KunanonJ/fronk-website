/**
 * Parity helpers for the TanStack Start migration (Phase 0). Framework-agnostic:
 * they read served HTML and text, never build output, so the same crawl runs
 * against local Next, local Start, the staging Worker and production.
 *
 * Plain JS (ESM) so scripts/parity-*.mjs can import it without a build step.
 */

const ENTITIES = {
  "&amp;": "&",
  "&quot;": '"',
  "&#x27;": "'",
  "&#39;": "'",
  "&lt;": "<",
  "&gt;": ">",
};
const decode = (value) =>
  value.replace(/&(amp|quot|#x27|#39|lt|gt);/g, (m) => ENTITIES[m]);

/** Attributes of one start tag as a plain object (names lowercased). */
export function parseAttributes(source) {
  const attrs = {};
  for (const m of source.matchAll(
    /([^\s"'<>/=]+)(?:\s*=\s*("[^"]*"|'[^']*'|[^\s"'>]+))?/g,
  )) {
    const name = m[1].toLowerCase();
    let value = m[2] ?? "";
    if (/^["']/.test(value)) value = value.slice(1, -1);
    attrs[name] = decode(value);
  }
  return attrs;
}

/** Framework plumbing that is expected to differ between Next and Start. */
const DROP_REL = new Set([
  "preload",
  "modulepreload",
  "stylesheet",
  "preconnect",
  "dns-prefetch",
  "expect",
]);
const DROP_META_NAMES = new Set(["next-size-adjust"]);
const FRAMEWORK_URL = /\/_next\/|\/assets\/|\/@vite\/|\/_build\//;

/** Stable stand-ins for hashed metadata image URLs (OG images, icons). */
export function normaliseUrl(value) {
  return value
    .replace(
      /\/(opengraph-image|twitter-image)(-[a-z0-9]+)?(\?[^"\s]*)?$/i,
      "/$1",
    )
    .replace(/\/(icon|apple-icon)(\?[^"\s]*)?$/i, "/$1");
}

function tagKey(name, attrs) {
  const keys = Object.keys(attrs).sort();
  return `${name} ${keys.map((k) => `${k}=${JSON.stringify(normaliseUrl(attrs[k]))}`).join(" ")}`.trim();
}

/**
 * Normalised, sorted meta/link tags from a whole document (Next can stream
 * metadata after <head>; JSON-LD sits in <body>), with framework asset tags
 * removed.
 */
export function headTags(html) {
  const out = [];
  for (const m of html.matchAll(/<(meta|link)\b([^>]*)>/gi)) {
    const name = m[1].toLowerCase();
    const attrs = parseAttributes(m[2]);
    if (name === "link" && DROP_REL.has((attrs.rel ?? "").toLowerCase()))
      continue;
    if (name === "meta" && DROP_META_NAMES.has(attrs.name ?? "")) continue;
    if (Object.values(attrs).some((v) => FRAMEWORK_URL.test(v))) continue;
    out.push(tagKey(name, attrs));
  }
  return [...new Set(out)].sort();
}

export function jsonLd(html) {
  return [
    ...html.matchAll(
      /<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi,
    ),
  ]
    .map((m) => {
      try {
        return JSON.stringify(JSON.parse(m[1]));
      } catch {
        return m[1].trim();
      }
    })
    .sort();
}

const text = (html) =>
  decode(html.replace(/<[^>]+>/g, ""))
    .replace(/\s+/g, " ")
    .trim();

/** Everything an HTML page exposes to crawlers, normalised for diffing. */
export function extractPage(html) {
  const htmlTag = html.match(/<html\b([^>]*)>/i);
  const mainTag = html.match(/<main\b([^>]*)>/i);
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const h1 = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i);
  return {
    htmlLang: htmlTag ? (parseAttributes(htmlTag[1]).lang ?? null) : null,
    mainLang: mainTag ? (parseAttributes(mainTag[1]).lang ?? null) : null,
    title: title ? text(title[1]) : null,
    h1: h1 ? text(h1[1]) : null,
    tags: headTags(html),
    jsonLd: jsonLd(html),
  };
}

/** Text-endpoint bodies with per-request timestamps replaced. */
export function normaliseBody(body) {
  return body.replace(
    /<lastBuildDate>[^<]*<\/lastBuildDate>/g,
    "<lastBuildDate>DATE</lastBuildDate>",
  );
}

/** Internal page links worth crawling (no APIs, Studio, files or fragments). */
export function internalLinks(html) {
  const links = new Set();
  for (const m of html.matchAll(/<a\b[^>]*href="(\/[^"#?]*)/gi)) {
    const path = m[1];
    if (/^\/(api|studio|_next|assets)\b/.test(path)) continue;
    if (/\.[a-z0-9]+$/i.test(path)) continue;
    links.add(path.length > 1 ? path.replace(/\/$/, "") : path);
  }
  return [...links];
}

/**
 * Differences between two crawl records for the same URL. `ignore` holds
 * "path:field" or "*:field" entries for intended differences.
 */
export function diffRecord(path, a, b, ignore = []) {
  const skip = (field) =>
    ignore.includes(`${path}:${field}`) || ignore.includes(`*:${field}`);
  const diffs = [];
  if (!a || !b) return [{ field: "presence", a: Boolean(a), b: Boolean(b) }];
  for (const field of [
    "status",
    "location",
    "contentType",
    "robotsHeader",
    "csp",
    "htmlLang",
    "mainLang",
    "title",
    "h1",
    "body",
  ]) {
    if (skip(field)) continue;
    if ((a[field] ?? null) !== (b[field] ?? null))
      diffs.push({ field, a: a[field] ?? null, b: b[field] ?? null });
  }
  for (const field of ["tags", "jsonLd"]) {
    if (skip(field)) continue;
    const left = new Set(a[field] ?? []);
    const right = new Set(b[field] ?? []);
    const onlyA = [...left].filter((v) => !right.has(v));
    const onlyB = [...right].filter((v) => !left.has(v));
    if (onlyA.length || onlyB.length) diffs.push({ field, onlyA, onlyB });
  }
  return diffs;
}

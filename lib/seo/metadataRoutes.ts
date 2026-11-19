import type { Manifest, Robots, Sitemap } from "@/lib/seo/types";
import { escapeXml } from "@/lib/utils/xml";

/*
 * Text output of Next's metadata routes (robots.ts, sitemap.ts, manifest.ts),
 * for frameworks that serve them by hand (the TanStack Start build). Matches
 * Next's own serialisers byte for byte for Next's fields. robots.txt's
 * `comment` and `contentSignal` are this site's additions (Content Signals).
 */

/** A value or a list of them as a list; undefined as none. */
export const list = <T>(value: T | T[] | undefined): T[] =>
  value === undefined ? [] : Array.isArray(value) ? value : [value];

export function robotsToText(robots: Robots): string {
  let out = "";
  for (const line of list(robots.comment)) out += `# ${line}\n`;
  if (robots.comment !== undefined) out += "\n";
  for (const rule of list(robots.rules)) {
    for (const agent of list(rule.userAgent ?? "*"))
      out += `User-Agent: ${agent}\n`;
    if (rule.contentSignal) out += `Content-Signal: ${rule.contentSignal}\n`;
    for (const path of list(rule.allow)) out += `Allow: ${path}\n`;
    for (const path of list(rule.disallow)) out += `Disallow: ${path}\n`;
    if (rule.crawlDelay) out += `Crawl-delay: ${rule.crawlDelay}\n`;
    out += "\n";
  }
  if (robots.host) out += `Host: ${robots.host}\n`;
  for (const sitemap of list(robots.sitemap)) out += `Sitemap: ${sitemap}\n`;
  return out;
}

/**
 * Every value is escaped: post URLs carry slugs from Sanity, and the sitemap
 * is served from the site's own origin as XML, where markup would run.
 */
export function sitemapToXml(entries: Sitemap): string {
  let out =
    '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  for (const entry of entries) {
    out += "<url>\n";
    out += `<loc>${escapeXml(entry.url)}</loc>\n`;
    if (entry.lastModified) {
      const date =
        entry.lastModified instanceof Date
          ? entry.lastModified.toISOString()
          : entry.lastModified;
      out += `<lastmod>${escapeXml(date)}</lastmod>\n`;
    }
    if (entry.changeFrequency)
      out += `<changefreq>${entry.changeFrequency}</changefreq>\n`;
    if (typeof entry.priority === "number")
      out += `<priority>${entry.priority}</priority>\n`;
    out += "</url>\n";
  }
  return `${out}</urlset>\n`;
}

export function manifestToJson(manifest: Manifest): string {
  return JSON.stringify(manifest);
}

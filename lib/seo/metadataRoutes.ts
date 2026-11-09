import type { MetadataRoute } from "next";

/*
 * Text output of Next's metadata routes (robots.ts, sitemap.ts, manifest.ts),
 * for frameworks that serve them by hand (the TanStack Start build). Matches
 * Next's own serialisers byte for byte for the fields this site uses.
 */

const list = <T,>(value: T | T[] | undefined): T[] => (value === undefined ? [] : Array.isArray(value) ? value : [value]);

export function robotsToText(robots: MetadataRoute.Robots): string {
  let out = "";
  for (const rule of list(robots.rules)) {
    for (const agent of list(rule.userAgent ?? "*")) out += `User-Agent: ${agent}\n`;
    for (const path of list(rule.allow)) out += `Allow: ${path}\n`;
    for (const path of list(rule.disallow)) out += `Disallow: ${path}\n`;
    if (rule.crawlDelay) out += `Crawl-delay: ${rule.crawlDelay}\n`;
    out += "\n";
  }
  if (robots.host) out += `Host: ${robots.host}\n`;
  for (const sitemap of list(robots.sitemap)) out += `Sitemap: ${sitemap}\n`;
  return out;
}

export function sitemapToXml(entries: MetadataRoute.Sitemap): string {
  let out = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  for (const entry of entries) {
    out += "<url>\n";
    out += `<loc>${entry.url}</loc>\n`;
    if (entry.lastModified) {
      const date = entry.lastModified instanceof Date ? entry.lastModified.toISOString() : entry.lastModified;
      out += `<lastmod>${date}</lastmod>\n`;
    }
    if (entry.changeFrequency) out += `<changefreq>${entry.changeFrequency}</changefreq>\n`;
    if (typeof entry.priority === "number") out += `<priority>${entry.priority}</priority>\n`;
    out += "</url>\n";
  }
  return `${out}</urlset>\n`;
}

export function manifestToJson(manifest: MetadataRoute.Manifest): string {
  return JSON.stringify(manifest);
}

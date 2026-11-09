import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_SITE_URL = "https://kunanonj.com";
});

import manifest from "@/lib/seo/manifest";
import robots from "@/lib/seo/robots";
import { manifestToJson, robotsToText, sitemapToXml } from "./metadataRoutes";

const reference = JSON.parse(
  readFileSync("process/features/tanstack-migration/references/next-parity_09-11-26.json", "utf8"),
) as Record<string, { body?: string }>;

describe("metadata route serialisers (match Next's output)", () => {
  it("robots.txt", () => {
    expect(robotsToText(robots())).toBe(reference["/robots.txt"].body);
  });

  it("manifest.webmanifest", () => {
    expect(manifestToJson(manifest())).toBe(reference["/manifest.webmanifest"].body);
  });

  it("sitemap.xml shape", () => {
    const xml = sitemapToXml([
      { url: "https://kunanonj.com", lastModified: new Date("2026-07-19T00:00:00.000Z"), changeFrequency: "weekly", priority: 1 },
    ]);
    expect(xml).toBe(
      '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n<url>\n<loc>https://kunanonj.com</loc>\n<lastmod>2026-07-19T00:00:00.000Z</lastmod>\n<changefreq>weekly</changefreq>\n<priority>1</priority>\n</url>\n</urlset>\n',
    );
    expect(reference["/sitemap.xml"].body?.startsWith(xml.split("</urlset>")[0].split("<url>\n<loc>https://kunanonj.com</loc>")[0])).toBe(true);
  });
});

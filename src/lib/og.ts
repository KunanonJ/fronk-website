import type { FileOgImage } from "@/lib/seo/metadataToHead";

/**
 * The og:image Next adds for a route's opengraph-image file: same URL (the
 * parity crawl ignores Next's hash), size and alt as the file's exports.
 */
export function fileOg(path: string, alt: string): FileOgImage {
  return { url: `${path}/opengraph-image`, width: 1200, height: 630, alt, type: "image/png" };
}

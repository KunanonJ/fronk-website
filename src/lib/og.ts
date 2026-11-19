import type { FileOgImage } from "@/lib/seo/metadataToHead";

/**
 * The og:image of a route that serves its own share card at
 * `<path>/opengraph-image` (src/server/og): its URL, size, alt and type.
 */
export function fileOg(path: string, alt: string): FileOgImage {
  return {
    url: `${path}/opengraph-image`,
    width: 1200,
    height: 630,
    alt,
    type: "image/png",
  };
}

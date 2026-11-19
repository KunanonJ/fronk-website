import { OG_SIZE } from "@/lib/og/card";
import type { FileOgImage } from "@/lib/seo/metadataToHead";

/**
 * The og:image of a route that serves its own share card at
 * `<path>/opengraph-image` (src/server/og): its URL, size, alt and type.
 */
export function fileOg(path: string, alt: string): FileOgImage {
  return {
    url: `${path}/opengraph-image`,
    width: OG_SIZE.width,
    height: OG_SIZE.height,
    alt,
    type: "image/png",
  };
}

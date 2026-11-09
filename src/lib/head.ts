import type { Metadata } from "next";
import { metadataToHead, type FileOgImage } from "@/lib/seo/metadataToHead";
import { rootMetadata } from "@/lib/seo/rootMetadata";

/**
 * A route's head() from the same Metadata object its Next page exports, with
 * the root layout's metadata merged in the way Next merges it.
 */
export function pageHead(page: Metadata, options: { fileOgImage?: FileOgImage } = {}) {
  const { meta, links } = metadataToHead(rootMetadata, page, options);
  // Start's head() takes React element props; ours are plain string maps.
  return { meta: meta as never[], links: links as never[] };
}

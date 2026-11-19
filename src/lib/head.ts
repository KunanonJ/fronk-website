import type { Metadata } from "@/lib/seo/types";
import { siteConfig } from "@/lib/site";
import { metadataToHead, type FileOgImage } from "@/lib/seo/metadataToHead";
import { rootMetadata } from "@/lib/seo/rootMetadata";
import { fileOg } from "./og";

/** The site's share card (/opengraph-image): the og:image of a page that names none. */
const ROOT_OG = fileOg("", `${siteConfig.name} — ${siteConfig.tagline}`);

/**
 * A route's head() from its page Metadata, merged over the site's root
 * metadata (lib/seo/rootMetadata.ts) by metadataToHead.
 */
export function pageHead(
  page: Metadata,
  options: { fileOgImage?: FileOgImage } = {},
) {
  return metadataToHead(rootMetadata, page, {
    fileOgImage: options.fileOgImage ?? ROOT_OG,
  });
}

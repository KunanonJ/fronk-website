import type { Metadata } from "@/lib/seo/types";
import { BLOG_PUBLIC } from "@/lib/content/blogVisibility";
import { FEED_PATH } from "@/lib/content/rss";
import { OG_SIZE } from "@/lib/og/card";
import { siteConfig, sitePath, siteUrl } from "@/lib/site";

/**
 * The site-wide share card, served at /opengraph-image (src/server/og).
 *
 * A page's `openGraph` replaces the root's wholesale (metadataToHead), so
 * routes that pass no `images` get this card and still ship `og:image`.
 * Routes that serve their own `opengraph-image` must pass
 * `hasOwnOgImage: true`: `openGraph.images` win over a route's own image.
 */
export const DEFAULT_OG_IMAGE = {
  url: "/opengraph-image",
  width: OG_SIZE.width,
  height: OG_SIZE.height,
  // profileCardAlt(HOME_CARD), written out: lib/og/profileCards.ts stays
  // server-only (lib/og/profileCards.test.ts keeps the two equal).
  alt: "Kunanon Jarat’s portrait beside “Hi, I’m Kunanon Jarat. Forward deployed AI engineering from Bangkok.”",
};

type RouteShareInput = {
  title: string;
  description: string;
  path: string;
  /** Defaults to website */
  type?: "website" | "article";
  publishedTime?: string;
  images?: readonly string[];
  /**
   * Optional hreflang map: locale → absolute or site-relative path.
   * Always include `x-default` when providing alternates.
   */
  languages?: Record<string, string>;
  /**
   * Set when the route segment ships its own `opengraph-image` file, so the
   * site-wide default does not replace it. Guarded by a test in routeMeta.test.ts.
   */
  hasOwnOgImage?: boolean;
  /** `og:locale`. Thai routes pass `th_TH`. */
  locale?: "en_US" | "th_TH";
  /**
   * The page's Markdown twin (e.g. `/about.md`), advertised as
   * rel="alternate" type="text/markdown" for agents that prefer text.
   */
  markdownPath?: string;
};

/**
 * Per-route metadata so child pages do not inherit homepage OG title/url.
 */
export function routeShareMeta({
  title,
  description,
  path,
  type = "website",
  publishedTime,
  images,
  languages,
  hasOwnOgImage = false,
  locale = "en_US",
  markdownPath,
}: RouteShareInput): Metadata {
  const url = siteUrl(path);

  const ogImages = images?.length
    ? images.map((src) => ({ url: src }))
    : hasOwnOgImage
      ? undefined
      : [DEFAULT_OG_IMAGE];

  const canonical = sitePath(path);

  return {
    title,
    description,
    alternates: {
      canonical,
      ...(languages ? { languages } : {}),
      // A page-level `alternates` replaces the root layout's wholesale, so
      // the feed link has to be repeated here to reach every page's <head>.
      // Not advertised while the blog is hidden (the feed is empty then).
      ...(BLOG_PUBLIC || markdownPath
        ? {
            types: {
              ...(BLOG_PUBLIC ? { "application/rss+xml": FEED_PATH } : {}),
              ...(markdownPath ? { "text/markdown": markdownPath } : {}),
            },
          }
        : {}),
    },
    openGraph: {
      type,
      locale,
      url,
      siteName: siteConfig.name,
      title,
      description,
      ...(publishedTime ? { publishedTime } : {}),
      ...(ogImages ? { images: ogImages } : {}),
    },
    twitter: {
      card: "summary_large_image",
      creator: "@fkj98",
      site: "@fkj98",
      title,
      description,
      // Without explicit images, metadataToHead copies the route's resolved
      // openGraph images (its own opengraph-image too) into the Twitter card.
      ...(images?.length ? { images: [...images] } : {}),
    },
  };
}

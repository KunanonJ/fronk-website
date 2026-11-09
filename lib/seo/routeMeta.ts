import type { Metadata } from "@/lib/seo/types";
import { BLOG_PUBLIC } from "@/lib/content/blogVisibility";
import { FEED_PATH } from "@/lib/content/rss";
import { OG_SIZE } from "@/lib/og/card";
import { siteConfig } from "@/lib/site";

/**
 * Site-wide share card served by `app/opengraph-image.tsx`.
 *
 * A page-level `openGraph` object replaces the inherited one wholesale, which
 * drops the image Next.js derives from the root `opengraph-image` file. Routes
 * that pass no `images` fall back to this card so they still ship `og:image`.
 * Routes that ship their own `opengraph-image` file must pass
 * `hasOwnOgImage: true`: in Next.js 16.4 a config-based `openGraph.images`
 * replaces the file-based image (verified in the build output).
 */
export const DEFAULT_OG_IMAGE = {
  url: "/opengraph-image",
  width: OG_SIZE.width,
  height: OG_SIZE.height,
  alt: `${siteConfig.name}: ${siteConfig.tagline}`,
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
}: RouteShareInput): Metadata {
  const url = path.startsWith("http")
    ? path
    : `${siteConfig.url.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;

  const ogImages = images?.length
    ? images.map((src) => ({ url: src }))
    : hasOwnOgImage
      ? undefined
      : [DEFAULT_OG_IMAGE];

  const canonical = path.startsWith("/") ? path : `/${path}`;

  return {
    title,
    description,
    alternates: {
      canonical,
      ...(languages ? { languages } : {}),
      // A page-level `alternates` replaces the root layout's wholesale, so
      // the feed link has to be repeated here to reach every page's <head>.
      // Not advertised while the blog is hidden (the feed is empty then).
      ...(BLOG_PUBLIC ? { types: { "application/rss+xml": FEED_PATH } } : {}),
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
      // Without explicit images, Next.js copies the route's resolved openGraph
      // images (including its own opengraph-image file) into the Twitter card.
      ...(images?.length ? { images: [...images] } : {}),
    },
  };
}

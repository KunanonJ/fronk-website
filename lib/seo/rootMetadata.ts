import type { Metadata, Viewport } from "@/lib/seo/types";
import { BLOG_PUBLIC } from "@/lib/content/blogVisibility";
import { site as landingSite } from "@/lib/content/landing";
import { TITLE_SUFFIX } from "@/lib/seo/pageTitle";
import { resolveGscVerification } from "@/lib/seo/searchConsole";
import { THEME_COLORS } from "@/lib/seo/themeColor";
import { siteConfig } from "@/lib/site";

/*
 * Root metadata and viewport: the defaults every page's head builds on
 * (src/routes/__root.tsx and pageHead).
 */

const gscVerification = resolveGscVerification(
  process.env.NEXT_PUBLIC_GSC_VERIFICATION,
);

export const rootMetadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: landingSite.title,
    template: `%s${TITLE_SUFFIX}`,
  },
  description: landingSite.description,
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  alternates: {
    canonical: "/",
    // RSS only carries blog posts, so it isn't advertised while the blog is hidden.
    ...(BLOG_PUBLIC ? { types: { "application/rss+xml": "/feed.xml" } } : {}),
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: landingSite.title,
    description: landingSite.description,
  },
  twitter: {
    card: "summary_large_image",
    creator: "@fkj98",
    site: "@fkj98",
    title: landingSite.title,
    description: landingSite.description,
  },
  robots: {
    index: true,
    follow: true,
  },
  ...(gscVerification ? { verification: { google: gscVerification } } : {}),
};

export const rootViewport: Viewport = {
  // The browser-chrome colour the server writes: the light theme's, the
  // site's default. It follows the reader's theme, not the OS's, so it has
  // no `media`; the document makes it the dark one for a dark page
  // (lib/seo/themeColor.ts).
  themeColor: THEME_COLORS.light,
};

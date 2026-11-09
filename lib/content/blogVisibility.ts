/**
 * Whether the blog is public. Kept in its own import-free module so client
 * chrome (the nav) can read it without pulling in `lib/content/blog.ts` and
 * the Sanity client.
 *
 * Hidden 09-11-26 (owner request). The posts are thin (24-108 words of body,
 * see process/features/sea-discovery/reports/seo-aeo-audit_REPORT_04-11-26.md)
 * and come back once they're expanded. While false:
 * - no nav, footer or in-content links point at /blog or /blog/*;
 * - /blog and every /blog/* page are `noindex, follow`;
 * - posts are left out of sitemap.xml, llms.txt and the RSS feed, and the
 *   RSS `<link rel="alternate">` is not advertised.
 * The pages still render for anyone who has a URL.
 *
 * Set to true to restore all of the above.
 */
export const BLOG_PUBLIC: boolean = false;

/** robots value for blog pages while the blog is hidden. */
export const HIDDEN_BLOG_ROBOTS = { index: false, follow: true } as const;

/** True for `/blog` and `/blog/...` hrefs. */
export function isBlogHref(href: string): boolean {
  return (
    href === "/blog" ||
    href.startsWith("/blog/") ||
    href.startsWith("/blog?") ||
    href.startsWith("/blog#")
  );
}

/** Drops links to the blog while it's hidden; returns the input unchanged otherwise. */
export function withoutHiddenBlogLinks<T extends { href: string }>(
  links: readonly T[],
): readonly T[] {
  return BLOG_PUBLIC ? links : links.filter((link) => !isBlogHref(link.href));
}

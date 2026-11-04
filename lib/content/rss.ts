import type { BlogCard } from "@/lib/content/blog";

/** Canonical feed URL path. `/rss.xml` 308-redirects here for old subscribers. */
export const FEED_PATH = "/feed.xml";

function escapeXml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

type RssFeedInput = {
  /** Same set the /blog index renders (Sanity + fallbacks), newest first. */
  cards: readonly BlogCard[];
  /** Site origin without a trailing slash. */
  base: string;
  title: string;
  description: string;
  buildDate: Date;
};

export function buildRssFeed({
  cards,
  base,
  title,
  description,
  buildDate,
}: RssFeedInput): string {
  const items = cards
    .map((card) => {
      const url = `${base}/blog/${card.slug}`;
      const published = new Date(card.publishedAt);
      const pubDate = Number.isNaN(published.getTime())
        ? ""
        : `\n      <pubDate>${published.toUTCString()}</pubDate>`;
      const excerpt = card.excerpt.trim()
        ? `\n      <description>${escapeXml(card.excerpt)}</description>`
        : "";
      return `    <item>
      <title>${escapeXml(card.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>${pubDate}${excerpt}
    </item>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(title)}</title>
    <link>${base}/blog</link>
    <description>${escapeXml(description)}</description>
    <language>en-us</language>
    <lastBuildDate>${buildDate.toUTCString()}</lastBuildDate>
    <atom:link href="${base}${FEED_PATH}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;
}

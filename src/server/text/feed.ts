import { resolveBlogCards } from "@/lib/content/blog";
import { BLOG_PUBLIC } from "@/lib/content/blogVisibility";
import { buildRssFeed } from "@/lib/content/rss";
import { siteConfig } from "@/lib/site";
import { fetchAllPosts } from "@/lib/sanity/fetch";

export async function GET(): Promise<Response> {
  // Same set as /blog, sitemap.xml and llms.txt: Sanity posts + fallbacks.
  // While the blog is hidden (BLOG_PUBLIC) the feed stays valid but has no items.
  const cards = BLOG_PUBLIC ? resolveBlogCards(await fetchAllPosts()) : [];

  const xml = buildRssFeed({
    cards,
    base: siteConfig.url.replace(/\/$/, ""),
    title: `${siteConfig.name} — Blog`,
    description: siteConfig.description,
    buildDate: new Date(),
  });

  // Cache headers are set by the route (withEdgeCache in src/routes/feed[.]xml.ts).
  return new Response(xml, {
    headers: { "content-type": "application/xml; charset=utf-8" },
  });
}

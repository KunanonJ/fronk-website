import { resolveBlogCards } from "@/lib/content/blog";
import { buildRssFeed } from "@/lib/content/rss";
import { siteConfig } from "@/lib/site";
import { fetchAllPosts } from "@/lib/sanity/fetch";

export const revalidate = 600;

export async function GET(): Promise<Response> {
  const posts = await fetchAllPosts();
  // Same set as /blog, sitemap.xml and llms.txt: Sanity posts + fallbacks.
  const cards = resolveBlogCards(posts);

  const xml = buildRssFeed({
    cards,
    base: siteConfig.url.replace(/\/$/, ""),
    title: `${siteConfig.name} — Blog`,
    description: siteConfig.description,
    buildDate: new Date(),
  });

  return new Response(xml, {
    headers: {
      "content-type": "application/xml; charset=utf-8",
      "cache-control": "public, s-maxage=600, stale-while-revalidate=86400",
    },
  });
}

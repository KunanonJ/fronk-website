import type { MetadataRoute } from "next";
import { resolveBlogCards } from "@/lib/content/blog";
import { siteConfig } from "@/lib/site";
import { fetchAllPosts } from "@/lib/sanity/fetch";

export const revalidate = 3600;

const STATIC_ROUTES: readonly {
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}[] = [
  { path: "", changeFrequency: "weekly", priority: 1 },
  { path: "/about", changeFrequency: "monthly", priority: 0.9 },
  { path: "/showcase", changeFrequency: "monthly", priority: 0.7 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.8 },
  { path: "/press", changeFrequency: "monthly", priority: 0.8 },
  { path: "/blog", changeFrequency: "weekly", priority: 0.9 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url.replace(/\/$/, "");
  const staticUpdated = new Date("2026-07-19");

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${base}${route.path}`,
    lastModified: staticUpdated,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const posts = await fetchAllPosts();
  const cards = resolveBlogCards(posts);
  const seen = new Set<string>();
  const postEntries: MetadataRoute.Sitemap = [];

  for (const card of cards) {
    if (seen.has(card.slug)) continue;
    seen.add(card.slug);
    const published = new Date(card.publishedAt);
    postEntries.push({
      url: `${base}/blog/${card.slug}`,
      lastModified: Number.isNaN(published.getTime()) ? staticUpdated : published,
      changeFrequency: "monthly",
      priority: 0.7,
    });
  }

  return [...staticEntries, ...postEntries];
}

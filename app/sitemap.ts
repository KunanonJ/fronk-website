import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";
import { fetchAllPosts } from "@/lib/sanity/fetch";

export const revalidate = 3600;

const STATIC_ROUTES = [
  "",
  "/about",
  "/now",
  "/ventures",
  "/writing",
  // /resume is hidden — not in the sitemap so it's not surfaced to crawlers.
  // Still reachable via direct link if you want to share the URL with
  // someone specific.
  "/contact",
] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url.replace(/\/$/, "");

  // Stable lastmod for the code-driven static pages — bump when their content
  // meaningfully changes. An honest signal beats `new Date()`, which churns
  // every build and trains crawlers to ignore lastmod entirely.
  const staticUpdated = new Date("2026-06-13");

  const staticPages: MetadataRoute.Sitemap = STATIC_ROUTES.map((path) => ({
    url: `${base}${path}`,
    lastModified: staticUpdated,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.7,
  }));

  // Per-venture detail pages were removed — the /ventures grid now CTAs
  // directly to each venture's external landing site (gogocash.co, manut.xyz),
  // so there are no internal venture-slug URLs to expose to crawlers.

  // Posts carry their real publish date so crawlers see genuine freshness.
  const posts = await fetchAllPosts();
  const postPages: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${base}/writing/${post.slug}`,
    lastModified: post.publishedAt ? new Date(post.publishedAt) : staticUpdated,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  return [...staticPages, ...postPages];
}

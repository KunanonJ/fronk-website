import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";
import { fetchAllPostSlugs } from "@/lib/sanity/fetch";

export const revalidate = 3600;

const STATIC_ROUTES = [
  "",
  "/about",
  "/now",
  "/ventures",
  "/writing",
  "/resume",
  "/contact",
] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url.replace(/\/$/, "");
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = STATIC_ROUTES.map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.7,
  }));

  // Per-venture detail pages were removed — the /ventures grid now CTAs
  // directly to each venture's external landing site (gogocash.co, manut.xyz),
  // so there are no internal venture-slug URLs to expose to crawlers.

  const postSlugs = await fetchAllPostSlugs();
  const postPages: MetadataRoute.Sitemap = postSlugs.map((slug) => ({
    url: `${base}/writing/${slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  return [...staticPages, ...postPages];
}

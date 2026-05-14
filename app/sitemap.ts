import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";
import { getAllVentureSlugs } from "@/lib/content/ventures";
import { fetchAllPostSlugs } from "@/lib/sanity/fetch";

export const revalidate = 3600;

const STATIC_ROUTES = ["", "/about", "/ventures", "/writing", "/resume", "/contact"] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url.replace(/\/$/, "");
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = STATIC_ROUTES.map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.7,
  }));

  const venturePages: MetadataRoute.Sitemap = getAllVentureSlugs().map((slug) => ({
    url: `${base}/ventures/${slug}`,
    lastModified: now,
    changeFrequency: "yearly",
    priority: 0.6,
  }));

  const postSlugs = await fetchAllPostSlugs();
  const postPages: MetadataRoute.Sitemap = postSlugs.map((slug) => ({
    url: `${base}/writing/${slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  return [...staticPages, ...venturePages, ...postPages];
}

import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

export const revalidate = 3600;

const STATIC_ROUTES = ["", "/showcase", "/contact", "/press", "/blog"] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url.replace(/\/$/, "");
  const staticUpdated = new Date("2026-07-19");

  return STATIC_ROUTES.map((path) => ({
    url: `${base}${path}`,
    lastModified: staticUpdated,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.8,
  }));
}

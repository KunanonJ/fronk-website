import { createFileRoute } from "@tanstack/react-router";
import { withDeployCache } from "@/src/lib/cache";
import { GET } from "@/src/server/text/sitemapMd";

/**
 * Generated from lib/content (src/server/text/sitemapMd.ts). No CMS input, so the
 * edge keeps it for a day; the cache key includes the deploy version.
 */
export const Route = createFileRoute("/sitemap.md")({
  server: {
    handlers: {
      GET: () => withDeployCache(GET()),
    },
  },
});

import { createFileRoute } from "@tanstack/react-router";
import sitemap from "@/app/sitemap";
import { sitemapToXml } from "@/lib/seo/metadataRoutes";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => new Response(sitemapToXml(await sitemap()), { headers: { "Content-Type": "application/xml" } }),
    },
  },
});

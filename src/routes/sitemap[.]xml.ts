import { createFileRoute } from "@tanstack/react-router";
import { withEdgeCache } from "@/src/lib/cache";
import sitemap from "@/lib/seo/sitemap";
import { sitemapToXml } from "@/lib/seo/metadataRoutes";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () =>
        withEdgeCache(
          new Response(sitemapToXml(await sitemap()), {
            headers: { "Content-Type": "application/xml" },
          }),
          ["posts"],
        ),
    },
  },
});

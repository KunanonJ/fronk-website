import { createFileRoute } from "@tanstack/react-router";
import manifest from "@/lib/seo/manifest";
import { manifestToJson } from "@/lib/seo/metadataRoutes";
import { withDeployCache } from "@/src/lib/cache";

/**
 * Built from lib/seo with no CMS input, so it changes only on a deploy,
 * which empties the cache: a day at the edge, an hour in browsers.
 */
export const Route = createFileRoute("/manifest.webmanifest")({
  server: {
    handlers: {
      GET: async () =>
        withDeployCache(
          new Response(manifestToJson(manifest()), {
            headers: { "Content-Type": "application/manifest+json" },
          }),
        ),
    },
  },
});

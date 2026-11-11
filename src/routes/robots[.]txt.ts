import { createFileRoute } from "@tanstack/react-router";
import robots from "@/lib/seo/robots";
import { robotsToText } from "@/lib/seo/metadataRoutes";
import { withEdgeLifetime } from "@/src/lib/cache";

/**
 * Built from lib/seo with no CMS input, so it changes only on a deploy,
 * which empties the cache: a day at the edge, an hour in browsers.
 */
export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: async () =>
        withEdgeLifetime(
          new Response(robotsToText(robots()), {
            headers: { "Content-Type": "text/plain" },
          }),
          "public, max-age=86400",
          "public, max-age=3600",
        ),
    },
  },
});

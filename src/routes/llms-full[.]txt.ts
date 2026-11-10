import { createFileRoute } from "@tanstack/react-router";
import { withEdgeLifetime } from "@/src/lib/cache";
import { GET } from "@/src/server/text/llmsFull";

/**
 * Generated from lib/content (src/server/text/llmsFull.ts). No CMS input, so
 * the edge keeps it for a day; the cache key includes the deploy version.
 */
export const Route = createFileRoute("/llms-full.txt")({
  server: {
    handlers: {
      GET: () =>
        withEdgeLifetime(
          GET(),
          "public, max-age=86400",
          "public, max-age=3600",
        ),
    },
  },
});

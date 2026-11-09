import { createFileRoute } from "@tanstack/react-router";
import { withEdgeLifetime } from "@/src/lib/cache";
import { GET } from "@/src/server/text/agentsMd";

/**
 * Generated from lib/content (src/server/text/agentsMd.ts). No CMS input, so the
 * edge keeps it for a day; the cache key includes the deploy version.
 */
export const Route = createFileRoute("/agents.md")({
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

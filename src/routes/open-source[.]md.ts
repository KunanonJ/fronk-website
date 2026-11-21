import { createFileRoute } from "@tanstack/react-router";
import { withDeployCache } from "@/src/lib/cache";
import { GET } from "@/src/server/text/openSourceMd";

/**
 * The open-source page as Markdown (src/server/text/openSourceMd.ts).
 * Generated from lib/content and its committed GitHub snapshot, with no CMS
 * input, so the edge keeps it for a day; the cache key includes the deploy.
 */
export const Route = createFileRoute("/open-source.md")({
  server: {
    handlers: {
      GET: () => withDeployCache(GET()),
    },
  },
});

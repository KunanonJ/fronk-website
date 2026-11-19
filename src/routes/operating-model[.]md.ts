import { createFileRoute } from "@tanstack/react-router";
import { withDeployCache } from "@/src/lib/cache";
import { GET } from "@/src/server/text/operatingModelMd";

/**
 * Generated from lib/content (src/server/text/operatingModelMd.ts). No CMS
 * input, so the edge keeps it for a day; the cache key includes the deploy.
 */
export const Route = createFileRoute("/operating-model.md")({
  server: {
    handlers: {
      GET: () => withDeployCache(GET()),
    },
  },
});

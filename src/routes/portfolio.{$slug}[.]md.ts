import { createFileRoute } from "@tanstack/react-router";
import { withDeployCache } from "@/src/lib/cache";
import { GET } from "@/src/server/text/portfolioMd";

/**
 * One portfolio project as Markdown (src/server/text/portfolioMd.ts). Built
 * from lib/content, so the edge keeps it for a day; an unknown slug is a
 * plain 404, which withDeployCache leaves uncached.
 */
export const Route = createFileRoute("/portfolio/{$slug}.md")({
  server: {
    handlers: {
      GET: ({ params }) => withDeployCache(GET(params.slug)),
    },
  },
});

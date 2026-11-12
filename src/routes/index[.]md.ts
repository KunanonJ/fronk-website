import { createFileRoute } from "@tanstack/react-router";
import { withEdgeCache } from "@/src/lib/cache";
import { GET } from "@/src/server/text/homeMd";

/**
 * The home page as Markdown (src/server/text/homeMd.ts): the /llms.txt brief.
 * Tagged like /llms.txt, which reads Sanity's posts while the blog is public.
 */
export const Route = createFileRoute("/index.md")({
  server: {
    handlers: {
      GET: () => withEdgeCache(GET(), ["posts"]),
    },
  },
});

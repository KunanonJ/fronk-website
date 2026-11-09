import { createFileRoute } from "@tanstack/react-router";
import { withEdgeCache } from "@/src/lib/cache";
import { GET } from "@/src/server/text/llms";

/** Shared handler in src/server; this file only maps the URL. */
export const Route = createFileRoute("/llms.txt")({
  server: {
    handlers: {
      GET: () => withEdgeCache(GET(), ["posts"]),
    },
  },
});

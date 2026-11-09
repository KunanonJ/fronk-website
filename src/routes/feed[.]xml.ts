import { createFileRoute } from "@tanstack/react-router";
import { withEdgeCache } from "@/src/lib/cache";
import { GET } from "@/src/server/text/feed";

/** Shared handler in src/server; this file only maps the URL. */
export const Route = createFileRoute("/feed.xml")({
  server: {
    handlers: {
      GET: () => withEdgeCache(GET(), ["posts"]),
    },
  },
});

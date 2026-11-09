import { createFileRoute } from "@tanstack/react-router";
import { withEdgeCache } from "@/src/lib/cache";
import { GET } from "@/app/feed.xml/route";

/** The Next route handler, unchanged (next/server is a Vite-only stand-in). */
export const Route = createFileRoute("/feed.xml")({
  server: {
    handlers: {
      GET: () => withEdgeCache(GET(), ["posts"]),
    },
  },
});

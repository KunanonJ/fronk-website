import { createFileRoute } from "@tanstack/react-router";
import { withDeployCache } from "@/src/lib/cache";
import { GET } from "@/src/server/text/searchIndex";

/**
 * The search dialog's and link previews' index (src/server/text/searchIndex.ts).
 * Built from lib/content, so it changes only on a deploy, which empties the
 * cache: a day at the edge, an hour in browsers.
 */
export const Route = createFileRoute("/search.json")({
  server: {
    handlers: {
      GET: () => withDeployCache(GET()),
    },
  },
});

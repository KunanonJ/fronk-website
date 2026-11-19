import { createFileRoute } from "@tanstack/react-router";
import { withDeployCache } from "@/src/lib/cache";
import { GET } from "@/src/server/text/skillsJson";

/**
 * Shared handler in src/server; this file maps the URL and sets the
 * lifetime. Built from a committed snapshot, so it changes only on a deploy,
 * which empties the cache: a day at the edge, an hour in browsers.
 */
export const Route = createFileRoute("/skills.json")({
  server: {
    handlers: {
      GET: () => withDeployCache(GET()),
    },
  },
});

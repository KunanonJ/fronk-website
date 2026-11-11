import { createFileRoute } from "@tanstack/react-router";
import { withEdgeLifetime } from "@/src/lib/cache";
import { GET } from "@/src/server/text/skillsJson";

/**
 * Shared handler in src/server; this file maps the URL and sets the
 * lifetime. Built from a committed snapshot, so it changes only on a deploy,
 * which empties the cache: a day at the edge, an hour in browsers.
 */
export const Route = createFileRoute("/skills.json")({
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

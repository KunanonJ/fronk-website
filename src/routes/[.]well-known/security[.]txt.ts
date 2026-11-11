import { createFileRoute } from "@tanstack/react-router";
import { withEdgeLifetime } from "@/src/lib/cache";
import { GET } from "@/src/server/text/securityTxt";

/**
 * Shared handler in src/server; this file maps the URL and sets the
 * lifetime. Built from lib/seo, so it changes only on a deploy, which
 * empties the cache: a day at the edge, an hour in browsers.
 */
export const Route = createFileRoute("/.well-known/security.txt")({
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

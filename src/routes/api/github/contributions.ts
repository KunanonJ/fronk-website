import { createFileRoute } from "@tanstack/react-router";
import { withEdgeLifetime } from "@/src/lib/cache";
import { GET } from "@/src/server/api/githubContributions";

/** Shared handler in src/server; this file only maps the URL. */
export const Route = createFileRoute("/api/github/contributions")({
  server: {
    handlers: {
      GET: () =>
        withEdgeLifetime(
          GET(),
          "public, max-age=3600, stale-while-revalidate=86400",
        ),
    },
  },
});

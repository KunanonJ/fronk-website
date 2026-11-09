import { createFileRoute } from "@tanstack/react-router";
import { withEdgeLifetime } from "@/src/lib/cache";
import { GET } from "@/app/api/github/contributions/route";

/** The Next route handler, unchanged (next/server is a Vite-only stand-in). */
export const Route = createFileRoute("/api/github/contributions")({
  server: {
    handlers: {
      GET: () => withEdgeLifetime(GET(), "public, max-age=3600, stale-while-revalidate=86400"),
    },
  },
});

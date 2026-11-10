import { createFileRoute } from "@tanstack/react-router";
import { withEdgeLifetime } from "@/src/lib/cache";
import { GET } from "@/src/server/text/aboutMd";

/**
 * The About page as Markdown (src/server/text/aboutMd.ts). Generated from
 * lib/content with no CMS input, so the edge keeps it for a day; the cache
 * key includes the deploy.
 */
export const Route = createFileRoute("/about.md")({
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

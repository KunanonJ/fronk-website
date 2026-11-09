import { createFileRoute } from "@tanstack/react-router";
import { withEdgeLifetime } from "@/src/lib/cache";
import render from "@/src/server/og/portfolioOg";

/** Next's file-convention image (next/og is @cf-wasm/og in this build). Edge-cached
 * for a day (the Worker cache key includes the deploy version). Browsers get a
 * day too, not the renderer's year: unlike Next, these URLs carry no hash. */
const OG_EDGE = "public, max-age=86400";

export const Route = createFileRoute("/portfolio/$slug/opengraph-image")({
  server: {
    handlers: {
      GET: async ({ params }) => withEdgeLifetime(render({ params: Promise.resolve(params) }), OG_EDGE, OG_EDGE),
    },
  },
});

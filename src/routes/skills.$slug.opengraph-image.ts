import { createFileRoute } from "@tanstack/react-router";
import { withImageCache } from "@/src/lib/cache";
import render from "@/src/server/og/skillOg";

export const Route = createFileRoute("/skills/$slug/opengraph-image")({
  server: {
    handlers: {
      GET: async ({ params }) =>
        withImageCache(render({ params: Promise.resolve(params) })),
    },
  },
});

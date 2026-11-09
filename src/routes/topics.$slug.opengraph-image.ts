import { createFileRoute } from "@tanstack/react-router";
import { withImageCache } from "@/src/lib/cache";
import render from "@/src/server/og/topicOg";

export const Route = createFileRoute("/topics/$slug/opengraph-image")({
  server: {
    handlers: {
      GET: async ({ params }) => withImageCache(render({ params: Promise.resolve(params) })),
    },
  },
});

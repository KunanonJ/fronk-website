import { createFileRoute } from "@tanstack/react-router";
import { withImageCache } from "@/src/lib/cache";
import render from "@/src/server/og/aboutOg";

export const Route = createFileRoute("/about/opengraph-image")({
  server: {
    handlers: {
      GET: async () => withImageCache(render()),
    },
  },
});

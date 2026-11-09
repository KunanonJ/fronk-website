import { createFileRoute } from "@tanstack/react-router";
import { withImageCache } from "@/src/lib/cache";
import render from "@/src/server/og/siteOg";

export const Route = createFileRoute("/opengraph-image")({
  server: {
    handlers: {
      GET: async () => withImageCache(render()),
    },
  },
});

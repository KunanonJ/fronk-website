import { createFileRoute } from "@tanstack/react-router";
import { withImageCache } from "@/src/lib/cache";
import render from "@/src/server/og/icon";

export const Route = createFileRoute("/icon")({
  server: {
    handlers: {
      GET: async () => withImageCache(render()),
    },
  },
});

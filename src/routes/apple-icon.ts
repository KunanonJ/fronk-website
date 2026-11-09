import { createFileRoute } from "@tanstack/react-router";
import { withImageCache } from "@/src/lib/cache";
import render from "@/src/server/og/appleIcon";

export const Route = createFileRoute("/apple-icon")({
  server: {
    handlers: {
      GET: async () => withImageCache(render()),
    },
  },
});

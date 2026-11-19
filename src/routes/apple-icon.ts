import { createFileRoute } from "@tanstack/react-router";
import { withImageCache } from "@/src/lib/cache";
import { APPLE_ICON, monogramIcon } from "@/src/server/og/icon";

export const Route = createFileRoute("/apple-icon")({
  server: {
    handlers: {
      GET: async () => withImageCache(monogramIcon(APPLE_ICON)),
    },
  },
});

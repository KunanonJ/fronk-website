import { createFileRoute } from "@tanstack/react-router";
import { withImageCache } from "@/src/lib/cache";
import { APPLE_ICON, portraitIcon } from "@/src/server/og/icon";

export const Route = createFileRoute("/apple-icon")({
  server: {
    handlers: {
      GET: async () => withImageCache(portraitIcon(APPLE_ICON)),
    },
  },
});

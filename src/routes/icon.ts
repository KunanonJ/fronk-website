import { createFileRoute } from "@tanstack/react-router";
import { withImageCache } from "@/src/lib/cache";
import { ICON, portraitIcon } from "@/src/server/og/icon";

export const Route = createFileRoute("/icon")({
  server: {
    handlers: {
      GET: async () => withImageCache(portraitIcon(ICON)),
    },
  },
});

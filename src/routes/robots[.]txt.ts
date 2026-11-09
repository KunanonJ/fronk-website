import { createFileRoute } from "@tanstack/react-router";
import robots from "@/lib/seo/robots";
import { robotsToText } from "@/lib/seo/metadataRoutes";

export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: async () => new Response(robotsToText(robots()), { headers: { "Content-Type": "text/plain" } }),
    },
  },
});

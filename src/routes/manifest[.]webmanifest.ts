import { createFileRoute } from "@tanstack/react-router";
import manifest from "@/lib/seo/manifest";
import { manifestToJson } from "@/lib/seo/metadataRoutes";

export const Route = createFileRoute("/manifest.webmanifest")({
  server: {
    handlers: {
      GET: async () => new Response(manifestToJson(manifest()), { headers: { "Content-Type": "application/manifest+json" } }),
    },
  },
});

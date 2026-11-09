import { createFileRoute } from "@tanstack/react-router";
import { POST } from "@/app/api/contact/route";

/** The Next route handler, unchanged (next/server is a Vite-only stand-in). */
export const Route = createFileRoute("/api/contact")({
  server: {
    handlers: {
      POST: ({ request }) => POST(request),
    },
  },
});

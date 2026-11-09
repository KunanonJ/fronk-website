import { createFileRoute } from "@tanstack/react-router";
import { GET } from "@/app/api/github/contributions/route";

/** The Next route handler, unchanged (next/server is a Vite-only stand-in). */
export const Route = createFileRoute("/api/github/contributions")({
  server: {
    handlers: {
      GET: () => GET(),
    },
  },
});

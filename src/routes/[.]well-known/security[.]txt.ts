import { createFileRoute } from "@tanstack/react-router";
import { GET } from "@/app/.well-known/security.txt/route";

/** The Next route handler, unchanged (next/server is a Vite-only stand-in). */
export const Route = createFileRoute("/.well-known/security.txt")({
  server: {
    handlers: {
      GET: () => GET(),
    },
  },
});

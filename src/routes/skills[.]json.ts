import { createFileRoute } from "@tanstack/react-router";
import { GET } from "@/app/skills.json/route";

/** The Next route handler, unchanged (next/server is a Vite-only stand-in). */
export const Route = createFileRoute("/skills.json")({
  server: {
    handlers: {
      GET: () => GET(),
    },
  },
});

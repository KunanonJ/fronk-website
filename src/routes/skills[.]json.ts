import { createFileRoute } from "@tanstack/react-router";
import { GET } from "@/src/server/text/skillsJson";

/** Shared handler in src/server; this file only maps the URL. */
export const Route = createFileRoute("/skills.json")({
  server: {
    handlers: {
      GET: () => GET(),
    },
  },
});

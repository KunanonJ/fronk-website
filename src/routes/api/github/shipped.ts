import { createFileRoute } from "@tanstack/react-router";
import { GET } from "@/src/server/api/githubShipped";

/** Shared handler in src/server, which sets its own cache headers. */
export const Route = createFileRoute("/api/github/shipped")({
  server: {
    handlers: {
      GET: () => GET(),
    },
  },
});

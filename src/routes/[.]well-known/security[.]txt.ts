import { createFileRoute } from "@tanstack/react-router";
import { GET } from "@/src/server/text/securityTxt";

/** Shared handler in src/server; this file only maps the URL. */
export const Route = createFileRoute("/.well-known/security.txt")({
  server: {
    handlers: {
      GET: () => GET(),
    },
  },
});

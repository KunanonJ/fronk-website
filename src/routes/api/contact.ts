import { createFileRoute } from "@tanstack/react-router";
import { env } from "cloudflare:workers";
import { POST } from "@/src/server/api/contact";
import { guardForm, type FormGuardEnv } from "@/src/server/formGuard";

/** Rate limit and Turnstile first, then the shared Next handler unchanged. */
export const Route = createFileRoute("/api/contact")({
  server: {
    handlers: {
      POST: async ({ request }) => (await guardForm(request, "contact", env as FormGuardEnv)) ?? POST(request),
    },
  },
});

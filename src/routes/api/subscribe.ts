import { createFileRoute } from "@tanstack/react-router";
import { env } from "cloudflare:workers";
import { POST } from "@/app/api/subscribe/route";
import { guardForm, type FormGuardEnv } from "@/src/server/formGuard";

/** Rate limit and Turnstile first, then the shared Next handler unchanged. */
export const Route = createFileRoute("/api/subscribe")({
  server: {
    handlers: {
      POST: async ({ request }) => (await guardForm(request, "subscribe", env as FormGuardEnv)) ?? POST(request),
    },
  },
});

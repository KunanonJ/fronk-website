import { contactMessages } from "@/lib/content/contact";

/*
 * Abuse checks for the form endpoints, run by the Start server routes before
 * the shared Next handlers: a per-IP rate limit (ratelimits binding) and
 * Turnstile verification once TURNSTILE_SECRET_KEY is set. Each check is
 * skipped when its binding or secret is absent (Next, unit tests, local).
 */

export type FormGuardEnv = {
  FORM_RATE_LIMIT?: { limit: (options: { key: string }) => Promise<{ success: boolean }> };
  TURNSTILE_SECRET_KEY?: string;
};

const SITEVERIFY = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export async function guardForm(
  request: Request,
  scope: "contact" | "subscribe",
  env: FormGuardEnv,
  fetcher: typeof fetch = fetch,
): Promise<Response | null> {
  const ip = request.headers.get("cf-connecting-ip") ?? "unknown";

  if (env.FORM_RATE_LIMIT) {
    const { success } = await env.FORM_RATE_LIMIT.limit({ key: `${scope}:${ip}` });
    if (!success) return Response.json({ ok: false, message: contactMessages.rateLimited }, { status: 429 });
  }

  if (env.TURNSTILE_SECRET_KEY) {
    const body = (await request.clone().json().catch(() => null)) as { turnstileToken?: unknown } | null;
    const token = typeof body?.turnstileToken === "string" ? body.turnstileToken : "";
    let passed = false;
    if (token) {
      const form = new URLSearchParams({ secret: env.TURNSTILE_SECRET_KEY, response: token, remoteip: ip });
      const outcome = (await fetcher(SITEVERIFY, { method: "POST", body: form })
        .then((r) => r.json())
        .catch(() => null)) as { success?: boolean } | null;
      passed = outcome?.success === true;
    }
    if (!passed) return Response.json({ ok: false, message: contactMessages.botCheck }, { status: 403 });
  }

  return null;
}

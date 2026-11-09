import { CONTACT_LIMITS, contactMessages } from "@/lib/content/contact";
import { readBodyText } from "@/src/server/http";

/*
 * Abuse checks for the contact endpoint, run by its server route before the
 * handler: a per-IP rate limit (ratelimits binding) and
 * Turnstile verification once TURNSTILE_SECRET_KEY is set. Each check is
 * skipped when its binding or secret is absent (unit tests, local dev).
 */

export type FormGuardEnv = {
  FORM_RATE_LIMIT?: { limit: (options: { key: string }) => Promise<{ success: boolean }> };
  TURNSTILE_SECRET_KEY?: string;
};

const SITEVERIFY = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export async function guardForm(
  request: Request,
  scope: "contact",
  env: FormGuardEnv,
  fetcher: typeof fetch = fetch,
): Promise<Response | null> {
  const ip = request.headers.get("cf-connecting-ip") ?? "unknown";

  if (env.FORM_RATE_LIMIT) {
    const { success } = await env.FORM_RATE_LIMIT.limit({ key: `${scope}:${ip}` });
    if (!success) return Response.json({ ok: false, message: contactMessages.rateLimited }, { status: 429 });
  }

  if (env.TURNSTILE_SECRET_KEY) {
    const text = await readBodyText(request.clone(), CONTACT_LIMITS.maxBodyBytes);
    let body: { turnstileToken?: unknown } | null;
    try {
      body = text ? (JSON.parse(text) as { turnstileToken?: unknown }) : null;
    } catch {
      body = null;
    }
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

// Pragmatic email shape check — one local part, one domain with a TLD. Not a
// full RFC validator (those reject valid addresses); the real confirmation is
// the double opt-in email Resend can send.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_PATTERN.test(email.trim());
}

export interface SubscribeResult {
  ok: boolean;
  status: number;
  message: string;
}

export interface SubscribeConfig {
  apiKey?: string;
  audienceId?: string;
}

const RETRY_MESSAGE = "Couldn't subscribe just now — please try again in a bit.";

/**
 * Add an email to the Resend audience (the newsletter list). Pure-ish + testable
 * via the injectable `fetchImpl`. Validates the address first, then no-ops with a
 * clear status when Resend isn't configured, and never throws — every failure
 * maps to a friendly {ok,status,message}. Resend's create-contact is idempotent,
 * so re-subscribing an existing address succeeds.
 */
export async function subscribeEmail(
  email: string,
  config: SubscribeConfig,
  fetchImpl: typeof fetch = fetch,
): Promise<SubscribeResult> {
  if (!isValidEmail(email)) {
    return { ok: false, status: 400, message: "Enter a valid email address." };
  }
  if (!config.apiKey || !config.audienceId) {
    return {
      ok: false,
      status: 503,
      message: "The newsletter isn't set up yet — check back soon.",
    };
  }

  try {
    const response = await fetchImpl(
      `https://api.resend.com/audiences/${config.audienceId}/contacts`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email.trim(), unsubscribed: false }),
      },
    );

    if (response.ok) {
      return {
        ok: true,
        status: 200,
        message: "You're in. New posts will land in your inbox.",
      };
    }
    return { ok: false, status: 502, message: RETRY_MESSAGE };
  } catch {
    return { ok: false, status: 502, message: RETRY_MESSAGE };
  }
}

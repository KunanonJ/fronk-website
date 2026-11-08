import {
  CONTACT_LIMITS,
  contactMessages,
  isContactTopic,
  type ContactTopic,
} from "@/lib/content/contact";
import { isValidEmail } from "@/lib/newsletter/subscribe";

const RESEND_EMAILS_URL = "https://api.resend.com/emails";
const SUBJECT_MAX = 150;

export interface ContactInput {
  name: string;
  email: string;
  message: string;
  topics: ContactTopic[];
  /** Honeypot. Real visitors never see or fill it. */
  company: string;
  /** Milliseconds between the form mounting and submit, measured client-side. */
  elapsedMs: number | null;
}

export interface ContactConfig {
  apiKey?: string;
  /** Owner inbox that receives messages. */
  to?: string;
  /** Verified Resend sender, e.g. `KunanonJ <contact@kunanonj.com>`. */
  from?: string;
}

export interface ContactResult {
  ok: boolean;
  status: number;
  message: string;
}

const text = (value: unknown): string =>
  typeof value === "string" ? value.trim() : "";

/** Turn any parsed JSON body into a safe, typed input. Never throws. */
export function parseContactInput(raw: unknown): ContactInput {
  const body =
    raw && typeof raw === "object" && !Array.isArray(raw)
      ? (raw as Record<string, unknown>)
      : {};

  const topics = Array.isArray(body.topics)
    ? [...new Set(body.topics.filter(isContactTopic))].slice(
        0,
        CONTACT_LIMITS.topicsMax,
      )
    : [];

  const elapsed = body.elapsedMs;

  return {
    name: text(body.name),
    email: text(body.email),
    message: text(body.message),
    topics,
    company: text(body.company),
    elapsedMs:
      typeof elapsed === "number" && Number.isFinite(elapsed) ? elapsed : null,
  };
}

/** Collapse control characters (CR/LF included) so a subject can't inject headers. */
const singleLine = (value: string): string =>
  value.replace(/[\u0000-\u001f\u007f]+/g, " ").replace(/\s+/g, " ").trim();

export function buildSubject(input: Pick<ContactInput, "name" | "topics">): string {
  const about = input.topics.length > 0 ? input.topics.join(", ") : "Message";
  return singleLine(`[kunanonj.com] ${about} from ${input.name}`).slice(
    0,
    SUBJECT_MAX,
  );
}

function buildText(input: ContactInput): string {
  return [
    `From: ${singleLine(input.name)} <${input.email}>`,
    `Topics: ${input.topics.length > 0 ? input.topics.join(", ") : "none"}`,
    "",
    input.message,
    "",
    "--",
    "Sent from the contact form on kunanonj.com. Reply to answer directly.",
  ].join("\n");
}

function validate(input: ContactInput): string | null {
  if (!input.name || input.name.length > CONTACT_LIMITS.nameMax) {
    return contactMessages.invalidName;
  }
  if (input.email.length > CONTACT_LIMITS.emailMax || !isValidEmail(input.email)) {
    return contactMessages.invalidEmail;
  }
  if (input.message.length < CONTACT_LIMITS.messageMin) {
    return contactMessages.messageTooShort;
  }
  if (input.message.length > CONTACT_LIMITS.messageMax) {
    return contactMessages.messageTooLong;
  }
  return null;
}

function looksAutomated(input: ContactInput): boolean {
  return (
    input.company !== "" ||
    input.elapsedMs === null ||
    input.elapsedMs < CONTACT_LIMITS.minFillMs
  );
}

/**
 * Deliver a contact-form message to the owner's inbox through Resend.
 *
 * Validates first, then silently accepts (without sending) anything that looks
 * automated so bots learn nothing. Returns 503 when Resend isn't configured and
 * 502 when delivery fails. Never throws. The body is plain text only, so
 * visitor input can't inject markup, and `reply_to` points at the visitor.
 */
export async function sendContactMessage(
  input: ContactInput,
  config: ContactConfig,
  fetchImpl: typeof fetch = fetch,
): Promise<ContactResult> {
  const invalid = validate(input);
  if (invalid) return { ok: false, status: 400, message: invalid };

  const sent: ContactResult = { ok: true, status: 200, message: contactMessages.sent };
  if (looksAutomated(input)) return sent;

  const apiKey = config.apiKey?.trim();
  const to = config.to?.trim();
  const from = config.from?.trim();
  if (!apiKey || !to || !from) {
    return { ok: false, status: 503, message: contactMessages.notConfigured };
  }

  const failed: ContactResult = { ok: false, status: 502, message: contactMessages.failed };
  try {
    const response = await fetchImpl(RESEND_EMAILS_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: input.email,
        subject: buildSubject(input),
        text: buildText(input),
      }),
    });
    return response.ok ? sent : failed;
  } catch {
    return failed;
  }
}

import { contactPage } from "@/lib/content/contact";

/**
 * The longest mailto: link handed to the email app. Chrome and Edge on
 * Windows open nothing for a longer external link (Chromium's
 * platform_util_win caps it at 2,048 characters), and percent-encoding
 * makes a message several times longer: 3 characters per space, 9 per
 * Thai letter.
 */
export const MAILTO_MAX = 2048;

/**
 * The email the contact form prepares: the visitor's own email app sends it
 * to the public address, so the site sends nothing and stores nothing.
 */
export interface ContactEmail {
  to: string;
  subject: string;
  body: string;
  /**
   * A mailto: link that opens it in the visitor's email app: the whole
   * email, or the address and subject only when the body would make it
   * longer than MAILTO_MAX.
   */
  href: string;
  /** False when `href` leaves the body out, for the visitor to paste in. */
  complete: boolean;
}

/** One line: line breaks and runs of spaces become a single space. */
export const oneLine = (value: string) => value.replace(/\s+/g, " ").trim();

/**
 * `value` with each lone surrogate replaced by U+FFFD, as
 * String.prototype.toWellFormed does: encodeURIComponent throws on one, and
 * an agent's draft (WebMCP) can carry one into the form.
 */
const wellFormed = (value: string) =>
  value.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDFFF]/g, (unit) =>
    unit.length === 2 ? unit : "�",
  );

/**
 * The subject names the topics and the sender ("Hiring: Ada Lovelace via
 * kunanonj.com"), so the owner can sort the inbox; the body is the message,
 * then the name as a sign-off. Line breaks become CRLF, as mailto bodies
 * expect (RFC 6068), and the name keeps to one line, as a subject must.
 */
export function composeContactEmail({
  name,
  message,
  topics,
}: {
  name: string;
  message: string;
  topics: readonly string[];
}): ContactEmail {
  const who = oneLine(wellFormed(name));
  const subject = `${topics.length ? `${topics.join(", ")}: ` : ""}${who} via kunanonj.com`;
  const body = `${wellFormed(message).trim()}\n\n${who}`;
  const to = contactPage.email;
  const head = `mailto:${to}?subject=${encodeURIComponent(subject)}`;
  const whole = `${head}&body=${encodeURIComponent(body.replace(/\r?\n/g, "\r\n"))}`;
  const complete = whole.length <= MAILTO_MAX;
  return { to, subject, body, href: complete ? whole : head, complete };
}

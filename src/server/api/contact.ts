import { CONTACT_LIMITS, contactMessages } from "@/lib/content/contact";
import {
  parseContactInput,
  sendContactMessage,
} from "@/lib/contact/sendContactMessage";
import { isCrossSite, readBodyText } from "@/src/server/http";

// Contact form → one plain-text email to the owner through Resend. Validation,
// bot filtering, the "not configured" path and every failure mode live in
// sendContactMessage (tested); this handler checks the request is a same-site
// JSON post under the size limit, parses it, and maps the result to
// { ok, message }. It never echoes visitor input back.
export async function POST(request: Request) {
  if (isCrossSite(request)) {
    return Response.json(
      { ok: false, message: contactMessages.failed },
      { status: 403 },
    );
  }
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().startsWith("application/json")) {
    return Response.json(
      { ok: false, message: contactMessages.failed },
      { status: 415 },
    );
  }

  const text = await readBodyText(request, CONTACT_LIMITS.maxBodyBytes);
  if (text === null) {
    return Response.json(
      { ok: false, message: contactMessages.tooLarge },
      { status: 413 },
    );
  }

  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    // Empty or invalid JSON falls through as an empty input (400 on the name).
  }

  const result = await sendContactMessage(parseContactInput(raw), {
    apiKey: process.env.RESEND_API_KEY,
    to: process.env.CONTACT_TO_EMAIL,
    from: process.env.CONTACT_FROM_EMAIL,
  });

  return Response.json(
    { ok: result.ok, message: result.message },
    { status: result.status },
  );
}

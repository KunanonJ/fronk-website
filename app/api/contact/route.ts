import { NextResponse } from "next/server";
import { CONTACT_LIMITS, contactMessages } from "@/lib/content/contact";
import {
  parseContactInput,
  sendContactMessage,
} from "@/lib/contact/sendContactMessage";

// Contact form → one plain-text email to the owner through Resend. Validation,
// bot filtering, the "not configured" path and every failure mode live in
// sendContactMessage (tested); this handler guards size, parses JSON, and maps
// the result to { ok, message }. It never echoes visitor input back.
export async function POST(request: Request) {
  const declared = Number(request.headers.get("content-length") ?? 0);
  if (declared > CONTACT_LIMITS.maxBodyBytes) {
    return NextResponse.json(
      { ok: false, message: contactMessages.tooLarge },
      { status: 413 },
    );
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    // Empty or invalid JSON falls through as an empty input (400 on the name).
  }

  const result = await sendContactMessage(parseContactInput(raw), {
    apiKey: process.env.RESEND_API_KEY,
    to: process.env.CONTACT_TO_EMAIL,
    from: process.env.CONTACT_FROM_EMAIL,
  });

  return NextResponse.json(
    { ok: result.ok, message: result.message },
    { status: result.status },
  );
}

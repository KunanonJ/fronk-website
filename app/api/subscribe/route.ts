import { NextResponse } from "next/server";
import { subscribeEmail } from "@/lib/newsletter/subscribe";

// Newsletter signup → adds the email to the Resend audience. Validation, the
// "not configured" path, and all failure modes live in subscribeEmail (tested);
// this handler just reads the body and maps the result to a JSON response.
export async function POST(request: Request) {
  let email = "";
  try {
    const body = (await request.json()) as { email?: unknown };
    if (typeof body?.email === "string") email = body.email;
  } catch {
    // Empty / invalid JSON → falls through as an invalid email (400).
  }

  const result = await subscribeEmail(email, {
    apiKey: process.env.RESEND_API_KEY,
    audienceId: process.env.RESEND_AUDIENCE_ID,
  });

  return NextResponse.json(
    { ok: result.ok, message: result.message },
    { status: result.status },
  );
}

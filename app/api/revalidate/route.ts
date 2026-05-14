import { revalidateTag } from "next/cache";
import { parseBody } from "next-sanity/webhook";
import { NextResponse, type NextRequest } from "next/server";

export const runtime = "nodejs";

interface SanityPostBody {
  _type?: string;
  slug?: { current?: string };
}

export async function POST(req: Request | NextRequest): Promise<Response> {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  if (!secret) {
    return NextResponse.json(
      { message: "Missing SANITY_REVALIDATE_SECRET" },
      { status: 500 },
    );
  }

  try {
    const { isValidSignature, body } = await parseBody<SanityPostBody>(
      req as NextRequest,
      secret,
    );

    if (!isValidSignature) {
      return NextResponse.json({ message: "Invalid signature" }, { status: 401 });
    }

    if (!body) {
      return NextResponse.json({ message: "Empty body" }, { status: 400 });
    }

    // "max" is the documented cache-life profile name for immediate
    // revalidation in Next.js 16. Passing a `{ expire: 0 }` object also
    // type-checks but is not a documented profile shape — the webhook used
    // to silently no-op tag invalidation despite responding 200.
    revalidateTag("posts", "max");

    return NextResponse.json({
      status: 200,
      revalidated: true,
      now: Date.now(),
      body,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ message }, { status: 500 });
  }
}

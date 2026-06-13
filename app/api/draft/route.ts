import { draftMode } from "next/headers";
import { NextResponse } from "next/server";
import { getSafeRedirectPath } from "@/lib/utils/safeRedirectPath";

export async function GET(req: Request): Promise<Response> {
  const secret = process.env.SANITY_PREVIEW_SECRET;
  if (!secret) {
    return NextResponse.json(
      { message: "Missing SANITY_PREVIEW_SECRET" },
      { status: 500 },
    );
  }

  const url = new URL(req.url);
  const providedSecret = url.searchParams.get("secret");
  if (providedSecret !== secret) {
    return NextResponse.json({ message: "Invalid secret" }, { status: 401 });
  }

  const draft = await draftMode();
  draft.enable();

  const path = getSafeRedirectPath(url.searchParams.get("slug"));
  return NextResponse.redirect(new URL(path, req.url), 307);
}

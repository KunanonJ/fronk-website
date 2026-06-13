import { draftMode } from "next/headers";
import { NextResponse } from "next/server";
import { getSafeRedirectPath } from "@/lib/utils/safeRedirectPath";

export async function GET(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const draft = await draftMode();
  draft.disable();

  const path = getSafeRedirectPath(url.searchParams.get("slug"));
  return NextResponse.redirect(new URL(path, req.url), 307);
}

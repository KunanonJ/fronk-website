import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { REVALIDATE_TAGS } from "@/lib/sanity/revalidation";

const SCHEDULED_TAGS = [
  REVALIDATE_TAGS.posts,
  REVALIDATE_TAGS.writing,
  REVALIDATE_TAGS.pages,
  REVALIDATE_TAGS.ventures,
] as const;

export async function GET(req: Request): Promise<Response> {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ message: "Missing CRON_SECRET" }, { status: 500 });
  }

  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  for (const tag of SCHEDULED_TAGS) {
    revalidateTag(tag, "max");
  }

  return NextResponse.json({
    revalidated: true,
    tags: [...SCHEDULED_TAGS],
    now: Date.now(),
  });
}

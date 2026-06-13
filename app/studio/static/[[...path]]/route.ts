import { readManifestFile, resolveManifestFileName } from "@/lib/sanity/manifest";
import { NextResponse } from "next/server";

export const dynamic = "force-static";

export async function GET(
  _request: Request,
  context: { params: Promise<{ path?: string[] }> },
) {
  const { path: segments } = await context.params;
  const fileName = resolveManifestFileName(segments);
  if (!fileName) {
    return new NextResponse("Not found", { status: 404 });
  }

  const content = await readManifestFile(fileName);
  if (!content) {
    return new NextResponse("Not found", { status: 404 });
  }

  return new NextResponse(content, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}

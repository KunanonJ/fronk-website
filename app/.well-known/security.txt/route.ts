import { buildSecurityTxt } from "@/lib/seo/securityTxt";

export const dynamic = "force-static";

export function GET() {
  return new Response(buildSecurityTxt(), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}

import { buildSecurityTxt } from "@/lib/seo/securityTxt";

/** Its cache headers are set by its route (src/routes/[.]well-known/security[.]txt.ts). */
export function GET() {
  return new Response(buildSecurityTxt(), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

import { buildSecurityTxt } from "@/lib/seo/securityTxt";
import { textResponse } from "@/src/server/text/markdown";

/** Its cache headers are set by its route (src/routes/[.]well-known/security[.]txt.ts). */
export function GET() {
  return textResponse(buildSecurityTxt(), "text/plain");
}

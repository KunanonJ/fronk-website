import { SITE_ORIGIN, siteConfig } from "@/lib/site";

/**
 * RFC 9116 security.txt, served at /.well-known/security.txt.
 *
 * `Expires` is required and should be under a year out. Bump it before it
 * lapses: `securityTxt.test.ts` fails once fewer than 30 days remain.
 */
export const SECURITY_TXT_EXPIRES = "2027-11-01T00:00:00.000Z";

export function buildSecurityTxt(): string {
  return [
    `Contact: mailto:${siteConfig.email}`,
    `Contact: ${SITE_ORIGIN}/contact`,
    `Expires: ${SECURITY_TXT_EXPIRES}`,
    "Preferred-Languages: en, th",
    `Canonical: ${SITE_ORIGIN}/.well-known/security.txt`,
    "",
  ].join("\n");
}

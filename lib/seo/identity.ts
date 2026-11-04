import { siteConfig } from "@/lib/site";

/**
 * `<link rel="me">` targets in the root layout: personal profiles only, so
 * search engines and IndieWeb verifiers tie them to the person. Product
 * domains (e.g. gogocash.co) belong on Organization.url in the JSON-LD, not
 * here; `siteConfig.socials.website` is deliberately left out (04-11-26).
 */
export const IDENTITY_LINKS: readonly string[] = [
  `mailto:${siteConfig.email}`,
  siteConfig.socials.x,
  siteConfig.socials.linkedin,
  siteConfig.socials.github,
  siteConfig.socials.telegram,
  siteConfig.socials.farcaster,
];

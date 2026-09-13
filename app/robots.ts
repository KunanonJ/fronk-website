import type { MetadataRoute } from "next";
import {
  CANONICAL_SITE_URL,
  PLACEHOLDER_SITE_URL,
  resolvePublicSiteUrl,
} from "@/lib/seo/siteUrl";

/** Citation / search bots — allow explicitly so managed rules are easier to audit. */
const CITATION_USER_AGENTS = [
  "Googlebot",
  "ChatGPT-User",
  "OAI-SearchBot",
  "PerplexityBot",
  "Claude-User",
  "Claude-SearchBot",
] as const;

/** Training / aggressive scrapers — keep blocked at the app layer. */
const BLOCKED_USER_AGENTS = ["CCBot", "Bytespider"] as const;

/** Robots Host/Sitemap must never advertise the local placeholder. */
function robotsOrigin(): string {
  const resolved = resolvePublicSiteUrl().replace(/\/$/, "");
  if (
    resolved === PLACEHOLDER_SITE_URL ||
    resolved.includes("example.com") ||
    resolved.includes("localhost")
  ) {
    return CANONICAL_SITE_URL;
  }
  return resolved;
}

export default function robots(): MetadataRoute.Robots {
  const base = robotsOrigin();
  const sharedDisallow = ["/studio", "/api"] as const;

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [...sharedDisallow],
      },
      ...CITATION_USER_AGENTS.map((userAgent) => ({
        userAgent,
        allow: "/",
        disallow: [...sharedDisallow],
      })),
      ...BLOCKED_USER_AGENTS.map((userAgent) => ({
        userAgent,
        disallow: ["/"],
      })),
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}

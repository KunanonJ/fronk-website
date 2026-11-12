import type { Robots } from "@/lib/seo/types";
import {
  CANONICAL_SITE_URL,
  PLACEHOLDER_SITE_URL,
  resolvePublicSiteUrl,
} from "@/lib/seo/siteUrl";

/**
 * Search, citation and model crawlers, allowed explicitly so managed rules
 * are easy to audit. The site's goal is to be cited and known by AI answer
 * engines (FDE positioning), so the model crawlers are allowed too.
 */
const CITATION_USER_AGENTS = [
  "Googlebot",
  "Bingbot",
  "ChatGPT-User",
  "OAI-SearchBot",
  "GPTBot",
  "PerplexityBot",
  "Perplexity-User",
  "Claude-User",
  "Claude-SearchBot",
  "ClaudeBot",
  "Google-Extended",
  "Applebot",
  "Applebot-Extended",
] as const;

/**
 * How AI may use the site's text (contentsignals.org), the owner's answer of
 * 12-11-26: search, AI answers and training are all allowed, as the citation
 * crawlers above already are. A crawler reads only the group that names it,
 * so every group that allows crawling carries the line.
 */
export const CONTENT_SIGNAL = "search=yes, ai-input=yes, ai-train=yes";

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

export default function robots(): Robots {
  const base = robotsOrigin();
  const sharedDisallow = ["/studio", "/api"] as const;

  return {
    comment: "Content signals: https://contentsignals.org",
    rules: [
      {
        userAgent: "*",
        contentSignal: CONTENT_SIGNAL,
        allow: "/",
        disallow: [...sharedDisallow],
      },
      ...CITATION_USER_AGENTS.map((userAgent) => ({
        userAgent,
        contentSignal: CONTENT_SIGNAL,
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

/**
 * Canonical production origin for kunanonj.com.
 * Used when NEXT_PUBLIC_SITE_URL is missing or a local/placeholder value during
 * production builds so robots/sitemap/canonicals never emit fronk.example.com.
 */
export const CANONICAL_SITE_URL = "https://kunanonj.com";

/** Dev / test placeholder — never emit this from production robots or sitemaps. */
export const PLACEHOLDER_SITE_URL = "https://fronk.example.com";

function isUnusablePublicUrl(url: string): boolean {
  const lower = url.toLowerCase();
  return (
    !url ||
    lower.includes("example.com") ||
    lower.includes("localhost") ||
    lower.startsWith("http://127.")
  );
}

/**
 * Resolve the public site origin for metadata, robots, JSON-LD, and sitemaps.
 * Fail closed to the real production host when env is missing in production.
 */
export function resolvePublicSiteUrl(
  envUrl: string | undefined = process.env.NEXT_PUBLIC_SITE_URL,
  nodeEnv: string | undefined = process.env.NODE_ENV,
): string {
  const raw = envUrl?.trim().replace(/\/$/, "") ?? "";
  if (!isUnusablePublicUrl(raw)) return raw;
  if (nodeEnv === "production") return CANONICAL_SITE_URL;
  return PLACEHOLDER_SITE_URL;
}

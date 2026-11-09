import type { RevalidationTag } from "@/lib/sanity/revalidation";

/*
 * Worker cache headers (wrangler.start.jsonc `cache.enabled`). The cache reads
 * CDN-Cache-Control before Cache-Control, so browsers always revalidate while
 * the edge keeps a copy until a Sanity webhook (or the hourly cron) purges
 * its Cache-Tag. s-maxage is avoided: it switches off stale-while-revalidate.
 */
export const EDGE_LIFETIME = "public, max-age=86400, stale-while-revalidate=86400";

export function edgeCacheHeaders(tags: readonly RevalidationTag[]): Record<string, string> {
  return {
    "Cache-Control": "public, max-age=0, must-revalidate",
    "CDN-Cache-Control": EDGE_LIFETIME,
    "Cache-Tag": tags.join(","),
  };
}

/** The same headers on a response another handler built (feed, llms, sitemap). */
export async function withEdgeCache(response: Response | Promise<Response>, tags: readonly RevalidationTag[]): Promise<Response> {
  const res = await response;
  if (!res.ok) return res;
  const headers = new Headers(res.headers);
  for (const [key, value] of Object.entries(edgeCacheHeaders(tags))) headers.set(key, value);
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers });
}

/**
 * Time-based edge caching for responses no webhook touches (OG images, GitHub).
 * `browser` replaces Cache-Control when the handler's own value is too long.
 */
export async function withEdgeLifetime(
  response: Response | Promise<Response>,
  lifetime: string,
  browser?: string,
): Promise<Response> {
  const res = await response;
  if (!res.ok) return res;
  const headers = new Headers(res.headers);
  headers.set("CDN-Cache-Control", lifetime);
  if (browser) headers.set("Cache-Control", browser);
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers });
}

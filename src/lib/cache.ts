import type { RevalidationTag } from "@/lib/sanity/revalidation";

/*
 * Worker cache headers (wrangler.start.jsonc `cache.enabled`). The cache reads
 * CDN-Cache-Control before Cache-Control, so browsers always revalidate while
 * the edge keeps a copy until a Sanity webhook (or the hourly cron) purges
 * its Cache-Tag. s-maxage is avoided: it switches off stale-while-revalidate.
 */
export const EDGE_LIFETIME =
  "public, max-age=86400, stale-while-revalidate=86400";

/**
 * Keeps a response out of the edge cache and the browser's. It has to be
 * said: the Worker cache keeps a 200 that carries no Cache-Control for two
 * hours (Cloudflare's default for a Worker with `cache.enabled`). On a page
 * it holds as long as no parent route sets CDN-Cache-Control, which the
 * edge reads first; none does.
 */
export const NO_STORE: Readonly<Record<string, string>> = {
  "Cache-Control": "no-store",
};

export function edgeCacheHeaders(
  tags: readonly RevalidationTag[],
): Record<string, string> {
  return {
    "Cache-Control": "public, max-age=0, must-revalidate",
    "CDN-Cache-Control": EDGE_LIFETIME,
    "Cache-Tag": tags.join(","),
  };
}

/**
 * For a route's `headers`: edge-cache a successful render only, never a 404
 * or an error page. `cacheable: false` also keeps a render out of the cache:
 * /resume passes it when Sanity could not be read and the repo's résumé
 * stands in, so the edge does not keep the stand-in for a day.
 */
export function routeCacheHeaders(
  match: { status: string },
  tags: readonly RevalidationTag[],
  cacheable = true,
): Record<string, string> {
  return match.status === "success" && cacheable
    ? edgeCacheHeaders(tags)
    : { ...NO_STORE };
}

/** The same headers on a response another handler built (feed, llms, sitemap). */
export async function withEdgeCache(
  response: Response | Promise<Response>,
  tags: readonly RevalidationTag[],
): Promise<Response> {
  const res = await response;
  if (!res.ok) return res;
  const headers = new Headers(res.headers);
  for (const [key, value] of Object.entries(edgeCacheHeaders(tags)))
    headers.set(key, value);
  return new Response(res.body, {
    status: res.status,
    statusText: res.statusText,
    headers,
  });
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
  return new Response(res.body, {
    status: res.status,
    statusText: res.statusText,
    headers,
  });
}

/**
 * Generated images (OG cards, icons): a day at the edge, whose cache key
 * includes the deploy version, and a day in browsers, since the URLs carry no
 * content hash.
 */
const IMAGE_LIFETIME = "public, max-age=86400";

export function withImageCache(
  response: Response | Promise<Response>,
): Promise<Response> {
  return withEdgeLifetime(response, IMAGE_LIFETIME, IMAGE_LIFETIME);
}

import type { RevalidationTag } from "@/lib/sanity/revalidation";

/*
 * Worker cache headers (wrangler.jsonc `cache.enabled`). The edge reads
 * CDN-Cache-Control before Cache-Control, so browsers always revalidate while
 * the edge keeps a copy for an hour. A Sanity webhook purges the copy sooner,
 * by its Cache-Tag; the hour is the bound when a webhook is missed.
 *
 * No stale-while-revalidate: on a quiet site the first visit after the hour
 * would get the previous visitor's copy, up to 25 hours old. stale-if-error=0:
 * when the Worker fails while it refreshes an expired copy, the visitor gets
 * the error, not the old copy (Cloudflare's default is the old copy, with no
 * time limit). worker-cache-followup plan, decision 2. A probe on a preview
 * showed the edge reads it in CDN-Cache-Control, and that the must-revalidate
 * in Cache-Control does not stop the old copy
 * (process/general-plans/references/worker-cache-research_11-11-26.md).
 *
 * Left at Cloudflare's defaults, with no header from this repo: a 404 is kept
 * three minutes, a 405 one minute; a 308 and a 500 are not kept. A not-found
 * is drawn by the root route, the only route with a notFoundComponent, so a
 * route's own headers do not apply: on the built site an unknown post's 404
 * carries no cache header and no tag.
 * A deploy empties the cache: the Worker's version is part of its key.
 */
export const EDGE_LIFETIME = "public, max-age=3600, stale-if-error=0";

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
 * For a route's `headers`: edge-cache a successful render only, never an
 * error page. `cacheable: false` also keeps a render out of the cache:
 * /resume passes it when Sanity could not be read and the repo's résumé
 * stands in, so the edge does not keep the stand-in for the hour.
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
 * Time-based edge caching for responses no webhook touches: OG images,
 * GitHub, and the files built from the repo alone (robots.txt, the
 * manifest, security.txt, skills.json, the Markdown twins), which change only
 * on a deploy. `browser` replaces Cache-Control when it is given.
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

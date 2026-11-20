/** next.config.ts redirects(), all permanent (308), query string kept. */
const REDIRECTS = new Map<string, string>([
  ["/stock/asme", "/about"],
  ["/ventures", "/#ventures"],
  ["/now", "/"],
  ["/writing", "/blog"],
  ["/work", "/#ventures"],
  ["/rss.xml", "/feed.xml"],
  ["/showcase", "/"],
  ["/stock/velorah", "/"],
]);

/**
 * Endpoints whose output ignores the query string: share images, icons, the
 * text and data files, and the GitHub APIs (contributions, the ship log).
 * The edge cache keys on the whole URL, so an unread query string would make
 * each request a miss that renders an image, reads Sanity or spends the
 * GitHub token.
 */
const QUERY_FREE_PATH =
  /(?:\/opengraph-image|^\/(?:apple-)?icon|\.(?:md|txt|xml|json|webmanifest))$|^\/api\/github\/(?:contributions|shipped)$/;

/** The bare path to send a GET or HEAD for a query-free endpoint to, if it has a query. */
export function queryFreeRedirect(url: URL, method: string): string | null {
  if (!url.search || (method !== "GET" && method !== "HEAD")) return null;
  return QUERY_FREE_PATH.test(url.pathname) ? url.pathname : null;
}

export function redirectFor(pathname: string): string | null {
  const exact = REDIRECTS.get(pathname);
  if (exact) return exact;
  const writing = /^\/writing\/([^/]+)$/.exec(pathname);
  if (writing) return `/blog/${writing[1]}`;
  // Drop a trailing slash with a 308. Leading slashes collapse to one, so a
  // path like //evil.com/ can never become a protocol-relative Location.
  if (pathname.length > 1 && pathname.endsWith("/"))
    return "/" + pathname.replace(/^\/+|\/+$/g, "");
  return null;
}

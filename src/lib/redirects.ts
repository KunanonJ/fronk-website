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

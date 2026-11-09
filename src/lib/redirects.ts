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
  // Next drops a trailing slash with a 308 (trailingSlash: false).
  if (pathname.length > 1 && pathname.endsWith("/")) return pathname.replace(/\/+$/, "") || "/";
  return null;
}

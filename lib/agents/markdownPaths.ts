/**
 * The pages with a Markdown version (src/routes/*.md.ts): the Home, About
 * and each project. The Worker serves it to a request that prefers
 * text/markdown (src/server/negotiate.ts), and the WebMCP read_page tool
 * fetches it (lib/agents/webmcp.ts).
 */

/** The address of a page's Markdown version, or null when it has none. */
export function markdownPathFor(pathname: string): string | null {
  if (pathname === "/") return "/index.md";
  if (pathname === "/about") return "/about.md";
  return /^\/portfolio\/[a-z0-9]+(?:-[a-z0-9]+)*$/.test(pathname)
    ? `${pathname}.md`
    : null;
}

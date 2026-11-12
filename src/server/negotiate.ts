import { EDGE_LIFETIME } from "@/src/lib/cache";

/*
 * Markdown content negotiation (agent-readiness plan, step 4). These pages
 * are static files, so wrangler.jsonc runs the Worker first for them
 * (`assets.run_worker_first`). A GET or HEAD that names text/markdown and
 * weighs it at least as high as text/html gets the page's Markdown version;
 * any other GET or HEAD, and one whose Markdown fails, gets the static file
 * through ASSETS, or Start when there is none. src/server.ts sends other
 * methods to Start, as before.
 */

/** The address of a page's Markdown version, or null when it has none. */
export function markdownPathFor(pathname: string): string | null {
  if (pathname === "/") return "/index.md";
  if (pathname === "/about") return "/about.md";
  return /^\/portfolio\/[a-z0-9]+(?:-[a-z0-9]+)*$/.test(pathname)
    ? `${pathname}.md`
    : null;
}

type MediaRange = { type: string; subtype: string; q: number };

/** Media ranges with their weights; a missing, empty or unreadable q is 1. */
function parseAccept(accept: string): MediaRange[] {
  return accept.split(",").flatMap((part) => {
    const [media = "", ...params] = part.split(";");
    const [type, subtype] = media.trim().toLowerCase().split("/");
    if (!type || !subtype) return [];
    let q = 1;
    for (const param of params) {
      const [key, value = ""] = param.split("=");
      if (key?.trim().toLowerCase() !== "q" || value.trim() === "") continue;
      const weight = Number(value.trim());
      if (Number.isFinite(weight)) q = Math.min(Math.max(weight, 0), 1);
    }
    return [{ type, subtype, q }];
  });
}

/**
 * The weight a request gives a media type: from the most specific ranges
 * that cover it, the highest when the same range is listed twice; 0 when none
 * covers it.
 */
function weightOf(
  ranges: readonly MediaRange[],
  type: string,
  subtype: string,
): number {
  for (const matches of [
    (r: MediaRange) => r.type === type && r.subtype === subtype,
    (r: MediaRange) => r.type === type && r.subtype === "*",
    (r: MediaRange) => r.type === "*" && r.subtype === "*",
  ]) {
    const found = ranges.filter(matches);
    if (found.length > 0) return Math.max(...found.map((r) => r.q));
  }
  return 0;
}

/**
 * True when the request names text/markdown itself and weighs it at least as
 * high as text/html, so `text/markdown, text/html` gets Markdown. Browsers
 * never name it, so they get HTML, and so does a bare `*\/*`.
 */
export function prefersMarkdown(accept: string | null): boolean {
  if (!accept) return false;
  const ranges = parseAccept(accept);
  if (!ranges.some((r) => r.type === "text" && r.subtype === "markdown"))
    return false;
  const markdown = weightOf(ranges, "text", "markdown");
  return markdown > 0 && markdown >= weightOf(ranges, "text", "html");
}

/** Discovery links on the home page (RFC 8288), in both of its versions. */
export const HOME_LINKS = [
  '</index.md>; rel="alternate"; type="text/markdown"',
  '</llms.txt>; rel="describedby"; type="text/plain"',
  '</sitemap.xml>; rel="sitemap"; type="application/xml"',
].join(", ");

/** Pages and Markdown built from lib/content change only on a deploy, which empties the cache. */
const DEPLOY_LIFETIME = "public, max-age=86400";

/**
 * Edge headers for one version of a page. Every version gets a day, except
 * the home page's Markdown: it is the /llms.txt brief, which reads Sanity's
 * posts while the blog is public, so it keeps that file's hour. That file is
 * tagged `posts`, and Cloudflare requires one tag set for every version of
 * an address, so the home page's HTML carries the tag too.
 */
function edgeHeadersFor(
  pathname: string,
  markdown: boolean,
): Record<string, string> {
  if (pathname !== "/") return { "CDN-Cache-Control": DEPLOY_LIFETIME };
  return {
    "CDN-Cache-Control": markdown ? EDGE_LIFETIME : DEPLOY_LIFETIME,
    "Cache-Tag": "posts",
  };
}

function withVersionHeaders(
  response: Response,
  pathname: string,
  markdownPath: string | null,
  bodyless: boolean,
  keep = true,
): Response {
  if (!(response.ok || response.status === 304)) return response;
  const headers = new Headers(response.headers);
  const vary = headers.get("Vary");
  if (!vary || !/(^|,)\s*accept\s*(,|$)/i.test(vary))
    headers.set("Vary", vary ? `${vary}, Accept` : "Accept");
  if (keep) {
    for (const [name, value] of Object.entries(
      edgeHeadersFor(pathname, markdownPath !== null),
    ))
      headers.set(name, value);
  } else {
    // HTML in place of Markdown that failed: kept nowhere, or the cache
    // would answer that Accept value with HTML long after the failure.
    headers.delete("CDN-Cache-Control");
    headers.set("Cache-Control", "no-store");
  }
  if (markdownPath) headers.set("Content-Location", markdownPath);
  if (pathname === "/") headers.set("Link", HOME_LINKS);
  return new Response(bodyless ? null : response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

/**
 * Answer a `GET` or `HEAD` for a page that has a Markdown version. `start` is
 * the app (it serves the `.md` addresses and pages with no static file);
 * `assets` is the static files. When the Markdown cannot be built, the page's
 * HTML is the answer.
 */
export async function negotiate(
  request: Request,
  markdownPath: string,
  start: (request: Request) => Response | Promise<Response>,
  assets: (request: Request) => Response | Promise<Response>,
): Promise<Response> {
  const { pathname } = new URL(request.url);
  let markdownFailed = false;
  if (prefersMarkdown(request.headers.get("Accept"))) {
    try {
      const markdown = await start(
        new Request(new URL(markdownPath, request.url), {
          method: "GET",
          headers: request.headers,
        }),
      );
      if (markdown.ok)
        return withVersionHeaders(
          markdown,
          pathname,
          markdownPath,
          request.method === "HEAD",
        );
      // A 404 is an unknown project, whose page is a 404 too.
      if (markdown.status !== 404) {
        markdownFailed = true;
        console.error(
          `[negotiate] ${markdownPath} answered ${markdown.status}; ${pathname} answers HTML`,
        );
      }
    } catch (error: unknown) {
      markdownFailed = true;
      console.error(
        `[negotiate] ${markdownPath} failed; ${pathname} answers HTML`,
        error,
      );
    }
  }
  const page = await assets(request);
  const html = page.status === 404 ? await start(request) : page;
  return withVersionHeaders(html, pathname, null, false, !markdownFailed);
}

import { edgeCacheHeaders } from "@/src/lib/cache";

/*
 * Markdown content negotiation (agent-readiness plan, step 4). A page with a
 * Markdown version answers a request that asks for text/markdown with that
 * version; every other request gets the page's HTML. These pages are static
 * files, so wrangler.jsonc runs the Worker first for them
 * (`assets.run_worker_first`) and the HTML comes back from the static files.
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

function parseAccept(accept: string): MediaRange[] {
  return accept.split(",").flatMap((part) => {
    const [media = "", ...params] = part.split(";");
    const [type, subtype] = media.trim().toLowerCase().split("/");
    if (!type || !subtype) return [];
    let q = 1;
    for (const param of params) {
      const [key, value] = param.split("=");
      if (key?.trim().toLowerCase() !== "q") continue;
      const weight = Number(value?.trim());
      if (Number.isFinite(weight)) q = Math.min(Math.max(weight, 0), 1);
    }
    return [{ type, subtype, q }];
  });
}

/** The weight of the most specific range that covers a media type; 0 when none does. */
function weightOf(
  ranges: readonly MediaRange[],
  type: string,
  subtype: string,
): number {
  const exact = ranges.find((r) => r.type === type && r.subtype === subtype);
  if (exact) return exact.q;
  const family = ranges.find((r) => r.type === type && r.subtype === "*");
  if (family) return family.q;
  return ranges.find((r) => r.type === "*" && r.subtype === "*")?.q ?? 0;
}

/**
 * True when the request names text/markdown and weighs it at least as high
 * as text/html. Browsers never name it, so they get HTML, and so does a bare
 * `*\/*`.
 */
export function prefersMarkdown(accept: string | null): boolean {
  if (!accept) return false;
  const ranges = parseAccept(accept);
  const markdown = ranges.find(
    (r) => r.type === "text" && r.subtype === "markdown",
  );
  if (!markdown || markdown.q === 0) return false;
  return markdown.q >= weightOf(ranges, "text", "html");
}

/** Discovery links on the home page (RFC 8288), in both of its versions. */
export const HOME_LINKS = [
  '</index.md>; rel="alternate"; type="text/markdown"',
  '</llms.txt>; rel="describedby"; type="text/plain"',
  '</sitemap.xml>; rel="sitemap"; type="application/xml"',
].join(", ");

/**
 * Edge lifetime for both versions of a page. They change only on a deploy,
 * which empties the cache, so a day. The home page's Markdown is /llms.txt,
 * which is tagged `posts`; Cloudflare requires one tag set for every version
 * of an address, so the home page's HTML carries that tag and lifetime too.
 */
function edgeHeadersFor(pathname: string): Record<string, string> {
  if (pathname === "/") {
    const edge = edgeCacheHeaders(["posts"]);
    return {
      "CDN-Cache-Control": edge["CDN-Cache-Control"],
      "Cache-Tag": edge["Cache-Tag"],
    };
  }
  return { "CDN-Cache-Control": "public, max-age=86400" };
}

function withVersionHeaders(
  response: Response,
  pathname: string,
  markdownPath: string | null,
  bodyless: boolean,
): Response {
  if (!(response.ok || response.status === 304)) return response;
  const headers = new Headers(response.headers);
  const vary = headers.get("Vary");
  if (!vary || !/(^|,)\s*accept\s*(,|$)/i.test(vary))
    headers.set("Vary", vary ? `${vary}, Accept` : "Accept");
  for (const [name, value] of Object.entries(edgeHeadersFor(pathname)))
    headers.set(name, value);
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
 * `assets` is the static files.
 */
export async function negotiate(
  request: Request,
  markdownPath: string,
  start: (request: Request) => Response | Promise<Response>,
  assets: (request: Request) => Response | Promise<Response>,
): Promise<Response> {
  const { pathname } = new URL(request.url);
  if (prefersMarkdown(request.headers.get("Accept"))) {
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
  }
  const page = await assets(request);
  const html = page.status === 404 ? await start(request) : page;
  return withVersionHeaders(html, pathname, null, false);
}

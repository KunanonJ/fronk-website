import handler from "@tanstack/react-start/server-entry";
import { redirectFor } from "./lib/redirects";
import { handleCspReport } from "./server/cspReport";
import {
  CSP_REPORT_PATH,
  withSecurityHeaders,
  withServerFnNoStore,
} from "./server/http";
import { markdownPathFor, negotiate } from "./server/negotiate";
import { handleSanityWebhook, type CachePurger } from "./server/revalidate";

/**
 * Worker entry (wrangler.jsonc "main"). Start picks this file up as its
 * server entry. It owns what needs the Worker's env and ctx, which Start does
 * not pass to routes: redirects, the Sanity webhook purge, and the choice
 * between a page's HTML and its Markdown for the pages that run the Worker
 * first. It also takes the Content Security Policy's violation reports,
 * which need no page framework. Everything else goes to Start. Every response it returns carries
 * the security headers (public/_headers covers static files), and a server
 * function's answer that sets no Cache-Control is marked no-store.
 *
 * There is no scheduled handler: a cached copy ends within the hour by its
 * lifetime (src/lib/cache.ts), so a missed webhook needs no hourly purge.
 */

type Env = {
  SANITY_REVALIDATE_SECRET?: string;
  /** The static files (wrangler.jsonc `assets.binding`). */
  ASSETS: { fetch(request: Request): Promise<Response> };
};
/** ctx.cache exists when the wrangler config sets `cache.enabled`. */
type Ctx = { cache?: CachePurger };

const worker = {
  async fetch(request: Request, env: Env, ctx: Ctx): Promise<Response> {
    return withSecurityHeaders(
      withServerFnNoStore(request, await route(request, env, ctx)),
      new URL(request.url).pathname,
    );
  },
};

/** Redirects, the Worker-only endpoints and negotiation; everything else is Start. */
async function route(request: Request, env: Env, ctx: Ctx): Promise<Response> {
  const url = new URL(request.url);
  const to = redirectFor(url.pathname);
  if (to) {
    const location = to.includes("#") ? to : `${to}${url.search}`;
    return new Response(null, { status: 308, headers: { Location: location } });
  }
  if (url.pathname === "/api/revalidate" && request.method === "POST") {
    return handleSanityWebhook(
      request,
      env.SANITY_REVALIDATE_SECRET,
      ctx.cache,
    );
  }
  if (url.pathname === CSP_REPORT_PATH) return handleCspReport(request);
  const markdownPath = markdownPathFor(url.pathname);
  if (markdownPath && (request.method === "GET" || request.method === "HEAD")) {
    return negotiate(
      request,
      markdownPath,
      (req) => handler.fetch(req),
      (req) => env.ASSETS.fetch(req),
    );
  }
  return handler.fetch(request);
}

export default worker;

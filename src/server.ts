import handler from "@tanstack/react-start/server-entry";
import { redirectFor } from "./lib/redirects";
import { withSecurityHeaders } from "./server/http";
import {
  ALL_CONTENT_TAGS,
  handleSanityWebhook,
  purgeTags,
  type CachePurger,
} from "./server/revalidate";

/**
 * Worker entry (wrangler.jsonc "main"). Start picks this file up as its
 * server entry. It owns what needs the Worker's env and ctx, which Start does
 * not pass to routes: redirects, the Sanity webhook purge and the hourly
 * cache purge. Everything else goes to Start. Every response it returns
 * carries the security headers (public/_headers covers static files).
 */

type Env = { SANITY_REVALIDATE_SECRET?: string };
/** ctx.cache exists when the wrangler config sets `cache.enabled`. */
type Ctx = { waitUntil(promise: Promise<unknown>): void; cache?: CachePurger };

const worker = {
  async fetch(request: Request, env: Env, ctx: Ctx): Promise<Response> {
    return withSecurityHeaders(await route(request, env, ctx));
  },

  /** Hourly (triggers.crons): purge every content tag in case a webhook was missed. */
  async scheduled(_controller: unknown, _env: Env, ctx: Ctx): Promise<void> {
    ctx.waitUntil(
      purgeTags(ctx.cache, ALL_CONTENT_TAGS).then((result) => {
        if (!result.success)
          console.error("[cron] cache purge failed", result.errors);
      }),
    );
  },
};

/** Redirects and the Worker-only endpoint; everything else is Start. */
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
  return handler.fetch(request);
}

export default worker;

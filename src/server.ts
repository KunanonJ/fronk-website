import handler from "@tanstack/react-start/server-entry";
import { redirectFor } from "./lib/redirects";

/**
 * Worker entry for the Start build (wrangler.start.jsonc "main"). Start picks
 * this file up as its server entry. Phase 4 adds the Sanity webhook purge and
 * a scheduled() handler here, because both need the Worker's env and ctx.
 */

const worker = {
  fetch(request: Request): Promise<Response> | Response {
    const url = new URL(request.url);
    const to = redirectFor(url.pathname);
    if (to) {
      const location = to.includes("#") ? to : `${to}${url.search}`;
      return new Response(null, { status: 308, headers: { Location: location } });
    }
    return handler.fetch(request);
  },
};

export default worker;

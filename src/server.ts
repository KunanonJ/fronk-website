import handler from "@tanstack/react-start/server-entry";

/**
 * Worker entry for the Start build (wrangler.start.jsonc "main"). Start picks
 * this file up as its server entry. It delegates to Start's handler today;
 * Phase 4 adds the Sanity webhook purge and a scheduled() handler here, because
 * both need the Worker's env and ctx, which Start does not pass to routes.
 */
const worker = {
  fetch(request: Request): Promise<Response> | Response {
    return handler.fetch(request);
  },
};

export default worker;

import { describe, expect, it } from "vitest";
import { Route } from "@/src/routes/studio";

/*
 * /studio (worker-cache-followup plan, step 7): the page changes only on a
 * deploy, which empties the cache, so the edge keeps it a day. Only a
 * successful render is kept. The page sets no policy of its own: the Worker
 * adds the site's Content-Security-Policy, as on every page.
 */

const options = Route.options as unknown as {
  headers: (ctx: { match: { status: string } }) => Record<string, string>;
};

describe("/studio: what the edge may keep", () => {
  it("keeps a successful render a day at the edge, while browsers revalidate", () => {
    expect(options.headers({ match: { status: "success" } })).toEqual({
      "Cache-Control": "public, max-age=0, must-revalidate",
      "CDN-Cache-Control": "public, max-age=86400",
    });
  });

  it("keeps nothing for an error page", () => {
    expect(options.headers({ match: { status: "error" } })).toEqual({
      "Cache-Control": "no-store",
    });
  });
});

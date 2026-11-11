import { describe, expect, it } from "vitest";
import {
  EDGE_LIFETIME,
  edgeCacheHeaders,
  routeCacheHeaders,
  withEdgeCache,
  withEdgeLifetime,
} from "./cache";

describe("Worker cache headers", () => {
  it("lets the edge keep Sanity pages an hour while browsers revalidate", () => {
    expect(edgeCacheHeaders(["posts", "writing"])).toEqual({
      "Cache-Control": "public, max-age=0, must-revalidate",
      "CDN-Cache-Control": "public, max-age=3600, stale-if-error=0",
      "Cache-Tag": "posts,writing",
    });
    expect(edgeCacheHeaders(["resume"])["CDN-Cache-Control"]).toBe(
      EDGE_LIFETIME,
    );
  });

  it("never serves an old copy in place of a fresh render or an error", () => {
    // With stale-while-revalidate, a quiet site's first visit after the hour
    // gets the previous visitor's copy. Without stale-if-error=0, Cloudflare
    // serves the last good copy, with no time limit, when the Worker fails.
    expect(EDGE_LIFETIME).not.toMatch(/stale-while-revalidate|s-maxage/);
    expect(EDGE_LIFETIME).toMatch(/\bstale-if-error=0\b/);
  });

  it("keeps only a successful, cacheable render of a route", () => {
    const cached = edgeCacheHeaders(["resume"]);
    const never = { "Cache-Control": "no-store" };
    expect(routeCacheHeaders({ status: "success" }, ["resume"])).toEqual(
      cached,
    );
    expect(routeCacheHeaders({ status: "error" }, ["resume"])).toEqual(never);
    expect(routeCacheHeaders({ status: "notFound" }, ["resume"])).toEqual(
      never,
    );
    // The résumé drawn from the repo because Sanity could not be read.
    expect(routeCacheHeaders({ status: "success" }, ["resume"], false)).toEqual(
      never,
    );
  });

  it("tags responses another handler built, keeping body and type", async () => {
    const res = await withEdgeCache(
      new Response("<rss/>", {
        headers: { "Content-Type": "application/xml" },
      }),
      ["posts"],
    );
    expect(res.headers.get("Cache-Tag")).toBe("posts");
    expect(res.headers.get("Content-Type")).toBe("application/xml");
    expect(await res.text()).toBe("<rss/>");
  });

  it("never caches errors", async () => {
    const res = await withEdgeCache(new Response("nope", { status: 500 }), [
      "posts",
    ]);
    expect(res.headers.get("Cache-Tag")).toBeNull();
  });

  it("sets a time-based edge lifetime and optionally the browser one", async () => {
    const res = await withEdgeLifetime(
      new Response("png", {
        headers: { "Cache-Control": "max-age=31536000, immutable" },
      }),
      "public, max-age=86400",
      "public, max-age=86400",
    );
    expect(res.headers.get("CDN-Cache-Control")).toBe("public, max-age=86400");
    expect(res.headers.get("Cache-Control")).toBe("public, max-age=86400");
  });
});

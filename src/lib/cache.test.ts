import { describe, expect, it } from "vitest";
import {
  EDGE_LIFETIME,
  edgeCacheHeaders,
  withEdgeCache,
  withEdgeLifetime,
} from "./cache";

describe("Worker cache headers", () => {
  it("lets the edge keep Sanity pages while browsers revalidate", () => {
    expect(edgeCacheHeaders(["posts", "writing"])).toEqual({
      "Cache-Control": "public, max-age=0, must-revalidate",
      "CDN-Cache-Control": EDGE_LIFETIME,
      "Cache-Tag": "posts,writing",
    });
    expect(EDGE_LIFETIME).not.toContain("s-maxage");
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

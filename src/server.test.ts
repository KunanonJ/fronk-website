import { describe, expect, it, vi } from "vitest";

/*
 * The Worker entry (src/server.ts). Start is replaced by a handler that
 * answers every request with a header-less 200, the shape a server
 * function's answer has. The entry must mark that answer no-store, add the
 * security headers to every response, and run no scheduled purge.
 */

vi.mock("@tanstack/react-start/server-entry", () => ({
  default: {
    fetch: vi.fn(
      async () =>
        new Response('{"t":2}', {
          headers: { "Content-Type": "application/json" },
        }),
    ),
  },
}));

const { default: worker } = await import("./server");

const env = {};
const ctx = {};

describe("the Worker entry", () => {
  it("marks a server function's answer no-store and adds the security headers", async () => {
    const res = await worker.fetch(
      new Request("https://kunanonj.com/_serverFn/17bb0f50?payload=x"),
      env,
      ctx,
    );
    expect(res.status).toBe(200);
    expect(res.headers.get("cache-control")).toBe("no-store");
    expect(res.headers.get("x-content-type-options")).toBe("nosniff");
  });

  it("leaves the cache headers of every other response to its route", async () => {
    const res = await worker.fetch(
      new Request("https://kunanonj.com/learn"),
      env,
      ctx,
    );
    expect(res.headers.get("cache-control")).toBeNull();
    expect(res.headers.get("x-content-type-options")).toBe("nosniff");
  });

  it("has no scheduled handler: a cached copy ends with its lifetime", () => {
    expect(Object.keys(worker)).toEqual(["fetch"]);
  });
});

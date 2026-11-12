import { describe, expect, it, vi } from "vitest";

/*
 * The Worker entry (src/server.ts). Start is replaced by a handler that
 * answers a `.md` address with Markdown and anything else with a header-less
 * 200, the shape a server function's answer has. The static files are a fake
 * binding. The entry must mark a server function's answer no-store, choose
 * between a page's HTML and its Markdown, add the security headers to every
 * response, and run no scheduled purge.
 */

vi.mock("@tanstack/react-start/server-entry", () => ({
  default: {
    fetch: vi.fn(async (request: Request) =>
      new URL(request.url).pathname.endsWith(".md")
        ? new Response("# Markdown", {
            headers: { "Content-Type": "text/markdown; charset=utf-8" },
          })
        : new Response('{"t":2}', {
            headers: { "Content-Type": "application/json" },
          }),
    ),
  },
}));

const { default: worker } = await import("./server");

const assets = vi.fn(
  async () =>
    new Response("<h1>Static</h1>", {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    }),
);
const env = { ASSETS: { fetch: assets } };
const ctx = {};
const at = (path: string, headers: Record<string, string> = {}) =>
  new Request(`https://kunanonj.com${path}`, { headers });

describe("the Worker entry", () => {
  it("marks a server function's answer no-store and adds the security headers", async () => {
    const res = await worker.fetch(
      at("/_serverFn/17bb0f50?payload=x"),
      env,
      ctx,
    );
    expect(res.status).toBe(200);
    expect(res.headers.get("cache-control")).toBe("no-store");
    expect(res.headers.get("x-content-type-options")).toBe("nosniff");
  });

  it("leaves the cache headers of every other response to its route", async () => {
    const res = await worker.fetch(at("/learn"), env, ctx);
    expect(res.headers.get("cache-control")).toBeNull();
    expect(res.headers.get("vary")).toBeNull();
    expect(res.headers.get("x-content-type-options")).toBe("nosniff");
  });

  it("answers a page's Markdown to a request that asks for it", async () => {
    for (const [path, twin] of [
      ["/", "/index.md"],
      ["/about", "/about.md"],
      ["/portfolio/kunanonj-com", "/portfolio/kunanonj-com.md"],
    ]) {
      const res = await worker.fetch(
        at(path, { Accept: "text/markdown" }),
        env,
        ctx,
      );
      expect(await res.text(), path).toBe("# Markdown");
      expect(res.headers.get("content-location"), path).toBe(twin);
      expect(res.headers.get("vary"), path).toBe("Accept");
      expect(res.headers.get("x-content-type-options"), path).toBe("nosniff");
    }
  });

  it("answers a browser with the static page", async () => {
    for (const path of ["/", "/about", "/portfolio/kunanonj-com"]) {
      const res = await worker.fetch(
        at(path, { Accept: "text/html,*/*;q=0.8" }),
        env,
        ctx,
      );
      expect(await res.text(), path).toBe("<h1>Static</h1>");
      expect(res.headers.get("vary"), path).toBe("Accept");
      expect(res.headers.get("x-content-type-options"), path).toBe("nosniff");
    }
  });

  it("sends the home page's Link header with both versions", async () => {
    for (const accept of ["text/markdown", "text/html"]) {
      const res = await worker.fetch(at("/", { Accept: accept }), env, ctx);
      expect(res.headers.get("link"), accept).toContain(
        '</index.md>; rel="alternate"; type="text/markdown"',
      );
    }
    const about = await worker.fetch(at("/about"), env, ctx);
    expect(about.headers.get("link")).toBeNull();
  });

  it("hands a page with no static file to the app", async () => {
    assets.mockResolvedValueOnce(new Response(null, { status: 404 }));
    const calls = assets.mock.calls.length;
    const res = await worker.fetch(
      at("/portfolio/not-a-project", { Accept: "text/html" }),
      env,
      ctx,
    );
    expect(assets.mock.calls.length).toBe(calls + 1);
    expect(await res.text()).toBe('{"t":2}');
  });

  it("leaves an address with no Markdown version to the app", async () => {
    const calls = assets.mock.calls.length;
    const res = await worker.fetch(
      at("/resume", { Accept: "text/markdown" }),
      env,
      ctx,
    );
    expect(await res.text()).toBe('{"t":2}');
    expect(res.headers.get("vary")).toBeNull();
    expect(assets.mock.calls.length).toBe(calls);
  });

  it("negotiates only GET and HEAD", async () => {
    const res = await worker.fetch(
      new Request("https://kunanonj.com/about", {
        method: "POST",
        headers: { Accept: "text/markdown" },
      }),
      env,
      ctx,
    );
    expect(await res.text()).toBe('{"t":2}');
    expect(res.headers.get("vary")).toBeNull();
  });

  it("has no scheduled handler: a cached copy ends with its lifetime", () => {
    expect(Object.keys(worker)).toEqual(["fetch"]);
  });
});

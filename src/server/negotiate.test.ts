import { describe, expect, it, vi } from "vitest";
import {
  HOME_LINKS,
  markdownPathFor,
  negotiate,
  prefersMarkdown,
} from "./negotiate";

const BROWSER =
  "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8";

describe("prefersMarkdown", () => {
  it.each([
    ["text/markdown", true],
    ["text/markdown, text/html;q=0.9", true],
    ["text/markdown, text/html", true],
    ["TEXT/Markdown; charset=utf-8", true],
    ["text/markdown;q=0.5, */*;q=0.1", true],
    ["text/markdown, */*", true],
    ["text/markdown;q=", true],
    ["text/markdown;q=0, text/markdown;q=1", true],
    ["text/html, text/markdown;q=0.9", false],
    ["text/markdown;q=0.5, */*", false],
    ["text/markdown;q=0", false],
    [BROWSER, false],
    ["*/*", false],
    ["text/*", false],
    ["text/plain", false],
    ["", false],
  ])("%j → %s", (accept, expected) => {
    expect(prefersMarkdown(accept)).toBe(expected);
  });

  it("treats a missing Accept as a browser", () => {
    expect(prefersMarkdown(null)).toBe(false);
  });
});

describe("markdownPathFor", () => {
  it.each([
    ["/", "/index.md"],
    ["/about", "/about.md"],
    ["/portfolio/kunanonj-com", "/portfolio/kunanonj-com.md"],
    ["/portfolio", null],
    ["/portfolio/kunanonj-com/cover.webp", null],
    ["/portfolio/kunanonj-com.md", null],
    ["/resume", null],
    ["/about.md", null],
  ])("%s → %s", (pathname, expected) => {
    expect(markdownPathFor(pathname)).toBe(expected);
  });
});

const md = (body: string) =>
  new Response(body, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
const html = (body: string) =>
  new Response(body, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
const get = (path: string, accept: string | null, method = "GET") =>
  new Request(`https://kunanonj.com${path}`, {
    method,
    headers: accept ? { Accept: accept } : {},
  });

describe("negotiate", () => {
  it("answers a request for Markdown with the page's Markdown version", async () => {
    const start = vi.fn(async (req: Request) =>
      new URL(req.url).pathname === "/about.md" ? md("# About") : html("x"),
    );
    const assets = vi.fn(async () => html("<h1>About</h1>"));
    const res = await negotiate(
      get("/about", "text/markdown"),
      "/about.md",
      start,
      assets,
    );
    expect(await res.text()).toBe("# About");
    expect(res.headers.get("content-type")).toContain("text/markdown");
    expect(res.headers.get("vary")).toBe("Accept");
    expect(res.headers.get("content-location")).toBe("/about.md");
    expect(res.headers.get("cdn-cache-control")).toBe("public, max-age=86400");
    expect(res.headers.get("cache-control")).toBe("public, max-age=3600");
    expect(assets).not.toHaveBeenCalled();
  });

  it("answers a browser with the static page, marked as varying by Accept", async () => {
    const start = vi.fn(async () => md("# About"));
    const assets = vi.fn(async () => html("<h1>About</h1>"));
    const res = await negotiate(
      get("/about", BROWSER),
      "/about.md",
      start,
      assets,
    );
    expect(await res.text()).toBe("<h1>About</h1>");
    expect(res.headers.get("vary")).toBe("Accept");
    expect(res.headers.get("content-location")).toBeNull();
    expect(res.headers.get("cdn-cache-control")).toBe("public, max-age=86400");
    expect(res.headers.get("cache-control")).toBe(
      "public, max-age=0, must-revalidate",
    );
    expect(start).not.toHaveBeenCalled();
  });

  it("gives both versions of the home page its links and one tag", async () => {
    const start = vi.fn(async () => md("# Kunanon Jarat"));
    const assets = vi.fn(async () => html("<h1>Home</h1>"));
    // The Markdown is the /llms.txt brief, so it keeps that file's hour; the
    // static HTML changes only on a deploy, so it keeps a day like /about.
    for (const [accept, lifetime] of [
      ["text/markdown", "public, max-age=3600, stale-if-error=0"],
      [BROWSER, "public, max-age=86400"],
    ]) {
      const res = await negotiate(get("/", accept), "/index.md", start, assets);
      expect(res.headers.get("link"), accept).toBe(HOME_LINKS);
      expect(res.headers.get("cache-tag"), accept).toBe("posts");
      expect(res.headers.get("cdn-cache-control"), accept).toBe(lifetime);
      expect(res.headers.get("vary"), accept).toBe("Accept");
    }
  });

  it("answers the HTML when the Markdown cannot be built", async () => {
    const logged = vi.spyOn(console, "error").mockImplementation(() => {});
    const start = vi.fn(async () => {
      throw new Error("render failed");
    });
    const assets = vi.fn(async () => html("<h1>About</h1>"));
    const res = await negotiate(
      get("/about", "text/markdown"),
      "/about.md",
      start,
      assets,
    );
    expect(await res.text()).toBe("<h1>About</h1>");
    expect(res.headers.get("content-location")).toBeNull();
    expect(logged).toHaveBeenCalled();
    logged.mockRestore();
  });

  it("falls back to the app when there is no static file, and leaves a 404 alone", async () => {
    const notFound = new Response("missing", { status: 404 });
    const start = vi.fn(async () => notFound);
    const assets = vi.fn(async () => new Response(null, { status: 404 }));
    const res = await negotiate(
      get("/portfolio/not-a-project", "text/markdown"),
      "/portfolio/not-a-project.md",
      start,
      assets,
    );
    expect(res).toBe(notFound);
    expect(start).toHaveBeenCalledTimes(2);
  });

  it("answers a HEAD for Markdown with the headers only", async () => {
    const start = vi.fn(async () => md("# About"));
    const assets = vi.fn(async () => html("x"));
    const res = await negotiate(
      get("/about", "text/markdown", "HEAD"),
      "/about.md",
      start,
      assets,
    );
    expect(res.headers.get("content-location")).toBe("/about.md");
    expect(await res.text()).toBe("");
  });

  it("adds Accept to a Vary the response already has, once", async () => {
    const start = vi.fn(async () => md("# About"));
    const varied = new Response("<h1>About</h1>", {
      headers: { Vary: "Accept-Encoding" },
    });
    const res = await negotiate(
      get("/about", BROWSER),
      "/about.md",
      start,
      vi.fn(async () => varied),
    );
    expect(res.headers.get("vary")).toBe("Accept-Encoding, Accept");
    const twice = await negotiate(
      get("/about", BROWSER),
      "/about.md",
      start,
      vi.fn(async () => new Response("x", { headers: { Vary: "accept" } })),
    );
    expect(twice.headers.get("vary")).toBe("accept");
  });
});

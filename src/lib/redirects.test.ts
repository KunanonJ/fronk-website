import { describe, expect, it } from "vitest";
import { queryFreeRedirect, redirectFor } from "./redirects";

describe("redirectFor (next.config.ts redirects + trailing slash)", () => {
  it.each([
    ["/stock/asme", "/about"],
    ["/ventures", "/#ventures"],
    ["/now", "/"],
    ["/writing", "/blog"],
    ["/writing/some-post", "/blog/some-post"],
    ["/work", "/#ventures"],
    ["/rss.xml", "/feed.xml"],
    ["/showcase", "/"],
    ["/stock/velorah", "/"],
    ["/about/", "/about"],
    ["/portfolio/tbh-intranet/", "/portfolio/tbh-intranet"],
  ])("%s -> %s", (from, to) => {
    expect(redirectFor(from)).toBe(to);
  });

  it.each([
    ["//example.org/", "/example.org"],
    ["///example.org/path/", "/example.org/path"],
    ["//", "/"],
  ])("never redirects off-site: %s -> %s", (from, to) => {
    expect(redirectFor(from)).toBe(to);
  });

  it.each(["/", "/about", "/writing/a/b", "/ventures/gogocash"])(
    "%s is not redirected",
    (path) => {
      expect(redirectFor(path)).toBeNull();
    },
  );
});

describe("queryFreeRedirect (endpoints whose output ignores the query)", () => {
  const at = (path: string) => new URL(path, "https://kunanonj.com");

  it.each([
    ["/opengraph-image?x=1", "/opengraph-image"],
    [
      "/portfolio/tbh-intranet/opengraph-image?v=2",
      "/portfolio/tbh-intranet/opengraph-image",
    ],
    ["/icon?x", "/icon"],
    ["/apple-icon?x", "/apple-icon"],
    ["/llms.txt?audit=1", "/llms.txt"],
    ["/about.md?x=1", "/about.md"],
    ["/sitemap.xml?x=1", "/sitemap.xml"],
    ["/skills.json?x=1", "/skills.json"],
    ["/manifest.webmanifest?x=1", "/manifest.webmanifest"],
    [
      "/.well-known/agent-skills/index.json?x=1",
      "/.well-known/agent-skills/index.json",
    ],
    ["/api/github/contributions?x=1", "/api/github/contributions"],
    ["/api/github/shipped?x=1", "/api/github/shipped"],
  ])("%s -> %s", (from, to) => {
    expect(queryFreeRedirect(at(from), "GET")).toBe(to);
    expect(queryFreeRedirect(at(from), "HEAD")).toBe(to);
  });

  it.each([
    "/opengraph-image",
    "/llms.txt",
    "/blog?tag=ai",
    "/portfolio?kind=fintech",
    "/resume?x=1",
    "/_serverFn/abc?payload=1",
    "/api/csp-report?x=1",
    "/iconography?x=1",
  ])("%s is left alone", (path) => {
    expect(queryFreeRedirect(at(path), "GET")).toBeNull();
  });

  it("leaves other methods alone", () => {
    expect(queryFreeRedirect(at("/llms.txt?x=1"), "POST")).toBeNull();
  });
});

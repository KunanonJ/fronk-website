import { describe, expect, it } from "vitest";
import { redirectFor } from "./redirects";

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

  it.each(["/", "/about", "/writing/a/b", "/ventures/gogocash"])("%s is not redirected", (path) => {
    expect(redirectFor(path)).toBeNull();
  });
});

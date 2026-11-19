import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/*
 * Guards for the Phase 7 lane D1 partial (the topic hubs and the reading
 * pages; profile redesign). A `max-width` query that ends where the next
 * `min-width` begins leaves a sliver (63.9375rem against 64rem, a fraction
 * of a pixel at some zooms) where neither applies; range syntax
 * (`37.5rem <= width < 64rem`) has no gap. A `cursor` here would beat the
 * site's hand cursor on buttons and links (globals.css, spec 6.9).
 */
const css = readFileSync(
  join(process.cwd(), "src/styles/profile/pages-hubs.css"),
  "utf8",
);

const mediaQueries = (sheet: string) =>
  [...sheet.matchAll(/@media([^{]+)\{/g)].map((m) => m[1]!.trim());
const maxWidthQueries = (sheet: string) =>
  mediaQueries(sheet).filter((query) => /max-width/.test(query));
const cursors = (sheet: string) =>
  [...sheet.matchAll(/(?<![-\w])cursor\s*:\s*([^;]+);/g)].map((m) => m[1]);

describe("pages-hubs.css", () => {
  it("names its lane in its first line", () => {
    expect(css.split("\n")[0]).toContain("Profile redesign, Phase 7 lane D1");
  });

  it("finds a max-width query and a cursor in a fixture, so a pass means something", () => {
    const fixture =
      "@media (min-width: 37.5rem) and (max-width: 63.9375rem) { a { cursor: pointer; } }";
    expect(maxWidthQueries(fixture)).toHaveLength(1);
    expect(cursors(fixture)).toEqual(["pointer"]);
  });

  it("bounds its ranges with range syntax, never max-width", () => {
    expect(mediaQueries(css).length).toBeGreaterThan(3);
    expect(maxWidthQueries(css)).toEqual([]);
  });

  it("sets no cursor, so buttons keep the site's hand", () => {
    expect(cursors(css)).toEqual([]);
  });
});

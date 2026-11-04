import { describe, expect, it } from "vitest";
import { FALLBACK_BLOG_POSTS, resolveBlogCards } from "@/lib/content/blog";
import { buildRssFeed, FEED_PATH } from "@/lib/content/rss";

const BASE = "https://kunanonj.com";

function build(cards = resolveBlogCards([])) {
  return buildRssFeed({
    cards,
    base: BASE,
    title: "KunanonJ — Blog",
    description: "Notes & ideas",
    buildDate: new Date("2026-11-04T00:00:00Z"),
  });
}

describe("buildRssFeed", () => {
  it("includes the fallback posts when Sanity returns nothing", () => {
    const xml = build();
    const items = xml.match(/<item>/g) ?? [];
    expect(items.length).toBe(FALLBACK_BLOG_POSTS.length);
    expect(items.length).toBeGreaterThan(0);
  });

  it("points rel=self at /feed.xml, not the /rss.xml redirect", () => {
    const xml = build();
    expect(xml).toContain(
      `<atom:link href="${BASE}${FEED_PATH}" rel="self" type="application/rss+xml" />`,
    );
    expect(xml).not.toContain("/rss.xml");
  });

  it("escapes XML and links each item to its blog URL", () => {
    const [first] = resolveBlogCards([]);
    const xml = build([{ ...first!, title: "R&D <notes>" }]);
    expect(xml).toContain("<title>R&amp;D &lt;notes&gt;</title>");
    expect(xml).toContain(`<link>${BASE}/blog/${first!.slug}</link>`);
    expect(xml).toContain("<description>Notes &amp; ideas</description>");
  });

  it("omits pubDate for unparseable dates instead of printing Invalid Date", () => {
    const [first] = resolveBlogCards([]);
    const xml = build([{ ...first!, publishedAt: "not-a-date" }]);
    expect(xml).not.toContain("Invalid Date");
    expect(xml).not.toContain("<pubDate>");
  });
});

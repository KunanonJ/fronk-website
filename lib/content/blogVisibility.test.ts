import { describe, expect, it, vi } from "vitest";
import {
  BLOG_PUBLIC,
  isBlogHref,
  withoutHiddenBlogLinks,
} from "@/lib/content/blogVisibility";
import { footerResources, nav, primaryNav } from "@/lib/content/landing";
import { getAllTopicPillars } from "@/lib/content/topics/pillars";

// Keep the routes off the network: no Sanity in unit tests.
vi.mock("@/lib/sanity/fetch", () => ({
  fetchAllPosts: vi.fn(async () => []),
}));

describe("isBlogHref", () => {
  it("matches /blog and its children only", () => {
    expect(isBlogHref("/blog")).toBe(true);
    expect(isBlogHref("/blog/cashback-loops")).toBe(true);
    expect(isBlogHref("/blog?tag=AI")).toBe(true);
    expect(isBlogHref("/blogroll")).toBe(false);
    expect(isBlogHref("/topics/ai-transformation-thailand")).toBe(false);
  });
});

describe.runIf(!BLOG_PUBLIC)("while the blog is hidden", () => {
  it("keeps Blog out of the nav and the RSS feed out of the footer", () => {
    const hrefs = primaryNav.flatMap((item) =>
      item.type === "menu" ? item.children.map((c) => c.href) : [item.href],
    );
    expect(hrefs.some(isBlogHref)).toBe(false);
    expect(nav.some((item) => isBlogHref(item.href))).toBe(false);
    expect(footerResources.some((item) => item.href === "/feed.xml")).toBe(false);
  });

  it("drops blog links from topic-hub related links", () => {
    for (const lang of ["en", "th"] as const) {
      for (const pillar of getAllTopicPillars(lang)) {
        const visible = withoutHiddenBlogLinks(pillar.relatedLinks);
        expect(visible.some((l) => isBlogHref(l.href))).toBe(false);
        expect(visible.length).toBeGreaterThan(0);
      }
    }
  });

  it("leaves blog URLs out of sitemap.xml", async () => {
    const { default: sitemap } = await import("@/app/sitemap");
    const urls = (await sitemap()).map((e) => new URL(e.url).pathname);
    expect(urls.some(isBlogHref)).toBe(false);
    expect(urls).toContain("/about");
  });

  it("leaves the blog, its posts and the RSS feed out of llms.txt", async () => {
    const { GET } = await import("@/app/llms.txt/route");
    const text = await (await GET()).text();
    expect(text).not.toMatch(/\/blog(\/|\b)/);
    expect(text).not.toContain("/feed.xml");
    expect(text).toContain("/portfolio");
  });

  it("serves a valid RSS feed with no items", async () => {
    const { GET } = await import("@/app/feed.xml/route");
    const xml = await (await GET()).text();
    expect(xml).toContain("<channel>");
    expect(xml).not.toContain("<item>");
  });
});

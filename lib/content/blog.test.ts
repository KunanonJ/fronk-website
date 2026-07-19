import { describe, expect, it } from "vitest";
import {
  collectBlogTags,
  FALLBACK_BLOG_POSTS,
  filterBlogPosts,
  formatBlogDate,
  resolveBlogCards,
} from "@/lib/content/blog";

describe("formatBlogDate > given ISO date", () => {
  it("formats as DD/MM/YYYY", () => {
    expect(formatBlogDate("2026-06-12")).toBe("12/06/2026");
    expect(formatBlogDate("2026-04-28T10:00:00.000Z")).toBe("28/04/2026");
  });
});

describe("resolveBlogCards > given empty Sanity posts", () => {
  it("returns fallback stock", () => {
    expect(resolveBlogCards([])).toEqual(FALLBACK_BLOG_POSTS);
  });
});

describe("collectBlogTags > given posts", () => {
  it("returns sorted unique tags", () => {
    const tags = collectBlogTags(FALLBACK_BLOG_POSTS);
    expect(tags).toContain("AI");
    expect(tags).toContain("GoGoCash");
    expect(tags).toEqual([...tags].sort((a, b) => a.localeCompare(b)));
  });
});

describe("filterBlogPosts > given search and tag", () => {
  it("filters by tag", () => {
    const result = filterBlogPosts(FALLBACK_BLOG_POSTS, { tag: "Manut" });
    expect(result).toHaveLength(1);
    expect(result[0]?.slug).toBe("ai-workspace-for-smes");
  });

  it("filters by search query across title and excerpt", () => {
    const result = filterBlogPosts(FALLBACK_BLOG_POSTS, { query: "cashback" });
    expect(result.some((p) => p.slug === "cashback-loops")).toBe(true);
  });

  it("combines search and tag", () => {
    const result = filterBlogPosts(FALLBACK_BLOG_POSTS, {
      query: "bangkok",
      tag: "Founding",
    });
    expect(result).toHaveLength(1);
    expect(result[0]?.slug).toBe("shipping-from-bangkok");
  });
});

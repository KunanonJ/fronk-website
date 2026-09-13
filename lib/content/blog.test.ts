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
  it("returns fallback stock sorted by publishedAt desc", () => {
    expect(resolveBlogCards([])).toEqual(
      [...FALLBACK_BLOG_POSTS].sort((a, b) =>
        b.publishedAt.localeCompare(a.publishedAt),
      ),
    );
  });
});

describe("resolveBlogCards > given Sanity posts", () => {
  it("merges fallbacks and lets Sanity win on the same slug", () => {
    const cards = resolveBlogCards([
      {
        _id: "cms-hello",
        slug: "hello-world",
        title: "Hello World",
        excerpt: "From Sanity",
        publishedAt: "2026-05-14T13:42:00.000Z",
        tags: [],
        coverImage: null,
      },
      {
        _id: "cms-ai",
        slug: "ai-transformation-thailand-smes",
        title: "AI transformation (CMS)",
        excerpt: "Edited in Studio",
        publishedAt: "2026-07-11",
        tags: ["AI"],
        coverImage: null,
      },
    ]);

    const slugs = cards.map((c) => c.slug);
    expect(slugs).toContain("hello-world");
    expect(slugs).toContain("ai-vs-traditional-erp-sea");
    expect(slugs).toContain("intelligence-ai-inside-erp");

    const ai = cards.find((c) => c.slug === "ai-transformation-thailand-smes");
    expect(ai?.title).toBe("AI transformation (CMS)");
    expect(ai?.id).toBe("cms-ai");
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
    expect(result.length).toBeGreaterThanOrEqual(2);
    expect(result.every((p) => p.tags.includes("Manut"))).toBe(true);
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
    expect(result.length).toBeGreaterThanOrEqual(1);
    expect(result.every((p) => p.tags.includes("Founding"))).toBe(true);
  });
});

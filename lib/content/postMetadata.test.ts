import { describe, expect, it } from "vitest";
import { resolvePostMetadata } from "./postMetadata";

describe("resolvePostMetadata", () => {
  it("uses SEO fields when present", () => {
    expect(
      resolvePostMetadata({
        title: "Post title",
        excerpt: "Short excerpt.",
        seo: {
          title: "Custom SEO title",
          description: "Custom SEO description.",
        },
      }),
    ).toEqual({
      title: "Custom SEO title",
      description: "Custom SEO description.",
    });
  });

  it("falls back to title and excerpt when SEO is missing", () => {
    expect(
      resolvePostMetadata({
        title: "Post title",
        excerpt: "Short excerpt.",
        seo: null,
      }),
    ).toEqual({
      title: "Post title",
      description: "Short excerpt.",
    });
  });

  it("ignores blank SEO strings and falls back field-by-field", () => {
    expect(
      resolvePostMetadata({
        title: "Post title",
        excerpt: null,
        seo: { title: "  ", description: "Only meta description." },
      }),
    ).toEqual({
      title: "Post title",
      description: "Only meta description.",
    });
  });
});

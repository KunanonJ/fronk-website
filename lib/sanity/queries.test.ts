import { describe, expect, it } from "vitest";
import { POSTS_QUERY, POST_QUERY, POST_SLUGS_QUERY } from "./queries";

describe("Sanity public post queries", () => {
  it("exclude drafts and future-dated posts from public listing queries", () => {
    expect(POSTS_QUERY).toContain('!(_id in path("drafts.**"))');
    expect(POSTS_QUERY).toContain("publishedAt <= now()");
  });

  it("exclude drafts and future-dated posts from public slug queries", () => {
    expect(POST_SLUGS_QUERY).toContain('!(_id in path("drafts.**"))');
    expect(POST_SLUGS_QUERY).toContain("publishedAt <= now()");
  });

  it("excludes drafts and future-dated posts from public post detail queries", () => {
    expect(POST_QUERY).toContain('!(_id in path("drafts.**"))');
    expect(POST_QUERY).toContain("publishedAt <= now()");
    expect(POST_QUERY).toContain("seo {");
  });
});

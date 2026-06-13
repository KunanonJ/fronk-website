import { describe, expect, it } from "vitest";
import { getRevalidationTagsForType, REVALIDATE_TAGS } from "./revalidation";

describe("getRevalidationTagsForType", () => {
  it("routes posts to writing cache tags", () => {
    expect(getRevalidationTagsForType("post")).toEqual([REVALIDATE_TAGS.posts]);
  });

  it("routes page documents to the affected page cache tag and global settings", () => {
    expect(getRevalidationTagsForType("standardPage")).toEqual([
      REVALIDATE_TAGS.pages,
      REVALIDATE_TAGS.site,
    ]);
  });

  it("routes writing page documents to the writing index cache tag", () => {
    expect(getRevalidationTagsForType("writingPage")).toEqual([
      REVALIDATE_TAGS.writing,
    ]);
  });

  it("routes shared settings to every public content tag", () => {
    expect(getRevalidationTagsForType("siteSettings")).toEqual([
      REVALIDATE_TAGS.site,
      REVALIDATE_TAGS.home,
      REVALIDATE_TAGS.pages,
      REVALIDATE_TAGS.ventures,
      REVALIDATE_TAGS.resume,
      REVALIDATE_TAGS.posts,
      REVALIDATE_TAGS.writing,
    ]);
  });

  it("falls back to global invalidation for unknown document types", () => {
    expect(getRevalidationTagsForType("unknownType")).toEqual([
      REVALIDATE_TAGS.site,
      REVALIDATE_TAGS.home,
      REVALIDATE_TAGS.pages,
      REVALIDATE_TAGS.ventures,
      REVALIDATE_TAGS.resume,
      REVALIDATE_TAGS.posts,
      REVALIDATE_TAGS.writing,
    ]);
  });
});

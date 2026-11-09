import { describe, expect, it } from "vitest";
import { getRevalidationTagsForType, REVALIDATE_TAGS } from "./revalidation";

const ALL = [REVALIDATE_TAGS.resume, REVALIDATE_TAGS.posts, REVALIDATE_TAGS.writing];

describe("getRevalidationTagsForType", () => {
  it("routes posts and authors to the posts tag", () => {
    expect(getRevalidationTagsForType("post")).toEqual([REVALIDATE_TAGS.posts]);
    expect(getRevalidationTagsForType("author")).toEqual([REVALIDATE_TAGS.posts]);
  });

  it("routes the writing page and the resume to their own tags", () => {
    expect(getRevalidationTagsForType("writingPage")).toEqual([REVALIDATE_TAGS.writing]);
    expect(getRevalidationTagsForType("resumeProfile")).toEqual([REVALIDATE_TAGS.resume]);
  });

  it("purges every tag for shared settings, unknown and missing types", () => {
    expect(getRevalidationTagsForType("siteSettings")).toEqual(ALL);
    expect(getRevalidationTagsForType("unknownType")).toEqual(ALL);
    expect(getRevalidationTagsForType(undefined)).toEqual(ALL);
  });
});

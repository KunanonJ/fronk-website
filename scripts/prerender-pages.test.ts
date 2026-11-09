import { describe, expect, it } from "vitest";
import { TOPIC_SLUGS } from "@/lib/content/topics/pillars";
import { EXTRA_PRERENDER_PATHS } from "./prerender-pages.mjs";

describe("extra prerender pages", () => {
  it("lists every Thai topic hub", () => {
    expect(EXTRA_PRERENDER_PATHS).toEqual(TOPIC_SLUGS.map((slug) => `/th/topics/${slug}`));
  });
});

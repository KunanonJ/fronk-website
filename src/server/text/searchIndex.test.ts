import { describe, expect, it } from "vitest";
import { allCaseStudies } from "@/lib/content/caseStudy";
import { getAllSkills } from "@/lib/content/skills";
import { getAllTopicPillars } from "@/lib/content/topics/pillars";
import { GET, buildSearchIndex } from "@/src/server/text/searchIndex";

/*
 * /search.json: every public page once, in the site's own words, and none of
 * the hidden ones.
 */
describe("the search index", () => {
  const index = buildSearchIndex();
  const paths = index.map((entry) => entry.path);

  it("lists each page once, with a title and a summary", () => {
    expect(new Set(paths).size).toBe(paths.length);
    for (const entry of index) {
      expect(entry.title.trim(), entry.path).not.toBe("");
      expect(entry.summary.trim(), entry.path).not.toBe("");
      expect(entry.path, entry.path).toMatch(/^\/[^?#]*$/);
    }
  });

  it("holds every case, both languages' topic hubs and every skill", () => {
    for (const study of allCaseStudies()) expect(paths).toContain(study.path);
    expect(index.filter((entry) => entry.kind === "topic")).toHaveLength(
      getAllTopicPillars("en").length + getAllTopicPillars("th").length,
    );
    expect(index.filter((entry) => entry.lang === "th")).toHaveLength(
      getAllTopicPillars("th").length,
    );
    for (const skill of getAllSkills()) {
      expect(paths).toContain(`/skills/${skill.slug}`);
    }
    for (const page of ["/", "/about", "/portfolio", "/resume", "/contact"]) {
      expect(paths).toContain(page);
    }
  });

  it("leaves the hidden pages out", () => {
    for (const path of paths) {
      expect(path).not.toMatch(/^\/(blog|press|studio)(\/|$)/);
    }
  });

  it("is served as JSON", async () => {
    const response = GET();
    expect(response.headers.get("content-type")).toBe(
      "application/json; charset=utf-8",
    );
    expect(await response.json()).toEqual(index);
  });
});

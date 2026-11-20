import { describe, expect, it } from "vitest";
import { allCaseStudies, type CaseStudy } from "@/lib/content/caseStudy";
import {
  WORDS_PER_MINUTE,
  caseWords,
  countWords,
  readingMinutes,
} from "@/lib/content/readingTime";

/*
 * Reading time (plan reading-aids_PLAN_20-11-26): counted from the content's
 * own words, rounded up to whole minutes, never under one.
 */
describe("countWords", () => {
  it("counts words, keeping figures, hyphens and apostrophes in one", () => {
    expect(countWords("One back office for a multi-entity group.")).toBe(7);
    expect(countWords("It's 1,000 users · 30% max")).toBe(5);
    expect(countWords("  ")).toBe(0);
  });
});

describe("readingMinutes", () => {
  it("rounds up to whole minutes and never says zero", () => {
    expect(readingMinutes(0)).toBe(1);
    expect(readingMinutes(WORDS_PER_MINUTE)).toBe(1);
    expect(readingMinutes(WORDS_PER_MINUTE + 1)).toBe(2);
  });
});

describe("caseWords", () => {
  const cases = allCaseStudies();

  it("reads every case's words: more than its lead, a few minutes at most", () => {
    expect(cases.length).toBeGreaterThan(0);
    for (const study of cases) {
      const words = caseWords(study);
      expect(words, study.href).toBeGreaterThan(countWords(study.lead));
      expect(readingMinutes(words), study.href).toBeLessThanOrEqual(10);
    }
  });

  it("counts the chapters, and not the links' addresses", () => {
    const study = cases[0]!;
    const without: CaseStudy = { ...study, chapters: [] };
    expect(caseWords(study)).toBeGreaterThan(caseWords(without));
    const relinked: CaseStudy = {
      ...study,
      chapters: study.chapters.map((chapter) => ({
        ...chapter,
        blocks: chapter.blocks.map((block) =>
          block.type === "links"
            ? {
                ...block,
                links: block.links.map((link) => ({
                  ...link,
                  href: `${link.href}/a/much/longer/address`,
                })),
              }
            : block,
        ),
      })),
    };
    expect(caseWords(relinked)).toBe(caseWords(study));
  });
});

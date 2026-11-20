import { describe, expect, it } from "vitest";
import { CASE_PATHS } from "@/lib/content/casePaths";
import { allCaseStudies } from "@/lib/content/caseStudy";

describe("CASE_PATHS (the 404's I'm feeling lucky)", () => {
  it("lists every case study the content has, in its order", () => {
    expect([...CASE_PATHS]).toEqual(allCaseStudies().map((s) => s.path));
  });
});

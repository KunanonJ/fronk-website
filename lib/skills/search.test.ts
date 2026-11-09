import { describe, expect, it } from "vitest";
import * as v from "valibot";
import {
  ADAPTED_COUNT,
  MODEL_INVOKED_COUNT,
  ORIGINAL_COUNT,
  USER_INVOKED_COUNT,
  getAllSkills,
} from "@/lib/content/skills";
import {
  SKILL_FILTERS,
  matchesSkillFilter,
  skillsSearchSchema,
  type SkillFilter,
} from "./search";

describe("skills search params", () => {
  const parse = (input: unknown) => v.parse(skillsSearchSchema, input);

  it("defaults to all skills", () => {
    expect(parse({})).toEqual({ show: "all" });
  });

  it.each(SKILL_FILTERS.map((show) => [show]))("reads ?show=%s", (show) => {
    expect(parse({ show })).toEqual({ show });
  });

  it.each([["stage"], ["Original"], [""], [1], [null], [["user"]]])(
    "falls back to all for %j without throwing",
    (show) => {
      expect(parse({ show })).toEqual({ show: "all" });
    },
  );

  it("drops unrelated params", () => {
    expect(parse({ show: "user", install: "zip" })).toEqual({ show: "user" });
  });
});

describe("matchesSkillFilter", () => {
  const skills = getAllSkills();
  const count = (filter: SkillFilter) =>
    skills.filter((s) => matchesSkillFilter(s, filter)).length;

  it("matches the catalog counts for every filter", () => {
    expect(count("all")).toBe(skills.length);
    expect(count("original")).toBe(ORIGINAL_COUNT);
    expect(count("adapted")).toBe(ADAPTED_COUNT);
    expect(count("auto")).toBe(MODEL_INVOKED_COUNT);
    expect(count("user")).toBe(USER_INVOKED_COUNT);
  });

  it("splits by origin and by invocation without overlap", () => {
    expect(count("original") + count("adapted")).toBe(skills.length);
    expect(count("auto") + count("user")).toBe(skills.length);
  });

  it("files adapted skills under their upstream and originals under none", () => {
    for (const s of skills) {
      expect(matchesSkillFilter(s, "adapted"), s.slug).toBe(s.source !== null);
    }
  });
});

import { describe, expect, it } from "vitest";
import { aboutPage } from "./aboutPage";
import { operatingModel } from "./operatingModel";
import { getAllPortfolioProjects } from "./portfolio";
import { SKILL_STAGES, SKILL_STAGE_MEMBERS, getAllSkills } from "./skills";
import { getAllVentures } from "./ventures";

describe("operating model", () => {
  it("mirrors the skill stages, blurbs and members exactly", () => {
    expect(operatingModel.stages.map((s) => s.id)).toEqual(
      SKILL_STAGES.map((s) => s.id),
    );
    for (const stage of operatingModel.stages) {
      const source = SKILL_STAGES.find((s) => s.id === stage.id)!;
      expect(stage.label).toBe(source.label);
      expect(stage.practice).toBe(source.blurb);
      expect(stage.skills).toEqual(SKILL_STAGE_MEMBERS[stage.id]);
    }
  });

  it("uses each of the four About principles once", () => {
    const principles = aboutPage.principles.items.map((p) => p.title);
    expect([...operatingModel.stages.map((s) => s.principle)].sort()).toEqual(
      [...principles].sort(),
    );
  });

  it("links only to skills, projects and ventures that exist", () => {
    const skills = new Set(getAllSkills().map((s) => s.slug));
    const pages = new Set([
      ...getAllPortfolioProjects().map((p) => `/portfolio/${p.slug}`),
      ...getAllVentures().map((v) => `/ventures/${v.slug}`),
    ]);
    for (const stage of operatingModel.stages) {
      for (const slug of stage.skills) expect(skills.has(slug)).toBe(true);
      for (const link of stage.evidence)
        expect(pages.has(link.href)).toBe(true);
    }
  });
});

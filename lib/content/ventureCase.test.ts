import { describe, expect, it } from "vitest";
import { getAllVentureSlugs, getVentureBySlug } from "@/lib/content/ventures";

describe("venture case studies", () => {
  it("every venture ships a case study with intro, sections and timeline", () => {
    for (const slug of getAllVentureSlugs()) {
      const venture = getVentureBySlug(slug);
      expect(venture, slug).not.toBeNull();
      expect(venture?.caseStudy, `${slug} caseStudy`).toBeDefined();
      expect(venture?.caseStudy?.intro.length, `${slug} intro`).toBeGreaterThan(
        40,
      );
      expect(
        venture?.caseStudy?.sections.length,
        `${slug} sections`,
      ).toBeGreaterThanOrEqual(2);
      for (const section of venture?.caseStudy?.sections ?? []) {
        expect(section.heading.length).toBeGreaterThan(2);
        expect(section.body.length).toBeGreaterThan(20);
      }
      expect(venture?.caseStudy?.timeline).toMatch(/\d{4}/);
    }
  });

  it("splits each tagline into hub display lines, word for word", () => {
    for (const slug of getAllVentureSlugs()) {
      const venture = getVentureBySlug(slug)!;
      const lines = venture.caseStudy?.taglineLines ?? [];
      expect(lines.length, slug).toBeGreaterThan(1);
      expect(lines.join(" "), slug).toBe(venture.tagline);
      expect(venture.logo, slug).toMatch(/^\/brand\//);
    }
  });

  it("only gives a loop to a venture whose case names its stages", () => {
    const gogocash = getVentureBySlug("gogocash")!.caseStudy!;
    const stands = gogocash.sections[1]!.body.toLowerCase();
    expect(gogocash.loop).toHaveLength(4);
    expect(stands).toContain(
      (gogocash.loop ?? []).map((stage) => stage.toLowerCase()).join(", "),
    );
    expect(getVentureBySlug("manut")?.caseStudy?.loop).toBeUndefined();
  });

  it("keeps metrics honest — only ventures with corroborated figures have them", () => {
    // GoGoCash's figures are corroborated in its description; Manut has no
    // published numbers yet and must not grow fabricated ones.
    expect(getVentureBySlug("gogocash")?.metrics?.length).toBe(3);
    expect(getVentureBySlug("manut")?.metrics).toBeUndefined();
  });
});

import { describe, expect, it } from "vitest";
import {
  getAdjacentVentures,
  getAllVentures,
  getAllVentureSlugs,
  getVentureBySlug,
} from "@/lib/content/ventures";

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

  it("keeps metrics honest — only ventures with corroborated figures have them", () => {
    // GoGoCash's figures are corroborated in its description; Manut has no
    // published numbers yet and must not grow fabricated ones.
    expect(getVentureBySlug("gogocash")?.metrics?.length).toBe(3);
    expect(getVentureBySlug("manut")?.metrics).toBeUndefined();
  });

  describe("getAdjacentVentures", () => {
    it("walks the year-desc order without wrapping", () => {
      const ordered = getAllVentures();
      const first = getAdjacentVentures(ordered[0].slug);
      expect(first.prev).toBeNull();
      expect(first.next?.slug).toBe(ordered[1].slug);

      const last = getAdjacentVentures(ordered[ordered.length - 1].slug);
      expect(last.prev?.slug).toBe(ordered[ordered.length - 2].slug);
      expect(last.next).toBeNull();
    });

    it("returns nulls for an unknown slug", () => {
      const result = getAdjacentVentures("does-not-exist");
      expect(result.prev).toBeNull();
      expect(result.next).toBeNull();
    });
  });
});

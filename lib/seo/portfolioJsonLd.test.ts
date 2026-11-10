import { describe, expect, it } from "vitest";
import { getAllPortfolioProjects } from "@/lib/content/portfolio";
import {
  buildPortfolioCollectionJsonLd,
  buildPortfolioProjectJsonLd,
  isTeamProject,
} from "./portfolioJsonLd";

describe("portfolio JSON-LD", () => {
  it("credits the Person as contributor on team projects and creator otherwise", () => {
    for (const project of getAllPortfolioProjects()) {
      const ld = buildPortfolioProjectJsonLd(project);
      if (isTeamProject(project)) {
        expect(ld.contributor).toBeDefined();
        expect(ld.creator).toBeUndefined();
      } else {
        expect(ld.creator).toBeDefined();
        expect(ld.contributor).toBeUndefined();
      }
      expect(ld.sourceOrganization).toEqual({
        "@id": expect.stringMatching(/thebinaryholdings/),
      });
    }
    expect(getAllPortfolioProjects().some(isTeamProject)).toBe(true);
  });

  it("lists every project in the collection, in order", () => {
    const projects = getAllPortfolioProjects();
    const ld = buildPortfolioCollectionJsonLd(projects) as {
      mainEntity: { itemListElement: { position: number; name: string }[] };
    };
    expect(ld.mainEntity.itemListElement.map((i) => i.name)).toEqual(
      projects.map((p) => p.name),
    );
  });
});

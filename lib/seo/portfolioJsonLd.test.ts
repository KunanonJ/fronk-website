import { describe, expect, it } from "vitest";
import {
  getAllPortfolioProjects,
  isPersonalProject,
} from "@/lib/content/portfolio";
import { EMPLOYER_ORGANIZATION } from "@/lib/seo/jsonLd";
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
    }
    expect(getAllPortfolioProjects().some(isTeamProject)).toBe(true);
  });

  it("names the employer as the source only on the employer's projects", () => {
    const projects = getAllPortfolioProjects();
    for (const project of projects) {
      const ld = buildPortfolioProjectJsonLd(project);
      // His own project (this site) was not built for The Binary Holdings.
      expect(ld.sourceOrganization, project.slug).toEqual(
        isPersonalProject(project)
          ? undefined
          : { "@id": expect.stringMatching(/thebinaryholdings/) },
      );
      // Every project is either his own or the employer's, by name.
      expect(
        isPersonalProject(project) ||
          project.organization === EMPLOYER_ORGANIZATION.name,
        project.slug,
      ).toBe(true);
    }
    expect(
      projects.filter(isPersonalProject).map((project) => project.slug),
    ).toEqual(["kunanonj-com"]);
  });

  it("adds the stated outcomes to the description, attributed to the résumé", () => {
    for (const project of getAllPortfolioProjects()) {
      const { description } = buildPortfolioProjectJsonLd(project) as {
        description: string;
      };
      const outcomes = project.outcomes ?? [];
      // schema.org has no property for an outcome, so the description says
      // where it is stated, as the page's own link does.
      expect(description.startsWith(project.summary), project.slug).toBe(true);
      expect(description === project.summary, project.slug).toBe(
        outcomes.length === 0,
      );
      expect(
        description.includes("as stated in the résumé"),
        project.slug,
      ).toBe(outcomes.length > 0);
      for (const outcome of outcomes)
        expect(description).toContain(`${outcome.label}: ${outcome.value}`);
    }
    expect(
      buildPortfolioProjectJsonLd(
        getAllPortfolioProjects().find((p) => p.slug === "tbh-intranet")!,
      ).description,
    ).toMatch(
      / Outcome, as stated in the résumé: Adoption: 50\+ employees; Build cycles: 4 months to 1 week\.$/,
    );
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

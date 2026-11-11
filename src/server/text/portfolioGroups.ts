import {
  getAllPortfolioProjects,
  isPersonalProject,
  type PortfolioProject,
} from "@/lib/content/portfolio";

/**
 * The portfolio as llms.txt and llms-full.txt list it: the projects built
 * for an employer under its name, then the owner's own (this site), each in
 * list order. Apart, so no heading credits The Binary Holdings with work it
 * did not commission. The employer's name comes from the projects, so the
 * heading follows the data. A group with no project is left out.
 */
export function portfolioGroups(): readonly {
  heading: string;
  projects: readonly PortfolioProject[];
}[] {
  const all = getAllPortfolioProjects();
  const employed = all.filter((project) => !isPersonalProject(project));
  const employers = [...new Set(employed.map((p) => p.organization))];
  return [
    {
      heading: `AI engineering and internal tools (${employers.join(", ")})`,
      projects: employed,
    },
    { heading: "Personal projects", projects: all.filter(isPersonalProject) },
  ].filter((group) => group.projects.length > 0);
}

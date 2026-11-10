import type { PortfolioProject } from "@/lib/content/portfolio";
import { EMPLOYER_ORGANIZATION, PERSON_ID, WEBSITE_ID } from "@/lib/seo/jsonLd";
import { siteConfig } from "@/lib/site";

const BASE = siteConfig.url.replace(/\/$/, "");
const EMPLOYER_ID = `${EMPLOYER_ORGANIZATION.url}/#organization`;

/** A team-built project names the Person as contributor, never as sole creator. */
export function isTeamProject(project: PortfolioProject): boolean {
  return /team project/i.test(project.role);
}

/**
 * CreativeWork for /portfolio/[slug]: what was built, for which organisation,
 * and by whom, so engines can answer "who built X" from structured data as
 * well as from the page's byline.
 */
export function buildPortfolioProjectJsonLd(
  project: PortfolioProject,
): Record<string, unknown> {
  const url = `${BASE}/portfolio/${project.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "@id": `${url}/#work`,
    name: project.name,
    description: project.summary,
    url,
    mainEntityOfPage: url,
    dateCreated: String(project.year),
    keywords: project.stack.join(", "),
    sourceOrganization: { "@id": EMPLOYER_ID },
    isPartOf: { "@id": WEBSITE_ID },
    ...(isTeamProject(project)
      ? { contributor: { "@id": PERSON_ID } }
      : { creator: { "@id": PERSON_ID } }),
  };
}

/** CollectionPage for /portfolio listing every project in order. */
export function buildPortfolioCollectionJsonLd(
  projects: readonly PortfolioProject[],
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${BASE}/portfolio/#collection`,
    url: `${BASE}/portfolio`,
    name: "Selected work",
    isPartOf: { "@id": WEBSITE_ID },
    about: { "@id": PERSON_ID },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: projects.map((project, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${BASE}/portfolio/${project.slug}`,
        name: project.name,
      })),
    },
  };
}

import type { OpenSourceProject } from "@/lib/content/openSource";
import { PAGE_META } from "@/lib/content/pageMeta";
import { PERSON_ID, WEBSITE_ID } from "@/lib/seo/jsonLd";
import { SITE_ORIGIN } from "@/lib/site";

/** SPDX license page, e.g. MIT -> https://spdx.org/licenses/MIT.html */
const spdx = (license: string) => `https://spdx.org/licenses/${license}.html`;

/**
 * CollectionPage for /open-source: each project as SoftwareSourceCode by the
 * site's Person, with its repository, license, latest release and last
 * change. No stars or forks: they move between syncs, and the page shows
 * them only from STARS_SHOWN_FROM. No programmingLanguage: GitHub calls
 * Superstacks Python, while its skills are Markdown.
 */
export function buildOpenSourceJsonLd(
  projects: readonly OpenSourceProject[],
  syncedOn: string,
): Record<string, unknown> {
  const url = `${SITE_ORIGIN}/open-source`;
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${url}/#collection`,
    url,
    name: PAGE_META["open-source"].title,
    description: PAGE_META["open-source"].description,
    isPartOf: { "@id": WEBSITE_ID },
    about: { "@id": PERSON_ID },
    dateModified: syncedOn,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: projects.length,
      itemListElement: projects.map((p, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "SoftwareSourceCode",
          "@id": `${url}/#${p.slug}`,
          name: p.name,
          description: p.summary,
          url: `${url}#${p.slug}`,
          codeRepository: p.facts.url,
          license: spdx(p.facts.license),
          ...(p.facts.release
            ? {
                version: p.facts.release.tag,
                datePublished: p.facts.release.publishedAt.slice(0, 10),
              }
            : {}),
          dateModified: p.facts.lastCommitAt.slice(0, 10),
          author: { "@id": PERSON_ID },
        },
      })),
    },
  };
}

import type { PortfolioProject } from "@/lib/content/portfolio";
import type { Venture } from "@/lib/content/ventures";
import { namedPageTitle } from "@/lib/seo/pageTitle";
import { routeShareMeta } from "@/lib/seo/routeMeta";
import { pageHead } from "./head";
import { fileOg } from "./og";

/*
 * The head of a case page, /portfolio/<slug> or /ventures/<slug>: the title,
 * description, canonical, Open Graph and Twitter tags, the Markdown twin and
 * the share image, from the same builders the live routes used before the
 * case-study template (profile redesign Phase 5) moved onto them at the
 * Phase 6 cutover. The routes' loaders call it; caseHead.test.ts pins it
 * through them, and the parity gate pins the served tags.
 */

/** The head of /portfolio/<slug>, as `_landing/portfolio/$slug.tsx` builds it. */
export function projectCaseHead(project: PortfolioProject) {
  const path = `/portfolio/${project.slug}`;
  return pageHead(
    routeShareMeta({
      title: namedPageTitle(project.name, project.tagline),
      description: project.summary,
      path,
      hasOwnOgImage: true,
      markdownPath: `${path}.md`,
    }),
    { fileOgImage: fileOg(path, `${project.name}: by Kunanon Jarat`) },
  );
}

/** The head of /ventures/<slug>, as `_landing/ventures/$slug.tsx` builds it. */
export function ventureCaseHead(venture: Venture) {
  const path = `/ventures/${venture.slug}`;
  return pageHead(
    routeShareMeta({
      title: namedPageTitle(venture.name, venture.tagline),
      description: venture.description,
      path,
      hasOwnOgImage: true,
    }),
    { fileOgImage: fileOg(path, "Venture hub") },
  );
}

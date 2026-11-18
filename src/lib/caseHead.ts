import type { PortfolioProject } from "@/lib/content/portfolio";
import type { Venture } from "@/lib/content/ventures";
import { namedPageTitle } from "@/lib/seo/pageTitle";
import { routeShareMeta } from "@/lib/seo/routeMeta";
import type { Metadata } from "@/lib/seo/types";
import { pageHead } from "./head";
import { fileOg } from "./og";

/*
 * The head of a case page, /portfolio/<slug> or /ventures/<slug>, as its live
 * route builds it: the same builders with the same input. The hidden previews
 * of the case-study template (profile redesign Phase 5) use it with `hidden`,
 * so they carry the live page's canonical, Open Graph and Twitter tags (Share
 * copies the canonical address) and differ only in `robots`. caseHead.test.ts
 * compares both with the live routes' own loaders, so the two cannot drift
 * apart before Phase 6 moves the template onto the live routes.
 */

/** A preview's one difference: kept out of search. */
const HIDDEN: NonNullable<Metadata["robots"]> = { index: false, follow: false };

type CaseHeadOptions = {
  /** True for a hidden preview: noindex and nofollow, all else the same. */
  hidden?: boolean;
};

function head(
  metadata: Metadata,
  ogImage: ReturnType<typeof fileOg>,
  { hidden = false }: CaseHeadOptions,
) {
  return pageHead(hidden ? { ...metadata, robots: HIDDEN } : metadata, {
    fileOgImage: ogImage,
  });
}

/** The head of /portfolio/<slug>, as `_landing/portfolio/$slug.tsx` builds it. */
export function projectCaseHead(
  project: PortfolioProject,
  options: CaseHeadOptions = {},
) {
  const path = `/portfolio/${project.slug}`;
  return head(
    routeShareMeta({
      title: namedPageTitle(project.name, project.tagline),
      description: project.summary,
      path,
      hasOwnOgImage: true,
      markdownPath: `${path}.md`,
    }),
    fileOg(path, `${project.name}: by Kunanon Jarat`),
    options,
  );
}

/** The head of /ventures/<slug>, as `_landing/ventures/$slug.tsx` builds it. */
export function ventureCaseHead(
  venture: Venture,
  options: CaseHeadOptions = {},
) {
  const path = `/ventures/${venture.slug}`;
  return head(
    routeShareMeta({
      title: namedPageTitle(venture.name, venture.tagline),
      description: venture.description,
      path,
      hasOwnOgImage: true,
    }),
    fileOg(path, "Venture hub"),
    options,
  );
}

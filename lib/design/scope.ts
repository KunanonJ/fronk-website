/*
 * Which pages render in the profile redesign's token scope
 * (`data-design="profile"` on <html>). Since Phase 7 every page of the site
 * does: the core pages from the Phase 6 cutover (design spec 2.13), then the
 * topic hubs and reading pages (group D1) and the catalog and record pages
 * (group D2). Since D2 (7f) the 404 and the error state render the new status
 * page, whichever route failed, so a match that ended in a 404 or an error is
 * in the scope too. Only Sanity Studio and the files the site serves (feeds,
 * markdown, images) are outside it.
 *
 * The scope follows the matched routes on screen, never the location: during
 * a client navigation the location changes as soon as it starts, while the
 * old page is still showing, and switching the scope then would restyle the
 * old page mid-transition.
 */
const PROFILE_ROUTE_IDS: ReadonlySet<string> = new Set([
  "/_landing/",
  "/_landing/portfolio/",
  "/_landing/portfolio/$slug",
  "/_landing/ventures/$slug",
  "/_landing/about",
  "/_landing/contact",
  // Phase 7, group D1: the topic hubs in English and Thai, and the reading pages.
  "/_landing/topics/$slug",
  "/_landing/th/topics/$slug",
  "/_landing/learn",
  "/_landing/examples",
  "/_landing/stack",
  "/_landing/proof",
  "/_landing/build",
  // Phase 7, group D2: skills, résumé, /design, and the hidden blog and press.
  "/_landing/skills/",
  "/_landing/skills/$slug",
  "/_landing/resume",
  "/_system/design",
  "/_landing/blog/",
  "/_landing/blog/$slug",
  "/_landing/press",
]);

/** The part of a route match the scope reads. */
export interface ScopeMatch {
  readonly routeId: string;
  readonly status?: string;
  /** Set on the match that shows the 404 page (the root, for an unknown URL). */
  readonly _notFound?: boolean;
}

/** A match whose route failed: the new status page shows in its place. */
function showsStatusPage(match: ScopeMatch): boolean {
  return (
    match.status === "notFound" ||
    match.status === "error" ||
    match._notFound === true
  );
}

export function profileDesign(
  matches: readonly ScopeMatch[],
): "profile" | undefined {
  return matches.some(
    (match) => PROFILE_ROUTE_IDS.has(match.routeId) || showsStatusPage(match),
  )
    ? "profile"
    : undefined;
}

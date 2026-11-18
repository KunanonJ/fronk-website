/*
 * Which pages render in the profile redesign's token scope
 * (`data-design="profile"` on <html>). Since the Phase 6 cutover (design spec
 * 2.13) the core pages do: Home, the portfolio index, the case studies,
 * About and Contact. Every other page keeps the old tokens under the new
 * chrome, which carries the attribute itself, until Phase 7 restyles it.
 *
 * The scope follows the matched routes on screen, never the location: during
 * a client navigation the location changes as soon as it starts, while the
 * old page is still showing, and switching the scope then would restyle the
 * old page mid-transition. A match that ended in a 404 or an error renders
 * the old status page, so it does not count.
 */
const PROFILE_ROUTE_IDS: ReadonlySet<string> = new Set([
  "/_landing/",
  "/_landing/portfolio/",
  "/_landing/portfolio/$slug",
  "/_landing/ventures/$slug",
  "/_landing/about",
  "/_landing/contact",
  // Phase 7 (D1): the topic hubs in English and Thai, and the reading pages.
  "/_landing/topics/$slug",
  "/_landing/th/topics/$slug",
  "/_landing/learn",
  "/_landing/examples",
  "/_landing/stack",
  "/_landing/proof",
  "/_landing/build",
]);

/** The part of a route match the scope reads. */
export interface ScopeMatch {
  readonly routeId: string;
  readonly status?: string;
}

export function profileDesign(
  matches: readonly ScopeMatch[],
): "profile" | undefined {
  return matches.some(
    (match) =>
      PROFILE_ROUTE_IDS.has(match.routeId) &&
      match.status !== "notFound" &&
      match.status !== "error",
  )
    ? "profile"
    : undefined;
}

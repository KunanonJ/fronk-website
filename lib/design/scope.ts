/*
 * Which pages render in the profile redesign's token scope
 * (`data-design="profile"` on <html>). Until the Phase 6 cutover only the
 * hidden preview routes do. The scope follows the matched routes on screen,
 * never the location: during a client navigation the location changes as
 * soon as it starts, while the old page is still showing, and switching the
 * scope then would restyle the old page mid-transition.
 */
const PROFILE_ROUTE_IDS: ReadonlySet<string> = new Set(["/preview"]);

export function profileDesign(
  routeIds: readonly string[],
): "profile" | undefined {
  return routeIds.some((id) => PROFILE_ROUTE_IDS.has(id))
    ? "profile"
    : undefined;
}

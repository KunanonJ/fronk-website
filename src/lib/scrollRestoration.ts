/*
 * The router's scroll restoration (createRouter's `scrollRestoration`, which
 * may be a function the router asks before each restore).
 *
 * The first restore on the client runs as the page hydrates. TanStack then
 * puts the window back at the top, or scrolls a deep link's target into view.
 * The browser has placed the page by then (at the top, at the hash's target,
 * or where a reload left it), so a visitor who scrolled before hydration ended
 * was pulled back. WebKit, which hydrates later, showed it in testing; it held
 * in every engine.
 *
 * So the first restore is skipped once the visitor has scrolled: by a wheel,
 * a touch or a scroll key since this script started, or, on a page without a
 * hash, by the page no longer being at the top. A deep link the visitor has
 * not moved from still lands on its target, and every later restore
 * (navigations in the app, Back, Forward) runs as before. On the server the
 * answer is always yes, so the router's inline restore script stays in the
 * HTML.
 */

/** Keys that scroll the page. */
const SCROLL_KEYS = new Set([
  "ArrowUp",
  "ArrowDown",
  "PageUp",
  "PageDown",
  "Home",
  "End",
  " ",
]);

type RestoreQuestion = { location: { hash: string } };

export function restoreScrollAfterHydration(): (
  question: RestoreQuestion,
) => boolean {
  if (typeof window === "undefined") return () => true;
  let first = true;
  let moved = false;
  const listen = { capture: true, passive: true } as const;
  const onInput = () => {
    moved = true;
  };
  const onKey = (event: KeyboardEvent) => {
    if (SCROLL_KEYS.has(event.key)) moved = true;
  };
  window.addEventListener("wheel", onInput, listen);
  window.addEventListener("touchmove", onInput, listen);
  window.addEventListener("keydown", onKey, listen);
  return ({ location }) => {
    if (!first) return true;
    first = false;
    window.removeEventListener("wheel", onInput, listen);
    window.removeEventListener("touchmove", onInput, listen);
    window.removeEventListener("keydown", onKey, listen);
    // A page without a hash opens at the top, or where a reload left it,
    // which is where the restore would put it anyway.
    const scrolled = moved || (!location.hash && window.scrollY !== 0);
    return !scrolled;
  };
}

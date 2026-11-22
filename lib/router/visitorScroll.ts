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

const LISTEN = { capture: true, passive: true } as const;

/**
 * Calls `moved` when the visitor scrolls the page themselves: a wheel, a
 * touch that moves, or a key that scrolls. A script's own scrolling is not
 * the visitor's, so it does not count. Returns the way to stop listening.
 */
export function onVisitorScroll(moved: () => void): () => void {
  const onKey = (event: KeyboardEvent) => {
    if (SCROLL_KEYS.has(event.key)) moved();
  };
  window.addEventListener("wheel", moved, LISTEN);
  window.addEventListener("touchmove", moved, LISTEN);
  window.addEventListener("keydown", onKey, LISTEN);
  return () => {
    window.removeEventListener("wheel", moved, LISTEN);
    window.removeEventListener("touchmove", moved, LISTEN);
    window.removeEventListener("keydown", onKey, LISTEN);
  };
}

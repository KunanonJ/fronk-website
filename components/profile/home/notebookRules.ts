/*
 * The notebook's rules (profile redesign Phase 4, design spec 8.7), kept pure
 * so they can be tested without a browser: how long a page stays, where each
 * page rests, and whether a released drag turns the page.
 */

/** Words in a quote, as a reader counts them. */
export function wordCount(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

/**
 * How long the notebook waits before turning to the next page, in ms:
 * min(18000, max(7000, 2000 + 180 x the words on the visible page)).
 */
export function autoplayMs(words: number): number {
  return Math.min(18000, Math.max(7000, 2000 + 180 * words));
}

/** A page is turned over to the left, the open one, or under it. */
export type PageState = "turned" | "current" | "stacked";

export function pageState(index: number, current: number): PageState {
  if (index < current) return "turned";
  return index === current ? "current" : "stacked";
}

/**
 * The page's place in the pile, higher on top: the open page tops the right
 * pile and the page turned last tops the left one. Read as a z offset, so the
 * piles stack the same way in the 3D context the turn needs.
 */
export function pageDepth(index: number, current: number, total: number) {
  return index < current ? index + 1 : 2 * total - index;
}

/** The next page, wrapping round in either direction. */
export function stepPage(current: number, direction: 1 | -1, total: number) {
  return total > 0 ? (current + direction + total) % total : 0;
}

/** A turn's share of the leaf (25%), or a flick faster than this, in px/ms. */
const TURN_SHARE = 0.25;
const FLICK_SPEED = 0.5;

/**
 * Whether a released drag turns the page: dragged past a quarter of the
 * leaf, or flicked faster than 0.5 px/ms, toward the turn. Otherwise the page
 * springs back.
 */
export function turnsOnRelease(
  distance: number,
  leafWidth: number,
  speed: number,
): boolean {
  return distance > leafWidth * TURN_SHARE || speed > FLICK_SPEED;
}

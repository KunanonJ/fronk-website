/*
 * Hide on scroll for the pill nav (profile redesign, design spec 7.3). Pure,
 * so the thresholds are pinned without a browser. A new position is recorded
 * only after NAV_STEP px of movement; the bar hides once the page moves down
 * past NAV_TOP px, and shows again after NAV_STEP px up.
 */

/** Movement, in px, before the recorded position moves. */
export const NAV_STEP = 6;

/** The bar stays shown until the page is this far down. */
export const NAV_TOP = 24;

export interface NavScroll {
  /** The last position recorded. */
  readonly lastY: number;
  /** Whether the bar is hidden. */
  readonly away: boolean;
}

export function navAway(state: NavScroll, y: number): NavScroll {
  if (Math.abs(y - state.lastY) < NAV_STEP) return state;
  return { lastY: y, away: y > state.lastY && y > NAV_TOP };
}

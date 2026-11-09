/**
 * Non-React motion gate. Any JS-driven motion (e.g. the theme toggle's
 * circular reveal) checks this so `prefers-reduced-motion: reduce` never
 * starts it. Server-side, or without matchMedia, it assumes reduced motion.
 */

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

export function prefersReducedMotion(): boolean {
  if (
    typeof window === "undefined" ||
    typeof window.matchMedia !== "function"
  ) {
    return true;
  }
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

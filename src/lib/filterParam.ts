import { useHydrated } from "@tanstack/react-router";
import { prefersReducedMotion } from "@/lib/motion/motionRuntime";

/**
 * The view transition a filter change runs: type "filter", in which the
 * listed cards move to their new places and the page itself does not fade
 * (globals.css). Only where the engine has view-transition types, by the
 * router's own test (router-core's startViewTransition): without them the
 * router would run a plain cross-fade. None under reduced motion. There is
 * no site-wide motion switch to consult; the sections' pause buttons stop
 * their own loops only.
 */
function filterViewTransition(): false | { types: string[] } {
  if (
    prefersReducedMotion() ||
    typeof CSS === "undefined" ||
    !CSS.supports("selector(:active-view-transition-type(a))")
  ) {
    return false;
  }
  return { types: ["filter"] };
}

/**
 * How a list filter writes its URL param: replace the history entry, keep
 * the scroll position, and move the cards (filterViewTransition). The
 * transition is decided at each click, when the route spreads this object.
 */
export const FILTER_NAVIGATION = {
  replace: true,
  resetScroll: false,
  get viewTransition() {
    return filterViewTransition();
  },
} as const;

/**
 * The filter value a prerendered list page renders. One static file answers
 * every `?param=`, and its HTML shows the default, so hydrate that same
 * markup first and apply the param after. Client-side navigations are
 * already hydrated and apply it at once.
 */
export function usePrerenderedParam<T>(value: T, fallback: T): T {
  return useHydrated() ? value : fallback;
}

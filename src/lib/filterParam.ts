import { useHydrated } from "@tanstack/react-router";

/**
 * How a list filter writes its URL param: replace the history entry, keep
 * the scroll position and skip the view transition.
 */
export const FILTER_NAVIGATION = {
  replace: true,
  resetScroll: false,
  viewTransition: false,
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

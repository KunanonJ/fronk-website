"use client";

import { useSyncExternalStore } from "react";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/**
 * Tracks the user's `prefers-reduced-motion` setting for JS-driven motion.
 *
 * The global CSS `@media (prefers-reduced-motion: reduce)` block neutralizes
 * CSS animations/transitions, but it cannot stop JS animation loops (the WebGL
 * hero field, the cursor/scroll/time HUD, the ticker). Every such effect must
 * consult this hook and skip or freeze its loop when it returns `true`.
 *
 * Implemented with `useSyncExternalStore` — the canonical way to subscribe to
 * an external browser store like `MediaQueryList` (no `setState`-in-effect, no
 * tearing). The server snapshot returns `true` (reduced) so no JS motion can
 * start during SSR / the first client paint; motion only begins once the client
 * has positively confirmed the user allows it.
 */
function subscribe(onChange: () => void): () => void {
  if (typeof window === "undefined" || !window.matchMedia) return () => {};
  const mediaQuery = window.matchMedia(REDUCED_MOTION_QUERY);
  mediaQuery.addEventListener("change", onChange);
  return () => mediaQuery.removeEventListener("change", onChange);
}

function getSnapshot(): boolean {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

function getServerSnapshot(): boolean {
  return true;
}

export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

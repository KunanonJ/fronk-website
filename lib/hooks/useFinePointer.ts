"use client";

import { useSyncExternalStore } from "react";

const FINE_POINTER_QUERY = "(pointer: fine)";

/**
 * Tracks whether the primary pointing device is a fine pointer (mouse).
 *
 * Server snapshot is `false` so custom-cursor UI stays off during SSR and
 * only appears after the client confirms a mouse-class pointer.
 */
function subscribe(onChange: () => void): () => void {
  if (typeof window === "undefined" || !window.matchMedia) return () => {};
  const mediaQuery = window.matchMedia(FINE_POINTER_QUERY);
  mediaQuery.addEventListener("change", onChange);
  return () => mediaQuery.removeEventListener("change", onChange);
}

function getSnapshot(): boolean {
  return window.matchMedia(FINE_POINTER_QUERY).matches;
}

function getServerSnapshot(): boolean {
  return false;
}

export function useFinePointer(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

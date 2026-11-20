import { prefersReducedMotion } from "@/lib/motion/motionRuntime";

/*
 * The one-time "on reveal" moments wait the way Reveal does (design spec
 * 6.7): after hydration, only an element still below the fold waits, and it
 * plays once as it comes into view. Anything on screen already, not laid out
 * (a box of no height, as a hidden drawing has), under reduced motion, or
 * without IntersectionObserver plays nothing and stays as it is. Users: the
 * count-ups (useCountUp), the dither's print-in (DitherField) and the
 * footer's drawings (PixelArt).
 */

/**
 * Watches `el` until it is in view, then calls `onView` once. Returns a
 * function that stops watching, or null when the element should not wait.
 */
export function waitForFirstView(
  el: Element,
  onView: () => void,
  options?: IntersectionObserverInit,
): (() => void) | null {
  if (prefersReducedMotion() || typeof IntersectionObserver === "undefined") {
    return null;
  }
  const box = el.getBoundingClientRect();
  if (box.height === 0 || box.top < window.innerHeight) return null;
  const observer = new IntersectionObserver((entries) => {
    if (!entries.some((entry) => entry.isIntersecting)) return;
    observer.disconnect();
    onView();
  }, options);
  observer.observe(el);
  return () => observer.disconnect();
}

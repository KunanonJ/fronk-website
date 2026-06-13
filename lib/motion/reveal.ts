/**
 * Reveal-on-scroll geometry. Kept pure so the flash-prevention threshold is
 * unit-tested; `Reveal` feeds it `getBoundingClientRect().top` + innerHeight.
 */
export const REVEAL_OBSERVER_OPTIONS: IntersectionObserverInit = {
  rootMargin: "0px 0px -10% 0px",
  threshold: 0.12,
};

/**
 * True only when an element sits comfortably BELOW the fold, so it can start
 * hidden and reveal on scroll. Anything already on screen stays visible — that
 * prevents a flash-of-hidden-content for above-the-fold sections and keeps the
 * page fully visible with no JS / under reduced motion.
 */
export function shouldStartHidden(top: number, viewportHeight: number): boolean {
  return top > viewportHeight * 0.9;
}

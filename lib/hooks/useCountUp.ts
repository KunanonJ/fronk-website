import { useEffect, type RefObject } from "react";
import { COUNT_MS, countFrame, parseFigure } from "@/lib/motion/countUp";
import { prefersReducedMotion } from "@/lib/motion/motionRuntime";

/*
 * Runs a figure's count-up (lib/motion/countUp.ts) the way Reveal waits:
 * after hydration, only a figure still below the fold waits at zero until it
 * is in view, then counts once. On screen already, hidden, under reduced
 * motion, without IntersectionObserver, or for a value that is not one
 * number, the figure stays as it is. Printing shows the figure.
 *
 * `draw` shows a frame over the real figure, or with null takes the frame
 * away. It never changes the real figure, which React owns and which stays
 * what screen readers, search and tests read. Pass a function defined at
 * module level, so it is the same on every render.
 */

/** Counts once the figure is a little way into the screen. */
const COUNT_OBSERVER: IntersectionObserverInit = {
  rootMargin: "0px 0px -10% 0px",
};

export function useCountUp<T extends Element>(
  ref: RefObject<T | null>,
  value: string,
  draw: (el: T, frame: string | null) => void,
): void {
  useEffect(() => {
    const el = ref.current;
    const figure = parseFigure(value);
    if (
      !el ||
      !figure ||
      prefersReducedMotion() ||
      typeof IntersectionObserver === "undefined"
    ) {
      return;
    }
    const box = el.getBoundingClientRect();
    if (box.height === 0 || box.top < window.innerHeight) return;

    let frame = 0;
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      observer.disconnect();
      const start = performance.now();
      const step = (now: number) => {
        const progress = (now - start) / COUNT_MS;
        if (progress >= 1) {
          finish();
          return;
        }
        draw(el, countFrame(figure, progress));
        frame = requestAnimationFrame(step);
      };
      frame = requestAnimationFrame(step);
    }, COUNT_OBSERVER);
    const finish = () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener("beforeprint", finish);
      draw(el, null);
    };

    draw(el, countFrame(figure, 0));
    observer.observe(el);
    window.addEventListener("beforeprint", finish);
    return finish;
  }, [ref, value, draw]);
}

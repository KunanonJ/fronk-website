import { useEffect, useState } from "react";

/*
 * The workflow picture's clock (profile redesign Phase 5, design spec 9.9):
 * while it runs, the current step moves on every FLOW_TICK, through every
 * step done, then starts again. It runs only once hydrated, with motion
 * allowed and the tile's animation playing (its pause control, WCAG 2.2.2);
 * stopped, it holds its step. Before it first runs, every step is done: the
 * still frame of the server HTML and of reduced motion.
 */

/** How long each step stays current, in ms. */
export const FLOW_TICK = 1200;

/** The step after `step` of `count`: past the last, back to the first. */
export function nextFlowStep(step: number, count: number): number {
  return step >= count ? 0 : step + 1;
}

export function useFlowStep(
  count: number,
  running: boolean,
  initial: number = count,
): number {
  const [step, setStep] = useState(initial);
  useEffect(() => {
    if (!running || count < 2) return;
    const timer = window.setInterval(
      () => setStep((current) => nextFlowStep(current, count)),
      FLOW_TICK,
    );
    return () => window.clearInterval(timer);
  }, [count, running]);
  return step;
}

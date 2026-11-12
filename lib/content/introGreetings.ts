/**
 * First-visit intro (session-once). Five greetings at the original intro's
 * pace: 720 ms a word, the last one held 1.62 s, then a 700 ms fade, 5.2 s in
 * all. ux-experience Phase 1 had cut it to 1.45 s; the owner chose this length
 * on 12-11-26. Any key, tap, click or scroll, or the Skip button, still ends
 * it at once, and reduced motion skips it.
 */
export const INTRO_GREETINGS = [
  "Hello",
  "สวัสดี",
  "Bonjour",
  "こんにちは",
  "Welcome to KunanonJ",
] as const;

export const INTRO_SESSION_KEY = "fronk-intro-seen";

/** Hard ceiling for the full intro, exit fade included. */
export const INTRO_MAX_MS = 5500;

export const INTRO_TIMING = {
  /** How long each greeting before the last stays on screen. */
  wordMs: 720,
  /** How long the last greeting stays before the exit starts. */
  lastHoldMs: 1620,
  /** Overlay fade-out; the hero is already showing through during it. */
  exitMs: 700,
  /**
   * The arrival burst (confetti, sparkles, champagne pop) starts with the last
   * greeting and must be over by the end of the exit fade, so the intro's
   * total time does not change.
   */
  burstMs: 740,
} as const;

/** When the exit fade starts, measured from the first greeting. */
export function introExitStartMs(
  count: number = INTRO_GREETINGS.length,
): number {
  return Math.max(0, count - 1) * INTRO_TIMING.wordMs + INTRO_TIMING.lastHoldMs;
}

/** Total intro duration, exit included. */
export function introTotalMs(count: number = INTRO_GREETINGS.length): number {
  return introExitStartMs(count) + INTRO_TIMING.exitMs;
}

/**
 * First-visit intro (session-once). Kept short on purpose: the whole intro,
 * exit included, must finish within INTRO_MAX_MS so a visitor arriving from
 * LinkedIn or Google sees the hero almost at once (ux-experience Phase 1).
 */
export const INTRO_GREETINGS = [
  "Hello",
  "สวัสดี",
  "Welcome to KunanonJ",
] as const;

export const INTRO_SESSION_KEY = "fronk-intro-seen";

/** Hard ceiling for the full intro, exit fade included. */
export const INTRO_MAX_MS = 1500;

export const INTRO_TIMING = {
  /** How long each greeting before the last stays on screen. */
  wordMs: 350,
  /** How long the last greeting stays before the exit starts. */
  lastHoldMs: 450,
  /** Overlay fade-out; the hero is already showing through during it. */
  exitMs: 300,
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

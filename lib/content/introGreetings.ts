/**
 * First-visit intro (session-once): the pixel portrait "mints" (owner,
 * 20-11-26, research punk-avatar-and-intro_RESEARCH_20-11-26.md). The portrait
 * prints in by the dither's 16 ranks, 100 ms a rank, under a counter of its
 * 576 cells, while the first four greetings pass at 400 ms each; the welcome
 * lands as the last rank does, with a burst of pixels, and holds 800 ms; then
 * the portrait flies into the nav's avatar as the overlay fades (500 ms).
 * 2.9 s in all. Any key, tap, click or scroll, or the Skip button, ends it at
 * once, and reduced motion skips it.
 */
export const INTRO_GREETINGS = [
  "Hello",
  "สวัสดี",
  "Bonjour",
  "こんにちは",
  "Welcome to KunanonJ",
] as const;

export const INTRO_SESSION_KEY = "fronk-intro-seen";

/** The intro's few words besides the greetings. */
export const INTRO_COPY = {
  skip: "Skip intro",
  minting: "Minting",
  minted: "Minted",
} as const;

/** Hard ceiling for the full intro, the hand-over included. */
export const INTRO_MAX_MS = 3200;

export const INTRO_TIMING = {
  /** How long each greeting before the last stays on screen. */
  wordMs: 400,
  /** One of the portrait's 16 print ranks: it is whole as the welcome lands. */
  printStepMs: 100,
  /** How long the welcome stays before the hand-over starts. */
  lastHoldMs: 800,
  /** The hand-over: the overlay fades as the portrait flies to the nav. */
  exitMs: 500,
  /** The burst of pixels with the welcome, over inside its hold. */
  burstMs: 640,
} as const;

/** The portrait's cells, and how many each print rank adds. */
export const INTRO_CELLS = 24 * 24;
export const INTRO_RANKS = 16;

/** When the hand-over starts, measured from the first greeting. */
export function introExitStartMs(
  count: number = INTRO_GREETINGS.length,
): number {
  return Math.max(0, count - 1) * INTRO_TIMING.wordMs + INTRO_TIMING.lastHoldMs;
}

/** Total intro duration, the hand-over included. */
export function introTotalMs(count: number = INTRO_GREETINGS.length): number {
  return introExitStartMs(count) + INTRO_TIMING.exitMs;
}

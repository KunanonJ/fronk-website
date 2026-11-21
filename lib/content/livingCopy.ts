/*
 * Copy of the footer's living status (now-building-and-genz Phase 5): the
 * guess beside the Bangkok clock and the ship log. Only the footer's lazy
 * chunk (components/profile/site/living/Living.tsx, which also says where
 * the log stands) imports it, so no page's first load carries it.
 *
 * The owner approved all of it as is on 21-11-26. Each hour's words are a
 * guess and say so ("probably"); none says when the owner answers or
 * whether they are free, so none is a claim about availability.
 */

/** From each hour in Bangkok (0 to 23) until the next: the guess. */
const HOUR_GUESSES: readonly (readonly [from: number, guess: string])[] = [
  [0, "probably asleep"],
  [6, "probably having coffee"],
  [9, "probably shipping"],
  [12, "probably at lunch"],
  [13, "probably shipping"],
  [18, "probably still shipping"],
  [23, "probably asleep"],
];

/** The guess for an hour in Bangkok, 0 to 23. */
export function hourGuess(hour: number): string {
  let guess = HOUR_GUESSES[0]![1];
  for (const [from, words] of HOUR_GUESSES) if (hour >= from) guess = words;
  return guess;
}

/** The ship log: "Shipped 3h ago:", then the commit's subject as its link. */
export const shippedCopy = {
  lead: "Shipped",
  /** After the commit's subject, for screen readers. */
  opens: "(commit on GitHub, opens in a new tab)",
} as const;

/*
 * Copy of the footer's living status (now-building-and-genz Phase 5): the
 * guess beside the Bangkok clock and the ship log. Only the footer's lazy
 * chunk (components/profile/site/living/Living.tsx, which also says where
 * the log stands) imports it, so no page's first load carries it.
 *
 * DRAFT, all of it, awaiting the owner's approval. Each hour's words are a
 * guess and say so ("probably"); none says when he answers or whether he is
 * free, so none is a claim about availability.
 */

/** From each hour in Bangkok (0 to 23) until the next: the guess. */
const HOUR_GUESSES: readonly (readonly [from: number, guess: string])[] = [
  [0, "probably asleep"], // DRAFT
  [6, "probably having coffee"], // DRAFT
  [9, "probably shipping"], // DRAFT
  [12, "probably at lunch"], // DRAFT
  [13, "probably shipping"], // DRAFT
  [18, "probably still shipping"], // DRAFT
  [23, "probably asleep"], // DRAFT
];

/** The guess for an hour in Bangkok, 0 to 23. */
export function hourGuess(hour: number): string {
  let guess = HOUR_GUESSES[0]![1];
  for (const [from, words] of HOUR_GUESSES) if (hour >= from) guess = words;
  return guess;
}

/** The ship log: "Shipped 3h ago:", then the commit's subject as its link. */
export const shippedCopy = {
  lead: "Shipped", // DRAFT
  /** After the commit's subject, for screen readers. */
  opens: "(commit on GitHub, opens in a new tab)", // DRAFT
} as const;

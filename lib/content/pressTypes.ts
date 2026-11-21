/*
 * The press coverage types, apart from the coverage itself
 * (lib/content/press.ts): /press's search options (lib/press/search.ts) run
 * on every navigation, so they ship in the entry chunk every page loads,
 * and they need only these three words.
 */

/** Coverage types, in filter order (bento canvas Press, design spec 4.19). */
export const PRESS_TYPES = ["Feature", "Product", "Profile"] as const;
export type PressType = (typeof PRESS_TYPES)[number];

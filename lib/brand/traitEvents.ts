/*
 * What the trait store (lib/brand/traitStore.ts, loaded on demand) shares
 * with the page's shell, which every page loads: where the traits are kept
 * and the window event that says they changed. Nothing else, so the shell
 * stays small.
 */

/** The found traits: a JSON list of trait ids. */
export const FOUND_KEY = "pf-portrait-found";

/** The worn trait's id. */
export const WORN_KEY = "pf-portrait-worn";

/**
 * Sent on window at every change of the traits. Its `detail` is news for the
 * toast, or null when there is none (a trait put on, or found on /about).
 */
export const TRAITS_EVENT = "pf:traits";

/** A trait found (`isNew`), or put on again by the pixel party. */
export interface TraitNews {
  readonly id: string;
  readonly isNew: boolean;
}

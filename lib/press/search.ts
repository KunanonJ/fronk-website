import * as v from "valibot";
import { enumParam } from "@/lib/search/enumParam";
import { PRESS_TYPES, type PressType } from "@/lib/content/pressTypes";

/*
 * /press route options that run on every navigation (so they ship in the
 * entry bundle). They take the coverage types from lib/content/pressTypes,
 * not lib/content/press, so the coverage itself stays with /press.
 */

/** URL values: `all` plus each coverage type in lower case. */
export const PRESS_FILTERS = [
  "all",
  ...PRESS_TYPES.map((t) => t.toLowerCase() as Lowercase<PressType>),
] as const;
export type PressFilter = "all" | Lowercase<PressType>;

/** The default filter; stripped from the URL, so /press stays clean. */
export const PRESS_SEARCH_DEFAULTS = { type: "all" } as const;

/**
 * /press search params (TanStack Router `validateSearch`, Standard Schema):
 * `?type=feature|product|profile` narrows the coverage. A missing or unknown
 * value falls back to all without an error.
 */
export const pressSearchSchema = v.object({
  type: enumParam(PRESS_FILTERS, PRESS_SEARCH_DEFAULTS.type),
});

/** Whether an item shows under `filter`. */
export function matchesPressFilter(
  item: { source: PressType },
  filter: PressFilter,
): boolean {
  return filter === "all" || item.source.toLowerCase() === filter;
}

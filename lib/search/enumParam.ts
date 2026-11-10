import * as v from "valibot";

/**
 * A list-filter search param for TanStack Router `validateSearch`: one of
 * `options`, or `fallback` when the value is missing or unknown, never an
 * error. Pair the route with `stripSearchParams(defaults)` so the default
 * never shows in the URL. Route options ship in the entry bundle, so this
 * module imports nothing but Valibot.
 */
export function enumParam<const T extends readonly [string, ...string[]]>(
  options: T,
  fallback: T[number],
) {
  return v.optional(v.fallback(v.picklist(options), fallback), fallback);
}

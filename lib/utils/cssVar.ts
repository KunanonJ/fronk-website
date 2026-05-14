import type { CSSProperties } from "react";

/**
 * Returns a `React.CSSProperties` object that sets a CSS custom property.
 * TypeScript's built-in CSSProperties type doesn't allow arbitrary custom
 * properties without a cast, so this helper centralises the cast.
 *
 * Example:
 *   <div className="stagger" style={cssVar("--i", index)} />
 */
export function cssVar(name: `--${string}`, value: string | number): CSSProperties {
  return { [name]: value } as CSSProperties;
}

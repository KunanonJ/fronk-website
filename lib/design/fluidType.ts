/**
 * Fluid type and browser zoom (WCAG 1.4.4; profile redesign best-practices
 * audit, section 2).
 *
 * A fluid size such as `clamp(2.625rem, 5.4vw + 0.625rem, 6rem)` shrinks in
 * CSS px as the reader zooms in, because zooming narrows the viewport. The
 * clamp's rem minimum is the only part that keeps growing with zoom, so it
 * decides whether text can still reach twice its default size. Browsers zoom
 * to 500% at most.
 */

export interface ClampParts {
  readonly min: string;
  readonly preferred: string;
  readonly max: string;
}

/** Splits `clamp(a, b, c)` at its top-level commas; nested min() stays whole. */
export function parseClamp(value: string): ClampParts | null {
  const inner = value.trim().match(/^clamp\(([\s\S]*)\)$/)?.[1];
  if (inner === undefined) return null;
  const parts: string[] = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < inner.length; i += 1) {
    const ch = inner[i];
    if (ch === "(") depth += 1;
    else if (ch === ")") depth -= 1;
    else if (ch === "," && depth === 0) {
      parts.push(inner.slice(start, i).trim());
      start = i + 1;
    }
  }
  parts.push(inner.slice(start).trim());
  if (parts.length !== 3) return null;
  const [min, preferred, max] = parts as [string, string, string];
  return { min, preferred, max };
}

/** `2.625rem` to 2.625; anything that is not a plain rem length gives null. */
export function remValue(length: string): number | null {
  const match = length.trim().match(/^(\d*\.?\d+)rem$/);
  return match ? Number(match[1]) : null;
}

/** Browsers stop zooming at 500%. */
const MAX_ZOOM = 5;
/** WCAG 1.4.4: text must be able to reach 200% of its default size. */
const REQUIRED_SCALE = 2;

/**
 * Whether text sized `clamp(minRem, ..., maxRem)` can still be zoomed to
 * twice its default size.
 *
 * At zoom z the viewport is z times narrower, so the fluid middle term can
 * fall all the way to `minRem`; only the minimum is sure to scale. At 500%
 * the text renders at least 5 x minRem, and it has to reach 2 x what it
 * showed at 100%, which can be as large as maxRem: so max <= 2.5 x min, the
 * rule the best-practices audit and the design system adopted. The type
 * scale's largest ratio today is 96 / 42 = 2.29.
 */
export function isZoomSafeClamp(minRem: number, maxRem: number): boolean {
  if (!(minRem > 0) || maxRem < minRem) return false;
  return MAX_ZOOM * minRem >= REQUIRED_SCALE * maxRem;
}

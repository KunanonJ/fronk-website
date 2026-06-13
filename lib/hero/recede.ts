/**
 * The hero scroll-recede curve, fitted to matveyan.com's measured values:
 * over one viewport of scroll the hero scales 1 → ~0.887, fades 1 → ~0, and
 * blurs 0 → ~9.4px, so it appears to recede into depth behind the next section.
 *
 * Pure and framework-free so the curve is unit-tested; `HeroRecede` just feeds
 * it `scrollY / innerHeight` each frame.
 */
export interface HeroReceTransform {
  scale: number;
  opacity: number;
  blur: number;
}

function clamp01(value: number): number {
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export function heroRecede(progress: number): HeroReceTransform {
  const p = clamp01(progress);
  const eased = easeOutCubic(p);
  return {
    scale: 1 - 0.113 * eased,
    opacity: Math.pow(1 - p, 1.6),
    blur: 9.44 * eased,
  };
}

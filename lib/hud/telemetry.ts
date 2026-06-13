/**
 * Pure helpers for the live telemetry HUD (cursor / scroll / time readout).
 * Kept framework-free so the math is unit-tested in isolation; the component
 * just wires these to requestAnimationFrame.
 */

/** Scroll position as a 0..1 fraction, clamped, division-by-zero safe. */
export function scrollProgress(
  scrollY: number,
  scrollHeight: number,
  innerHeight: number,
): number {
  const max = scrollHeight - innerHeight;
  if (max <= 0) return 0;
  const ratio = scrollY / max;
  if (ratio < 0) return 0;
  if (ratio > 1) return 1;
  return ratio;
}

/** Scroll fraction as a fixed 0.000 readout. */
export function formatProgress(progress: number): string {
  return progress.toFixed(3);
}

/** Elapsed seconds as a 0.00 readout. */
export function formatSeconds(seconds: number): string {
  return seconds.toFixed(2);
}

/** Pointer coordinate rounded to a whole pixel. */
export function formatCoord(value: number): string {
  return String(Math.round(value));
}

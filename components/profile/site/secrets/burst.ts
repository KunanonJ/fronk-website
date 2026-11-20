/*
 * A burst of square pixels in the site's colours, the intro's material
 * (components/landing/IntroPixels.tsx): each pixel is an `.intro-pixel`
 * (globals.css), which flies from the burst's centre to (--x, --y) and fades,
 * and only under prefers-reduced-motion: no-preference. These are its custom
 * properties. Not seeded like the intro's: a party may differ every time.
 */

/**
 * True when the visitor asks for reduced motion: then there is no burst.
 * The same test as lib/motion/motionRuntime, here so the lazy chunks that
 * burst do not split that module out of the shared chunk every page loads.
 */
export function reducedMotion(): boolean {
  return (
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? true
  );
}

const COLOURS = [
  "var(--accent)",
  "var(--ember)",
  "var(--peach)",
  "var(--tint-3)",
] as const;

export interface BurstShape {
  /** How many pixels. */
  readonly count: number;
  /** How far they fly, in px: the nearest and the farthest. */
  readonly reach: readonly [near: number, far: number];
  /** All over by this many ms. */
  readonly ms: number;
  /** The latest a pixel may set off, in ms. */
  readonly stagger: number;
  /** The directions, in radians (0 is right, π/2 down): all round by default. */
  readonly arc?: readonly [from: number, to: number];
}

/** One pixel's custom properties for `.intro-pixel`. */
export type BurstPixel = Record<`--${string}`, string>;

export function burstPixels(
  {
    count,
    reach: [near, far],
    ms,
    stagger,
    arc = [0, Math.PI * 2],
  }: BurstShape,
  random: () => number = Math.random,
): BurstPixel[] {
  const [from, to] = arc;
  return Array.from({ length: count }, (_, at) => {
    const angle = from + ((at + random() * 0.8) / count) * (to - from);
    const distance = near + random() * (far - near);
    const delay = Math.round(random() * stagger);
    return {
      "--x": `${Math.round(Math.cos(angle) * distance)}px`,
      "--y": `${Math.round(Math.sin(angle) * distance)}px`,
      "--s": `${[8, 8, 12][at % 3]}px`,
      "--c": COLOURS[at % COLOURS.length]!,
      "--delay": `${delay}ms`,
      "--d": `${ms - delay}ms`,
    };
  });
}

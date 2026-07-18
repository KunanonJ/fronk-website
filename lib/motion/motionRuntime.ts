/**
 * Non-React motion runtime gates for Lenis + GSAP.
 * Every JS-driven smooth-scroll / timeline init must go through these helpers
 * so `prefers-reduced-motion: reduce` never starts those engines.
 */

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return true;
  }
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

export type SmoothScrollInstance = {
  raf: (time: number) => void;
  destroy: () => void;
};

/**
 * Construct a smooth-scroll instance only when motion is allowed.
 * Pass a factory so unit tests can assert the factory is never called under PRM.
 */
export function createSmoothScroll<T extends SmoothScrollInstance>(
  factory: () => T,
): T | null {
  if (prefersReducedMotion()) return null;
  return factory();
}

export type GsapLike = {
  registerPlugin: (...plugins: object[]) => void;
};

/**
 * Register GSAP plugins only when motion is allowed.
 * @returns whether plugins were registered
 */
export function registerGsapPlugins(
  gsap: GsapLike,
  plugins: object[],
): boolean {
  if (prefersReducedMotion()) return false;
  gsap.registerPlugin(...plugins);
  return true;
}

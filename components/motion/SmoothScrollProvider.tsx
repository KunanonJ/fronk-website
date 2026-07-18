"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { createSmoothScroll } from "@/lib/motion/motionRuntime";

/**
 * Mounts Lenis smooth scrolling when motion is allowed.
 * No-ops under prefers-reduced-motion (and on Studio routes via SiteShell).
 */
export function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;

    const lenis = createSmoothScroll(
      () =>
        new Lenis({
          autoRaf: false,
          smoothWheel: true,
        }),
    );
    if (!lenis) return;

    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, [reducedMotion]);

  return children;
}

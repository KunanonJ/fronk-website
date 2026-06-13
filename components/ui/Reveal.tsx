"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { cn } from "@/lib/utils/cn";
import { REVEAL_OBSERVER_OPTIONS, shouldStartHidden } from "@/lib/motion/reveal";

interface RevealProps {
  children: ReactNode;
  className?: string;
}

/**
 * Reveals its children on scroll (fade + 8px rise) via IntersectionObserver.
 *
 * Progressive enhancement: content is fully visible by default — under SSR, with
 * no JS, and under reduced motion. Only when motion is allowed AND the element
 * is still below the fold does it start hidden and reveal as it scrolls in, so
 * there is never a flash-of-hidden-content above the fold. transform+opacity
 * only → no layout shift (CLS-safe).
 */
export function Reveal({ children, className }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    // Leave on-screen elements visible; only arm the reveal for below-fold ones.
    if (!shouldStartHidden(el.getBoundingClientRect().top, window.innerHeight)) {
      return;
    }
    el.dataset.reveal = "hidden";

    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          el.dataset.reveal = "shown";
          observer.disconnect();
        }
      }
    }, REVEAL_OBSERVER_OPTIONS);
    observer.observe(el);
    return () => observer.disconnect();
  }, [reduced]);

  return (
    <div ref={ref} className={cn("reveal", className)}>
      {children}
    </div>
  );
}

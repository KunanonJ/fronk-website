"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { heroRecede } from "@/lib/hero/recede";

interface HeroRecedeProps {
  children: ReactNode;
  className?: string;
}

/**
 * Wraps the hero content and makes it recede into depth on scroll — scale,
 * fade, and blur per the matveyan curve. Writes styles directly on its element
 * inside a scroll-throttled rAF (no React re-render). When the user prefers
 * reduced motion it does nothing, so the content stays fully visible and sharp.
 *
 * Children are server-rendered and passed through untouched, so the hero
 * headline remains the (static, fast) LCP element.
 */
export function HeroRecede({ children, className }: HeroRecedeProps) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    if (prefersReduced) return;
    const el = ref.current;
    if (!el) return;

    let frame = 0;
    let scheduled = false;

    const apply = () => {
      scheduled = false;
      const progress = window.scrollY / Math.max(1, window.innerHeight);
      const { scale, opacity, blur } = heroRecede(progress);
      el.style.transform = `scale(${scale.toFixed(4)})`;
      el.style.opacity = opacity.toFixed(4);
      el.style.filter = blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : "";
      el.style.willChange = progress < 1 ? "transform, opacity, filter" : "auto";
      // Once faded out, stop intercepting clicks meant for the next section.
      el.style.pointerEvents = opacity < 0.1 ? "none" : "";
    };

    const onScroll = () => {
      if (scheduled) return;
      scheduled = true;
      frame = requestAnimationFrame(apply);
    };

    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
      el.style.transform = "";
      el.style.opacity = "";
      el.style.filter = "";
      el.style.willChange = "";
      el.style.pointerEvents = "";
    };
  }, [prefersReduced]);

  return (
    <div ref={ref} className={className} style={{ transformOrigin: "center 38%" }}>
      {children}
    </div>
  );
}

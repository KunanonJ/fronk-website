import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { prefersReducedMotion } from "@/lib/motion/motionRuntime";

/*
 * Reveal (profile redesign, design spec 6.7). Content renders visible from
 * the server. After hydration, only an element still below the fold waits
 * (`is-pending`) until any part of it is in view; anything already on screen
 * stays as it is. The observer has no threshold and no shrunk margin on
 * purpose: with either, a short block at the very end of the page or a block
 * taller than a few screens could never qualify and would stay invisible.
 * The pending state lives in CSS under
 * prefers-reduced-motion: no-preference, and this script does nothing under
 * reduced motion or without IntersectionObserver, so no reader ever loses
 * content. Anything holding an h1 never waits: the LCP heading stays static.
 */
/** Any visible pixel counts: see the note above. */
const REVEAL_OBSERVER: IntersectionObserverInit = {
  threshold: 0,
  rootMargin: "0px",
};

export function Reveal({
  children,
  variant = "rise",
  rise,
  delay,
  className,
}: {
  children: ReactNode;
  variant?: "rise" | "scale";
  /** Rise distance in px; 24 by default, 12 in the footer. */
  rise?: number;
  /** Delay in ms once revealed. */
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (
      !el ||
      prefersReducedMotion() ||
      typeof IntersectionObserver === "undefined" ||
      el.querySelector("h1") ||
      el.getBoundingClientRect().top < window.innerHeight
    ) {
      return;
    }
    el.classList.add("is-pending");
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        el.classList.remove("is-pending");
        observer.disconnect();
      }
    }, REVEAL_OBSERVER);
    observer.observe(el);
    return () => {
      observer.disconnect();
      el.classList.remove("is-pending");
    };
  }, []);

  const style = {
    ...(rise === undefined ? {} : { "--reveal-rise": `${rise}px` }),
    ...(delay === undefined ? {} : { transitionDelay: `${delay}ms` }),
  } as CSSProperties;

  return (
    <div
      ref={ref}
      data-reveal={variant === "scale" ? "scale" : ""}
      className={className}
      style={style}
    >
      {children}
    </div>
  );
}

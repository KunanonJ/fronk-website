import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

/*
 * The two pieces every bento page hero shares (design spec 3.1). Each page
 * keeps its own headline markup inside `PageTitle`, because the canvas draws
 * each one differently (logo, mid-line accent, optional parts).
 */

/**
 * The page h1. `hero-title` labels the hero section; the h1 is the LCP
 * element, so its lines only slide (`kj-lines`, one block child per line).
 */
export function PageTitle({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <h1
      id="hero-title"
      className={cn("kj-lines m-0 text-title text-ink", className)}
    >
      {children}
    </h1>
  );
}

/** The hero lead under the h1: 18 px ink-2, at most 620 px wide. */
export function HeroLead({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <p
      className={cn(
        "m-0 max-w-[620px] text-lg leading-[1.55] text-ink-2",
        className,
      )}
    >
      {children}
    </p>
  );
}

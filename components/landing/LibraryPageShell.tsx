"use client";

import type { ReactNode } from "react";
import LandingTopNav from "@/components/landing/LandingTopNav";
import { expandHashHref } from "@/lib/landing/nav";

const serif = {
  fontFamily: "var(--font-instrument-serif), 'Instrument Serif', serif",
} as const;

type LibraryPageShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  navId: string;
  children: ReactNode;
  /** Wider content (tables / boards). Default max-w-6xl. */
  wide?: boolean;
};

export default function LibraryPageShell({
  eyebrow,
  title,
  description,
  navId,
  children,
  wide = true,
}: LibraryPageShellProps) {
  const width = wide ? "max-w-6xl" : "max-w-3xl";

  return (
    <div className="relative min-h-[100svh] bg-landing text-primary">
      <LandingTopNav
        position="fixed"
        wordmarkHref="/"
        resolveHref={expandHashHref}
        navId={navId}
      />

      <main
        id="main"
        className="relative z-10 px-4 pb-28 pt-16 sm:px-6 md:px-10 md:pb-20 md:pt-28"
      >
        <header className={`mx-auto mb-10 ${width} sm:mb-14`}>
          <p className="mb-3 text-[10px] uppercase tracking-[0.2em] text-primary/60 sm:text-xs">
            {eyebrow}
          </p>
          <h1
            className="text-4xl font-medium tracking-tight text-primary sm:text-5xl md:text-6xl"
            style={serif}
          >
            {title}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-primary/65 sm:text-base">
            {description}
          </p>
        </header>

        <div className={`mx-auto ${width}`}>{children}</div>
      </main>
    </div>
  );
}

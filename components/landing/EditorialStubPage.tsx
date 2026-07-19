"use client";

import LandingTopNav from "@/components/landing/LandingTopNav";
import { expandHashHref } from "@/lib/landing/nav";

type EditorialStubPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  navId: string;
};

/**
 * Minimal on-brand page shell for Press / Blog until full CMS content lands.
 */
export default function EditorialStubPage({
  eyebrow,
  title,
  description,
  navId,
}: EditorialStubPageProps) {
  return (
    <div className="relative min-h-[100svh] overflow-hidden bg-black text-primary">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(225,224,204,0.08),_transparent_55%)]" />

      <LandingTopNav
        position="fixed"
        wordmarkHref="/"
        resolveHref={expandHashHref}
        navId={navId}
      />

      <main
        id="main"
        className="relative z-10 mx-auto flex min-h-[100svh] max-w-3xl flex-col justify-center px-6 pb-20 pt-28 sm:px-8"
      >
        <p className="mb-4 text-[10px] uppercase tracking-[0.2em] text-primary/60 sm:text-xs">
          {eyebrow}
        </p>
        <h1
          className="text-4xl font-medium tracking-tight text-primary sm:text-5xl md:text-6xl"
          style={{
            fontFamily:
              "var(--font-instrument-serif), 'Instrument Serif', serif",
          }}
        >
          {title}
        </h1>
        <p className="mt-6 max-w-xl text-sm leading-relaxed text-primary/70 sm:text-base">
          {description}
        </p>
        <p className="mt-10 text-xs text-primary/45">
          Content coming soon — this page is live in the site IA.
        </p>
      </main>
    </div>
  );
}

import type { ReactNode } from "react";
import LandingTopNav from "@/components/landing/LandingTopNav";
import { expandHashHref } from "@/lib/landing/nav";

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
    <div className="relative min-h-[100svh] bg-page text-ink">
      <LandingTopNav
        position="fixed"
        wordmarkHref="/"
        resolveHref={expandHashHref}
        navId={navId}
      />

      <main
        id="main"
        className="relative z-10 px-4 pb-20 pt-28 sm:px-6 md:px-10"
      >
        <header className={`mx-auto mb-10 ${width} sm:mb-14`}>
          <p className="mb-3 font-mono text-label uppercase text-ink-2">
            {eyebrow}
          </p>
          <h1 className="font-display text-h1 text-ink">
            {title}
          </h1>
          <p className="mt-5 max-w-2xl text-lead text-ink-2">
            {description}
          </p>
        </header>

        <div className={`mx-auto ${width}`}>{children}</div>
      </main>
    </div>
  );
}

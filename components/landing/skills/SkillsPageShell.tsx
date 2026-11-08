import type { ReactNode } from "react";
import LandingTopNav from "@/components/landing/LandingTopNav";

const serif = {
  fontFamily: "var(--font-instrument-serif), 'Instrument Serif', serif",
} as const;

type SkillsPageShellProps = {
  eyebrow: string;
  title: string;
  /** Lede under the title. */
  description: ReactNode;
  navId: string;
  /** Rendered above the eyebrow (detail pages: the breadcrumb). */
  breadcrumb?: ReactNode;
  /** Rendered under the lede (badges, version, GitHub link). */
  meta?: ReactNode;
  /** Monospace title, for skill names like `verify-loop`. */
  monoTitle?: boolean;
  children: ReactNode;
};

/**
 * Page chrome for `/skills` and `/skills/[slug]`: landing nav plus a header in
 * the LibraryPageShell style. A Server Component (only the nav hydrates), with
 * a 13px eyebrow so no text drops under the 12px floor on phones.
 */
export default function SkillsPageShell({
  eyebrow,
  title,
  description,
  navId,
  breadcrumb,
  meta,
  monoTitle = false,
  children,
}: SkillsPageShellProps) {
  return (
    <div className="relative min-h-[100svh] bg-landing text-primary">
      <LandingTopNav position="fixed" wordmarkHref="/" navId={navId} />

      <main
        id="main"
        className="relative z-10 px-4 pb-20 pt-28 sm:px-6 md:px-10"
      >
        <header className="mx-auto mb-10 max-w-6xl sm:mb-14">
          {breadcrumb}
          <p className="mb-3 text-[13px] uppercase tracking-[0.18em] text-primary/75">
            {eyebrow}
          </p>
          <h1
            className={
              monoTitle
                ? "break-words font-mono text-3xl font-medium tracking-tight text-primary sm:text-5xl"
                : "text-4xl font-medium tracking-tight text-primary sm:text-5xl md:text-6xl"
            }
            style={monoTitle ? undefined : serif}
          >
            {title}
          </h1>
          <div className="mt-4 max-w-2xl text-base leading-relaxed text-primary/75">
            {description}
          </div>
          {meta ? <div className="mt-6">{meta}</div> : null}
        </header>

        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}

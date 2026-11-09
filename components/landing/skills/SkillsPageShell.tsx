import type { ReactNode } from "react";

type SkillsPageShellProps = {
  eyebrow: string;
  title: string;
  /** Lede under the title. */
  description: ReactNode;
  /** Rendered above the eyebrow (detail pages: the breadcrumb). */
  breadcrumb?: ReactNode;
  /** Rendered under the lede (badges, version, GitHub link). */
  meta?: ReactNode;
  /** Monospace title, for skill names like `verify-loop`. */
  monoTitle?: boolean;
  children: ReactNode;
};

/**
 * Page chrome for `/skills` and `/skills/[slug]` (visual-redesign Phase 5):
 * landing nav plus the LibraryPageShell header. A Server Component (only the
 * nav hydrates); the eyebrow is the 12 px mono label.
 */
export default function SkillsPageShell({
  eyebrow,
  title,
  description,
  breadcrumb,
  meta,
  monoTitle = false,
  children,
}: SkillsPageShellProps) {
  return (
    <div className="relative min-h-[100svh] bg-page text-ink">
      <main
        id="main"
        className="relative z-10 px-4 pb-20 pt-14 sm:px-6 md:px-10"
      >
        <header className="mx-auto mb-10 max-w-6xl sm:mb-14">
          {breadcrumb}
          <p className="mb-3 font-mono text-label uppercase text-ink-2">
            {eyebrow}
          </p>
          <h1
            className={
              monoTitle
                ? "break-words font-mono text-h2 font-medium tracking-tight text-ink"
                : "font-display text-h1 text-ink"
            }
          >
            {title}
          </h1>
          <div className="mt-5 max-w-2xl text-lead text-ink-2">
            {description}
          </div>
          {meta ? <div className="mt-6">{meta}</div> : null}
        </header>

        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}

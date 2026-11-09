import type { ElementType, ReactNode } from "react";
import Link from "@/components/navigation/Link";
import { ArrowUpRight } from "lucide-react";

const CARD =
  "group flex h-full flex-col rounded-card border border-hairline bg-surface p-6 shadow-card transition-[border-color,transform] duration-150 ease-smooth hover:border-hairline-strong motion-safe:hover:-translate-y-0.5";

type LibraryLinkCardProps = {
  href: string;
  title: string;
  description: string;
  /** Visible call to action at the bottom of the card, e.g. "Open". */
  cta: string;
  /** Optional 12 px mono line above the title (a source or category). */
  eyebrow?: ReactNode;
  /** Opens in a new tab with rel=noopener (off-site destinations). */
  external?: boolean;
  /** Title element; h3 under a section heading, h2 when the page has none. */
  headingAs?: ElementType;
};

/**
 * One whole-card link for the library pages (visual-redesign Phase 5): the
 * same Paper card, hairline and hover lift as the portfolio cards.
 */
export function LibraryLinkCard({
  href,
  title,
  description,
  cta,
  eyebrow,
  external = false,
  headingAs: Heading = "h3",
}: LibraryLinkCardProps) {
  const inner = (
    <>
      {eyebrow ? (
        <span className="mb-3 font-mono text-label uppercase text-ink-2">
          {eyebrow}
        </span>
      ) : null}
      <Heading className="text-lead font-medium text-ink">{title}</Heading>
      <p className="mt-2 flex-1 text-small text-ink-2">{description}</p>
      <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-link">
        {cta}
        <ArrowUpRight
          className="h-4 w-4 transition-transform duration-150 ease-smooth motion-safe:group-hover:-translate-y-0.5 motion-safe:group-hover:translate-x-0.5"
          aria-hidden
        />
      </span>
    </>
  );

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={CARD}>
        {inner}
      </a>
    );
  }

  return (
    <Link href={href} className={CARD}>
      {inner}
    </Link>
  );
}

/** Section heading row for library pages: a Geist h2 over a hairline. */
export function LibrarySectionHeading({
  id,
  children,
  count,
}: {
  id: string;
  children: ReactNode;
  /** Shown as a two-digit mono count; hidden from screen readers. */
  count?: number;
}) {
  return (
    <div className="mb-6 flex items-baseline justify-between gap-4 border-b border-hairline pb-3">
      <h2 id={id} className="font-display text-h3 text-ink">
        {children}
      </h2>
      {count !== undefined ? (
        <span
          aria-hidden
          className="font-mono text-label tabular-nums text-ink-2"
        >
          {String(count).padStart(2, "0")}
        </span>
      ) : null}
    </div>
  );
}

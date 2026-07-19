import Link from "next/link";
import type { Venture } from "@/lib/content/ventures";

interface WorkRowProps {
  venture: Venture;
}

/**
 * Simple work list row — opacity hover only (minimal motion). Rows with a
 * case study link to the internal case page; the live product stays one
 * click away via the pill CTA on that page.
 */
export function WorkRow({ venture }: WorkRowProps) {
  const caseHref = venture.caseStudy ? `/ventures/${venture.slug}` : null;
  return (
    <li className="border-b border-border">
      <Link
        href={caseHref ?? venture.url}
        {...(caseHref ? {} : { target: "_blank", rel: "noopener noreferrer" })}
        className="group grid grid-cols-1 items-baseline gap-2 py-6 transition-opacity duration-200 hover:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_auto] sm:gap-6"
      >
        <span className="font-display text-2xl font-medium tracking-tight text-fg sm:text-3xl">
          {venture.name}
        </span>
        <span className="text-sm text-muted">{venture.tagline}</span>
        <span className="text-sm text-muted sm:text-right">{venture.year}</span>
      </Link>
    </li>
  );
}

interface WorkIndexListProps {
  ventures: readonly Venture[];
  emptyLabel?: string;
}

export function WorkIndexList({
  ventures,
  emptyLabel = "No ventures published yet.",
}: WorkIndexListProps) {
  if (ventures.length === 0) {
    return <p className="py-10 text-muted">{emptyLabel}</p>;
  }

  return (
    <ul className="border-t border-border">
      {ventures.map((venture) => (
        <WorkRow key={venture.slug} venture={venture} />
      ))}
    </ul>
  );
}

interface HomeWorkStripProps {
  ventures: readonly Venture[];
  title: string;
  kicker: string;
  seeAllHref?: string;
  seeAllLabel?: string;
}

export function HomeWorkStrip({
  ventures,
  title,
  kicker,
  seeAllHref = "/#ventures",
  seeAllLabel = "See all work",
}: HomeWorkStripProps) {
  return (
    <section aria-labelledby="home-work-heading">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted">{kicker}</p>
          <h2
            id="home-work-heading"
            className="mt-2 font-display text-3xl font-semibold tracking-tight text-fg sm:text-4xl"
          >
            {title}
          </h2>
        </div>
        <Link
          href={seeAllHref}
          className="text-sm text-fg transition-opacity duration-200 hover:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          {seeAllLabel}
        </Link>
      </div>
      <WorkIndexList ventures={ventures} />
    </section>
  );
}

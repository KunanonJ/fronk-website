import LibraryPageShell from "@/components/landing/LibraryPageShell";
import { LibraryLinkCard } from "@/components/landing/LibraryLinkCard";
import {
  getProofCards,
  getProofMetrics,
  proofPage,
} from "@/lib/content/proof";
import { cn } from "@/lib/utils/cn";

/**
 * Columns that fill every row, so no empty cell shows the hairline backdrop:
 * 2 or 4 per row for even counts, else 3.
 */
function statColumns(count: number): string {
  if (count % 4 === 0) return "sm:grid-cols-2 lg:grid-cols-4";
  if (count % 2 === 0 && count % 3 !== 0) return "sm:grid-cols-2";
  return "sm:grid-cols-3";
}

/**
 * Proof (visual-redesign Phase 5): published venture metrics as stat tiles
 * (the home proof strip's pattern), then the evidence cards.
 */
export default function ProofPage() {
  const metrics = getProofMetrics();
  const cards = getProofCards();

  return (
    <LibraryPageShell
      eyebrow={proofPage.eyebrow}
      title={proofPage.title}
      description={proofPage.description}
      navId="proof-mobile-nav"
    >
      {metrics.length > 0 ? (
        <dl
          className={cn(
            "mb-14 grid grid-cols-1 gap-px overflow-hidden rounded-card border border-hairline bg-hairline",
            statColumns(metrics.length),
          )}
        >
          {metrics.map((metric) => (
            <div
              key={`${metric.source}-${metric.label}`}
              className="flex flex-col bg-surface p-5 sm:p-6"
            >
              <dt className="font-mono text-label uppercase text-ink-2">
                {metric.label} · {metric.source}
              </dt>
              <dd className="mt-3 font-display text-h2 tabular-nums text-ink">
                {metric.value}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}

      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <li key={card.id}>
            <LibraryLinkCard
              href={card.href}
              title={card.title}
              description={card.description}
              cta="View"
              eyebrow={card.source}
              external={card.external}
              headingAs="h2"
            />
          </li>
        ))}
      </ul>
    </LibraryPageShell>
  );
}

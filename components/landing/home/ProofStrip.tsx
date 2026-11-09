import { Section } from "@/components/ui/Section";
import { getProofMetrics } from "@/lib/content/proof";

/**
 * Home proof strip (visual-redesign Phase 2): published venture metrics as
 * stat tiles. Real numbers only; renders nothing when there are none.
 */
export default function ProofStrip() {
  const metrics = getProofMetrics();
  if (metrics.length === 0) return null;

  return (
    <Section
      eyebrow="In numbers"
      heading="What's live today"
      className="pt-0 md:pt-0 lg:pt-0"
    >
      <dl className="grid gap-px overflow-hidden rounded-card border border-hairline bg-hairline sm:grid-cols-3">
        {metrics.map((metric) => (
          <div
            key={`${metric.source}-${metric.label}`}
            className="flex flex-col bg-surface p-6 sm:p-8"
          >
            <dt className="font-mono text-label uppercase text-ink-2">
              {metric.label} · {metric.source}
            </dt>
            <dd className="mt-3 font-display text-stat tabular-nums text-ink">
              {metric.value}
            </dd>
          </div>
        ))}
      </dl>
    </Section>
  );
}

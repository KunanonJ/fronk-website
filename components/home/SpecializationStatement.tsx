import { Fragment } from "react";
import { Button } from "@/components/ui/Button";
import type { CtaLink } from "@/lib/sanity/types";
import type { StatementSegment } from "@/lib/content/homePage";

interface SpecializationStatementProps {
  eyebrow: string;
  statement: readonly StatementSegment[];
  primaryCta: CtaLink;
  secondaryCta: CtaLink;
}

/**
 * Home §B — the specialization statement. A mono eyebrow over a weight-contrast
 * uppercase headline (light base, semibold emphasis spans, matveyan-style) and
 * the two primary actions. Content is honest and code-owned; see homePage.ts.
 */
export function SpecializationStatement({
  eyebrow,
  statement,
  primaryCta,
  secondaryCta,
}: SpecializationStatementProps) {
  return (
    <section
      aria-labelledby="specialization-statement"
      className="max-w-4xl"
    >
      <p className="label-mono text-subtle">{eyebrow}</p>

      <h2
        id="specialization-statement"
        className="mt-6 text-balance font-display text-hero font-light uppercase leading-[1.12] tracking-[0.02em]"
      >
        {statement.map((segment, i) =>
          segment.strong ? (
            <strong key={i} className="font-semibold text-fg">
              {segment.text}
            </strong>
          ) : (
            <Fragment key={i}>{segment.text}</Fragment>
          ),
        )}
      </h2>

      <div className="mt-9 flex flex-wrap items-center gap-3">
        <Button href={primaryCta.href} size="lg">
          {primaryCta.label}
        </Button>
        <Button href={secondaryCta.href} variant="secondary" size="lg">
          {secondaryCta.label}
        </Button>
      </div>
    </section>
  );
}

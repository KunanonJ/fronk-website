import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { CtaLink } from "@/lib/sanity/types";

interface WritingCalloutProps {
  eyebrow?: string;
  title: string;
  description: string;
  cta: CtaLink;
}

/**
 * Home — the writing invitation, in terminal dress: a hairline panel with a
 * mono eyebrow, weight-contrast heading, and a tick-button CTA.
 */
export function WritingCallout({
  eyebrow,
  title,
  description,
  cta,
}: WritingCalloutProps) {
  return (
    <div className="panel flex flex-col items-start gap-6 p-8 sm:flex-row sm:items-center sm:justify-between sm:p-12">
      <div className="max-w-xl">
        {eyebrow ? <p className="label-mono text-subtle">{eyebrow}</p> : null}
        <h2 className="mt-3 font-display text-3xl font-semibold uppercase tracking-tight sm:text-4xl">
          {title}
        </h2>
        <p className="mt-3 text-muted">{description}</p>
      </div>
      <Button href={cta.href} variant="secondary" size="lg" className="flex-shrink-0">
        {cta.label}
        <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

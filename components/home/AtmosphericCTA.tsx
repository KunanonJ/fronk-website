import { Button } from "@/components/ui/Button";
import { ATMOSPHERIC_CTA } from "@/lib/content/homeMarketing";
import type { CtaLink } from "@/lib/sanity/types";

interface AtmosphericCTAProps {
  title?: string;
  description?: string;
  primary?: CtaLink;
  secondary?: CtaLink;
}

/**
 * Closing atmospheric band with dual pills.
 */
export function AtmosphericCTA({
  title = ATMOSPHERIC_CTA.title,
  description = ATMOSPHERIC_CTA.description,
  primary = ATMOSPHERIC_CTA.primary,
  secondary = ATMOSPHERIC_CTA.secondary,
}: AtmosphericCTAProps) {
  return (
    <section
      aria-labelledby="atmospheric-cta-heading"
      className="relative isolate overflow-hidden px-5 py-24 sm:px-8 sm:py-32"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_70%_40%,rgba(255,255,255,0.06),transparent_55%)]"
      />
      <div className="relative mx-auto flex max-w-2xl flex-col items-center text-center">
        <h2
          id="atmospheric-cta-heading"
          className="font-display text-3xl font-semibold tracking-tight text-fg sm:text-4xl"
        >
          {title}
        </h2>
        <p className="mt-4 text-muted">{description}</p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button href={primary.href} size="lg">
            {primary.label}
          </Button>
          <Button href={secondary.href} variant="secondary" size="lg">
            {secondary.label}
          </Button>
        </div>
      </div>
    </section>
  );
}

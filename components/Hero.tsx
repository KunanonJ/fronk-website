import { Button } from "@/components/ui/Button";
import type { ResolvedHomePage } from "@/lib/content/homePage";

interface HeroProps {
  content: ResolvedHomePage;
}

/**
 * FogLAMP-mood home hero: centered headline, support line, dual pills.
 * Copy comes from resolved home content (Fronk voice).
 */
export function Hero({ content }: HeroProps) {
  return (
    <section
      className="relative w-full bg-hero-field px-5 pt-28 pb-10 text-fg sm:px-8 sm:pt-32 md:pt-36"
      aria-label="Introduction"
    >
      <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
        {content.heroEyebrow ? (
          <p className="text-xs uppercase tracking-[0.2em] text-muted">
            {content.heroEyebrow}
          </p>
        ) : null}
        <h1 className="mt-4 font-display text-4xl font-medium tracking-tight text-fg sm:text-5xl md:text-[3rem] md:leading-[1.1]">
          {content.heroTagline}
        </h1>
        {content.heroIntro ? (
          <p className="mt-5 max-w-xl text-base text-muted sm:text-lg">
            {content.heroIntro}
          </p>
        ) : null}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button href={content.primaryCta.href} size="lg">
            {content.primaryCta.label}
          </Button>
          <Button
            href={content.secondaryCta.href}
            variant="secondary"
            size="lg"
          >
            {content.secondaryCta.label}
          </Button>
        </div>
      </div>
    </section>
  );
}

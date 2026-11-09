import Link from "@/components/navigation/Link";
import LandingTopNav from "@/components/landing/LandingTopNav";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { MonoLabel } from "@/components/ui/MonoLabel";
import { PixelGrid } from "@/components/ui/PixelGrid";
import { hero } from "@/lib/content/landing";

/**
 * Home hero (visual-redesign Phase 2). A text statement is the first thing a
 * visitor sees and the LCP element: no video, no animation on the heading.
 * The pixel card's Ember squares sit on Paper next to the "Live" chip label.
 * Server component; only the nav inside is interactive.
 */
export default function Hero() {
  return (
    <section
      aria-labelledby="home-hero-title"
      className="relative px-4 pt-32 pb-16 sm:px-6 md:pt-40 md:pb-24"
    >
      <LandingTopNav navId="mobile-nav" />

      <div className="mx-auto grid w-full max-w-6xl items-center gap-12 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-7">
          <MonoLabel>{hero.eyebrow}</MonoLabel>
          <h1
            id="home-hero-title"
            className="mt-5 font-display text-[clamp(2.5rem,1.4rem+3.2vw,4rem)] leading-[1.04] font-semibold tracking-[-0.045em] text-ink"
          >
            <span className="block">{hero.statement}</span>
            <span className="block text-ink-2">{hero.statementSecondary}</span>
          </h1>
          <p className="mt-6 max-w-xl text-lead text-ink-2">{hero.lead}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={hero.primaryCta.href}
              className="inline-flex min-h-12 items-center rounded-full bg-action px-6 text-sm font-medium text-on-action transition-colors hover:bg-action-hover"
            >
              {hero.primaryCta.label}
            </Link>
            <Link
              href={hero.secondaryCta.href}
              className="inline-flex min-h-12 items-center rounded-full border border-hairline-strong bg-surface px-6 text-sm font-medium text-ink transition-colors hover:bg-surface-tint"
            >
              {hero.secondaryCta.label}
            </Link>
          </div>
        </div>

        <div className="lg:col-span-5">
          <Card className="p-6 sm:p-8">
            <PixelGrid cols={14} rows={9} seed={2026} state="live" />
            <div className="mt-6">
              <Chip state="live">{hero.status}</Chip>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}

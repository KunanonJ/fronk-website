import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { HeroBackdrop } from "@/components/hero/HeroBackdrop";
import { HeroRecede } from "@/components/hero/HeroRecede";
import { StatusTicker } from "@/components/hud/StatusTicker";
import type { ResolvedHomePage } from "@/lib/content/homePage";

interface HeroProps {
  content: ResolvedHomePage;
}

// Honest "now" signals — every item is a real, already-published site claim.
const TICKER_ITEMS: readonly string[] = [
  "STATUS · SHIPPING",
  "BUILDING · GOGOCASH",
  "BUILDING · MANUT AI",
  "GOGOCASH · 1,000+ USERS",
  "GOGOCASH · 220+ MERCHANTS",
  "BASED IN BANGKOK",
];

export function Hero({ content }: HeroProps) {
  return (
    <section className="relative flex min-h-[88vh] flex-col overflow-hidden border-b border-border">
      <HeroBackdrop />

      <HeroRecede className="flex flex-1 items-center justify-center py-24">
        <Container size="lg">
          <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
            <span className="label-mono mb-9 border border-border bg-surface-2 px-3 py-1.5 text-muted">
              <span className="relative mr-1 flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping bg-accent opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 bg-accent" />
              </span>
              {content.heroEyebrow}
            </span>

            <h1 className="font-display text-display font-bold leading-[0.92] tracking-tight">
              {content.heroTitle}
              <span className="text-accent">.</span>
            </h1>

            <p className="mt-6 text-balance text-lg font-medium text-fg sm:text-xl">
              {content.heroTagline}
            </p>

            {content.heroIntro ? (
              <p className="mt-4 max-w-xl text-balance text-sm leading-relaxed text-muted">
                {content.heroIntro}
              </p>
            ) : (
              <p className="mt-4 max-w-xl text-balance text-sm leading-relaxed text-muted">
                Founder of{" "}
                <a
                  className="text-fg underline decoration-accent underline-offset-4 hover:text-accent"
                  href="https://gogocash.co"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GoGoCash
                </a>{" "}
                (cashback) and{" "}
                <a
                  className="text-fg underline decoration-accent underline-offset-4 hover:text-accent"
                  href="https://manut.xyz"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Manut AI
                </a>{" "}
                (AI workspaces for solo founders). I build the products and the
                unglamorous plumbing under them — from Bangkok.
              </p>
            )}

            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <Button href={content.primaryCta.href} size="lg">
                {content.primaryCta.label}
                <ArrowRight className="h-4 w-4" />
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
        </Container>
      </HeroRecede>

      <StatusTicker items={TICKER_ITEMS} />
    </section>
  );
}

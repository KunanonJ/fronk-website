import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { HeroCanvas } from "@/components/ui/HeroCanvas";
import type { ResolvedHomePage } from "@/lib/content/homePage";

interface HeroProps {
  content: ResolvedHomePage;
  personName: string;
}

export function Hero({ content, personName }: HeroProps) {
  return (
    <section className="relative overflow-hidden border-b border-border/60 py-24 sm:py-32">
      <HeroCanvas />
      <Container size="xl">
        <div className="grid items-center gap-12 md:grid-cols-[1fr_auto] md:gap-16">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-subtle/40 px-3 py-1 font-mono text-xs uppercase tracking-[0.16em] text-muted">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </span>
              {content.heroEyebrow}
            </div>

            <h1 className="text-5xl font-semibold tracking-tight sm:text-7xl">
              {content.heroTitle}
              <span className="text-accent">.</span>
            </h1>

            <p className="max-w-2xl text-2xl font-medium tracking-tight text-muted sm:text-3xl">
              {content.heroTagline}
            </p>

            {content.heroIntro ? (
              <p className="max-w-2xl text-base text-muted sm:text-lg">
                {content.heroIntro}
              </p>
            ) : (
              <p className="max-w-2xl text-base text-muted sm:text-lg">
                Founder of{" "}
                <a
                  className="text-fg underline decoration-accent decoration-2 underline-offset-4 hover:text-accent"
                  href="https://gogocash.co"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GoGoCash
                </a>{" "}
                and{" "}
                <a
                  className="text-fg underline decoration-accent decoration-2 underline-offset-4 hover:text-accent"
                  href="https://manut.xyz"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Manut AI
                </a>
                . Cashback, AI workspaces, and the unglamorous plumbing — all
                from Bangkok.
              </p>
            )}

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button href={content.primaryCta.href} size="lg">
                {content.primaryCta.label}
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button href={content.secondaryCta.href} variant="secondary" size="lg">
                {content.secondaryCta.label}
              </Button>
            </div>
          </div>

          <div className="order-first md:order-none">
            <div className="relative mx-auto h-44 w-44 sm:h-56 sm:w-56 md:h-64 md:w-64">
              <div
                aria-hidden
                className="absolute -inset-6 -z-10 rounded-full bg-gradient-to-br from-accent/40 via-emerald-500/15 to-transparent blur-3xl"
              />
              <div className="relative h-full w-full overflow-hidden rounded-2xl ring-1 ring-border">
                <Image
                  src="/profile.jpg"
                  alt={`${personName} — headshot`}
                  width={400}
                  height={400}
                  priority
                  loading="eager"
                  sizes="(min-width: 768px) 256px, (min-width: 640px) 224px, 176px"
                  className="h-full w-full object-cover"
                />
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/5"
                />
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { HeroCanvas } from "@/components/ui/HeroCanvas";
import type { ResolvedHomePage } from "@/lib/content/homePage";

interface HeroProps {
  content: ResolvedHomePage;
  personName: string;
}

export function Hero({ content, personName }: HeroProps) {
  return (
    <section className="relative overflow-hidden border-b-2 border-border py-24 sm:py-32">
      <HeroCanvas />
      <Container size="xl">
        <div className="grid items-center gap-12 md:grid-cols-[1fr_auto] md:gap-16">
          <div className="space-y-6">
            <Badge>
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping bg-accent-fg opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 bg-accent-fg" />
              </span>
              {content.heroEyebrow}
            </Badge>

            <h1 className="font-display text-6xl font-extrabold leading-[0.95] tracking-tight sm:text-8xl">
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
                className="absolute -right-3 -top-3 -z-10 h-full w-full border-brutal bg-accent"
              />
              <div className="relative h-full w-full overflow-hidden border-brutal bg-surface">
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
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

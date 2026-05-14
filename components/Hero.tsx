import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { siteConfig } from "@/lib/site";

export function Hero() {
  return (
    <section className="border-b border-border/60 py-24 sm:py-32">
      <Container size="xl">
        <div className="grid items-center gap-12 md:grid-cols-[1fr_auto] md:gap-16">
          <div className="space-y-8">
            <div className="flex items-center gap-2 text-sm text-muted">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              Currently building.
            </div>

            <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">
              {siteConfig.name.split(" ")[0]}
              <span className="text-accent">.</span>
              <br />
              <span className="text-muted">{siteConfig.tagline}</span>
            </h1>

            <p className="max-w-2xl text-lg text-muted">
              Founder of <a className="text-fg hover:text-accent" href="https://gogocash.co" target="_blank" rel="noopener noreferrer">GoGoCash</a>.
              Building fintech and adjacent infrastructure from Bangkok, with
              roots in smart contracts, AI, and Web3.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Button href="/ventures" size="lg">
                See ventures
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button href="/writing" variant="secondary" size="lg">
                Read writing
              </Button>
            </div>
          </div>

          <div className="order-first md:order-none">
            <div className="relative mx-auto h-44 w-44 overflow-hidden rounded-2xl ring-1 ring-border sm:h-56 sm:w-56 md:h-64 md:w-64">
              <Image
                src="/profile.jpg"
                alt={`${siteConfig.name} — headshot`}
                width={400}
                height={400}
                priority
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
      </Container>
    </section>
  );
}

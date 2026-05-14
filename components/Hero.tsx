import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { siteConfig } from "@/lib/site";

export function Hero() {
  return (
    <section className="border-b border-border/60 py-24 sm:py-32">
      <Container size="xl">
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
            I start companies and write about the work. Currently focused on
            infrastructure that lets small teams move at startup speed without
            paying the operational tax of larger ones.
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
      </Container>
    </section>
  );
}

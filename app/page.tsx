import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Hero } from "@/components/Hero";
import { VentureCard } from "@/components/VentureCard";
import { getFeaturedVentures } from "@/lib/content/ventures";
import { cssVar } from "@/lib/utils/cssVar";

export default function HomePage() {
  const featured = getFeaturedVentures(3);

  return (
    <>
      <Hero />

      <Container size="xl" as="section" className="py-20">
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted">
              ✦ Currently shipping
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Two bets. Both live.
            </h2>
          </div>
          <Link
            href="/ventures"
            className="hidden items-center gap-1 text-sm text-muted hover:text-fg sm:inline-flex"
          >
            See both <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((venture, i) => (
            <div
              key={venture.slug}
              className="animate-fade-up stagger"
              style={cssVar("--i", i)}
            >
              <VentureCard venture={venture} />
            </div>
          ))}
        </div>
      </Container>

      <Container size="xl" as="section" className="py-20">
        <div className="rounded-2xl border border-border bg-subtle/30 p-8 sm:p-12">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Currently writing
          </h2>
          <p className="mt-2 max-w-xl text-muted">
            Long-form notes on building from zero — fundraising, hiring,
            shipping, and the daily reality of running early-stage companies.
          </p>
          <div className="mt-6">
            <Link
              href="/writing"
              className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:underline"
            >
              Read the journal <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </Container>
    </>
  );
}

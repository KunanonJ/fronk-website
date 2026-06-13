import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Hero } from "@/components/Hero";
import { VentureCard } from "@/components/VentureCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { resolveHomePage } from "@/lib/content/homePage";
import {
  getFeaturedVentures,
  resolveFeaturedVentures,
} from "@/lib/content/ventures";
import { fetchFeaturedVentures, fetchHomePage } from "@/lib/sanity/fetch";
import { cssVar } from "@/lib/utils/cssVar";

export const revalidate = 60;

export default async function HomePage() {
  const [homeCms, venturesCms] = await Promise.all([
    fetchHomePage(),
    fetchFeaturedVentures(6),
  ]);

  const content = resolveHomePage(homeCms);
  const featured = resolveFeaturedVentures(
    venturesCms,
    getFeaturedVentures(content.featuredLimit),
    content.featuredLimit,
  );

  return (
    <>
      <Hero content={content} />

      <Container size="xl" as="section" className="py-20">
        <SectionHeader
          kicker={content.featuredSectionKicker}
          title={content.featuredSectionTitle}
          action={
            <Link
              href="/ventures"
              className="hidden items-center gap-1 text-sm text-muted underline decoration-transparent underline-offset-4 hover:text-fg hover:decoration-accent sm:inline-flex"
            >
              See both <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />

        <div className="grid gap-4 sm:grid-cols-2">
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

      <Container size="xl" as="section" className="pb-20">
        <Card className="p-8 sm:p-12">
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            {content.writingTitle}
          </h2>
          <p className="mt-3 max-w-xl text-muted">{content.writingDescription}</p>
          <div className="mt-6">
            <Button href={content.writingCta.href} variant="secondary">
              {content.writingCta.label}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      </Container>
    </>
  );
}

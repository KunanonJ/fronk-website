import { Container } from "@/components/ui/Container";
import { Hero } from "@/components/Hero";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SpecializationStatement } from "@/components/home/SpecializationStatement";
import { VentureCaseRow } from "@/components/home/VentureCaseRow";
import { WritingCallout } from "@/components/home/WritingCallout";
import { resolveHomePage } from "@/lib/content/homePage";
import {
  getFeaturedVentures,
  resolveFeaturedVentures,
} from "@/lib/content/ventures";
import { fetchFeaturedVentures, fetchHomePage } from "@/lib/sanity/fetch";

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

      <Container size="lg" as="section" className="py-24 sm:py-32">
        <SpecializationStatement
          eyebrow={content.specializationEyebrow}
          statement={content.specializationStatement}
          primaryCta={content.primaryCta}
          secondaryCta={content.secondaryCta}
        />
      </Container>

      <Container size="xl" as="section" className="pb-24 sm:pb-32">
        <SectionHeader
          kicker={content.featuredSectionKicker}
          title={content.featuredSectionTitle}
        />
        <div className="space-y-20 sm:space-y-28">
          {featured.map((venture, i) => (
            <VentureCaseRow key={venture.slug} venture={venture} index={i} />
          ))}
        </div>
      </Container>

      <Container size="xl" as="section" className="pb-24 sm:pb-32">
        <WritingCallout
          eyebrow="Journal"
          title={content.writingTitle}
          description={content.writingDescription}
          cta={content.writingCta}
        />
      </Container>
    </>
  );
}

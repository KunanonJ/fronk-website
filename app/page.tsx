import { Container } from "@/components/ui/Container";
import { Hero } from "@/components/Hero";
import { Reveal } from "@/components/ui/Reveal";
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

      <Container size="lg" as="section" className="py-16 sm:py-24 lg:py-32">
        <Reveal>
          <SpecializationStatement
            eyebrow={content.specializationEyebrow}
            statement={content.specializationStatement}
            primaryCta={content.primaryCta}
            secondaryCta={content.secondaryCta}
          />
        </Reveal>
      </Container>

      <Container size="xl" as="section" className="pb-16 sm:pb-24 lg:pb-32">
        <Reveal>
          <SectionHeader
            kicker={content.featuredSectionKicker}
            title={content.featuredSectionTitle}
          />
        </Reveal>
        <div className="space-y-20 sm:space-y-28">
          {featured.map((venture, i) => (
            <Reveal key={venture.slug}>
              <VentureCaseRow venture={venture} index={i} />
            </Reveal>
          ))}
        </div>
      </Container>

      <Container size="xl" as="section" className="pb-16 sm:pb-24 lg:pb-32">
        <Reveal>
          <WritingCallout
            eyebrow="Journal"
            title={content.writingTitle}
            description={content.writingDescription}
            cta={content.writingCta}
          />
        </Reveal>
      </Container>
    </>
  );
}

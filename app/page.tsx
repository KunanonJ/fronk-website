import { Container } from "@/components/ui/Container";
import { Hero } from "@/components/Hero";
import { IntroLoader } from "@/components/home/IntroLoader";
import { FeaturedWorkPreview } from "@/components/home/FeaturedWorkPreview";
import { NarrativeBlock } from "@/components/home/NarrativeBlock";
import { ThreeStepEngage } from "@/components/home/ThreeStepEngage";
import { AtmosphericCTA } from "@/components/home/AtmosphericCTA";
import { WritingCallout } from "@/components/home/WritingCallout";
import { HomeWorkStrip } from "@/components/work/WorkIndexList";
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
      <IntroLoader />
      <Hero content={content} />
      <FeaturedWorkPreview ventures={featured} />
      <NarrativeBlock />

      <Container size="xl" as="section" className="pb-8 sm:pb-12">
        <HomeWorkStrip
          ventures={featured}
          kicker={content.featuredSectionKicker}
          title={content.featuredSectionTitle}
        />
      </Container>

      <ThreeStepEngage />

      <AtmosphericCTA />

      <Container size="xl" as="section" className="pb-16 sm:pb-24 lg:pb-32">
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

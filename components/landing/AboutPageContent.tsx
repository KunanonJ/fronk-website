import { Bento, BentoRow } from "@/components/bento/Bento";
import ContributionActivity from "@/components/landing/ContributionActivity";
import {
  FaqCard,
  NextCard,
  NowCard,
  OperatingModelCard,
  PathCard,
  PrinciplesCard,
  StackCard,
  StoryCard,
} from "@/components/landing/about/AboutCards";

/**
 * The About bento below the hero (bento canvas, design spec 4.2), dense:
 * Story (2) | Selected path / How I work (3) / Now | Activity (2) /
 * Tech stack (3) / FAQ + Next side by side. Between 641 and 1023px the dense
 * flow pulls Now up beside Selected path.
 */
export default function AboutPageContent() {
  return (
    <Bento dense>
      <StoryCard />
      <PathCard />
      <PrinciplesCard />
      <NowCard />
      <ContributionActivity />
      <StackCard />
      <OperatingModelCard />
      <BentoRow>
        <FaqCard className="min-w-0 flex-[2_1_400px]" />
        <NextCard className="min-w-0 flex-[1_1_260px]" />
      </BentoRow>
    </Bento>
  );
}

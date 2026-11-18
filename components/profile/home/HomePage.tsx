import IntroLoader from "@/components/landing/IntroLoader";
import AboutBento from "@/components/profile/home/AboutBento";
import Hero from "@/components/profile/home/Hero";
import Journey from "@/components/profile/home/Journey";
import Notes from "@/components/profile/home/Notes";
import WorkStack from "@/components/profile/home/WorkStack";
import { ProfileMain } from "@/components/profile/site/ProfileMain";

/*
 * Home (profile redesign, design spec 8; live since the Phase 6 cutover): the
 * first-visit intro, then the hero with its canvas mock and logo strip
 * (Phase 2), the stacked work cards in article#work with GoGoCash's
 * id="ventures" (Phase 3), the About bento in section#about (Phase 3), the
 * Journey in section#journey (Phase 4) and the notebook, which renders only
 * with 3 or more cleared quotes (Phase 4). The sections keep their ids, which
 * the nav, its scrollspy and the anchor offsets use.
 */
export default function HomePage() {
  return (
    <ProfileMain>
      <IntroLoader />
      <Hero />
      <WorkStack />
      <AboutBento />
      <Journey />
      <Notes />
    </ProfileMain>
  );
}

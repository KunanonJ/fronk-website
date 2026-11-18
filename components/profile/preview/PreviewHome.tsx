import IntroLoader from "@/components/landing/IntroLoader";
import AboutBento from "@/components/profile/home/AboutBento";
import Hero from "@/components/profile/home/Hero";
import Journey from "@/components/profile/home/Journey";
import Notes from "@/components/profile/home/Notes";
import WorkStack from "@/components/profile/home/WorkStack";

/*
 * /preview: the chrome around empty, labelled Home sections. Each block is
 * filled by its phase: the sections keep their ids (#work, #about, #journey)
 * so the nav, the scrollspy and the anchor offsets are tested before the
 * content lands.
 */
export default function PreviewHome() {
  return (
    <>
      {/* Phase 2: the hero, its canvas mock and the logo strip, after the first-visit intro. */}

      <IntroLoader />
      <Hero />

      {/* Phase 3: the stacked work cards, in article#work. */}

      <WorkStack />

      {/* Phase 3: the About bento, in section#about. */}

      <AboutBento />

      {/* Phase 4: the Journey and its story, in section#journey; then the notebook, which renders only with 3 or more cleared quotes. */}

      <Journey />
      <Notes />
    </>
  );
}

import { EyebrowRow } from "@/components/ds/labels";
import IntroLoader from "@/components/landing/IntroLoader";
import Hero from "@/components/profile/home/Hero";

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

      {/* Phase 3: the stacked work cards, in section#work. */}

      <section
        id="work"
        aria-labelledby="work-title"
        className="ds-wrap min-h-[120svh] pt-28 lg:pt-36"
      >
        <EyebrowRow>Phase 3</EyebrowRow>
        <h2 id="work-title" className="t-title mt-6">
          Work
        </h2>
      </section>

      {/* Phase 3: the About bento, in section#about. */}

      <section
        id="about"
        aria-labelledby="about-title"
        className="ds-wrap min-h-[120svh] pt-32 tablet:pt-44"
      >
        <EyebrowRow>Phase 3</EyebrowRow>
        <h2 id="about-title" className="t-title mt-6">
          About
        </h2>
      </section>

      {/* Phase 4: the Journey and the notes, in section#journey. */}

      <section
        id="journey"
        aria-labelledby="journey-title"
        className="ds-wrap min-h-[120svh] pt-28"
      >
        <EyebrowRow>Phase 4</EyebrowRow>
        <h2 id="journey-title" className="t-title mt-6">
          Journey
        </h2>
      </section>
    </>
  );
}

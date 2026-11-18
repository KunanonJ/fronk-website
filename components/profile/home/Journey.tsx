import { Pill } from "@/components/ds/Pill";
import { Orbit } from "@/components/profile/home/Orbit";
import { SectionHeader } from "@/components/profile/home/SectionHeader";
import { Story } from "@/components/profile/home/Story";
import { journeyCopy } from "@/lib/content/homeJourney";

/*
 * The Home's Journey, `section#journey` (profile redesign Phase 4, design
 * spec 8.6): a stage with the washes, the tool orbit and the centred copy
 * (eyebrow, h2 at 9ch, lead, a ghost pill to the story), then `#story` with
 * the records card. Styles: `.pf-journey*`, `.pf-orbit*`, `.pf-story*` and
 * `.pf-records*` in src/styles/profile/home-journey.css.
 */
export default function Journey() {
  return (
    <section
      id="journey"
      aria-labelledby="journey-title"
      className="pf-journey"
    >
      <Orbit>
        <SectionHeader
          align="centred"
          rule={false}
          eyebrow={journeyCopy.eyebrow}
          title={journeyCopy.heading}
          titleId="journey-title"
          titleMaxWidth={9}
          lead={journeyCopy.lead}
          leadSize="lead"
          className="pf-journey__head"
        />
        <Pill
          href="#story"
          variant="ghost"
          size="sm"
          className="pf-journey__more"
        >
          {journeyCopy.storyLink}
        </Pill>
      </Orbit>
      <Story />
    </section>
  );
}

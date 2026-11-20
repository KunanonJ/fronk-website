import { Pill } from "@/components/ds/Pill";
import { Orbit } from "@/components/profile/home/Orbit";
import { SectionHeader } from "@/components/profile/home/SectionHeader";
import { Story } from "@/components/profile/home/Story";
import { journeyCopy } from "@/lib/content/homeJourney";

/*
 * The Home's Journey, `section#journey` (profile redesign Phase 4, design
 * spec 8.6): a stage with the washes, the tool orbit and the centred copy
 * (eyebrow, h2, lead, a ghost pill to the story), then `#story` with the
 * records card. The h2's 16ch holds "From smart contracts" on one line, so
 * it sets in two lines; the spec's 9ch stacked it in four, one word to the
 * last (UX sweep 21-11-26). On phones the ring leaves it three lines
 * (home-journey.css). Styles: `.pf-journey*`, `.pf-orbit*`, `.pf-story*`
 * and `.pf-records*` in src/styles/profile/home-journey.css.
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
          titleMaxWidth={16}
          lead={journeyCopy.lead}
          leadSize="lead"
          className="pf-journey__head"
          actions={
            <Pill
              href="#story"
              variant="ghost"
              size="sm"
              className="pf-journey__more"
            >
              {journeyCopy.storyLink}
            </Pill>
          }
        />
      </Orbit>
      <Story />
    </section>
  );
}

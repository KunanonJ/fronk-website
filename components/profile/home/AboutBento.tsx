import { MessTile } from "@/components/profile/home/MessTile";
import { MotionTile } from "@/components/profile/home/MotionTile";
import { PrincipleTile } from "@/components/profile/home/PrincipleTile";
import { SectionHeader } from "@/components/profile/home/SectionHeader";
import { StatsTile } from "@/components/profile/home/StatsTile";
import Link from "@/components/navigation/Link";
import type { AboutInline } from "@/lib/content/aboutPage";
import { aboutCopy } from "@/lib/content/homeWorkAbout";
import { keepNamesWhole } from "@/lib/content/keepWhole";
import { aboutStats, statsFootnote } from "@/lib/landing/aboutStats";

/*
 * The About bento (profile redesign Phase 3, design spec 8.5 and 10.1): a
 * section named "About" by its eyebrow, then a grid of tiles. One column
 * under 600 px; two from 600 (the wide tiles full width, the principles two
 * by two); twelve from 810 with every tile at span 6; and from 1024 the
 * spans 7 + 5, 7 + 5 and 3 + 3 + 3 + 3 (home-work-about.css). Every tile
 * starts with an h3, shown or for assistive technology only (WCAG 1.3.1).
 */

const STATS = aboutStats();
const STATS_FOOTNOTE = statsFootnote(STATS);

/**
 * A link inside the story's sentences. The new-tab note sits in the visually
 * hidden span with its own leading space, so no underlined gap shows before
 * the punctuation that follows the link (spec 6.10, 12 item 17).
 */
function StoryLink({ span }: { span: Extract<AboutInline, { type: "link" }> }) {
  const text = keepNamesWhole(span.text);
  if (span.external) {
    return (
      <a
        href={span.href}
        target="_blank"
        rel="noopener"
        className="ds-prose-link"
      >
        {text}
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    );
  }
  return (
    <Link href={span.href} className="ds-prose-link">
      {text}
    </Link>
  );
}

/**
 * The "In short" tile: today's About story, its links included, its names
 * unbroken on phones (keepWhole.ts).
 */
function BriefTile() {
  return (
    <div className="ds-tile pf-bento__tile pf-bento__brief">
      <h3 className="t-meta pf-tile__label">{aboutCopy.briefLabel}</h3>
      <div className="t-lead pf-brief">
        {aboutCopy.brief.map((paragraph, index) => (
          <p key={index}>
            {paragraph.spans.map((span, at) =>
              span.type === "text" ? (
                keepNamesWhole(span.text)
              ) : (
                <StoryLink key={at} span={span} />
              ),
            )}
          </p>
        ))}
      </div>
    </div>
  );
}

/**
 * `id` is "about", Home's section for the nav. /about renders the bento
 * without the four principles (`principles={false}`): its "How I ship"
 * heads each stage with one, beside its skills and the work that shows it,
 * and that stage list carries the "principles" anchor /learn links (UX
 * sweep 21-11-26).
 */
export default function AboutBento({
  id = "about",
  principles = true,
}: {
  id?: string;
  principles?: boolean;
}) {
  return (
    <section
      id={id}
      aria-labelledby="about-eyebrow"
      className="pf-about ds-wrap"
    >
      <SectionHeader
        eyebrow={aboutCopy.eyebrow}
        eyebrowId="about-eyebrow"
        title={aboutCopy.heading}
        titleId="about-title"
        lead={aboutCopy.lead}
        titleMaxWidth={10}
      />
      <div className="pf-bento">
        <BriefTile />
        <MessTile
          heading={aboutCopy.mess.heading}
          chips={aboutCopy.mess.chips}
          line={aboutCopy.mess.line}
        />
        <StatsTile
          stats={STATS}
          heading={aboutCopy.stats.heading}
          footnote={STATS_FOOTNOTE}
        />
        <MotionTile
          caption={aboutCopy.motion.caption}
          labels={{
            pause: aboutCopy.motion.pause,
            play: aboutCopy.motion.play,
          }}
        />
        {principles
          ? aboutCopy.principles.map((principle, index) => (
              <PrincipleTile
                key={principle.title}
                index={index}
                title={principle.title}
                body={principle.body}
              />
            ))
          : null}
      </div>
    </section>
  );
}

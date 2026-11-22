import type { ShareTarget } from "@/components/bento/ShareRows";
import { StatusDot } from "@/components/ds/labels";
import { Reveal } from "@/components/ds/Reveal";
import { PageHero } from "@/components/profile/pages/PageHero";
import {
  EarlierCard,
  LearningCard,
  NowCard,
  ProjectsCard,
  ShareCard,
  SkillsCard,
  TimelineCard,
} from "@/components/resume/ResumeCards";
import type { ResumeProfileView } from "@/components/resume/ResumePrint";
import { ResumeSnapshot } from "@/components/resume/ResumeSnapshot";
import { AVAILABILITY } from "@/lib/content/availability";
import type { HeadlinePart } from "@/lib/content/corePages";
import { keepNamesWhole } from "@/lib/content/keepWhole";
import { RESUME_META } from "@/lib/resume/search";
import { resumeHeadline, resumeLayout } from "@/lib/resume/view";
import { TITLE_SUFFIX } from "@/lib/seo/pageTitle";
import { siteConfig } from "@/lib/site";
import resumeCss from "@/src/styles/resume.css?url";

/** What the Share card shares: the page's head() title and canonical URL. */
const SHARE_TARGET: ShareTarget = {
  title: `${RESUME_META.title}${TITLE_SUFFIX}`,
  url: new URL(RESUME_META.path, siteConfig.url).href,
};

/**
 * The h1's lines from the name and the headline, word for word the live
 * page's (the parity gate reads it): the name with the first sentence muted,
 * the middle sentences, then the last in the italic accent.
 */
function headlineLines(name: string, headline: string) {
  const { name: full, muted, middle, accent } = resumeHeadline(name, headline);
  const first: HeadlinePart[] = [{ text: full }];
  if (muted) first.push({ text: muted, tone: "muted" });
  return [
    first,
    ...middle.map((line): HeadlinePart[] => [{ text: line }]),
    ...(accent ? [[{ text: accent, tone: "accent" as const }]] : []),
  ];
}

/**
 * Résumé on screen ("Snapshot", now-building program phase 2, 20-11-26):
 * recruiter first. The first screen holds the h1, the availability line and
 * the facts card (Download PDF, Contact, what he is building, where he is,
 * how to reach him) beside the summary from 1024 px; on phones the card
 * comes before the summary, so Download PDF is on the first screen. Then
 * Building now, the roles as one timeline, independent projects, skills,
 * education and training, the earlier entries folded, and Share. Sections
 * rise in under no-preference only (Reveal). Both parts are hidden in print;
 * ResumePrint, unchanged and plain, is what `pnpm pdf` renders. Its
 * stylesheet (src/styles/resume.css) is linked here, so no other page loads
 * it.
 */
export default function ResumePage({
  profile,
}: {
  profile: ResumeProfileView;
}) {
  const layout = resumeLayout(profile.sections);

  return (
    <>
      <link rel="stylesheet" href={resumeCss} precedence="pf-resume" />
      <PageHero
        data-print-hide
        className="pf-resume-hero"
        eyebrow="Résumé"
        lines={headlineLines(profile.name, profile.headline)}
        titleClassName="pf-resume__title"
        aside={<ResumeSnapshot name={profile.name} now={layout.now} />}
        after={
          <p className="t-lead pf-page-hero__lead pf-resume__lead">
            {keepNamesWhole(profile.summary)}
          </p>
        }
      >
        <p className="pf-resume__availability">
          <StatusDot plain />
          <span>
            {AVAILABILITY.pill.label}{" "}
            <span className="pf-cat-note">· {AVAILABILITY.pill.detail}</span>
          </span>
        </p>
      </PageHero>

      <div data-print-hide className="ds-wrap pf-cat-section pf-resume-body">
        <div className="pf-resume">
          {layout.now ? (
            <Reveal>
              <NowCard section={layout.now} />
            </Reveal>
          ) : null}
          {layout.roles.map((section) => (
            <Reveal key={section.title}>
              <TimelineCard section={section} />
            </Reveal>
          ))}
          {layout.projects.map((section) => (
            <Reveal key={section.title}>
              <ProjectsCard section={section} />
            </Reveal>
          ))}
          <Reveal>
            <SkillsCard skills={profile.skills} />
          </Reveal>
          {layout.learning.length > 0 ? (
            <Reveal>
              <div className="pf-resume__pair">
                {layout.learning.map((section) => (
                  <LearningCard key={section.title} section={section} />
                ))}
              </div>
            </Reveal>
          ) : null}
          {layout.earlier.length > 0 ? (
            <Reveal>
              <EarlierCard sections={layout.earlier} />
            </Reveal>
          ) : null}
          <Reveal>
            <ShareCard target={SHARE_TARGET} />
          </Reveal>
        </div>
      </div>
    </>
  );
}

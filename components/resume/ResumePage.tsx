import { Bento, BentoRow } from "@/components/bento/Bento";
import { CtaLink } from "@/components/bento/Buttons";
import { EyebrowChip } from "@/components/bento/Chips";
import { DownloadIcon } from "@/components/bento/icons";
import { Segmented } from "@/components/bento/Segmented";
import SharePill from "@/components/bento/SharePill";
import type { ShareTarget } from "@/components/bento/ShareRows";
import type { ResumeProfileView } from "@/components/resume/ResumePrint";
import {
  RESUME_PDF,
  ResumeSectionCard,
  ShareCard,
  SkillsCard,
} from "@/components/resume/ResumeCards";
import {
  RESUME_DETAILS,
  RESUME_META,
  type ResumeDetail,
} from "@/lib/resume/search";
import { resumeHeadline } from "@/lib/resume/view";
import { TITLE_SUFFIX } from "@/lib/seo/pageTitle";
import { siteConfig } from "@/lib/site";
import { PageTitle, HeroLead } from "@/components/bento/PageHero";

const DETAIL_LABELS: Record<ResumeDetail, string> = {
  detailed: "Detailed",
  compact: "Compact",
};

/** What the Share card shares: the page's head() title and canonical URL. */
const SHARE_TARGET: ShareTarget = {
  title: `${RESUME_META.title}${TITLE_SUFFIX}`,
  url: new URL(RESUME_META.path, siteConfig.url).href,
};

/**
 * Résumé on screen (bento redesign, phase 7b; design spec 4.4): the hero
 * with Download PDF, Share and the Detailed / Compact control, then one dense
 * bento of the CMS sections, Skills and Share. Both parts are hidden in
 * print; ResumePrint is what `pnpm pdf` renders.
 */
export default function ResumePage({
  profile,
  detail,
  onDetailChange,
}: {
  profile: ResumeProfileView;
  detail: ResumeDetail;
  onDetailChange: (detail: ResumeDetail) => void;
}) {
  const headline = resumeHeadline(profile.name, profile.headline);

  return (
    <>
      <section
        data-print-hide
        aria-labelledby="hero-title"
        className="flex flex-col gap-6"
      >
        <EyebrowChip>Résumé</EyebrowChip>
        <PageTitle>
          <span className="block">
            {headline.name}
            {headline.muted ? (
              <>
                {" "}
                <span className="text-ink-3">{headline.muted}</span>
              </>
            ) : null}
          </span>
          {headline.middle.map((line) => (
            <span key={line} className="block">
              {" "}
              {line}
            </span>
          ))}
          {headline.accent ? (
            <span className="block text-mark"> {headline.accent}</span>
          ) : null}
        </PageTitle>
        <HeroLead>{profile.summary ?? RESUME_META.description}</HeroLead>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <CtaLink href={RESUME_PDF}>
              <DownloadIcon />
              <span>Download PDF</span>
            </CtaLink>
            <SharePill />
          </div>
          <Segmented
            label="Résumé detail"
            tone="surface"
            value={detail}
            onChange={onDetailChange}
            options={RESUME_DETAILS.map((value) => ({
              value,
              label: DETAIL_LABELS[value],
            }))}
          />
        </div>
      </section>

      <Bento dense data-print-hide>
        {profile.sections.map((section) => (
          <ResumeSectionCard
            key={section.title}
            section={section}
            detail={detail}
          />
        ))}
        <BentoRow>
          <SkillsCard
            skills={profile.skills}
            className="min-w-0 flex-[2_1_560px]"
          />
          <ShareCard
            target={SHARE_TARGET}
            className="min-w-0 flex-[1_1_280px]"
          />
        </BentoRow>
      </Bento>
    </>
  );
}

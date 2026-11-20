import Link from "@/components/navigation/Link";
import { DownloadIcon } from "@/components/bento/icons";
import SharePill from "@/components/bento/SharePill";
import type { ShareTarget } from "@/components/bento/ShareRows";
import { StatusDot } from "@/components/ds/labels";
import { pillClass } from "@/components/ds/Pill";
import { ToggleGroup } from "@/components/profile/catalog/ToggleGroup";
import { PageHero } from "@/components/profile/pages/PageHero";
import type { ResumeProfileView } from "@/components/resume/ResumePrint";
import {
  ResumeSectionCard,
  ShareCard,
  SkillsCard,
} from "@/components/resume/ResumeCards";
import {
  AVAILABILITY,
  RESUME_PDF_HREF,
  RESUME_PDF_NAME,
  WORK_CONTACT_HREF,
} from "@/lib/content/availability";
import type { HeadlinePart } from "@/lib/content/corePages";
import {
  RESUME_DETAILS,
  RESUME_META,
  type ResumeDetail,
} from "@/lib/resume/search";
import { resumeHeadline } from "@/lib/resume/view";
import { TITLE_SUFFIX } from "@/lib/seo/pageTitle";
import { siteConfig } from "@/lib/site";

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
 * Résumé on screen (profile redesign Phase 7e; plan step 7e): the hero on the
 * pixel sky with the summary, the availability line, Download PDF, Contact,
 * Share and the Detailed / Compact switch, then the sections in the records
 * card's style (spec 8.6), Skills and Share. Both parts are hidden in print;
 * ResumePrint, unchanged and plain, is what `pnpm pdf` renders. Styles:
 * `.pf-resume*` in src/styles/profile/pages-catalog.css.
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
  return (
    <>
      <PageHero
        data-print-hide
        eyebrow="Résumé"
        lines={headlineLines(profile.name, profile.headline)}
        titleClassName="pf-resume__title"
        lead={profile.summary}
      >
        <p className="pf-resume__availability">
          <StatusDot plain />
          <span>
            {AVAILABILITY.pill.label}{" "}
            <span className="pf-cat-note">· {AVAILABILITY.pill.detail}</span>
          </span>
        </p>
        <div className="pf-cat-hero__actions pf-resume__actions">
          {/* Full width on phones (pages-catalog.css). */}
          <a
            href={RESUME_PDF_HREF}
            download={RESUME_PDF_NAME}
            className={`${pillClass({ size: "lg" })} pf-resume__pdf`}
          >
            <span className="ds-pill__icon" aria-hidden="true">
              <DownloadIcon />
            </span>
            <span>Download PDF</span>
          </a>
          <Link
            href={WORK_CONTACT_HREF}
            className={pillClass({ variant: "ghost", size: "lg" })}
          >
            Contact
          </Link>
          <SharePill />
        </div>
        <ToggleGroup
          label="Résumé detail"
          value={detail}
          onChange={onDetailChange}
          options={RESUME_DETAILS.map((value) => ({
            value,
            label: DETAIL_LABELS[value],
          }))}
          className="pf-resume__detail"
        />
      </PageHero>

      <div data-print-hide className="ds-wrap pf-cat-section pf-cat-end">
        <div className="pf-resume">
          {profile.sections.map((section) => (
            <ResumeSectionCard
              key={section.title}
              section={section}
              detail={detail}
            />
          ))}
          <SkillsCard skills={profile.skills} />
          <ShareCard target={SHARE_TARGET} />
        </div>
      </div>
    </>
  );
}

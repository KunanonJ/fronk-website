import type { ReactNode } from "react";
import Link from "@/components/navigation/Link";
import { BentoCard, CardLink, type BentoSpan } from "@/components/bento/Bento";
import { CtaLink } from "@/components/bento/Buttons";
import { DownloadIcon } from "@/components/bento/icons";
import ShareRows, {
  shareUrlLabel,
  type ShareTarget,
} from "@/components/bento/ShareRows";
import { CompanyLogo } from "@/components/CompanyLogo";
import type {
  ResolvedTimelineItem,
  ResolvedTimelineSection,
  ResumeSkillGroup,
} from "@/lib/content/resumeProfile";
import {
  isLiveBullet,
  linkLabel,
  resumeSectionKind,
  rowWeight,
  sectionSlug,
  splitColumns,
  visibleBullets,
} from "@/lib/resume/view";
import type { ResumeDetail } from "@/lib/resume/search";
import { cn } from "@/lib/utils/cn";
import { pad2 } from "@/lib/utils/pad2";

/*
 * Résumé bento cards (bento canvas, design spec 4.4). Every section comes
 * from the résumé data in the repo (or from Sanity, if a résumé document is
 * ever created) and is drawn by its title: Currently, Experience,
 * Independent projects, University-era, Education, Affiliations and Training
 * (or Certifications) have canvas cards; any other section reads as roles.
 * `detail` "compact" hides the bullet lists. Screen only: print uses
 * ResumePrint.
 */

export const RESUME_PDF = "/resume.pdf";

/** The name a download saves under, so a recruiter can find the file again. */
export const RESUME_PDF_NAME = "Kunanon-Jarat-Resume.pdf";

/** One line under the organisation: a project's description, or an overlap. */
function Note({
  item,
  className,
}: {
  item: ResolvedTimelineItem;
  className: string;
}) {
  if (!item.note) return null;
  return (
    <p className={cn("mb-0 leading-[1.45] text-ink-2", className)}>
      {item.note}
    </p>
  );
}

function Bullets({
  bullets,
  className,
}: {
  bullets: readonly string[];
  className?: string;
}) {
  if (bullets.length === 0) return null;
  return (
    <ul className={cn("m-0 flex list-none flex-col gap-1.5 p-0", className)}>
      {bullets.map((bullet) => (
        <li
          key={bullet}
          className="flex gap-2.5 text-sm leading-normal text-ink-2"
        >
          {isLiveBullet(bullet) ? (
            // Live marker: Ember on a ring of surface, since the wells are page-coloured.
            <span
              aria-hidden
              className="mt-2 size-1.5 shrink-0 bg-ember shadow-[0_0_0_2px_var(--surface)]"
            />
          ) : (
            <span aria-hidden className="mt-[9px] size-1 shrink-0 bg-ink-2" />
          )}
          <span>{bullet}</span>
        </li>
      ))}
    </ul>
  );
}

function Logo({ item, size }: { item: ResolvedTimelineItem; size: number }) {
  return (
    <CompanyLogo
      name={item.logoName ?? item.org}
      domain={item.logoDomain}
      src={item.logoSrc}
      size={size}
      tile
    />
  );
}

/** The item title, linked when the résumé gives it a URL. */
function ItemTitle({ item }: { item: ResolvedTimelineItem }) {
  if (!item.href) return <>{item.title}</>;
  return (
    <Link
      href={item.href}
      className="text-ink underline decoration-hairline-strong underline-offset-4"
    >
      {item.title}
    </Link>
  );
}

const PERIOD = "font-mono text-xs text-ink-2";

/**
 * Currently and Independent projects: wells with a logo, the period, bullets
 * and links (the entry's own site, and its page on this site).
 */
function CurrentRoles({
  items,
  detail,
}: {
  items: readonly ResolvedTimelineItem[];
  detail: ResumeDetail;
}) {
  return (
    <ol className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-3 p-0">
      {items.map((item) => (
        <li
          key={`${item.title}-${item.org}`}
          className="flex flex-col gap-3.5 rounded-well border border-hairline bg-page px-4 pt-4 pb-[18px]"
        >
          <div className="flex items-center justify-between gap-3">
            <Logo item={item} size={44} />
            <span className={cn(PERIOD, "text-right")}>{item.period}</span>
          </div>
          <div>
            <h3 className="m-0 text-[17px] leading-[1.3] font-semibold tracking-[-0.01em]">
              {item.title}
            </h3>
            <p className="mt-1 mb-0 text-meta leading-[1.45] text-ink-2">
              {item.org}
            </p>
            <Note item={item} className="mt-2 text-meta" />
          </div>
          <Bullets bullets={visibleBullets(item, detail)} />
          {item.href || item.more ? (
            <div className="mt-auto flex flex-wrap gap-x-5">
              {item.href ? (
                <CardLink href={item.href}>{linkLabel(item.href)} →</CardLink>
              ) : null}
              {item.more ? (
                <CardLink href={item.more.href}>{item.more.label} →</CardLink>
              ) : null}
            </div>
          ) : null}
        </li>
      ))}
    </ol>
  );
}

/** A role row: logo and running number, title and period, org, bullets. */
function RoleList({
  items,
  start,
  detail,
}: {
  items: readonly ResolvedTimelineItem[];
  start: number;
  detail: ResumeDetail;
}) {
  return (
    <ol start={start + 1} className="m-0 list-none p-0">
      {items.map((item, i) => (
        <li
          key={`${item.title}-${item.org}-${item.period}`}
          className="flex gap-3.5 border-t border-hairline py-4"
        >
          <span
            aria-hidden
            className="flex w-10 shrink-0 flex-col items-center gap-2"
          >
            <Logo item={item} size={40} />
            <span className={PERIOD}>{pad2(start + i + 1)}</span>
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5">
              <h3 className="m-0 text-base leading-[1.35] font-semibold">
                <ItemTitle item={item} />
              </h3>
              <span className={cn(PERIOD, "whitespace-nowrap")}>
                {item.period}
              </span>
            </div>
            <p className="mt-0.5 mb-0 text-sm leading-[1.45] text-ink-2">
              {item.org}
            </p>
            <Note item={item} className="mt-0.5 text-sm" />
            <Bullets
              bullets={visibleBullets(item, detail)}
              className="mt-2.5"
            />
          </div>
        </li>
      ))}
    </ol>
  );
}

/** A credential row (affiliations, certifications): no period column. */
function CredentialList({
  items,
  start,
  detail,
}: {
  items: readonly ResolvedTimelineItem[];
  start: number;
  detail: ResumeDetail;
}) {
  return (
    <ol start={start + 1} className="m-0 list-none p-0">
      {items.map((item, i) => (
        <li
          key={`${item.title}-${item.org}-${item.period}`}
          className="flex gap-3.5 border-t border-hairline py-4"
        >
          <span
            aria-hidden
            className="flex w-10 shrink-0 flex-col items-center gap-2"
          >
            <Logo item={item} size={40} />
            <span className={PERIOD}>{pad2(start + i + 1)}</span>
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <h3 className="m-0 text-card leading-[1.35] font-semibold">
              <ItemTitle item={item} />
            </h3>
            <p className="m-0 text-sm leading-[1.45] text-ink-2">{item.org}</p>
            <p className={cn(PERIOD, "mt-0.5 mb-0")}>{item.period}</p>
            <Bullets bullets={visibleBullets(item, detail)} className="mt-2" />
          </div>
        </li>
      ))}
    </ol>
  );
}

/**
 * Two list columns side by side from 641px (not a bento-2: they never lift),
 * split where their heights are closest.
 */
function TwoColumns({
  items,
  detail,
  List,
  gap,
}: {
  items: readonly ResolvedTimelineItem[];
  detail: ResumeDetail;
  List: typeof RoleList;
  gap: string;
}) {
  const [left, right] = splitColumns(items, (item) => rowWeight(item, detail));
  return (
    <div className={cn("grid grid-cols-1 min-[641px]:grid-cols-2", gap)}>
      <List items={left} start={0} detail={detail} />
      <List items={right} start={left.length} detail={detail} />
    </div>
  );
}

/** Education: the degree with a larger logo, period and highlights. */
function EducationItems({
  items,
  detail,
}: {
  items: readonly ResolvedTimelineItem[];
  detail: ResumeDetail;
}) {
  return items.map((item, i) => (
    <div
      key={`${item.title}-${item.org}`}
      className={cn(
        "flex flex-col gap-4",
        i > 0 && "border-t border-hairline pt-4",
      )}
    >
      <div className="mt-1 flex items-center justify-between gap-3">
        <Logo item={item} size={52} />
        <span className={cn(PERIOD, "text-right")}>{item.period}</span>
      </div>
      <div>
        <h3 className="m-0 text-lg leading-[1.3] font-semibold tracking-[-0.01em]">
          <ItemTitle item={item} />
        </h3>
        <p className="mt-1 mb-0 text-sm leading-[1.45] text-ink-2">
          {item.org}
        </p>
      </div>
      <Bullets bullets={visibleBullets(item, detail)} />
    </div>
  ));
}

type Layout = {
  span: BentoSpan;
  gap: 2.5 | 4;
  className?: string;
  body: (
    items: readonly ResolvedTimelineItem[],
    detail: ResumeDetail,
  ) => ReactNode;
};

const LAYOUTS: Record<ReturnType<typeof resumeSectionKind>, Layout> = {
  current: {
    span: 3,
    gap: 4,
    body: (items, detail) => <CurrentRoles items={items} detail={detail} />,
  },
  roles: {
    span: 3,
    gap: 2.5,
    body: (items, detail) => (
      <TwoColumns
        items={items}
        detail={detail}
        List={RoleList}
        gap="gap-x-10"
      />
    ),
  },
  // University-era: columns 2-3 over two rows beside Education and
  // Affiliations on desktop; full width from 641 to 1023px (spec gap 23:
  // the canvas's `2 / span 2` there made an implicit third column).
  early: {
    span: 2,
    gap: 2.5,
    className: "lg:col-[2/span_2] lg:row-span-2",
    body: (items, detail) => (
      <RoleList items={items} start={0} detail={detail} />
    ),
  },
  education: {
    span: 1,
    gap: 4,
    body: (items, detail) => <EducationItems items={items} detail={detail} />,
  },
  list: {
    span: 1,
    gap: 2.5,
    body: (items, detail) => (
      <CredentialList items={items} start={0} detail={detail} />
    ),
  },
  credentials: {
    span: 2,
    gap: 2.5,
    body: (items, detail) => (
      <TwoColumns
        items={items}
        detail={detail}
        List={CredentialList}
        gap="gap-x-8"
      />
    ),
  },
};

/** One résumé section as its canvas card. */
export function ResumeSectionCard({
  section,
  detail,
}: {
  section: ResolvedTimelineSection;
  detail: ResumeDetail;
}) {
  const layout = LAYOUTS[resumeSectionKind(section.title)];
  return (
    <BentoCard
      headingId={`card-${sectionSlug(section.title)}`}
      title={section.title}
      span={layout.span}
      gap={layout.gap}
      minHeight={false}
      className={layout.className}
    >
      {layout.body(section.items, detail)}
    </BentoCard>
  );
}

/** Skills: the labelled groups, one chip per skill. */
export function SkillsCard({
  skills,
  className,
}: {
  skills: readonly ResumeSkillGroup[];
  className?: string;
}) {
  return (
    <BentoCard
      headingId="card-skills"
      title="Skills"
      minHeight={false}
      className={className}
    >
      <div className="flex flex-col gap-4">
        {skills.map((group) => (
          <div key={group.label} className="flex flex-col gap-2">
            <h3 className="m-0 font-mono text-label uppercase text-ink-2">
              {group.label}
            </h3>
            <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
              {group.items.map((skill) => (
                <li
                  key={skill}
                  className="inline-flex min-h-10 items-center rounded-full border border-hairline-strong bg-page px-4 text-sm font-medium"
                >
                  {skill}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </BentoCard>
  );
}

/** Share: the header panel's actions inline, then the PDF download. */
export function ShareCard({
  target,
  className,
}: {
  target: ShareTarget;
  className?: string;
}) {
  return (
    <BentoCard
      headingId="card-share"
      title="Share"
      gap={3}
      minHeight={false}
      className={className}
    >
      <div className="px-3 pt-0.5">
        <p className="m-0 text-card leading-[1.35] font-semibold">
          {target.title}
        </p>
        <p className="mt-0.5 mb-0 font-mono text-xs text-ink-2">
          {shareUrlLabel(target.url)}
        </p>
      </div>
      <div className="flex flex-col gap-0.5">
        <ShareRows target={target} />
      </div>
      <CtaLink href={RESUME_PDF} download={RESUME_PDF_NAME} className="mt-auto">
        <DownloadIcon />
        <span>Download PDF</span>
      </CtaLink>
    </BentoCard>
  );
}

import type { ReactNode } from "react";
import Link from "@/components/navigation/Link";
import { DownloadIcon } from "@/components/bento/icons";
import ShareRows, {
  shareUrlLabel,
  type ShareTarget,
} from "@/components/bento/ShareRows";
import { CompanyLogo } from "@/components/CompanyLogo";
import { pillClass } from "@/components/ds/Pill";
import { TextLink } from "@/components/ds/TextLink";
import { RESUME_PDF_HREF, RESUME_PDF_NAME } from "@/lib/content/availability";
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
 * Résumé sections in the records card's style (profile redesign Phase 7e;
 * design spec 8.6): paper 2, a mono heading, and rows of the title, the
 * organisation and the period. Every section comes from the résumé data in
 * the repo (or from Sanity, if a résumé document is ever created) and is
 * drawn by its title: Currently, Experience, Independent projects,
 * University-era, Education, Affiliations and Training (or Certifications)
 * have their layouts; any other section reads as roles. `detail` "compact"
 * hides the bullet lists. Screen only: print uses ResumePrint. Styles:
 * `.pf-resume*` in src/styles/profile/pages-catalog.css.
 */

/** One line under the organisation: a project's description, or an overlap. */
function Note({ item }: { item: ResolvedTimelineItem }) {
  if (!item.note) return null;
  return <p className="pf-resume__note">{item.note}</p>;
}

function Bullets({ bullets }: { bullets: readonly string[] }) {
  if (bullets.length === 0) return null;
  return (
    <ul className="pf-resume__bullets">
      {bullets.map((bullet) => (
        <li key={bullet} className="pf-resume__bullet">
          {/* A live product: the coral square; anything else: a plain one. */}
          <span
            aria-hidden
            className={
              isLiveBullet(bullet) ? "pf-resume__live" : "pf-resume__mark"
            }
          />
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
    <Link href={item.href} className="pf-resume__title-link">
      {item.title}
    </Link>
  );
}

/**
 * Currently and Independent projects: paper rows with a logo, the period,
 * bullets and links (the entry's own site, and its page on this site).
 */
function CurrentRoles({
  items,
  detail,
}: {
  items: readonly ResolvedTimelineItem[];
  detail: ResumeDetail;
}) {
  // A page link whose label repeats in the list ("Case study" for each
  // venture) is named after its entry for screen readers.
  const labels = items.flatMap((item) => (item.more ? [item.more.label] : []));
  const repeats = (label: string) =>
    labels.indexOf(label) !== labels.lastIndexOf(label);
  return (
    <ol className="pf-resume__wells">
      {items.map((item) => (
        <li key={`${item.title}-${item.org}`} className="pf-resume__well">
          <div className="pf-resume__well-head">
            <Logo item={item} size={44} />
            <span className="pf-resume__period">{item.period}</span>
          </div>
          <div>
            <h3 className="pf-resume__role pf-resume__role--lead">
              {item.title}
            </h3>
            <p className="pf-resume__org">{item.org}</p>
            <Note item={item} />
          </div>
          <Bullets bullets={visibleBullets(item, detail)} />
          {item.href || item.more ? (
            <div className="pf-resume__links">
              {item.href ? (
                <TextLink href={item.href}>{linkLabel(item.href)}</TextLink>
              ) : null}
              {item.more ? (
                <TextLink
                  href={item.more.href}
                  context={repeats(item.more.label) ? item.title : undefined}
                >
                  {item.more.label}
                </TextLink>
              ) : null}
            </div>
          ) : null}
        </li>
      ))}
    </ol>
  );
}

/**
 * A role row: logo and running number, title and period, org, bullets, and
 * the entry's page on this site when it has one (the latest role's "Case
 * studies", since it left Currently on 20-11-26).
 */
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
    <ol start={start + 1} className="pf-resume__rows">
      {items.map((item, i) => (
        <li
          key={`${item.title}-${item.org}-${item.period}`}
          className="pf-resume__row"
        >
          <span aria-hidden className="pf-resume__aside">
            <Logo item={item} size={40} />
            <span className="pf-resume__period">{pad2(start + i + 1)}</span>
          </span>
          <div className="pf-resume__body">
            <div className="pf-resume__line">
              <h3 className="pf-resume__role">
                <ItemTitle item={item} />
              </h3>
              <span className="pf-resume__period">{item.period}</span>
            </div>
            <p className="pf-resume__org">{item.org}</p>
            <Note item={item} />
            <Bullets bullets={visibleBullets(item, detail)} />
            {item.more ? (
              <div className="pf-resume__links">
                <TextLink href={item.more.href}>{item.more.label}</TextLink>
              </div>
            ) : null}
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
    <ol start={start + 1} className="pf-resume__rows">
      {items.map((item, i) => (
        <li
          key={`${item.title}-${item.org}-${item.period}`}
          className="pf-resume__row"
        >
          <span aria-hidden className="pf-resume__aside">
            <Logo item={item} size={40} />
            <span className="pf-resume__period">{pad2(start + i + 1)}</span>
          </span>
          <div className="pf-resume__body">
            <h3 className="pf-resume__role">
              <ItemTitle item={item} />
            </h3>
            <p className="pf-resume__org">{item.org}</p>
            <p className="pf-resume__period">{item.period}</p>
            <Bullets bullets={visibleBullets(item, detail)} />
          </div>
        </li>
      ))}
    </ol>
  );
}

/**
 * Two list columns side by side from 600 px, split where their heights are
 * closest.
 */
function TwoColumns({
  items,
  detail,
  List,
}: {
  items: readonly ResolvedTimelineItem[];
  detail: ResumeDetail;
  List: typeof RoleList;
}) {
  const [left, right] = splitColumns(items, (item) => rowWeight(item, detail));
  return (
    <div className="pf-resume__columns">
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
  return items.map((item) => (
    <div key={`${item.title}-${item.org}`} className="pf-resume__degree">
      <div className="pf-resume__well-head">
        <Logo item={item} size={52} />
        <span className="pf-resume__period">{item.period}</span>
      </div>
      <div>
        <h3 className="pf-resume__role pf-resume__role--lead">
          <ItemTitle item={item} />
        </h3>
        <p className="pf-resume__org">{item.org}</p>
      </div>
      <Bullets bullets={visibleBullets(item, detail)} />
    </div>
  ));
}

type Body = (
  items: readonly ResolvedTimelineItem[],
  detail: ResumeDetail,
) => ReactNode;

const BODIES: Record<ReturnType<typeof resumeSectionKind>, Body> = {
  current: (items, detail) => <CurrentRoles items={items} detail={detail} />,
  roles: (items, detail) => (
    <TwoColumns items={items} detail={detail} List={RoleList} />
  ),
  early: (items, detail) => (
    <RoleList items={items} start={0} detail={detail} />
  ),
  education: (items, detail) => (
    <EducationItems items={items} detail={detail} />
  ),
  list: (items, detail) => (
    <CredentialList items={items} start={0} detail={detail} />
  ),
  credentials: (items, detail) => (
    <TwoColumns items={items} detail={detail} List={CredentialList} />
  ),
};

/** A section's card: its kind places it in the grid (`data-kind`). */
function RecordsCard({
  id,
  title,
  kind,
  className,
  children,
}: {
  id: string;
  title: ReactNode;
  kind: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <article
      aria-labelledby={id}
      data-kind={kind}
      className={cn("pf-resume__card", className)}
    >
      <h2 id={id} className="t-meta pf-resume__heading">
        {title}
      </h2>
      {children}
    </article>
  );
}

/** One résumé section as its records card. */
export function ResumeSectionCard({
  section,
  detail,
}: {
  section: ResolvedTimelineSection;
  detail: ResumeDetail;
}) {
  const kind = resumeSectionKind(section.title);
  return (
    <RecordsCard
      id={`card-${sectionSlug(section.title)}`}
      title={section.title}
      kind={kind}
    >
      {BODIES[kind](section.items, detail)}
    </RecordsCard>
  );
}

/** Skills: the labelled groups, one chip per skill. */
export function SkillsCard({
  skills,
}: {
  skills: readonly ResumeSkillGroup[];
}) {
  return (
    <RecordsCard id="card-skills" title="Skills" kind="skills">
      <div className="pf-resume__groups">
        {skills.map((group) => (
          <div key={group.label} className="pf-resume__group">
            <h3 className="t-meta pf-resume__heading">{group.label}</h3>
            <ul className="pf-resume__chips">
              {group.items.map((skill) => (
                <li key={skill} className="ds-chip pf-resume__chip">
                  {skill}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </RecordsCard>
  );
}

/** Share: the share panel's actions inline, then the PDF download. */
export function ShareCard({ target }: { target: ShareTarget }) {
  return (
    <RecordsCard id="card-share" title="Share" kind="share">
      <div>
        <p className="pf-resume__role">{target.title}</p>
        <p className="pf-resume__period pf-resume__url">
          {shareUrlLabel(target.url)}
        </p>
      </div>
      <div className="pf-resume__share">
        <ShareRows target={target} />
      </div>
      <a
        href={RESUME_PDF_HREF}
        download={RESUME_PDF_NAME}
        className={`${pillClass({ size: "lg" })} pf-resume__card-pdf`}
      >
        <span className="ds-pill__icon" aria-hidden="true">
          <DownloadIcon />
        </span>
        <span>Download PDF</span>
      </a>
    </RecordsCard>
  );
}

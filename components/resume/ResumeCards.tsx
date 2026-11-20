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
import { keepNamesWhole } from "@/lib/content/keepWhole";
import type {
  ResolvedTimelineItem,
  ResolvedTimelineSection,
  ResumeSkillGroup,
} from "@/lib/content/resumeProfile";
import {
  isLive,
  isLiveBullet,
  linkLabel,
  sectionSlug,
  tileLine,
} from "@/lib/resume/view";
import { cn } from "@/lib/utils/cn";

/*
 * The résumé's sections below the hero ("Snapshot", now-building program
 * phase 2, 20-11-26), each a card with a serif h2: what he is building as
 * tiles, the roles as one timeline (the period on the left from 768 px,
 * above the role on phones), the skills, education and training, and the
 * University-era roles and affiliations folded into one closed <details>.
 * Every section comes from the résumé data (the repo's, or a Sanity
 * `resumeProfile`); lib/resume/view.ts places them by title. Screen only:
 * print uses ResumePrint. Styles: `.pf-resume*` in src/styles/resume.css.
 */

/** New wording on these cards, for the owner's review. */
const COPY = {
  now: "Building now", // DRAFT
  live: "Live", // DRAFT
  entries: (count: number) => `${count} ${count === 1 ? "entry" : "entries"}`, // DRAFT
} as const;

function Logo({
  item,
  size,
  loading,
}: {
  item: ResolvedTimelineItem;
  size: number;
  loading?: "eager" | "lazy";
}) {
  return (
    <CompanyLogo
      name={item.logoName ?? item.org}
      domain={item.logoDomain}
      src={item.logoSrc}
      size={size}
      loading={loading}
      tile
    />
  );
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
          <span>{keepNamesWhole(bullet)}</span>
        </li>
      ))}
    </ul>
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

const itemKey = (item: ResolvedTimelineItem) =>
  `${item.title}-${item.org}-${item.period}`;

/**
 * Ventures and projects as tiles: the logo, the period (and "Live" when a
 * bullet says so), the name, the kind, one line, and the links (the
 * entry's own site, and its page on this site). `eager` for the first
 * section, whose logos are in the first screen on a wide one.
 */
function Tiles({
  items,
  eager = false,
}: {
  items: readonly ResolvedTimelineItem[];
  eager?: boolean;
}) {
  // A page link whose label repeats in the list ("Case study" for each
  // venture) is named after its entry for screen readers.
  const labels = items.flatMap((item) => (item.more ? [item.more.label] : []));
  const repeats = (label: string) =>
    labels.indexOf(label) !== labels.lastIndexOf(label);
  return (
    <ul className="pf-resume__tiles">
      {items.map((item) => {
        const line = tileLine(item);
        return (
          <li key={itemKey(item)} className="pf-resume__tile">
            <div className="pf-resume__tile-top">
              <Logo item={item} size={48} loading={eager ? "eager" : "lazy"} />
              <div className="pf-resume__tile-meta">
                {isLive(item) ? (
                  <span className="pf-resume__badge">
                    <span aria-hidden className="pf-resume__live" />
                    {COPY.live}
                  </span>
                ) : null}
                <span className="pf-resume__when">{item.period}</span>
              </div>
            </div>
            <div>
              <h3 className="pf-resume__tile-title">{item.title}</h3>
              {item.org ? <p className="pf-resume__org">{item.org}</p> : null}
            </div>
            {line ? <p className="pf-resume__tile-line">{line}</p> : null}
            {item.href || item.more ? (
              <div className="pf-resume__links">
                {item.href ? (
                  <TextLink href={item.href} external arrow="up-right">
                    {linkLabel(item.href)}
                  </TextLink>
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
        );
      })}
    </ul>
  );
}

/**
 * One entry: the logo, title and organisation, the period (a grid area of
 * its own, so CSS can set it beside or above), then the note, bullets and
 * the entry's page on this site.
 */
function Entry({ item }: { item: ResolvedTimelineItem }) {
  return (
    <li className="pf-resume__entry">
      <div className="pf-resume__entry-head">
        <Logo item={item} size={40} />
        <div className="pf-resume__entry-name">
          <h3 className="pf-resume__role">
            <ItemTitle item={item} />
          </h3>
          {item.org ? <p className="pf-resume__org">{item.org}</p> : null}
        </div>
      </div>
      {item.period ? <p className="pf-resume__when">{item.period}</p> : null}
      {item.note || item.bullets?.length || item.more ? (
        <div className="pf-resume__entry-body">
          {item.note ? (
            <p className="pf-resume__note">{keepNamesWhole(item.note)}</p>
          ) : null}
          <Bullets bullets={item.bullets ?? []} />
          {item.more ? (
            <div className="pf-resume__links">
              <TextLink href={item.more.href}>{item.more.label}</TextLink>
            </div>
          ) : null}
        </div>
      ) : null}
    </li>
  );
}

/** Roles as a timeline: a rail with a pixel node per role, latest first. */
function Timeline({ items }: { items: readonly ResolvedTimelineItem[] }) {
  return (
    <ol className="pf-resume__timeline">
      {items.map((item) => (
        <Entry key={itemKey(item)} item={item} />
      ))}
    </ol>
  );
}

/** Degrees and courses: the same entries, without the rail. */
function Entries({ items }: { items: readonly ResolvedTimelineItem[] }) {
  return (
    <ul className="pf-resume__entries">
      {items.map((item) => (
        <Entry key={itemKey(item)} item={item} />
      ))}
    </ul>
  );
}

/** A section's card, named by its h2 (`data-kind` sets its layout). */
function Card({
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
      <h2 id={id} className="pf-resume__heading">
        {title}
      </h2>
      {children}
    </article>
  );
}

const cardId = (title: string) => `card-${sectionSlug(title)}`;

/** What he is building now: the "Currently" section, as tiles. */
export function NowCard({ section }: { section: ResolvedTimelineSection }) {
  return (
    <Card id="card-building-now" title={COPY.now} kind="now">
      <Tiles items={section.items} eager />
    </Card>
  );
}

/** Independent projects, as tiles too. */
export function ProjectsCard({
  section,
}: {
  section: ResolvedTimelineSection;
}) {
  return (
    <Card id={cardId(section.title)} title={section.title} kind="projects">
      <Tiles items={section.items} />
    </Card>
  );
}

/** Experience (and a section the page does not know): the timeline. */
export function TimelineCard({
  section,
}: {
  section: ResolvedTimelineSection;
}) {
  return (
    <Card id={cardId(section.title)} title={section.title} kind="roles">
      <Timeline items={section.items} />
    </Card>
  );
}

/** Education, Training or Certifications: entries without the rail. */
export function LearningCard({
  section,
}: {
  section: ResolvedTimelineSection;
}) {
  return (
    <Card id={cardId(section.title)} title={section.title} kind="learning">
      <Entries items={section.items} />
    </Card>
  );
}

/**
 * University-era and Affiliations, folded into one closed <details>: its
 * summary names them and counts their entries; inside, each is a timeline.
 */
export function EarlierCard({
  sections,
}: {
  sections: readonly ResolvedTimelineSection[];
}) {
  const count = sections.reduce((sum, s) => sum + s.items.length, 0);
  return (
    <details className="pf-resume__card pf-resume__more" data-kind="earlier">
      <summary className="pf-resume__more-summary">
        <span className="pf-resume__more-title">
          {sections.map((section) => section.title).join(" and ")}
        </span>
        <span className="pf-resume__more-count">{COPY.entries(count)}</span>
        <span aria-hidden className="pf-resume__more-mark" />
      </summary>
      <div className="pf-resume__more-body">
        {sections.map((section) => (
          <article
            key={section.title}
            aria-labelledby={cardId(section.title)}
            className="pf-resume__more-part"
          >
            <h2 id={cardId(section.title)} className="pf-resume__subheading">
              {section.title}
            </h2>
            <Timeline items={section.items} />
          </article>
        ))}
      </div>
    </details>
  );
}

/** Skills: the labelled groups, one chip per skill. */
export function SkillsCard({
  skills,
}: {
  skills: readonly ResumeSkillGroup[];
}) {
  return (
    <Card id="card-skills" title="Skills" kind="skills">
      <div className="pf-resume__groups">
        {skills.map((group) => (
          <div key={group.label} className="pf-resume__group">
            <h3 className="t-meta pf-resume__group-label">{group.label}</h3>
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
    </Card>
  );
}

/** Share: the page's title and address, the share actions, the PDF. */
export function ShareCard({ target }: { target: ShareTarget }) {
  return (
    <Card id="card-share" title="Share" kind="share">
      <div className="pf-resume__share">
        <div>
          <p className="pf-resume__role">{target.title}</p>
          <p className="pf-resume__url">{shareUrlLabel(target.url)}</p>
        </div>
        <div className="pf-resume__share-rows">
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
      </div>
    </Card>
  );
}

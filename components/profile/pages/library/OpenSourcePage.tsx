import { ArrowUpRightIcon } from "@/components/bento/icons";
import { DaysAgo } from "@/components/ds/DaysAgo";
import { Chip } from "@/components/ds/labels";
import { pillClass } from "@/components/ds/Pill";
import { CommandRow, SlashParts } from "@/components/landing/skills/CommandRow";
import { PixelBadge } from "@/components/profile/home/PixelIcon";
import { ArrowLink, BlockHead } from "@/components/profile/pages/library/parts";
import {
  ReadingHero,
  SegmentHeadline,
} from "@/components/profile/pages/ReadingHero";
import {
  OPEN_SOURCE_PROJECTS,
  openSourcePage,
  shownStars,
  type OpenSourceProject,
} from "@/lib/content/openSource";
import { cn } from "@/lib/utils/cn";

/*
 * /open-source (21-11-26, owner request): the reading hero, then one card per
 * project built like Proof's venture cards (BlockHead, the badge and name,
 * the summary, facts, stack chips, the install steps, a foot). Superstacks takes the
 * full row (`pf-read-wide`) and the others sit side by side from 810 px
 * (`pf-read-pair`). Facts come from the GitHub snapshot
 * (lib/content/openSource.ts); "Updated" is the newest commit on the default
 * branch, put into words in the browser (DaysAgo). The command rows come
 * from CommandRow.tsx, never from SkillParts, whose module loads the skills
 * snapshot; a step of several commands takes its `lines` layout. Styles:
 * `.pf-read-*` in pages-hubs.css and `.pf-cat-*` in pages-catalog.css.
 */

/** Opens on GitHub: a new tab, no opener. */
const EXTERNAL = { target: "_blank", rel: "noopener noreferrer" } as const;

/** The card's second link: a page on this site, or a page in another language. */
function MoreLink({ more }: { more: NonNullable<OpenSourceProject["more"]> }) {
  if (!more.external)
    return <ArrowLink href={more.href}>{more.label}</ArrowLink>;
  return (
    <a
      href={more.href}
      hrefLang={more.lang}
      {...EXTERNAL}
      className="ds-text-link pf-read-link"
    >
      <span>
        <span lang={more.lang}>{more.label}</span>{" "}
        <span className="sr-only">({more.note}, opens in a new tab)</span>
      </span>
      <span className="ds-text-link__arrow" aria-hidden="true">
        →
      </span>
    </a>
  );
}

function ProjectCard({ project }: { project: OpenSourceProject }) {
  const { facts } = project;
  const { labels } = openSourcePage;
  const nameId = `oss-${project.slug}`;
  const stars = shownStars(facts.stars);
  return (
    <li
      id={project.slug}
      className={cn("pf-read-item", project.wide && "pf-read-wide")}
    >
      <article aria-labelledby={nameId} className="ds-tile pf-read-tile">
        <BlockHead
          id={`${nameId}-kind`}
          title={project.kind}
          note={facts.license}
        />
        <div className="pf-read-lead-tool">
          <PixelBadge
            badge={project.badge}
            tone={project.tone}
            className="pf-read-badge pf-read-badge--lg"
          />
          <div className="pf-read-tool__text">
            <h3 id={nameId} className="t-lift-title pf-read-title">
              {project.name}
            </h3>
            <p className="t-small text-ink-2">{project.tagline}</p>
          </div>
        </div>
        <p className="t-small pf-read-text">{project.summary}</p>
        <dl className="pf-read-facts">
          {facts.release ? (
            <div>
              <dt className="t-meta text-ink-2">{labels.release}</dt>
              <dd className="t-meta-value">{facts.release.tag}</dd>
            </div>
          ) : null}
          <div>
            <dt className="t-meta text-ink-2">{labels.updated}</dt>
            <dd className="t-meta-value">
              <DaysAgo iso={facts.lastCommitAt} />
            </dd>
          </div>
          {stars === null ? null : (
            <div>
              <dt className="t-meta text-ink-2">{labels.stars}</dt>
              <dd className="t-meta-value">{stars}</dd>
            </div>
          )}
        </dl>
        <ul aria-label={labels.stack} className="pf-read-chips">
          {project.stack.map((item) => (
            <li key={item}>
              <Chip>{item}</Chip>
            </li>
          ))}
        </ul>
        {project.install ? (
          <div className="pf-cat-stack">
            {project.install.map((step) => (
              <CommandRow
                key={step.command}
                label={step.label}
                command={step.command}
                accessibleLabel={step.copyLabel}
                announcement={step.announcement}
                lines={step.command.includes("\n")}
              />
            ))}
          </div>
        ) : null}
        <div className="pf-read-foot">
          <a
            href={facts.url}
            {...EXTERNAL}
            className="ds-text-link pf-read-link"
          >
            <span className="t-meta pf-read-path">
              {/* Breaks only after a slash, never inside "thai-accounting-tax-law". */}
              <SlashParts word={facts.url.replace(/^https:\/\//, "")} />
              <span className="sr-only"> (opens in a new tab)</span>
            </span>
          </a>
          {project.more ? <MoreLink more={project.more} /> : null}
        </div>
      </article>
    </li>
  );
}

export default function OpenSourcePage() {
  const { headline, github } = openSourcePage;
  return (
    <>
      <ReadingHero
        eyebrow={openSourcePage.eyebrow}
        title={
          <SegmentHeadline
            lines={[...headline.lines, [headline.accent]]}
            joiner=" "
          />
        }
        lead={openSourcePage.lead}
      >
        <div className="pf-cat-hero__actions">
          <a
            href={github.href}
            aria-label={`${github.label}: ${github.handle}`}
            {...EXTERNAL}
            className={pillClass({ size: "hero" })}
          >
            {github.label}
            <span className="ds-pill__icon" aria-hidden="true">
              <ArrowUpRightIcon size={16} />
            </span>
          </a>
        </div>
        <p className="t-small pf-cat-hero__meta">{openSourcePage.meta}</p>
      </ReadingHero>
      <section
        aria-label={openSourcePage.labels.projects}
        className="ds-wrap pf-read-body"
      >
        <div>
          <ul className="pf-read-pair">
            {OPEN_SOURCE_PROJECTS.map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}

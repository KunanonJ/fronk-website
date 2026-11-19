import { Chip, PixelMark } from "@/components/ds/labels";
import { CtaArrow, pillClass } from "@/components/ds/Pill";
import Link from "@/components/navigation/Link";
import { CaseMediaView } from "@/components/profile/case/CaseMedia";
import { PageHero } from "@/components/profile/pages/PageHero";
import { caseAccess, caseCopy, projectCase } from "@/lib/content/caseStudy";
import { portfolioHeadline, workIndexCopy } from "@/lib/content/corePages";
import {
  getAllPortfolioProjects,
  portfolioPage,
  type PortfolioProject,
} from "@/lib/content/portfolio";
import {
  categoryParam,
  matchesPortfolioFilter,
  type PortfolioFilter,
} from "@/lib/portfolio/search";

/*
 * /portfolio, "All work" (profile redesign, Phase 6 cutover; plan step 6d):
 * the hero in the new style, the category filter, and every project as a
 * lift card (design spec 9.12 and 6.12), the case pages' "More projects"
 * cards with the first cleared outcome added. The filter is the route's
 * `?category=` search param: the prerendered page shows every project and
 * the filter applies after hydration. Each card is an article named by its
 * title whose only link is the call to action; the link's ::after covers the
 * card. Styles: `.pf-work-index*`, `.pf-work-card*` and the shared filter bar
 * (`.pf-filter-bar`, `.pf-filter`) in src/styles/profile/cutover.css, and
 * the case template's `.pf-lift*` in case.css.
 */

/** The filter: all projects, then each category in project order. */
function filterOptions(projects: readonly PortfolioProject[]) {
  const labels = [...new Set(projects.map((p) => p.category))];
  return [
    { id: "all", label: workIndexCopy.all },
    ...labels.map((label) => ({ id: categoryParam(label), label })),
  ] as { id: PortfolioFilter; label: string }[];
}

function WorkCard({ project }: { project: PortfolioProject }) {
  const study = projectCase(project);
  const titleId = `work-${project.slug}`;
  const drawn = study.cover?.kind === "illustration";
  return (
    <article
      className="pf-lift ds-stretch-card pf-work-card"
      aria-labelledby={titleId}
    >
      <div
        className="pf-lift__mat"
        data-kind={study.cover?.kind ?? "none"}
        data-hue={drawn ? study.hue : undefined}
        aria-hidden="true"
      >
        {study.cover ? (
          <div className="pf-lift__media">
            <CaseMediaView media={study.cover} variant="card" />
          </div>
        ) : null}
        {drawn ? (
          <Chip kind="illustration">{caseCopy.illustration}</Chip>
        ) : null}
      </div>
      <p className="t-meta pf-lift__meta">
        <span>{project.category}</span>
        <span>{project.period}</span>
        {/* Public, or an internal tool: why most cases have no live link. */}
        <span>{caseAccess(project.access)}</span>
      </p>
      <h2 id={titleId} className="t-lift-title pf-lift__title">
        {project.name}
      </h2>
      <p className="t-small pf-lift__summary">{project.tagline}</p>
      {study.firstOutcome ? (
        <p className="t-small pf-work-card__outcome">
          <PixelMark kind="bullet" />
          {study.firstOutcome}
        </p>
      ) : null}
      <Link
        href={study.href}
        className="ds-stretch pf-lift__link"
        aria-label={`${caseCopy.moreCta}: ${project.name}`}
      >
        <span className={pillClass({ variant: "ghost", size: "sm" })}>
          {caseCopy.moreCta}
          <CtaArrow />
        </span>
      </Link>
    </article>
  );
}

export default function WorkIndexPage({
  category,
  onCategoryChange,
}: {
  category: PortfolioFilter;
  onCategoryChange: (next: PortfolioFilter) => void;
}) {
  const projects = getAllPortfolioProjects();
  const shown = projects.filter((project) =>
    matchesPortfolioFilter(project.category, category),
  );

  return (
    <>
      <PageHero
        eyebrow={portfolioPage.eyebrow}
        lines={portfolioHeadline}
        lead={portfolioPage.description}
      />
      <section
        aria-label={workIndexCopy.projects}
        className="ds-wrap pf-work-index"
      >
        <div className="pf-filter-bar">
          <div
            role="group"
            aria-label={workIndexCopy.filter}
            className="pf-filter"
          >
            {filterOptions(projects).map((option) => (
              <button
                key={option.id}
                type="button"
                aria-pressed={option.id === category}
                onClick={() => onCategoryChange(option.id)}
                className="pf-filter__option ds-press"
              >
                {option.label}
              </button>
            ))}
          </div>
          <p aria-live="polite" className="t-meta pf-filter-bar__count">
            {workIndexCopy.count(shown.length, projects.length)}
          </p>
        </div>
        <ul className="pf-work-index__grid">
          {shown.map((project) => (
            <li key={project.slug} className="pf-work-index__item">
              <WorkCard project={project} />
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

import Link from "@/components/navigation/Link";
import { Bento, CardKicker } from "@/components/bento/Bento";
import { EyebrowChip, TechChip } from "@/components/bento/Chips";
import Image from "@/components/ui/Image";
import {
  hubSpanClass,
  type HubSpan,
} from "@/components/landing/discovery/hubLayout";
import PortfolioMockup from "@/components/landing/portfolio/PortfolioMockup";
import {
  AccessTag,
  CARD,
  HeroTitle,
  MONO_LABEL,
} from "@/components/landing/portfolio/PortfolioParts";
import { portfolioGrid } from "@/components/landing/portfolio/portfolioLayout";
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
import { cn } from "@/lib/utils/cn";
import { pad2 } from "@/lib/utils/pad2";

/*
 * /portfolio (bento redesign, phase 7e; design spec 4.5): the hero, the
 * category filter and the project cards. The filter is the `?category=`
 * search param, owned by the route. Copy comes from lib/content/portfolio.
 */

/** Tech chips a card shows before "+N more". */
const STACK_SHOWN = 4;

/** The filter: all projects, then each category in project order. */
function filterOptions(projects: readonly PortfolioProject[]) {
  const labels = [...new Set(projects.map((p) => p.category))];
  return [
    { id: "all", label: "All" },
    ...labels.map((label) => ({ id: categoryParam(label), label })),
  ] as { id: PortfolioFilter; label: string }[];
}

/** Screenshot when one is registered, else the illustrative mockup. */
function CardVisual({
  project,
  wide,
}: {
  project: PortfolioProject;
  wide: boolean;
}) {
  if (!project.cover && !project.mockup) return null;
  return (
    <figure
      className={cn(
        "m-0 flex flex-col items-center gap-3 rounded-well border border-hairline bg-page",
        wide ? "px-5 pt-5 pb-3" : "px-3.5 pt-3.5 pb-2.5",
      )}
    >
      <div className="w-full max-w-[520px] overflow-hidden rounded-[2.19%/3.5%] shadow-card">
        {project.cover ? (
          <Image
            src={project.cover.src}
            alt={project.cover.alt}
            width={project.cover.width}
            height={project.cover.height}
            sizes="(min-width: 1024px) 520px, 100vw"
            className="block aspect-[16/10] h-auto w-full object-cover"
          />
        ) : project.mockup ? (
          <PortfolioMockup mockup={project.mockup} />
        ) : null}
      </div>
      {project.cover ? null : (
        <figcaption className="self-start text-xs text-ink-2">
          Illustrative mockup, not real data.
        </figcaption>
      )}
    </figure>
  );
}

/**
 * One project: the category kicker and its list number, the visual, then
 * the access tag, year, name and tagline beside the first tech chips and
 * the link. Labelled by the project name.
 */
function ProjectCard({
  project,
  number,
  span,
}: {
  project: PortfolioProject;
  number: number;
  span: HubSpan;
}) {
  const nameId = `name-${project.slug}`;
  const shown = project.stack.slice(0, STACK_SHOWN);
  const more = project.stack.length - shown.length;
  return (
    <article
      aria-labelledby={nameId}
      className={cn(CARD, "flex min-w-0 flex-col gap-4", hubSpanClass(span))}
    >
      <div className="flex items-center justify-between gap-3">
        <CardKicker id={`kicker-${project.slug}`}>
          {project.category}
        </CardKicker>
        <span aria-hidden className="font-mono text-xs text-ink-2">
          {pad2(number)}
        </span>
      </div>
      <CardVisual project={project} wide={span.lg > 1} />
      <div className="mt-auto flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
        <div className="flex min-w-0 flex-[1_1_240px] flex-col items-start gap-2">
          <p className="m-0 flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <AccessTag access={project.access} />
            <span className="font-mono text-xs text-ink-2">{project.year}</span>
          </p>
          <h3
            id={nameId}
            className="m-0 text-2xl leading-[1.2] font-semibold tracking-[-0.02em]"
          >
            {project.name}
          </h3>
          <p className="m-0 text-card leading-[1.45] text-ink-2">
            {project.tagline}
          </p>
        </div>
        <div className="flex min-w-0 flex-[1_1_240px] flex-col items-start gap-2">
          <ul
            aria-label="Tech stack"
            className="m-0 flex list-none flex-wrap items-center gap-1.5 p-0"
          >
            {shown.map((tech) => (
              <li key={tech}>
                <TechChip>{tech}</TechChip>
              </li>
            ))}
            {more > 0 ? (
              <li className="px-0.5 py-1 font-mono text-xs text-ink-2">
                +{more} more
              </li>
            ) : null}
          </ul>
          <Link
            href={`/portfolio/${project.slug}`}
            aria-label={`View project: ${project.name}`}
            className="inline-flex min-h-11 items-center text-sm font-medium no-underline"
          >
            View project →
          </Link>
        </div>
      </div>
    </article>
  );
}

export default function PortfolioIndexPage({
  category,
  onCategoryChange,
}: {
  category: PortfolioFilter;
  onCategoryChange: (next: PortfolioFilter) => void;
}) {
  const projects = getAllPortfolioProjects();
  const shown = projects
    .map((project, index) => ({ project, number: index + 1 }))
    .filter(({ project }) =>
      matchesPortfolioFilter(project.category, category),
    );
  const spans = portfolioGrid(shown.length);

  return (
    <>
      <section
        aria-labelledby="hero-title"
        className="flex flex-col items-start gap-6"
      >
        <EyebrowChip>{portfolioPage.eyebrow}</EyebrowChip>
        <HeroTitle lines={portfolioPage.headline} />
        <p className="m-0 max-w-[620px] text-lg leading-[1.55] text-ink-2">
          {portfolioPage.description}
        </p>
      </section>

      <section aria-label="Projects" className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-3">
          <div
            role="group"
            aria-label="Filter projects by category"
            className="flex flex-wrap gap-1 rounded-bento border border-hairline bg-surface p-[5px] shadow-card"
          >
            {filterOptions(projects).map((option) => {
              const on = option.id === category;
              return (
                <button
                  key={option.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => onCategoryChange(option.id)}
                  className={cn(
                    "min-h-11 flex-none rounded-full border-0 px-4 text-sm font-medium whitespace-nowrap",
                    on ? "bg-cta text-on-cta" : "bg-transparent text-ink-2",
                  )}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
          <p aria-live="polite" className={MONO_LABEL}>
            {`${shown.length} of ${projects.length} projects`}
          </p>
        </div>
        <Bento>
          {shown.map(({ project, number }, i) => (
            <ProjectCard
              key={project.slug}
              project={project}
              number={number}
              span={spans[i]!}
            />
          ))}
        </Bento>
      </section>
    </>
  );
}

import Image from "@/components/ui/Image";
import Link from "@/components/navigation/Link";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import LibraryPageShell from "@/components/landing/LibraryPageShell";
import PortfolioCover from "@/components/landing/PortfolioCover";
import PortfolioArchitecture from "@/components/landing/portfolio/PortfolioArchitecture";
import PortfolioMockup, {
  MockupStage,
} from "@/components/landing/portfolio/PortfolioMockup";
import PortfolioWorkflow from "@/components/landing/portfolio/PortfolioWorkflow";
import { Chip } from "@/components/ui/Chip";
import {
  getAdjacentPortfolioProjects,
  type PortfolioProject,
} from "@/lib/content/portfolio";

type PortfolioProjectPageProps = {
  project: PortfolioProject;
};

export default function PortfolioProjectPage({
  project,
}: PortfolioProjectPageProps) {
  const { prev, next } = getAdjacentPortfolioProjects(project.slug);

  const meta: { label: string; value: string }[] = [
    { label: "Role", value: project.role },
    { label: "Organisation", value: project.organization },
    { label: "Period", value: project.period },
    {
      label: "Access",
      value:
        project.access === "internal" ? "Internal tool (login only)" : "Public",
    },
  ];

  return (
    <LibraryPageShell
      eyebrow={`Portfolio · ${project.category}`}
      title={project.name}
      description={project.summary}
    >
      <Link
        href="/portfolio"
        className="mb-8 inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-link underline-offset-4 hover:underline"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
        All projects
      </Link>

      {/* Hero: the real screenshot, else the illustrative mockup. The initials
          placeholder is never used here, since it would repeat the header. */}
      {project.cover ? (
        <PortfolioCover
          project={project}
          priority
          sizes="(min-width: 1152px) 1152px, 100vw"
          className="rounded-2xl"
        />
      ) : project.mockup ? (
        <figure>
          <MockupStage className="overflow-hidden rounded-panel border border-hairline px-[6%] py-[5%]">
            <PortfolioMockup
              mockup={project.mockup}
              label={`Illustrative mockup of ${project.name}`}
              className="max-w-4xl drop-shadow-[0_16px_40px_rgba(11,13,23,0.16)]"
            />
          </MockupStage>
          <figcaption className="mt-3 text-xs text-ink-2">
            Illustrative mockup, not real data.
          </figcaption>
        </figure>
      ) : null}

      {project.gallery && project.gallery.length > 0 ? (
        <ul className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {project.gallery.map((shot) => (
            <li
              key={shot.src}
              className="overflow-hidden rounded-2xl border border-hairline bg-surface-tint"
            >
              <Image
                src={shot.src}
                alt={shot.alt}
                width={shot.width}
                height={shot.height}
                sizes="(min-width: 1152px) 560px, (min-width: 640px) 50vw, 100vw"
                className="h-auto w-full"
              />
            </li>
          ))}
        </ul>
      ) : null}

      {/* Facts strip (visual-redesign Phase 4). */}
      <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-card border border-hairline bg-hairline md:grid-cols-4">
        {meta.map((row) => (
          <div key={row.label} className="flex flex-col gap-1.5 bg-surface p-5">
            <dt className="font-mono text-label uppercase text-ink-2">
              {row.label}
            </dt>
            <dd className="text-small font-medium text-ink">{row.value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-16">
        <div className="space-y-12">
          <p className="font-display text-h3 font-medium text-ink">
            {project.tagline}
          </p>

          <section aria-labelledby="portfolio-highlights">
            <h2
              id="portfolio-highlights"
              className="mb-4 font-display text-h3 text-ink"
            >
              What it does
            </h2>
            <ul className="space-y-3">
              {project.highlights.map((item) => (
                <li key={item} className="flex gap-3 text-body text-ink-2">
                  <span
                    className="mt-[0.6em] size-1.5 shrink-0 bg-signal"
                    aria-hidden="true"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          {project.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="mb-3 font-display text-h3 text-ink">
                {section.heading}
              </h2>
              <p className="text-body text-ink-2">{section.body}</p>
            </section>
          ))}
        </div>

        <aside className="space-y-10 lg:sticky lg:top-8 lg:self-start lg:pt-1">
          <section aria-labelledby="portfolio-stack">
            <h2
              id="portfolio-stack"
              className="mb-4 font-mono text-label uppercase text-ink-2"
            >
              Tech stack
            </h2>
            <ul className="flex flex-wrap gap-2">
              {project.stack.map((tech) => (
                <li key={tech}>
                  <Chip>{tech}</Chip>
                </li>
              ))}
            </ul>
          </section>

          {project.access === "public" && project.url ? (
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-action px-5 text-sm font-medium text-on-action transition-colors hover:bg-action-hover"
            >
              {project.urlLabel ?? "Visit"}
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </a>
          ) : null}
        </aside>
      </div>

      {project.workflow ? (
        <div className="mt-20">
          <PortfolioWorkflow
            workflow={project.workflow}
            headingId="portfolio-workflow"
          />
        </div>
      ) : null}

      {project.architecture ? (
        <div className="mt-20">
          <PortfolioArchitecture
            architecture={project.architecture}
            headingId="portfolio-architecture"
          />
        </div>
      ) : null}

      {prev && next ? (
        <nav
          aria-label="More projects"
          className="mt-20 grid grid-cols-1 gap-4 border-t border-hairline pt-8 sm:grid-cols-2"
        >
          <Link
            href={`/portfolio/${prev.slug}`}
            className="group flex flex-col rounded-card border border-hairline bg-surface p-5 shadow-card transition-colors hover:border-hairline-strong"
          >
            <span className="inline-flex items-center gap-1.5 font-mono text-label uppercase text-ink-2">
              <ArrowLeft className="h-3 w-3" aria-hidden="true" />
              Previous
            </span>
            <span className="mt-2 font-display text-h3 text-ink">
              {prev.name}
            </span>
          </Link>
          <Link
            href={`/portfolio/${next.slug}`}
            className="group flex flex-col rounded-card border border-hairline bg-surface p-5 text-right shadow-card transition-colors hover:border-hairline-strong sm:items-end"
          >
            <span className="inline-flex items-center gap-1.5 font-mono text-label uppercase text-ink-2">
              Next
              <ArrowRight className="h-3 w-3" aria-hidden="true" />
            </span>
            <span className="mt-2 font-display text-h3 text-ink">
              {next.name}
            </span>
          </Link>
        </nav>
      ) : null}
    </LibraryPageShell>
  );
}

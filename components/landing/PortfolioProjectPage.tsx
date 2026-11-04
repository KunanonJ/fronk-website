import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import LibraryPageShell from "@/components/landing/LibraryPageShell";
import PortfolioCover from "@/components/landing/PortfolioCover";
import PortfolioArchitecture from "@/components/landing/portfolio/PortfolioArchitecture";
import PortfolioMockup, {
  MockupStage,
} from "@/components/landing/portfolio/PortfolioMockup";
import PortfolioWorkflow from "@/components/landing/portfolio/PortfolioWorkflow";
import {
  getAdjacentPortfolioProjects,
  type PortfolioProject,
} from "@/lib/content/portfolio";

const serif = {
  fontFamily: "var(--font-instrument-serif), 'Instrument Serif', serif",
} as const;

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
      navId="portfolio-project-mobile-nav"
    >
      <Link
        href="/portfolio"
        className="mb-8 inline-flex items-center gap-1.5 text-sm text-primary/80 transition-colors hover:text-primary"
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
          <MockupStage className="overflow-hidden rounded-2xl border border-primary/12 px-[6%] py-[5%]">
            <PortfolioMockup
              mockup={project.mockup}
              label={`Illustrative mockup of ${project.name}`}
              className="max-w-4xl drop-shadow-[0_16px_40px_rgba(0,0,0,0.2)]"
            />
          </MockupStage>
          <figcaption className="mt-3 text-xs text-primary/70">
            Illustrative mockup, not real data.
          </figcaption>
        </figure>
      ) : null}

      {project.gallery && project.gallery.length > 0 ? (
        <ul className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {project.gallery.map((shot) => (
            <li
              key={shot.src}
              className="overflow-hidden rounded-xl border border-primary/12 bg-primary/[0.04]"
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

      <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-16">
        <div className="space-y-12">
          <p className="text-xl leading-relaxed text-primary/85" style={serif}>
            {project.tagline}
          </p>

          <section aria-labelledby="portfolio-highlights">
            <h2
              id="portfolio-highlights"
              className="mb-4 text-2xl font-medium text-primary"
              style={serif}
            >
              What it does
            </h2>
            <ul className="space-y-3">
              {project.highlights.map((item) => (
                <li
                  key={item}
                  className="flex gap-3 text-base leading-relaxed text-primary/80"
                >
                  <span
                    className="mt-[0.7em] h-1 w-1 shrink-0 rounded-full bg-primary/60"
                    aria-hidden="true"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          {project.sections.map((section) => (
            <section key={section.heading}>
              <h2
                className="mb-3 text-2xl font-medium text-primary"
                style={serif}
              >
                {section.heading}
              </h2>
              <p className="text-base leading-relaxed text-primary/80">
                {section.body}
              </p>
            </section>
          ))}
        </div>

        <aside className="space-y-10 lg:pt-1">
          <section aria-labelledby="portfolio-stack">
            <h2
              id="portfolio-stack"
              className="mb-4 text-xs font-medium uppercase tracking-[0.16em] text-primary/75"
            >
              Tech stack
            </h2>
            <ul className="flex flex-wrap gap-2">
              {project.stack.map((tech) => (
                <li
                  key={tech}
                  className="rounded-full border border-primary/15 px-3 py-1 text-sm text-primary/85"
                >
                  {tech}
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="portfolio-details">
            <h2
              id="portfolio-details"
              className="mb-4 text-xs font-medium uppercase tracking-[0.16em] text-primary/75"
            >
              Details
            </h2>
            <dl className="divide-y divide-primary/10 border-y border-primary/10">
              {meta.map((row) => (
                <div
                  key={row.label}
                  className="flex items-baseline justify-between gap-4 py-3 text-sm"
                >
                  <dt className="text-primary/75">{row.label}</dt>
                  <dd className="text-right text-primary">{row.value}</dd>
                </div>
              ))}
            </dl>
            {project.access === "public" && project.url ? (
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-cream px-5 py-2.5 text-sm font-medium text-black transition-opacity hover:opacity-90"
              >
                {project.urlLabel ?? "Visit"}
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            ) : null}
          </section>
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
          className="mt-20 grid grid-cols-1 gap-4 border-t border-primary/12 pt-8 sm:grid-cols-2"
        >
          <Link
            href={`/portfolio/${prev.slug}`}
            className="group flex flex-col rounded-2xl border border-primary/12 p-5 transition-colors hover:border-primary/30"
          >
            <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] text-primary/75">
              <ArrowLeft className="h-3 w-3" aria-hidden="true" />
              Previous
            </span>
            <span className="mt-2 text-xl text-primary" style={serif}>
              {prev.name}
            </span>
          </Link>
          <Link
            href={`/portfolio/${next.slug}`}
            className="group flex flex-col rounded-2xl border border-primary/12 p-5 text-right transition-colors hover:border-primary/30 sm:items-end"
          >
            <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] text-primary/75">
              Next
              <ArrowRight className="h-3 w-3" aria-hidden="true" />
            </span>
            <span className="mt-2 text-xl text-primary" style={serif}>
              {next.name}
            </span>
          </Link>
        </nav>
      ) : null}
    </LibraryPageShell>
  );
}

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import LibraryPageShell from "@/components/landing/LibraryPageShell";
import PortfolioCover from "@/components/landing/PortfolioCover";
import {
  getAllPortfolioProjects,
  portfolioPage,
} from "@/lib/content/portfolio";

const serif = {
  fontFamily: "var(--font-instrument-serif), 'Instrument Serif', serif",
} as const;

const CARD_STACK_LIMIT = 4;

export default function PortfolioPage() {
  const projects = getAllPortfolioProjects();

  return (
    <LibraryPageShell
      eyebrow={portfolioPage.eyebrow}
      title={portfolioPage.title}
      description={portfolioPage.description}
      navId="portfolio-mobile-nav"
    >
      <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {projects.map((project, index) => {
          const shownStack = project.stack.slice(0, CARD_STACK_LIMIT);
          const hiddenCount = project.stack.length - shownStack.length;

          return (
            <li key={project.slug}>
              <Link
                href={`/portfolio/${project.slug}`}
                className="group flex h-full flex-col rounded-2xl border border-primary/12 bg-primary/[0.03] p-3 transition-colors hover:border-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-landing"
              >
                <PortfolioCover
                  project={project}
                  index={index}
                  priority={index < 2}
                />
                <div className="flex flex-1 flex-col px-2 pb-2 pt-4">
                  <p className="text-[10px] uppercase tracking-[0.16em] text-primary/75">
                    {project.category} · {project.year}
                  </p>
                  <h2
                    className="mt-2 text-2xl font-medium tracking-tight text-primary"
                    style={serif}
                  >
                    {project.name}
                  </h2>
                  <p className="mt-1 text-sm leading-relaxed text-primary/75">
                    {project.tagline}
                  </p>
                  <ul
                    className="mt-4 flex flex-wrap gap-1.5"
                    aria-label="Tech stack"
                  >
                    {shownStack.map((tech) => (
                      <li
                        key={tech}
                        className="rounded-full border border-primary/15 px-2.5 py-0.5 text-xs text-primary/80"
                      >
                        {tech}
                      </li>
                    ))}
                    {hiddenCount > 0 ? (
                      <li className="rounded-full px-1.5 py-0.5 text-xs text-primary/75">
                        +{hiddenCount} more
                      </li>
                    ) : null}
                  </ul>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm text-primary/80 transition-colors group-hover:text-primary">
                    View project
                    <ArrowUpRight
                      className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </span>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </LibraryPageShell>
  );
}

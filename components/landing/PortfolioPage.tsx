import Link from "@/components/navigation/Link";
import { ArrowUpRight } from "lucide-react";
import LibraryPageShell from "@/components/landing/LibraryPageShell";
import PortfolioCover from "@/components/landing/PortfolioCover";
import { Chip } from "@/components/ui/Chip";
import {
  getAllPortfolioProjects,
  portfolioPage,
} from "@/lib/content/portfolio";

const CARD_STACK_LIMIT = 4;

const ACCESS_LABEL = {
  internal: "Internal tool",
  public: "Public",
} as const;

/**
 * Portfolio index (visual-redesign Phase 4): numbered case-study cards. No
 * outcome metric yet (the owner hasn't approved numbers for these internal
 * projects), so each card shows its access badge instead of a stat.
 */
export default function PortfolioPage() {
  const projects = getAllPortfolioProjects();

  return (
    <LibraryPageShell
      eyebrow={portfolioPage.eyebrow}
      title={portfolioPage.title}
      description={portfolioPage.description}
    >
      <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {projects.map((project, index) => {
          const shownStack = project.stack.slice(0, CARD_STACK_LIMIT);
          const hiddenCount = project.stack.length - shownStack.length;

          return (
            <li key={project.slug}>
              <Link
                href={`/portfolio/${project.slug}`}
                className="group flex h-full flex-col rounded-card border border-hairline bg-surface p-3 shadow-card transition-[border-color,transform] duration-150 ease-smooth hover:border-hairline-strong motion-safe:hover:-translate-y-0.5"
              >
                <PortfolioCover
                  project={project}
                  index={index}
                  priority={index < 2}
                />
                <div className="flex flex-1 flex-col px-3 pt-5 pb-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-mono text-label uppercase text-ink-2">
                      <span aria-hidden>
                        {String(index + 1).padStart(2, "0")} ·{" "}
                      </span>
                      {project.category} · {project.year}
                    </p>
                    <Chip tone="signal">{ACCESS_LABEL[project.access]}</Chip>
                  </div>
                  <h2 className="mt-3 font-display text-h3 text-ink">
                    {project.name}
                  </h2>
                  <p className="mt-1.5 text-small text-ink-2">
                    {project.tagline}
                  </p>
                  <ul
                    className="mt-5 flex flex-wrap gap-1.5"
                    aria-label="Tech stack"
                  >
                    {shownStack.map((tech) => (
                      <li key={tech}>
                        <Chip>{tech}</Chip>
                      </li>
                    ))}
                    {hiddenCount > 0 ? (
                      <li className="inline-flex items-center px-1 font-mono text-label text-ink-2">
                        +{hiddenCount} more
                      </li>
                    ) : null}
                  </ul>
                  <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-link">
                    View project
                    <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
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

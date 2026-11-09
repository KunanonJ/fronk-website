import Link from "@/components/navigation/Link";
import { ArrowUpRight } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { getAllPortfolioProjects } from "@/lib/content/portfolio";

/**
 * Home portfolio strip (visual-redesign Phase 2; ux-audit finding 13): the
 * internal projects as numbered cards, each a single link whose name is the
 * project, so screen-reader link lists stay distinct.
 */
export default function PortfolioStrip() {
  const projects = getAllPortfolioProjects();
  if (projects.length === 0) return null;

  return (
    <Section
      eyebrow="Portfolio"
      heading="Selected work"
      className="pt-0 md:pt-0 lg:pt-0"
    >
      <ol className="grid gap-4 sm:grid-cols-2">
        {projects.map((project, index) => (
          <li key={project.slug}>
            <Link
              href={`/portfolio/${project.slug}`}
              className="group flex h-full flex-col rounded-card border border-hairline bg-surface p-6 shadow-card transition-[border-color,transform] duration-150 ease-smooth hover:border-hairline-strong motion-safe:hover:-translate-y-0.5 sm:p-8"
            >
              <span className="font-mono text-label text-ink-2" aria-hidden>
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="mt-4 text-h3 text-ink">{project.name}</span>
              <span className="mt-2 flex-1 text-small text-ink-2">
                {project.tagline}
              </span>
              <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-link">
                View project
                <ArrowUpRight className="h-4 w-4" aria-hidden />
              </span>
            </Link>
          </li>
        ))}
      </ol>
      <Link
        href="/portfolio"
        className="mt-8 inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-link underline-offset-4 hover:underline"
      >
        All work
        <ArrowUpRight className="h-4 w-4" aria-hidden />
      </Link>
    </Section>
  );
}

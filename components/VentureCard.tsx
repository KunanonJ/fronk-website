import { ArrowUpRight } from "lucide-react";
import type { Venture } from "@/lib/content/ventures";

const STATUS_LABEL: Record<Venture["status"], string> = {
  active: "Active",
  acquired: "Acquired",
  "shut-down": "Shut down",
  paused: "Paused",
};

const STATUS_TONE: Record<Venture["status"], string> = {
  active: "text-emerald-600 dark:text-emerald-400",
  acquired: "text-sky-600 dark:text-sky-400",
  "shut-down": "text-muted",
  paused: "text-amber-600 dark:text-amber-400",
};

export function VentureCard({ venture }: { venture: Venture }) {
  return (
    <a
      href={venture.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block rounded-xl border border-border bg-subtle/30 p-6 transition-[transform,colors,box-shadow,border-color] duration-300 ease-out will-change-transform hover:-translate-y-0.5 hover:border-fg/30 hover:bg-subtle/60 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-baseline gap-3 text-sm text-muted">
            <span>{venture.year}</span>
            <span className={STATUS_TONE[venture.status]}>
              {STATUS_LABEL[venture.status]}
            </span>
          </div>
          <h3 className="text-2xl font-semibold tracking-tight group-hover:text-accent">
            {venture.name}
          </h3>
          <p className="text-sm text-muted">{venture.tagline}</p>
        </div>
        <ArrowUpRight className="h-5 w-5 flex-shrink-0 text-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-fg" />
      </div>

      <p className="mt-4 text-muted">{venture.description}</p>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        {venture.stack.map((tech) => (
          <span
            key={tech}
            className="rounded-full border border-border px-2 py-0.5 text-xs text-muted"
          >
            {tech}
          </span>
        ))}
      </div>

      <div className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-accent">
        Visit {venture.urlLabel}
        <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </div>
    </a>
  );
}

import Link from "next/link";
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
    <Link
      href={`/ventures/${venture.slug}`}
      className="group block rounded-xl border border-border bg-subtle/30 p-6 transition-colors hover:border-fg/30 hover:bg-subtle/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-baseline gap-3 text-sm text-muted">
            <span>{venture.year}</span>
            <span className={STATUS_TONE[venture.status]}>
              {STATUS_LABEL[venture.status]}
            </span>
          </div>
          <h3 className="text-xl font-semibold tracking-tight group-hover:text-accent">
            {venture.name}
          </h3>
        </div>
        <ArrowUpRight className="h-5 w-5 text-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-fg" />
      </div>
      <p className="mt-3 text-muted">{venture.tagline}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {venture.stack.map((tech) => (
          <span
            key={tech}
            className="rounded-full border border-border px-2 py-0.5 text-xs text-muted"
          >
            {tech}
          </span>
        ))}
      </div>
    </Link>
  );
}

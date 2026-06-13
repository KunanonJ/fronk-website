import { ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import type { Venture } from "@/lib/content/ventures";

const STATUS_LABEL: Record<Venture["status"], string> = {
  active: "Active",
  acquired: "Acquired",
  "shut-down": "Shut down",
  paused: "Paused",
};

export function VentureCard({ venture }: { venture: Venture }) {
  return (
    <Card hover className="h-full">
      <a
        href={venture.url}
        target="_blank"
        rel="noopener noreferrer"
        className="group block p-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted">
              <span className="font-mono">{venture.year}</span>
              <Badge variant="outline">{STATUS_LABEL[venture.status]}</Badge>
            </div>
            <h3 className="font-display text-2xl font-bold tracking-tight group-hover:text-accent">
              {venture.name}
            </h3>
            <p className="text-sm text-muted">{venture.tagline}</p>
          </div>
          <ArrowUpRight className="h-5 w-5 flex-shrink-0 text-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-fg" />
        </div>

        <p className="mt-4 text-muted">{venture.description}</p>

        <div className="mt-5 flex flex-wrap gap-2">
          {venture.stack.map((tech) => (
            <Badge key={tech} variant="outline" className="normal-case tracking-normal">
              {tech}
            </Badge>
          ))}
        </div>

        <div className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium underline decoration-accent decoration-2 underline-offset-4">
          Visit {venture.urlLabel}
          <ArrowUpRight className="h-4 w-4" />
        </div>
      </a>
    </Card>
  );
}

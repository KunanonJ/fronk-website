import { ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { MetricCountUp } from "@/components/home/MetricCountUp";
import { cn } from "@/lib/utils/cn";
import type { Venture } from "@/lib/content/ventures";

interface VentureCaseRowProps {
  venture: Venture;
  /** Position in the list — drives the alternating text↔visual layout. */
  index: number;
}

const STATUS_LABEL: Record<Venture["status"], string> = {
  active: "Active",
  acquired: "Acquired",
  "shut-down": "Shut down",
  paused: "Paused",
};

/**
 * Home §D — one venture as a matveyan-style "case row": editorial text on one
 * side, a branded instrument panel on the other, alternating sides by position.
 * The panel shows real headline metrics when they exist and degrades to the
 * tagline otherwise — never fabricated figures. DOM order is always text-first
 * (reading order); the visual side only swaps via CSS `order` at `lg`.
 */
export function VentureCaseRow({ venture, index }: VentureCaseRowProps) {
  const reversed = index % 2 === 1;
  const hasMetrics = !!venture.metrics && venture.metrics.length > 0;

  return (
    <article
      data-layout={reversed ? "visual-text" : "text-visual"}
      className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14"
    >
      {/* Text */}
      <div className={cn("flex flex-col items-start", reversed && "lg:order-2")}>
        <span className="label-mono text-subtle">
          {venture.stack.slice(0, 2).join(" / ")}
        </span>
        <h3 className="mt-4 font-display text-display font-semibold uppercase leading-[0.95] tracking-tight">
          {venture.name}
        </h3>
        <p className="mt-5 max-w-md text-muted">{venture.description}</p>
        <div className="mt-8">
          <Button
            href={venture.url}
            target="_blank"
            rel="noopener noreferrer"
            variant="secondary"
            size="lg"
          >
            Visit {venture.urlLabel}
            <ArrowUpRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Branded instrument panel */}
      <div
        data-panel
        className={cn(
          "panel panel-live relative flex flex-col gap-6 p-6 sm:p-8 lg:p-10",
          reversed && "lg:order-1",
        )}
      >
        <div className="flex items-center justify-between gap-4">
          <span className="label-mono text-fg">{venture.name}</span>
          <span className="label-mono text-subtle">
            {STATUS_LABEL[venture.status]} · {venture.year}
          </span>
        </div>

        <p className="text-sm text-muted">{venture.tagline}</p>

        {hasMetrics ? (
          <dl className="grid grid-cols-2 gap-x-6 gap-y-5 rule-hud pt-6 sm:grid-cols-3 sm:gap-4">
            {venture.metrics!.map((metric) => (
              <div key={metric.label} className="min-w-0 space-y-1">
                <dd className="font-display text-3xl font-semibold tracking-tight tabular-nums sm:text-4xl">
                  <MetricCountUp value={metric.value} />
                </dd>
                <dt className="label-mono text-subtle">{metric.label}</dt>
              </div>
            ))}
          </dl>
        ) : (
          <div className="flex flex-wrap gap-2 rule-hud pt-6">
            {venture.stack.map((tech) => (
              <Badge key={tech} variant="outline" className="normal-case tracking-normal">
                {tech}
              </Badge>
            ))}
          </div>
        )}

        <a
          href={venture.url}
          target="_blank"
          rel="noopener noreferrer"
          className="label-mono mt-auto inline-flex w-fit items-center gap-1.5 text-subtle transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
        >
          → {venture.urlLabel}
        </a>
      </div>
    </article>
  );
}

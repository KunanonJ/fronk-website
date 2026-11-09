import type { CSSProperties } from "react";
import VisualIcon from "@/components/landing/portfolio/VisualIcon";
import type { PortfolioWorkflow as Workflow } from "@/lib/content/portfolio";

type PortfolioWorkflowProps = {
  workflow: Workflow;
  headingId: string;
};

/**
 * Numbered stepper: a vertical timeline on small screens, one row of steps
 * joined by a line from `lg`. Semantic <ol>, so order is announced.
 */
export default function PortfolioWorkflow({
  workflow,
  headingId,
}: PortfolioWorkflowProps) {
  const count = workflow.steps.length;

  return (
    <section aria-labelledby={headingId}>
      <div className="mb-6 flex flex-wrap items-baseline justify-between gap-2">
        <h2
          id={headingId}
          className="font-display text-h3 text-ink"
        >
          How it works
        </h2>
        <p className="font-mono text-label uppercase text-ink-2">
          {workflow.title}
        </p>
      </div>

      <ol
        className="grid gap-6 lg:grid-cols-[repeat(var(--steps),minmax(0,1fr))] lg:gap-4"
        style={{ "--steps": count } as CSSProperties}
      >
        {workflow.steps.map((step, index) => {
          const last = index === count - 1;
          return (
            <li key={step.label} className="relative flex gap-4 lg:flex-col lg:gap-3">
              {!last ? (
                <span
                  aria-hidden="true"
                  className="absolute top-11 bottom-[-1.25rem] left-5 w-px bg-signal/40 lg:top-5 lg:right-[-1rem] lg:bottom-auto lg:left-11 lg:h-px lg:w-auto"
                />
              ) : null}
              <span className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-hairline-strong bg-surface text-ink">
                {step.icon ? (
                  <VisualIcon id={step.icon} className="h-4 w-4" />
                ) : (
                  <span className="text-sm">{index + 1}</span>
                )}
              </span>
              <div className="min-w-0 pb-1">
                <p className="font-mono text-label uppercase text-ink-2">
                  Step {String(index + 1).padStart(2, "0")}
                </p>
                <p className="mt-1 text-sm font-medium text-ink sm:text-base">
                  {step.label}
                </p>
                {step.detail ? (
                  <p className="mt-1 text-sm leading-relaxed text-ink-2">
                    {step.detail}
                  </p>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

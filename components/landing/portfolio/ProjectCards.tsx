import { useEffect, useRef, useState, type CSSProperties } from "react";
import Link from "@/components/navigation/Link";
import { BentoCard, CardKicker, bentoSpan } from "@/components/bento/Bento";
import { TechChip } from "@/components/bento/Chips";
import Image from "@/components/ui/Image";
import { twoDigits } from "@/components/landing/discovery/hubLayout";
import PortfolioMockup from "@/components/landing/portfolio/PortfolioMockup";
import {
  ArrowDownSmallIcon,
  CARD,
  MONO_LABEL,
} from "@/components/landing/portfolio/PortfolioParts";
import VisualIcon from "@/components/landing/portfolio/VisualIcon";
import {
  getAdjacentPortfolioProjects,
  portfolioPage,
  type PortfolioArchitecture,
  type PortfolioProject,
  type PortfolioWorkflow,
} from "@/lib/content/portfolio";
import { cn } from "@/lib/utils/cn";

/*
 * Project page cards (bento canvas, design spec 4.6). Every value comes from
 * lib/content/portfolio.ts; only the card labels are canvas microcopy.
 * Blocks with no data are left out (only TBH Intranet names a before and
 * after, and a project without a workflow has no stepper).
 */

const BODY = "m-0 text-card leading-[1.6] text-ink-2";

/** Interface: the screenshot or the illustrative mockup, then any gallery. */
export function InterfaceCard({ project }: { project: PortfolioProject }) {
  const { cover, mockup, gallery = [] } = project;
  if (!cover && !mockup) return null;
  return (
    <BentoCard
      headingId="card-interface"
      title="Interface"
      span={3}
      minHeight={false}
    >
      <figure className="m-0 flex flex-col gap-3">
        <div className="flex justify-center rounded-well border border-hairline bg-page px-[6%] py-[clamp(20px,5vw,56px)]">
          <div className="w-full max-w-[720px] overflow-hidden rounded-[2.19%/3.5%] shadow-pop">
            {cover ? (
              <Image
                src={cover.src}
                alt={cover.alt}
                width={cover.width}
                height={cover.height}
                priority
                sizes="(min-width: 1024px) 720px, 100vw"
                className="block h-auto w-full"
              />
            ) : mockup ? (
              <PortfolioMockup
                mockup={mockup}
                label={`Illustrative mockup of ${project.name}`}
              />
            ) : null}
          </div>
        </div>
        {cover ? null : (
          <figcaption className="px-1 text-meta text-ink-2">
            Illustrative mockup, not real data.
          </figcaption>
        )}
      </figure>
      {gallery.length > 0 ? (
        <ul className="m-0 grid list-none grid-cols-1 gap-3 p-0 min-[641px]:grid-cols-2">
          {gallery.map((shot) => (
            <li
              key={shot.src}
              className="overflow-hidden rounded-well border border-hairline bg-page"
            >
              <Image
                src={shot.src}
                alt={shot.alt}
                width={shot.width}
                height={shot.height}
                sizes="(min-width: 1024px) 470px, 100vw"
                className="block h-auto w-full"
              />
            </li>
          ))}
        </ul>
      ) : null}
    </BentoCard>
  );
}

type Section = PortfolioProject["sections"][number];

/** The problem: the section, then Before / After when the copy names both. */
export function ProblemCard({
  section,
  beforeAfter,
}: {
  section: Section;
  beforeAfter?: PortfolioProject["beforeAfter"];
}) {
  return (
    <BentoCard
      headingId="card-problem"
      title={section.heading}
      minHeight={false}
    >
      <p className={BODY}>{section.body}</p>
      {beforeAfter ? (
        <dl className="m-0 mt-auto flex flex-col border-t border-hairline">
          <div className="flex items-baseline gap-3 border-b border-hairline py-3">
            <dt className={cn(MONO_LABEL, "flex-[0_0_56px]")}>Before</dt>
            <dd className="m-0 text-card font-medium">{beforeAfter.before}</dd>
          </div>
          <div className="flex items-baseline gap-3 pt-3">
            <dt className={cn(MONO_LABEL, "flex-[0_0_56px]")}>After</dt>
            <dd className="m-0 flex items-center gap-2 text-card font-medium">
              {beforeAfter.after}
              <span aria-hidden className="size-1.5 shrink-0 bg-mark" />
            </dd>
          </div>
        </dl>
      ) : null}
    </BentoCard>
  );
}

/** What it does: the highlights as accent-marked rows. */
export function HighlightsCard({ items }: { items: readonly string[] }) {
  return (
    <BentoCard
      headingId="card-does"
      title="What it does"
      span={2}
      gap={3}
      minHeight={false}
    >
      <ul className="m-0 flex list-none flex-col p-0">
        {items.map((item) => (
          <li
            key={item}
            className="flex gap-3.5 border-b border-hairline py-[11px] text-card leading-normal last:border-b-0 last:pb-0"
          >
            <span aria-hidden className="mt-2 size-1.5 shrink-0 bg-mark" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </BentoCard>
  );
}

/** Steps past this count drop their labels below 641 px (dots only). */
const LABELLED_STEPS_MAX = 4;

const DOT =
  "inline-flex shrink-0 items-center justify-center rounded-full border font-mono text-meta font-medium transition-colors duration-150";

const STEP_BUTTON =
  "inline-flex min-h-11 items-center rounded-full px-[18px] text-sm";

/**
 * How it works: the workflow as numbered step buttons on a progress line,
 * and the chosen step in a well with its icon, Previous / Next / Start
 * again. Local state; the step is announced from the well's live region.
 */
export function FlowCard({ workflow }: { workflow: PortfolioWorkflow }) {
  const { steps } = workflow;
  const count = steps.length;
  const last = count - 1;
  const [step, setStep] = useState(0);
  const current = steps[step] ?? steps[0]!;
  const compact = count > LABELLED_STEPS_MAX;

  // Previous, Next and Start again come and go with the step: when the one
  // just pressed leaves, focus moves to the control that took its place.
  const nextRef = useRef<HTMLButtonElement>(null);
  const restartRef = useRef<HTMLButtonElement>(null);
  const refocus = useRef<"next" | "restart" | null>(null);
  useEffect(() => {
    const target = refocus.current;
    refocus.current = null;
    if (target === "next") nextRef.current?.focus();
    if (target === "restart") restartRef.current?.focus();
  }, [step]);

  const go = (to: number, focus: "next" | "restart" | null = null) => {
    refocus.current = focus;
    setStep(to);
  };

  const line = {
    "--flow-inset": `${50 / count}%`,
    "--flow-fill": `${(step * 100) / count}%`,
  } as CSSProperties;
  const track = cn(
    "absolute left-[var(--flow-inset)] h-0.5",
    compact ? "top-[21px] min-[641px]:top-[25px]" : "top-[25px]",
  );

  return (
    <article
      aria-labelledby="card-flow"
      className={cn(CARD, "flex flex-col gap-5", bentoSpan(3))}
    >
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <CardKicker id="card-flow">How it works</CardKicker>
        <p className={MONO_LABEL}>{workflow.title}</p>
      </div>
      <div className="relative pt-1" style={line}>
        <span
          aria-hidden
          className={cn(track, "right-[var(--flow-inset)] bg-hairline-strong")}
        />
        <span
          aria-hidden
          className={cn(
            track,
            "w-[var(--flow-fill)] bg-mark transition-[width] duration-200",
          )}
        />
        <ol
          aria-label={workflow.title}
          className="relative m-0 grid list-none p-0"
          style={{ gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))` }}
        >
          {steps.map((item, i) => {
            const on = i === step;
            return (
              <li key={item.label} className="flex min-w-0 justify-center">
                <button
                  type="button"
                  aria-pressed={on}
                  onClick={() => go(i)}
                  className="flex min-h-11 w-full flex-col items-center gap-2.5 rounded-2xl border-0 bg-transparent px-1.5 pb-1 text-center text-ink"
                >
                  <span
                    className={cn(
                      DOT,
                      compact ? "size-9 min-[641px]:size-11" : "size-11",
                      on
                        ? "border-cta bg-cta text-on-cta"
                        : i < step
                          ? "border-mark bg-surface-tint text-ink"
                          : "border-hairline-strong bg-surface text-ink-2",
                    )}
                  >
                    {twoDigits(i + 1)}
                  </span>
                  <span
                    className={cn(
                      "text-meta leading-[1.3] font-medium",
                      on ? "text-ink" : "text-ink-2",
                      compact && "max-[640px]:sr-only",
                    )}
                  >
                    {item.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-4 rounded-well border border-hairline bg-page px-5 py-[18px]">
        {current.icon ? (
          <span
            aria-hidden
            className="inline-flex size-12 shrink-0 items-center justify-center rounded-2xl bg-surface-tint text-mark"
          >
            <VisualIcon id={current.icon} />
          </span>
        ) : null}
        <div
          aria-live="polite"
          className="flex min-w-0 flex-[1_1_220px] flex-col gap-1"
        >
          <p className={MONO_LABEL}>
            Step {twoDigits(step + 1)} of {twoDigits(count)}
          </p>
          <p className="m-0 text-[22px] leading-[1.25] font-semibold tracking-[-0.02em]">
            {current.label}
          </p>
          {current.detail ? <p className={BODY}>{current.detail}</p> : null}
        </div>
        <div className="flex flex-wrap gap-2">
          {step > 0 ? (
            <button
              type="button"
              onClick={() => go(step - 1, step === 1 ? "next" : null)}
              className={cn(
                STEP_BUTTON,
                "border border-hairline-strong bg-surface font-medium text-ink",
              )}
            >
              Previous step
            </button>
          ) : null}
          {step < last ? (
            <button
              ref={nextRef}
              type="button"
              onClick={() => go(step + 1, step + 1 === last ? "restart" : null)}
              className={cn(
                STEP_BUTTON,
                "border-0 bg-cta font-semibold text-on-cta",
              )}
            >
              Next step
            </button>
          ) : (
            <button
              ref={restartRef}
              type="button"
              onClick={() => go(0, "next")}
              className={cn(
                STEP_BUTTON,
                "border border-hairline-strong bg-surface font-medium text-ink",
              )}
            >
              Start again
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

/** Architecture: the layers top to bottom, joined by down arrows. */
export function ArchitectureCard({
  architecture,
}: {
  architecture: PortfolioArchitecture;
}) {
  return (
    <article
      aria-labelledby="card-arch"
      className={cn(CARD, "flex flex-col gap-4", bentoSpan(2))}
    >
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <CardKicker id="card-arch">Architecture</CardKicker>
        <p className={MONO_LABEL}>Top to bottom</p>
      </div>
      <ol
        aria-label="Layers, top to bottom"
        className="m-0 flex list-none flex-col gap-2.5 p-0"
      >
        {architecture.layers.map((layer, i) => (
          <li
            key={layer.label}
            className="relative flex flex-wrap items-center gap-x-4 gap-y-2.5 rounded-well border border-hairline bg-page px-4 py-3.5"
          >
            {i > 0 ? (
              <span
                aria-hidden
                className="absolute -top-4 left-1/2 -ml-[11px] flex size-[22px] items-center justify-center rounded-full border border-hairline-strong bg-surface text-ink-2"
              >
                <ArrowDownSmallIcon />
              </span>
            ) : null}
            <h3 className={cn(MONO_LABEL, "flex-[0_0_132px] font-medium")}>
              {twoDigits(i + 1)} · {layer.label}
            </h3>
            <ul className="m-0 flex min-w-0 flex-[1_1_280px] list-none flex-wrap gap-2 p-0">
              {layer.nodes.map((node) => (
                <li
                  key={node.label}
                  className="flex flex-col justify-center gap-0.5 rounded-row border border-hairline-strong bg-surface px-3 py-2"
                >
                  <span className="text-sm font-medium">{node.label}</span>
                  {node.note ? (
                    <span className="text-xs text-ink-2">{node.note}</span>
                  ) : null}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </article>
  );
}

/**
 * The narrow column beside Architecture: the remaining sections ("How it is
 * built") over the full tech stack. Its cards lift on their own.
 */
export function BuiltColumn({
  sections,
  stack,
}: {
  sections: readonly Section[];
  stack: readonly string[];
}) {
  return (
    <div className="bento-row flex min-w-0 flex-col gap-5">
      {sections.map((section, i) => (
        <BentoCard
          key={section.heading}
          headingId={`card-built-${i + 1}`}
          title={section.heading}
          minHeight={false}
        >
          <p className={BODY}>{section.body}</p>
        </BentoCard>
      ))}
      <BentoCard
        headingId="card-stack"
        title="Tech stack"
        minHeight={false}
        className="flex-auto"
      >
        <ul className="m-0 flex list-none flex-wrap gap-1.5 p-0">
          {stack.map((tech) => (
            <li key={tech}>
              <TechChip>{tech}</TechChip>
            </li>
          ))}
        </ul>
      </BentoCard>
    </div>
  );
}

const NAV_CARD =
  "kj-icon flex min-h-40 min-w-0 flex-[1_1_260px] flex-col gap-2 rounded-bento border border-hairline px-5 pt-[18px] pb-5 text-ink no-underline";

const NAV_NAME =
  "mt-auto text-[22px] leading-[1.2] font-semibold tracking-[-0.02em]";

const NAV_NOTE = "text-sm leading-[1.45] text-ink-2";

/** Previous / All projects / Next, wrapping around the list. */
export function ProjectPager({ slug }: { slug: string }) {
  const { prev, next } = getAdjacentPortfolioProjects(slug);
  if (!prev || !next) return null;
  return (
    <nav aria-label="More projects" className="flex flex-wrap gap-5">
      <Link
        href={`/portfolio/${prev.slug}`}
        className={cn(NAV_CARD, "bg-surface shadow-card")}
      >
        <span className={MONO_LABEL}>
          <span aria-hidden>← </span>Previous
        </span>
        <span className={NAV_NAME}>{prev.name}</span>
        <span className={NAV_NOTE}>{prev.tagline}</span>
      </Link>
      <Link
        href="/portfolio"
        className={cn(NAV_CARD, "items-center bg-surface-tint text-center")}
      >
        <span className={MONO_LABEL}>{portfolioPage.eyebrow}</span>
        <span className={NAV_NAME}>All projects</span>
        <span className={NAV_NOTE}>{portfolioPage.title}</span>
      </Link>
      <Link
        href={`/portfolio/${next.slug}`}
        className={cn(NAV_CARD, "items-end bg-surface text-right shadow-card")}
      >
        <span className={MONO_LABEL}>
          Next<span aria-hidden> →</span>
        </span>
        <span className={NAV_NAME}>{next.name}</span>
        <span className={NAV_NOTE}>{next.tagline}</span>
      </Link>
    </nav>
  );
}

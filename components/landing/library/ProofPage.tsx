import { useState } from "react";
import Link from "@/components/navigation/Link";
import { TechChip } from "@/components/bento/Chips";
import {
  CARD,
  EXTERNAL,
  Kicker,
  LibraryHero,
  MONO_LABEL,
  TEXT_LINK,
  WELL,
} from "@/components/landing/library/parts";
import {
  getProofCases,
  getProofMetrics,
  proofPage,
  type ProofMetric,
} from "@/lib/content/proof";
import type { Venture } from "@/lib/content/ventures";
import { cn } from "@/lib/utils/cn";
import { pad2 } from "@/lib/utils/pad2";

/**
 * Venture metrics: a tile per published figure; picking one shows the
 * sentence it comes from. The pick is local state (owner default: metric
 * tiles are not URL state).
 */
function MetricsCard({ metrics }: { metrics: readonly ProofMetric[] }) {
  const [picked, setPicked] = useState(0);
  const source = metrics[picked] ?? metrics[0];
  const ventures = [...new Set(metrics.map((m) => m.source))];

  return (
    <article aria-labelledby="card-metrics" className={cn(CARD, "gap-[18px]")}>
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
        <Kicker id="card-metrics">Venture metrics</Kicker>
        <span className={MONO_LABEL}>
          {pad2(metrics.length)} published · {ventures.join(" · ")}
        </span>
      </div>
      <div
        role="group"
        aria-label="Pick a metric to see its source"
        className="flex flex-wrap gap-3"
      >
        {metrics.map((metric, i) => {
          const on = i === picked;
          return (
            <button
              key={`${metric.source}-${metric.label}`}
              type="button"
              aria-pressed={on}
              onClick={() => setPicked(i)}
              className={cn(
                "flex min-h-[120px] min-w-0 flex-[1_1_180px] flex-col items-start gap-2 rounded-well border px-[18px] py-4 text-left text-ink",
                on ? "border-mark bg-surface-tint" : "border-hairline bg-page",
              )}
            >
              <span className="text-[40px] leading-[1.05] font-semibold tracking-[-0.03em] tabular-nums">
                {metric.value}
              </span>
              <span className={MONO_LABEL}>
                {metric.label} · {metric.source}
              </span>
            </button>
          );
        })}
      </div>
      <div
        aria-live="polite"
        className={cn(WELL, "flex flex-col gap-2.5 px-5 py-[18px]")}
      >
        <p className={cn(MONO_LABEL, "inline-flex items-center gap-2")}>
          <span aria-hidden className="size-1.5 shrink-0 bg-mark" />
          Source · {source.where}
        </p>
        <blockquote className="m-0 max-w-[760px] text-lg leading-[1.55] text-ink">
          “{source.quote}”
        </blockquote>
        <Link href={source.href} className={TEXT_LINK}>
          Read the {source.source} case →
        </Link>
      </div>
    </article>
  );
}

/** A venture case: logo and tagline, summary, role and timeline, focus, links. */
function CaseCard({ venture }: { venture: Venture }) {
  const id = `case-${venture.slug}`;
  return (
    <article aria-labelledby={id} className={cn(CARD, "gap-[18px]")}>
      <div className="flex items-center justify-between gap-3">
        <Kicker id={id}>{venture.name} case</Kicker>
        <span className={MONO_LABEL}>Venture</span>
      </div>
      <div className="flex min-w-0 items-center gap-4">
        <img
          src={venture.logo}
          alt=""
          width={72}
          height={72}
          loading="lazy"
          decoding="async"
          className="size-[72px] shrink-0 rounded-well border-[3px] border-surface bg-paper object-cover shadow-logo"
        />
        <div className="flex min-w-0 flex-col gap-1">
          <h3 className="m-0 text-2xl font-semibold tracking-[-0.02em]">
            {venture.name}
          </h3>
          <p className="m-0 text-sm leading-[1.45] text-ink-2">
            {venture.tagline}
          </p>
        </div>
      </div>
      <p className="m-0 text-card leading-[1.6] text-ink-2">
        {venture.description}
      </p>
      <dl className="m-0 flex flex-wrap border-t border-hairline">
        <div className="flex flex-[1_1_110px] flex-col gap-1 py-3">
          <dt className={MONO_LABEL}>Role</dt>
          <dd className="m-0 text-card font-medium">{venture.role}</dd>
        </div>
        {venture.caseStudy ? (
          <div className="flex flex-[1_1_110px] flex-col gap-1 py-3">
            <dt className={MONO_LABEL}>Timeline</dt>
            <dd className="m-0 font-mono text-sm">
              {venture.caseStudy.timeline}
            </dd>
          </div>
        ) : null}
      </dl>
      {venture.stack.length > 0 ? (
        <ul
          aria-label="Focus"
          className="m-0 flex list-none flex-wrap gap-1.5 p-0"
        >
          {venture.stack.map((item) => (
            <li key={item}>
              <TechChip>{item}</TechChip>
            </li>
          ))}
        </ul>
      ) : null}
      <div className="mt-auto flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
        <a
          href={venture.url}
          {...EXTERNAL}
          className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-ink no-underline"
        >
          {venture.status === "active" ? (
            <>
              <span aria-hidden className="size-[7px] shrink-0 bg-ember" />
              Live
            </>
          ) : null}
          <span className="font-mono text-xs text-ink-2">
            {venture.urlLabel}
          </span>
        </a>
        <Link
          href={`/ventures/${venture.slug}`}
          aria-label={`View the ${venture.name} case`}
          className={TEXT_LINK}
        >
          View →
        </Link>
      </div>
    </article>
  );
}

/**
 * Proof (bento redesign, phase 7f; design spec 4.13): the venture metrics
 * card (tiles and the quoted source), then the venture cases side by side.
 * Every figure and quote comes from lib/content/ventures; none is invented.
 */
export default function ProofPage() {
  const metrics = getProofMetrics();
  return (
    <>
      <LibraryHero
        eyebrow={proofPage.eyebrow}
        headline={proofPage.headline}
        lede={proofPage.description}
      />
      {metrics.length > 0 ? <MetricsCard metrics={metrics} /> : null}
      <section
        aria-label="Case studies"
        className="bento-2 grid grid-cols-1 gap-5 min-[641px]:grid-cols-2"
      >
        {getProofCases().map((venture) => (
          <CaseCard key={venture.slug} venture={venture} />
        ))}
      </section>
    </>
  );
}

import { useState } from "react";
import { Chip } from "@/components/ds/labels";
import { Reveal } from "@/components/ds/Reveal";
import Link from "@/components/navigation/Link";
import {
  ArrowLink,
  BlockHead,
  countLabel,
} from "@/components/profile/pages/library/parts";
import {
  ReadingHero,
  SegmentHeadline,
} from "@/components/profile/pages/ReadingHero";
import { RESUME_HREF } from "@/lib/content/availability";
import {
  getProofCases,
  getProofMetrics,
  getProofOutcomes,
  proofPage,
  type ProofMetric,
  type ProofOutcome,
} from "@/lib/content/proof";
import type { Venture } from "@/lib/content/ventures";
import { cn } from "@/lib/utils/cn";
import { pad2 } from "@/lib/utils/pad2";

/*
 * /proof (profile redesign, Phase 7 lane D1, plan step 7d): Delivery first,
 * the outcomes the case studies state, a tile each that opens its case
 * study; then the venture metrics, a tile per published figure (a running
 * total carries the month it was true) and the sentence it comes from; then
 * the venture cases side by side. Every figure is read from
 * lib/content/portfolio or lib/content/ventures; none is typed here.
 */

/**
 * Delivery (recruiter-fit phase 3): his own figures, so the block says where
 * he states them. In the DOM the label comes before the figure, as a screen
 * reader should hear it; the figure is drawn on top.
 */
function Delivery({ outcomes }: { outcomes: readonly ProofOutcome[] }) {
  const projects = [...new Set(outcomes.map((outcome) => outcome.project))];
  return (
    <article aria-labelledby="card-delivery">
      <BlockHead
        id="card-delivery"
        title="Delivery"
        note={`${countLabel(outcomes.length, "outcome", "outcomes")} · ${projects.join(" · ")}`}
      />
      <ul
        aria-label="Outcomes, each linking to its case study"
        className="pf-read-flex pf-read-flex--wide"
      >
        {outcomes.map((outcome) => (
          <li
            key={`${outcome.project}-${outcome.label}`}
            className="pf-read-item"
          >
            <Link href={outcome.href} className="ds-tile pf-read-figure-tile">
              <span className="t-meta pf-read-figure-tile__label">
                {outcome.label} · {outcome.project}
              </span>
              <span className="t-h3 pf-read-figure">{outcome.value}</span>
              <span className="pf-read-figure-tile__cta">
                Case study <span aria-hidden="true">→</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <p className="pf-read-note">
        <Link href={RESUME_HREF} className="ds-text-link">
          As stated in the résumé →
        </Link>
      </p>
    </article>
  );
}

/**
 * Venture metrics: a tile per published figure; picking one shows the
 * sentence it comes from. The pick is local state (owner default: metric
 * tiles are not URL state). A running total prints the month it was true.
 */
function Metrics({ metrics }: { metrics: readonly ProofMetric[] }) {
  const [picked, setPicked] = useState(0);
  const source = metrics[picked] ?? metrics[0]!;
  const ventures = [...new Set(metrics.map((m) => m.source))];

  return (
    <article aria-labelledby="card-metrics">
      <BlockHead
        id="card-metrics"
        title="Venture metrics"
        note={`${pad2(metrics.length)} published · ${ventures.join(" · ")}`}
      />
      <div
        role="group"
        aria-label="Pick a metric to see its source"
        className="pf-read-flex"
      >
        {metrics.map((metric, i) => (
          <button
            key={`${metric.source}-${metric.label}`}
            type="button"
            aria-pressed={i === picked}
            onClick={() => setPicked(i)}
            className={cn(
              "ds-tile pf-read-metric",
              // A running total is long: the two share a row of their own.
              metric.asOf && "pf-read-metric--dated",
            )}
          >
            <span className="t-h3 pf-read-figure">{metric.value}</span>
            <span className="t-meta text-ink-2">
              {metric.label} · {metric.source}
              {metric.asOf ? (
                <span className="pf-read-asof">As of {metric.asOf}</span>
              ) : null}
            </span>
          </button>
        ))}
      </div>
      <div aria-live="polite" className="ds-tile ds-tile--paper pf-read-source">
        <p className="t-meta pf-read-meta">
          <span>Source · {source.where}</span>
        </p>
        <blockquote className="t-lead pf-read-quote">
          “{source.quote}”
        </blockquote>
        <ArrowLink href={source.href}>Read the {source.source} case</ArrowLink>
      </div>
    </article>
  );
}

/** A venture case: logo and tagline, summary, role and timeline, focus, links. */
function CaseTile({ venture }: { venture: Venture }) {
  const id = `case-${venture.slug}`;
  return (
    <article aria-labelledby={id} className="ds-tile pf-read-tile">
      <BlockHead id={id} title={`${venture.name} case`} note="Venture" />
      <div className="pf-read-lead-tool">
        <img
          src={venture.logo}
          alt=""
          width={72}
          height={72}
          loading="lazy"
          decoding="async"
          className="pf-read-logo"
        />
        <div className="pf-read-tool__text">
          <h3 className="t-lift-title pf-read-title">{venture.name}</h3>
          <p className="t-small text-ink-2">{venture.tagline}</p>
        </div>
      </div>
      <p className="t-small pf-read-text">{venture.description}</p>
      <dl className="pf-read-facts">
        <div>
          <dt className="t-meta text-ink-2">Role</dt>
          <dd className="t-meta-value">{venture.role}</dd>
        </div>
        {venture.caseStudy ? (
          <div>
            <dt className="t-meta text-ink-2">Timeline</dt>
            <dd className="t-meta-value">{venture.caseStudy.timeline}</dd>
          </div>
        ) : null}
      </dl>
      {venture.stack.length > 0 ? (
        <ul aria-label="Focus" className="pf-read-chips">
          {venture.stack.map((item) => (
            <li key={item}>
              <Chip>{item}</Chip>
            </li>
          ))}
        </ul>
      ) : null}
      <div className="pf-read-foot">
        <a
          href={venture.url}
          target="_blank"
          rel="noopener noreferrer"
          className="ds-text-link pf-read-link"
        >
          {venture.status === "active" ? (
            <>
              <span aria-hidden="true" className="pf-read-live" />
              Live
            </>
          ) : null}
          <span className="t-meta pf-read-path">
            {venture.urlLabel}
            <span className="sr-only"> (opens in a new tab)</span>
          </span>
        </a>
        <ArrowLink
          href={`/ventures/${venture.slug}`}
          label={`View the ${venture.name} case`}
        >
          View
        </ArrowLink>
      </div>
    </article>
  );
}

export default function ProofPage() {
  const outcomes = getProofOutcomes();
  const metrics = getProofMetrics();
  const { headline } = proofPage;
  return (
    <>
      <ReadingHero
        eyebrow={proofPage.eyebrow}
        title={
          <SegmentHeadline
            lines={[...headline.lines, [headline.accent]]}
            joiner=" "
          />
        }
        lead={proofPage.description}
      />
      <div className="ds-wrap pf-read-body">
        {outcomes.length > 0 ? <Delivery outcomes={outcomes} /> : null}
        {metrics.length > 0 ? (
          <Reveal>
            <Metrics metrics={metrics} />
          </Reveal>
        ) : null}
        <Reveal>
          <section
            aria-label="Case studies"
            className="pf-read-flex pf-read-flex--wide"
          >
            {getProofCases().map((venture) => (
              <CaseTile key={venture.slug} venture={venture} />
            ))}
          </section>
        </Reveal>
      </div>
    </>
  );
}

import { getAllPortfolioProjects } from "@/lib/content/portfolio";
import { getAllVentures, type Venture } from "@/lib/content/ventures";
import { PAGE_META } from "@/lib/content/pageMeta";

/**
 * An outcome a portfolio case study states, as the owner's résumé words it
 * (recruiter-fit phase 3). Read from the project, never typed here, so the
 * audit in `portfolioOutcomes.test.ts` covers this page too.
 */
export type ProofOutcome = {
  value: string;
  label: string;
  /** The project's name. */
  project: string;
  /** The project's case study. */
  href: string;
};

/** Every case-study outcome, in portfolio order. */
export function getProofOutcomes(): readonly ProofOutcome[] {
  return getAllPortfolioProjects().flatMap((project) =>
    (project.outcomes ?? []).map((outcome) => ({
      value: outcome.value,
      label: outcome.label,
      project: project.name,
      href: `/portfolio/${project.slug}`,
    })),
  );
}

/** A published venture metric with the sentence that states it. */
export type ProofMetric = {
  value: string;
  label: string;
  /** The month a running total was true, when the figure is dated. */
  asOf?: string;
  /** The venture's name. */
  source: string;
  /** Where the quote comes from, e.g. "GoGoCash case · Where it stands". */
  where: string;
  /** The published sentence that states the value, word for word. */
  quote: string;
  /** The venture's case page. */
  href: string;
};

export const proofPage = {
  eyebrow: "Proof",
  title: "Proof",
  description: PAGE_META.proof.description,
  /** The description as the bento canvas draws the h1: one entry per line. */
  headline: {
    lines: [
      [{ muted: "Honest signals:" }, " venture metrics"],
      [{ muted: "and" }, " case studies."],
    ],
    accent: "No invented scores.",
  },
} as const;

/** Sentences of a paragraph (a full stop and a space end one). */
function sentences(text: string): string[] {
  return text.split(/(?<=\.)\s+/);
}

/**
 * The first published sentence that states `value`: the case sections in
 * order, then the venture summary. Every metric is corroborated by one
 * (tested), so the quote is never written by hand.
 */
function sourceFor(
  venture: Venture,
  value: string,
): { where: string; quote: string } {
  const texts = [
    ...(venture.caseStudy?.sections ?? []).map((section) => ({
      where: `${venture.name} case · ${section.heading}`,
      text: section.body,
    })),
    { where: `${venture.name} · Venture summary`, text: venture.description },
  ];
  for (const { where, text } of texts) {
    const quote = sentences(text).find((s) => s.includes(value));
    if (quote) return { where, quote };
  }
  return {
    where: `${venture.name} · Venture summary`,
    quote: venture.description,
  };
}

/** Published venture metrics, each with the sentence it comes from. */
export function getProofMetrics(): readonly ProofMetric[] {
  const out: ProofMetric[] = [];
  for (const venture of getAllVentures()) {
    for (const metric of venture.metrics ?? []) {
      out.push({
        value: metric.value,
        label: metric.label,
        ...(metric.asOf ? { asOf: metric.asOf } : {}),
        source: venture.name,
        href: `/ventures/${venture.slug}`,
        ...sourceFor(venture, metric.value),
      });
    }
  }
  return out;
}

/**
 * The ventures with a case page, newest first. Press items were removed
 * 04-11-26 (owner request): they linked to the owner's own sites, not real
 * coverage, and /press is hidden.
 */
export function getProofCases(): readonly Venture[] {
  return getAllVentures().filter((venture) => venture.caseStudy);
}

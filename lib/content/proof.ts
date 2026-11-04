import { getAllVentures } from "@/lib/content/ventures";

export type ProofMetric = {
  value: string;
  label: string;
  source: string;
};

export type ProofCard = {
  id: string;
  title: string;
  description: string;
  href: string;
  external?: boolean;
  source?: string;
};

export const proofPage = {
  eyebrow: "Proof",
  title: "Proof",
  description:
    "Honest signals — venture metrics and case studies. No invented scores.",
} as const;

/** Flatten published venture metrics for the proof strip. */
export function getProofMetrics(): readonly ProofMetric[] {
  const out: ProofMetric[] = [];
  for (const venture of getAllVentures()) {
    for (const metric of venture.metrics ?? []) {
      out.push({
        value: metric.value,
        label: metric.label,
        source: venture.name,
      });
    }
  }
  return out;
}

/**
 * Venture case links as proof cards. Press items were removed 04-11-26
 * (owner request): they linked to the owner's own sites, not real coverage,
 * and /press is hidden.
 */
export function getProofCards(): readonly ProofCard[] {
  const ventureCards: ProofCard[] = getAllVentures()
    .filter((v) => v.caseStudy)
    .map((v) => ({
      id: `venture-${v.slug}`,
      title: `${v.name} case`,
      description: v.description,
      href: `/ventures/${v.slug}`,
      source: "Venture",
    }));

  return ventureCards;
}

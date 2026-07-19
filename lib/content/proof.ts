import { pressItems } from "@/lib/content/press";
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
    "Honest signals — venture metrics and selected mentions. No invented scores.",
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

/** Press + venture case links as proof cards. */
export function getProofCards(): readonly ProofCard[] {
  const pressCards: ProofCard[] = pressItems.map((item) => ({
    id: `press-${item.id}`,
    title: item.title,
    description: item.description,
    href: item.href,
    external: true,
    source: item.source,
  }));

  const ventureCards: ProofCard[] = getAllVentures()
    .filter((v) => v.caseStudy)
    .map((v) => ({
      id: `venture-${v.slug}`,
      title: `${v.name} case`,
      description: v.description,
      href: `/ventures/${v.slug}`,
      source: "Venture",
    }));

  return [...ventureCards, ...pressCards];
}

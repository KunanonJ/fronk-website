export interface Venture {
  slug: string;
  name: string;
  tagline: string;
  /** Short pitch used on the card. One or two sentences. */
  description: string;
  year: number;
  role: string;
  status: "active" | "acquired" | "shut-down" | "paused";
  stack: readonly string[];
  /** External landing page — when present, the card CTAs straight to it. */
  url: string;
  /** Display string for the URL CTA (e.g. "gogocash.co"). */
  urlLabel: string;
  /**
   * Headline figures for the case-row instrument panel. Honest only — every
   * value must be corroborated by the description / a published claim. Omit
   * entirely when a venture has no real numbers yet (no fabricated metrics).
   */
  metrics?: readonly { value: string; label: string }[];
  featured?: boolean;
  /** Lower sorts earlier in the home featured list (flagship-first). */
  featuredOrder?: number;
  /**
   * Long-form case-study content for /ventures/[slug]. Same honesty rule as
   * metrics: every claim restates a published fact — no invented numbers,
   * clients, or outcomes.
   */
  caseStudy?: VentureCaseStudy;
}

export interface VentureCaseStudy {
  /** Opening paragraph under the case-page header. */
  intro: string;
  sections: readonly { heading: string; body: string }[];
  /** Display string, e.g. "2023 — present". */
  timeline: string;
}

const VENTURES: readonly Venture[] = [
  {
    slug: "gogocash",
    name: "GoGoCash",
    tagline: "Shopping-to-earn cashback.",
    description:
      "A shopping-to-earn cashback platform. 1,000+ users earning up to 30% back across 220+ top merchants — Apple, Samsung, Lazada, Shopee, TikTok Shop, Temu, and more.",
    year: 2023,
    role: "Founder",
    status: "active",
    stack: ["Cashback", "E-commerce", "Affiliate"],
    url: "https://gogocash.co",
    urlLabel: "gogocash.co",
    // Corroborated by the description above — not invented.
    metrics: [
      { value: "1,000+", label: "Users" },
      { value: "220+", label: "Merchants" },
      { value: "30%", label: "Max cashback" },
    ],
    featured: true,
    featuredOrder: 1,
    caseStudy: {
      intro:
        "GoGoCash is a shopping-to-earn cashback platform: shop at the stores you already use, earn a cut of every purchase back. It has grown to more than a thousand users earning across 220+ merchants.",
      timeline: "2023 — present",
      sections: [
        {
          heading: "What it is",
          body: "A cashback layer over everyday e-commerce. Members shop through GoGoCash at partner merchants — Apple, Samsung, Lazada, Shopee, TikTok Shop, Temu, and more — and earn up to 30% of the purchase back, funded by affiliate commissions.",
        },
        {
          heading: "Where it stands",
          body: "Live at gogocash.co with 1,000+ users and a merchant catalogue past 220 partners. The core loop — browse, shop, track cashback, withdraw — is in production and growing.",
        },
        {
          heading: "My role",
          body: "Founder. I own the product end to end: merchant partnerships, the cashback engine, and the member experience, from first commit in 2023 to today.",
        },
      ],
    },
  },
  {
    slug: "manut",
    name: "Manut AI",
    tagline: "ERP/CRM workspace with Intelligence AI for automotive SMEs.",
    description:
      "An ERP/CRM workspace with Intelligence AI for SMEs in the automotive industry — ops, customers, and repeat decisions in one place instead of a dozen disconnected SaaS tools.",
    year: 2025,
    role: "Founder",
    status: "active",
    stack: ["ERP/CRM", "Intelligence AI", "Automotive SME"],
    url: "https://manut.xyz",
    urlLabel: "manut.xyz",
    featured: true,
    featuredOrder: 2,
    caseStudy: {
      intro:
        "Manut AI is an ERP/CRM workspace with Intelligence AI for automotive SMEs — one operator surface for internal systems instead of SaaS sprawl.",
      timeline: "2025 — present",
      sections: [
        {
          heading: "What it is",
          body: "ERP and CRM workflows for automotive SMEs, with Intelligence AI assisting the repetitive operator work — follow-ups, ops handoffs, and decisions that used to live in spreadsheets and five tabs.",
        },
        {
          heading: "Why it matters in Thailand & SEA",
          body: "SMEs and startups need a system of record before flashy agents. Manut starts from that internal system, then layers AI where judgment repeats. Live at manut.xyz.",
        },
        {
          heading: "My role",
          body: "Founder. Started in 2025; I design and build the product — ERP/CRM structure, Intelligence AI workflows, and the operator experience from Bangkok.",
        },
      ],
    },
  },
];

export function getAllVentures(): readonly Venture[] {
  return [...VENTURES].sort((a, b) => b.year - a.year);
}

export function getFeaturedVentures(limit?: number): readonly Venture[] {
  // Flagship-first on the home page, independent of getAllVentures' year sort.
  const featured = getAllVentures()
    .filter((v) => v.featured)
    .sort(
      (a, b) =>
        (a.featuredOrder ?? Number.POSITIVE_INFINITY) -
        (b.featuredOrder ?? Number.POSITIVE_INFINITY),
    );
  return typeof limit === "number" ? featured.slice(0, limit) : featured;
}

export function getVentureBySlug(slug: string): Venture | null {
  return VENTURES.find((v) => v.slug === slug) ?? null;
}

export function getAllVentureSlugs(): readonly string[] {
  return VENTURES.map((v) => v.slug);
}

/**
 * Prev/next neighbours in the year-desc case-page order. No wrap-around —
 * the edges return null so the footer nav renders a single direction.
 */
export function getAdjacentVentures(slug: string): {
  prev: Venture | null;
  next: Venture | null;
} {
  const ordered = getAllVentures();
  const index = ordered.findIndex((v) => v.slug === slug);
  if (index === -1) return { prev: null, next: null };
  return {
    prev: index > 0 ? ordered[index - 1] : null,
    next: index < ordered.length - 1 ? ordered[index + 1] : null,
  };
}

export function resolveVentures(
  cmsVentures: readonly Venture[] | null | undefined,
  fallback: readonly Venture[] = VENTURES,
): readonly Venture[] {
  if (!cmsVentures || cmsVentures.length === 0) return fallback;
  return cmsVentures;
}

export function resolveFeaturedVentures(
  cmsVentures: readonly Venture[] | null | undefined,
  fallback: readonly Venture[] = VENTURES,
  limit?: number,
): readonly Venture[] {
  const source = resolveVentures(cmsVentures, fallback);
  const featured = source.filter((venture) => venture.featured);
  return typeof limit === "number" ? featured.slice(0, limit) : featured;
}

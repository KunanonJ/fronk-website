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
  },
  {
    slug: "manut",
    name: "Manut AI",
    tagline: "Notion on steroids, for solo entrepreneurs.",
    description:
      "An all-in-one workspace for solo entrepreneurs. Connects MongoDB, Meta, AI agents, and multiple AI models into a single platform — so you run your whole operation in one place instead of stitching together a dozen SaaS tools.",
    year: 2025,
    role: "Founder",
    status: "active",
    stack: ["AI agents", "MongoDB", "Self-hosted"],
    url: "https://manut.xyz",
    urlLabel: "manut.xyz",
    featured: true,
    featuredOrder: 2,
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

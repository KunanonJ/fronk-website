export interface Venture {
  slug: string;
  name: string;
  tagline: string;
  year: number;
  role: string;
  status: "active" | "acquired" | "shut-down" | "paused";
  stack: readonly string[];
  url?: string;
  summary: string;
  problem: string;
  approach: string;
  outcome: string;
  learnings: readonly string[];
  featured?: boolean;
}

const VENTURES: readonly Venture[] = [
  {
    slug: "atlas",
    name: "Atlas",
    tagline: "Infrastructure for small teams to ship faster.",
    year: 2024,
    role: "Founder & CEO",
    status: "active",
    stack: ["TypeScript", "Next.js", "Postgres", "Cloudflare"],
    url: "https://example.com/atlas",
    summary:
      "A platform that compresses a week of DevOps onboarding into an afternoon for two-to-twenty person teams.",
    problem:
      "Early-stage teams burn weeks on infrastructure that doesn't move the product forward. The tooling exists but the assembly is the work.",
    approach:
      "We built an opinionated runtime with sensible defaults: preview environments, secrets management, observability, and rollbacks — all wired up on first commit. No yak-shaving.",
    outcome:
      "Reached design-partner traction with a handful of teams across fintech, devtools, and consumer. P50 onboarding is now 22 minutes from signup to first deploy.",
    learnings: [
      "Opinionation beats configurability for the first 90 days of a customer relationship.",
      "Onboarding time is the single best leading indicator of activation.",
      "Founders trust founders — sales-led GTM beat product-led for our ICP.",
    ],
    featured: true,
  },
  {
    slug: "lumen",
    name: "Lumen",
    tagline: "Privacy-first analytics for solo builders.",
    year: 2023,
    role: "Founder",
    status: "active",
    stack: ["Rust", "ClickHouse", "Astro"],
    url: "https://example.com/lumen",
    summary:
      "A lightweight analytics product for independent makers who want signal without surveillance.",
    problem:
      "Mainstream analytics tools optimize for ad-network-grade tracking. Indie builders want to know what's working — not who their visitors are.",
    approach:
      "Built a Rust ingestion layer that drops PII at the edge, with a simple Astro dashboard. No cookies, no fingerprints, GDPR-clean by default.",
    outcome:
      "Crossed 1,200 paying customers on a flat $9/mo plan. Profitable from month four with two contractors.",
    learnings: [
      "Boring infrastructure is a feature when the buyer cares about reliability over novelty.",
      "Pricing simplicity (one plan, one number) removed 80% of the sales conversation.",
      "A small wedge in a clear niche compounds faster than a broad wedge in a crowded market.",
    ],
    featured: true,
  },
  {
    slug: "tessera",
    name: "Tessera",
    tagline: "Marketplace for verified open-source maintainers.",
    year: 2022,
    role: "Co-founder",
    status: "shut-down",
    stack: ["Python", "Django", "Stripe Connect"],
    summary:
      "Connected companies depending on open-source libraries with the maintainers behind them, for paid support and roadmap influence.",
    problem:
      "Companies relied on open-source software they couldn't get a support contract for. Maintainers wanted income from their work.",
    approach:
      "Built a two-sided marketplace with KYC, scoped support tiers, and a billing layer that handled the messy tax/escrow plumbing for solo maintainers.",
    outcome:
      "Reached a small but real GMV before realizing the friction between buyers (procurement-heavy) and sellers (allergic to procurement) was structural. Shut down after 14 months and returned remaining funds.",
    learnings: [
      "Two-sided marketplaces with structurally mismatched workflows don't survive without huge subsidies.",
      "Founder honesty about the shut-down decision compounded into the next venture's fundraise.",
      "Open-source as a market is enormous; open-source-as-a-product is brutal.",
    ],
    featured: true,
  },
];

export function getAllVentures(): readonly Venture[] {
  return [...VENTURES].sort((a, b) => b.year - a.year);
}

export function getFeaturedVentures(limit?: number): readonly Venture[] {
  const featured = getAllVentures().filter((v) => v.featured);
  return typeof limit === "number" ? featured.slice(0, limit) : featured;
}

export function getVentureBySlug(slug: string): Venture | null {
  return VENTURES.find((v) => v.slug === slug) ?? null;
}

export function getAllVentureSlugs(): readonly string[] {
  return VENTURES.map((v) => v.slug);
}

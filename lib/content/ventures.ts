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
  /** Square logo (public path) for the hub h1 and the "Also building" card. */
  logo: string;
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
  /**
   * The tagline as the hub h1 draws it, one string per line: every line but
   * the last is muted, the last takes the accent colour. Joined with single
   * spaces the lines are exactly `tagline` (tested).
   */
  taglineLines: readonly string[];
  sections: readonly { heading: string; body: string }[];
  /** Display string, e.g. "2023 — present". */
  timeline: string;
  /**
   * The product's core loop as ordered stages, only where a section states
   * one (GoGoCash's "Where it stands"). Drives the hub's loop stepper; omit
   * it when the venture has no published loop.
   */
  loop?: readonly string[];
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
    logo: "/brand/gogocash.svg",
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
      taglineLines: ["Shopping-to-earn", "cashback."],
      timeline: "2023 — present",
      // The stages "Where it stands" names: browse, shop, track cashback, withdraw.
      loop: ["Browse", "Shop", "Track cashback", "Withdraw"],
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
    logo: "/brand/manut-144.webp",
    featured: true,
    featuredOrder: 2,
    caseStudy: {
      intro:
        "Manut AI is an ERP/CRM workspace with Intelligence AI for automotive SMEs — one operator surface for internal systems instead of SaaS sprawl.",
      taglineLines: [
        "ERP/CRM workspace",
        "with Intelligence AI",
        "for automotive SMEs.",
      ],
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

export function getVentureBySlug(slug: string): Venture | null {
  return VENTURES.find((v) => v.slug === slug) ?? null;
}

export function getAllVentureSlugs(): readonly string[] {
  return VENTURES.map((v) => v.slug);
}

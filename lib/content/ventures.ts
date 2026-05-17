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
  featured?: boolean;
}

const VENTURES: readonly Venture[] = [
  {
    slug: "gogocash",
    name: "GoGoCash",
    tagline: "Cash, on-demand.",
    description:
      "A fintech product giving people in Thailand fast, transparent access to short-term liquidity — built for speed, honest pricing, and reliable payouts.",
    year: 2023,
    role: "Founder",
    status: "active",
    stack: ["Fintech rails", "Payments", "TypeScript"],
    url: "https://gogocash.co",
    urlLabel: "gogocash.co",
    featured: true,
  },
  {
    slug: "manut",
    name: "Manut AI",
    tagline: "AI-augmented knowledge workspace.",
    description:
      "A self-hosted knowledge platform with AI built in — for planning, sorting, and creating in one place, without the silo problem of stacking five SaaS tools.",
    year: 2025,
    role: "Founder",
    status: "active",
    stack: ["AI", "AFFiNE", "Self-hosted"],
    url: "https://manut.xyz",
    urlLabel: "manut.xyz",
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

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
    tagline: "Shopping-to-earn cashback.",
    description:
      "A shopping-to-earn cashback platform. 1,000+ users earning up to 30% back across 220+ top merchants — Apple, Samsung, Lazada, Shopee, TikTok Shop, Temu, and more.",
    year: 2023,
    role: "Founder",
    status: "active",
    stack: ["Cashback", "E-commerce", "Affiliate"],
    url: "https://gogocash.co",
    urlLabel: "gogocash.co",
    featured: true,
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

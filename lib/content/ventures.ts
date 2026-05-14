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
    slug: "gogocare",
    name: "GoGoCare",
    tagline: "Healthcare benefits, reimagined for modern teams.",
    year: 2025,
    role: "Founder",
    status: "active",
    stack: ["TypeScript", "Next.js", "Healthcare APIs"],
    summary:
      "Building accessible healthcare benefits infrastructure — making employer-sponsored care simpler for both companies and the people they cover.",
    problem:
      "[REPLACE] Modern teams need healthcare benefits that match how they actually work — flexible, transparent, and digital-first. The legacy options are anything but.",
    approach:
      "[REPLACE] Designing the product, working with care partners, and shipping the first version end-to-end.",
    outcome:
      "[REPLACE] Currently in build / early-customer phase. Updates coming.",
    learnings: [
      "[REPLACE — add 2–3 short bullets once there's something concrete to share.]",
    ],
    featured: true,
  },
  {
    slug: "gogocash",
    name: "GoGoCash",
    tagline: "Cash, on-demand.",
    year: 2023,
    role: "Founder",
    status: "active",
    stack: ["TypeScript", "Fintech rails", "Payments"],
    url: "https://gogocash.co",
    summary:
      "A fintech product giving people fast, transparent access to their own money — without the friction or hidden costs of traditional channels.",
    problem:
      "[REPLACE] Existing cash-access products are expensive, slow, or trap users in fee cycles. There's room for a model that's honest about price and fast by default.",
    approach:
      "[REPLACE] Built the core flow with a focus on speed, clear pricing, and reliable payout infrastructure.",
    outcome:
      "[REPLACE] Live at gogocash.co; growing customer base across Thailand.",
    learnings: [
      "[REPLACE — replace with your real 2–3 takeaways from running GoGoCash so far.]",
    ],
    featured: true,
  },
  {
    slug: "talent-wizard",
    name: "Talent Wizard",
    tagline: "AI + blockchain for product requirements.",
    year: 2024,
    role: "Co-founder",
    status: "paused",
    stack: ["AI", "Blockchain", "Smart contracts"],
    summary:
      "Using AI and blockchain to rethink how product requirements are written, signed off, and tracked across teams.",
    problem:
      "[REPLACE] Product requirements are usually messy documents that drift from what gets built. The accountability gap is real and costs teams real time.",
    approach:
      "[REPLACE] Combined LLMs for drafting and structuring requirements with on-chain attestation for sign-off and traceability.",
    outcome:
      "[REPLACE] Validated the wedge between May 2023 and March 2024 before shifting focus to fintech-first products.",
    learnings: [
      "[REPLACE — list the things the project taught you, the honest ones included.]",
    ],
    featured: true,
  },
  {
    slug: "saving-plus",
    name: "Saving Plus",
    tagline: "A faster on-ramp to saving.",
    year: 2023,
    role: "Founder",
    status: "paused",
    stack: ["Fintech", "Mobile"],
    summary:
      "An attempt at making everyday saving feel rewarding and frictionless — particularly for first-time savers.",
    problem:
      "[REPLACE] Most savings products feel like homework. The behavioural barrier is bigger than the financial one for the people who'd benefit most.",
    approach:
      "[REPLACE] Designed a lightweight mobile-first flow with goal-based saving and clear feedback loops.",
    outcome:
      "[REPLACE] Ran from Dec 2022 to Mar 2023. Lessons fed directly into GoGoCash.",
    learnings: [
      "[REPLACE — your real takeaways here.]",
    ],
  },
  {
    slug: "nicha",
    name: "Nicha NFT Marketplace",
    tagline: "A curated marketplace for Southeast Asian creators.",
    year: 2022,
    role: "Co-founder",
    status: "paused",
    stack: ["Solidity", "Next.js", "IPFS"],
    summary:
      "A marketplace built around regional creators and collectors during the NFT cycle, focused on curation over volume.",
    problem:
      "[REPLACE] Mainstream NFT marketplaces were optimised for speculation, not for the creators and communities that gave the work its meaning.",
    approach:
      "[REPLACE] Built a curated marketplace with smart-contract escrow, Thai-language UX, and tighter community moderation.",
    outcome:
      "[REPLACE] Ran from October to December 2022; wound down with the broader cycle.",
    learnings: [
      "[REPLACE — the NFT-cycle lessons, including what you'd do differently now.]",
    ],
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

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
    slug: "gogocash",
    name: "GoGoCash",
    tagline: "Cash, on-demand.",
    year: 2023,
    role: "Founder",
    status: "active",
    stack: ["TypeScript", "Fintech rails", "Payments"],
    url: "https://gogocash.co",
    summary:
      "A fintech product giving Thai consumers fast, transparent access to short-term liquidity — without the friction or hidden costs of traditional channels.",
    problem:
      "Cash-access products in the region are slow, opaque on price, and built for the bank's convenience rather than the user's. Whole demographics get priced out, and the ones who do qualify still wait days for funds that should arrive in minutes.",
    approach:
      "Started with a focused wedge: one well-priced product, one clear flow, and infrastructure tuned for speed over breadth. Every part of the experience — application, decisioning, payout — is measured against a single metric: time from request to money received. Compliance and risk are first-class concerns; we don't ship anything that can't survive scrutiny later.",
    outcome:
      "Live at gogocash.co and operating from Bangkok. Steady customer growth, profitable unit economics on each transaction, and a small team I'm proud of. Specific numbers are kept off the public site — happy to share with anyone considering working together.",
    learnings: [
      "Trust compounds faster than features. Clear pricing and on-time payouts beat a longer product roadmap every quarter.",
      "Boring infrastructure is a moat in fintech. Reliability is the headline feature once you're past the launch phase.",
      "Selling to under-served customers means showing up in places banks don't. Distribution is half the job.",
    ],
    featured: true,
  },
  {
    slug: "gogocare",
    name: "GoGoCare",
    tagline: "Healthcare benefits, reimagined for modern teams.",
    year: 2025,
    role: "Founder",
    status: "paused",
    stack: ["TypeScript", "Next.js", "Healthcare APIs"],
    summary:
      "An exploration into healthcare benefits infrastructure for small teams — making employer-sponsored care simpler for both companies and the people they cover.",
    problem:
      "Modern teams in Southeast Asia want healthcare benefits that work the way their teams work — flexible, transparent, and digital-first. The legacy options are bundles built for a different decade and a different size of company.",
    approach:
      "Started by talking to founders and HR leads about what actually breaks during onboarding and claims. Sketched a thin product on top of existing care networks rather than rebuilding the network itself.",
    outcome:
      "Currently paused while focus stays on GoGoCash. The research notes and operator interviews are still in the drawer for when timing is right — there's a real product underneath if the right team forms around it.",
    learnings: [
      "Healthcare-benefits products live or die by their partner networks. Software is the easy part.",
      "Founder bandwidth is the real constraint. Better to pause cleanly than to dilute the main venture.",
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
      "Used AI to draft and structure product requirements and on-chain attestation to make sign-off and traceability auditable across teams.",
    problem:
      "Product requirements are usually messy documents that drift from what gets built. Engineering, product, and stakeholders argue about a version that no longer exists. The accountability gap costs teams real time.",
    approach:
      "Combined LLM-assisted drafting with a lightweight on-chain layer for sign-off — every approved version of a requirement hashed and stored, so disputes had a clear record. Designed to be opt-in: teams could use the AI side without touching the chain side at all.",
    outcome:
      "Ran from May 2023 to March 2024 with early design partners. Validated the wedge but realised the wedge was narrower than the team needed to sustain itself — we wound down cleanly and rolled the learnings into newer ventures.",
    learnings: [
      "AI features only justified the price when they came with structural guarantees customers couldn't easily replicate.",
      "On-chain attestation needs to be invisible until the moment a dispute happens. Otherwise it's friction nobody asked for.",
      "Two-sided products with both AI and Web3 components compound the time it takes to find customers who care about both.",
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
      "An attempt to make everyday saving feel rewarding and frictionless — particularly for first-time savers in Thailand.",
    problem:
      "Most savings products feel like homework. For people who'd benefit most from saving — younger users, freelancers, gig workers — the behavioural barrier is bigger than the financial one.",
    approach:
      "Built a lightweight mobile-first flow around goal-based saving with quick visual feedback. Less interest-rate marketing, more behavioural design.",
    outcome:
      "Ran from December 2022 to March 2023. Customer interviews and the early flow directly informed how GoGoCash thinks about onboarding and pricing today.",
    learnings: [
      "Behaviour-design products are a regulator-adjacent business model. Build for the compliance team early.",
      "A small product team can't run consumer marketing and product simultaneously. Pick one wedge and own it.",
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
      "A marketplace built around regional NFT creators and collectors during the 2021–2022 cycle, focused on curation over volume.",
    problem:
      "Mainstream NFT marketplaces were optimised for speculation, not for the creators and communities that gave the work its meaning. Thai and regional artists had inventory to share but no surface that fit their audience.",
    approach:
      "Built a curated marketplace with smart-contract escrow, Thai-language UX, and tighter community moderation. Limited drops over open submissions.",
    outcome:
      "Operated from October to December 2022, wound down with the broader cycle. The marketplace surface didn't outlast the moment, but the on-chain experience set the technical foundation for later projects.",
    learnings: [
      "Riding a cycle is fine. Building a business on top of one is not.",
      "Curation creates short-term loyalty but doesn't replace network effects when the broader market cools.",
      "Smart-contract escrow patterns transferred directly into later fintech work — the wasted code is rarely fully wasted.",
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

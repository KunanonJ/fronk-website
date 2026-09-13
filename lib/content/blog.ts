import { urlFor } from "@/lib/sanity/client";
import type { PostSummary, SanityImage } from "@/lib/sanity/types";
import { formatPressDate } from "@/lib/content/press";

export type BlogCard = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  /** ISO date or datetime — display via `formatBlogDate`. */
  publishedAt: string;
  tags: readonly string[];
  bannerSrc: string;
  bannerAlt: string;
  /** Plain paragraphs for fallback / cornerstone posts (no Portable Text). */
  bodyParagraphs?: readonly string[];
};

export const blogPage = {
  eyebrow: "Blog",
  title: "Blog",
  description:
    "Notes on fintech, AI workspaces, and shipping from Bangkok. Search or filter by tag.",
  searchPlaceholder: "Search posts…",
  allTagsLabel: "All",
  emptyLabel: "No posts match your filters.",
} as const;

const STOCK_BANNER =
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80";

/** Cornerstone + calendar posts — always mergeable into the public index by slug. */
export const FALLBACK_BLOG_POSTS: readonly BlogCard[] = [
  {
    id: "fallback-ai-transformation-thailand-smes",
    slug: "ai-transformation-thailand-smes",
    title: "AI transformation for Thai SMEs",
    excerpt:
      "What AI transformation means for SMEs in Thailand — start from internal systems, not chatbot theater.",
    publishedAt: "2026-07-10",
    tags: ["AI", "Thailand", "SME"],
    bannerSrc: STOCK_BANNER,
    bannerAlt: "City skyline",
    bodyParagraphs: [
      "AI transformation for Thai SMEs is not a chatbot bolted onto broken process. It is replacing scattered tools and manual handoffs with a system of record — then adding judgment where the same decisions repeat every week.",
      "I write this from Bangkok while building GoGoCash and Manut. The pattern that holds: start with ERP/CRM workflows, prove one vertical, then layer Intelligence AI. See the hub at /topics/ai-transformation-thailand and the Manut case at /ventures/manut.",
      "If you are an operator drowning in SaaS tabs, begin with customer and inventory truth — not a model demo. Contact me via /contact when you want a second set of eyes.",
    ],
  },
  {
    id: "fallback-erp-crm-internal-systems-startups",
    slug: "erp-crm-internal-systems-startups",
    title: "ERP and CRM for startups without sprawl",
    excerpt:
      "How tech startups in SEA pick ERP/CRM and internal systems before adding Intelligence AI.",
    publishedAt: "2026-07-08",
    tags: ["ERP", "CRM", "Startups"],
    bannerSrc:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1600&q=80",
    bannerAlt: "Operations dashboard",
    bodyParagraphs: [
      "Most early teams drown in SaaS. The durable path is a clear internal system — ERP and CRM that match how the business actually runs — then Intelligence AI on top.",
      "From shipping in Thailand and SEA: pick one system of record for customers and ops, kill duplicate tools ruthlessly, and only then automate judgment. Hub: /topics/erp-crm-internal-systems. Product proof: /ventures/manut.",
    ],
  },
  {
    id: "fallback-building-tech-startups-bangkok-sea",
    slug: "building-tech-startups-bangkok-sea",
    title: "Building tech startups from Bangkok",
    excerpt:
      "Operator notes on shipping fintech and AI products from Thailand into SEA.",
    publishedAt: "2026-07-05",
    tags: ["Founding", "Bangkok", "SEA"],
    bannerSrc:
      "https://images.unsplash.com/photo-1528183429752-a97d0bf99b5a?auto=format&fit=crop&w=1600&q=80",
    bannerAlt: "Bangkok at night",
    bodyParagraphs: [
      "Bangkok is a strong base to ship fintech and AI into Southeast Asia — if you treat operations as seriously as product.",
      "Pace, constraints, and craft matter more than location theater. I expand on this at /topics/tech-startup-thailand-sea and in the GoGoCash case at /ventures/gogocash.",
    ],
  },
  {
    id: "fallback-manut-ai-erp-crm-automotive",
    slug: "manut-ai-erp-crm-automotive",
    title: "Manut: AI ERP/CRM for automotive SMEs",
    excerpt:
      "How Manut folds ERP/CRM and Intelligence AI into one operator surface for automotive SMEs.",
    publishedAt: "2026-07-01",
    tags: ["Manut", "AI", "ERP"],
    bannerSrc:
      "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1600&q=80",
    bannerAlt: "Digital interface",
    bodyParagraphs: [
      "Manut is an ERP/CRM workspace with Intelligence AI aimed at automotive SMEs — ops, customers, and repeat decisions in one place instead of a dozen disconnected tools.",
      "Case hub: /ventures/manut. Broader framing: /topics/erp-crm-internal-systems.",
    ],
  },
  {
    id: "fallback-shipping-from-bangkok",
    slug: "shipping-from-bangkok",
    title: "Shipping from Bangkok",
    excerpt:
      "Why we build fintech and AI tooling from Thailand — pace, constraints, and craft.",
    publishedAt: "2026-06-12",
    tags: ["Founding", "Bangkok"],
    bannerSrc:
      "https://images.unsplash.com/photo-1528183429752-a97d0bf99b5a?auto=format&fit=crop&w=1600&q=80",
    bannerAlt: "Bangkok at night",
    bodyParagraphs: [
      "We build from Bangkok because the constraints are real and the market is adjacent — Thailand into SEA, not a slide about global from day one.",
      "More operator notes: /topics/tech-startup-thailand-sea.",
    ],
  },
  {
    id: "fallback-cashback-loops",
    slug: "cashback-loops",
    title: "Cashback loops that actually retain",
    excerpt:
      "Lessons from GoGoCash on merchant mix, reward clarity, and habit formation.",
    publishedAt: "2026-04-28",
    tags: ["GoGoCash", "Product"],
    bannerSrc:
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1600&q=80",
    bannerAlt: "Retail shopping",
    bodyParagraphs: [
      "Retention in cashback is habit, not novelty. Merchant mix, reward clarity, and a loop users understand beat another splash screen.",
      "Product context: /ventures/gogocash.",
    ],
  },
  {
    id: "fallback-ai-workspace",
    slug: "ai-workspace-for-smes",
    title: "An AI workspace for automotive SMEs",
    excerpt:
      "How Manut folds ERP/CRM and Intelligence AI into one operator surface.",
    publishedAt: "2026-02-14",
    tags: ["Manut", "AI"],
    bannerSrc:
      "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1600&q=80",
    bannerAlt: "Digital interface",
    bodyParagraphs: [
      "An AI workspace only helps if it sits on ERP/CRM truth. Manut’s bet is one operator surface for automotive SMEs — see /ventures/manut.",
    ],
  },
  {
    id: "fallback-ai-vs-traditional-erp-sea",
    slug: "ai-vs-traditional-erp-sea",
    title: "AI vs traditional ERP in SEA",
    excerpt:
      "When Intelligence AI on ERP/CRM beats a greenfield AI ERP pitch for SEA operators.",
    publishedAt: "2026-08-02",
    tags: ["AI", "ERP", "SEA"],
    bannerSrc: STOCK_BANNER,
    bannerAlt: "City skyline",
    bodyParagraphs: [
      "In Southeast Asia I rarely see rip out ERP for an AI product win. What wins is a system of record operators already trust, plus Intelligence AI where judgment repeats.",
      "Traditional ERP without AI still beats chatbot theater. AI without ERP/CRM truth creates confident nonsense. The useful middle: /topics/erp-crm-internal-systems and /topics/ai-transformation-thailand.",
      "Manut is one worked example for automotive SMEs: /ventures/manut. No magic metrics — just ops, customers, and decisions in one place.",
    ],
  },
  {
    id: "fallback-crm-habits-for-automotive-dealers",
    slug: "crm-habits-for-automotive-dealers",
    title: "CRM habits for automotive dealers",
    excerpt:
      "Operator CRM habits that stick in automotive retail — follow-up, inventory truth, and fewer tabs.",
    publishedAt: "2026-08-09",
    tags: ["CRM", "Automotive", "SME"],
    bannerSrc:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1600&q=80",
    bannerAlt: "Operations dashboard",
    bodyParagraphs: [
      "Dealer CRM fails when it is a graveyard of notes. Habits that stick: one owner per lead, same-day follow-up, inventory truth tied to the customer record, and a weekly review that is shorter than a coffee.",
      "I build for this shape of work in Manut — /ventures/manut — and write the category framing at /topics/erp-crm-internal-systems.",
    ],
  },
  {
    id: "fallback-sea-founder-ops-stack-2026",
    slug: "sea-founder-ops-stack-2026",
    title: "SEA founder ops stack (2026)",
    excerpt:
      "A minimal ops stack for SEA founders: system of record, shipping cadence, and AI only where it compounds.",
    publishedAt: "2026-08-16",
    tags: ["Founding", "SEA", "Ops"],
    bannerSrc:
      "https://images.unsplash.com/photo-1528183429752-a97d0bf99b5a?auto=format&fit=crop&w=1600&q=80",
    bannerAlt: "Bangkok at night",
    bodyParagraphs: [
      "My 2026 ops stack for shipping from Bangkok is deliberately small: one system of record for customers and money-moving work, a weekly ship cadence, and AI only on repeat decisions.",
      "Category hub: /topics/tech-startup-thailand-sea. Product proof points: /ventures/gogocash and /ventures/manut.",
    ],
  },
  {
    id: "fallback-digital-transformation-budget-sme-thailand",
    slug: "digital-transformation-budget-sme-thailand",
    title: "Digital transformation budgets for Thai SMEs",
    excerpt:
      "How I think about SME digital transformation spend in Thailand — buy less SaaS, fund the system of record.",
    publishedAt: "2026-08-23",
    tags: ["Thailand", "SME", "AI"],
    bannerSrc: STOCK_BANNER,
    bannerAlt: "City skyline",
    bodyParagraphs: [
      "Thai SME transformation budgets get wasted on overlapping SaaS and one-off AI pilots. I push spend toward a durable system of record first, then Intelligence AI on top of real workflows.",
      "Framing: /topics/ai-transformation-thailand. If you want a working product shape for automotive ops, see /ventures/manut.",
    ],
  },
  {
    id: "fallback-internal-tools-vs-saas-sprawl",
    slug: "internal-tools-vs-saas-sprawl",
    title: "Internal tools vs SaaS sprawl",
    excerpt:
      "When to consolidate into an internal system instead of adding another SaaS seat.",
    publishedAt: "2026-08-30",
    tags: ["ERP", "Internal systems"],
    bannerSrc:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1600&q=80",
    bannerAlt: "Operations dashboard",
    bodyParagraphs: [
      "SaaS sprawl feels like progress until handoffs break. Internal tools win when the workflow is your moat and the data must stay coherent across teams.",
      "I expand the ERP/CRM angle at /topics/erp-crm-internal-systems and show one consolidation path via /ventures/manut.",
    ],
  },
  {
    id: "fallback-gogocash-retention-loops",
    slug: "gogocash-retention-loops",
    title: "GoGoCash retention loops",
    excerpt:
      "How we think about retention loops at GoGoCash — clarity, merchant mix, and habit over hype.",
    publishedAt: "2026-09-01",
    tags: ["GoGoCash", "Fintech", "Product"],
    bannerSrc:
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1600&q=80",
    bannerAlt: "Retail shopping",
    bodyParagraphs: [
      "GoGoCash retention is a loop: clear rewards, merchants people already shop, and a reason to come back without a new gimmick every week.",
      "Case hub: /ventures/gogocash. Related note: /blog/cashback-loops.",
    ],
  },
  {
    id: "fallback-hiring-builders-in-bangkok",
    slug: "hiring-builders-in-bangkok",
    title: "Hiring builders in Bangkok",
    excerpt:
      "What I look for when hiring builders in Bangkok — craft, ownership, and comfort with constraints.",
    publishedAt: "2026-09-06",
    tags: ["Founding", "Bangkok", "Hiring"],
    bannerSrc:
      "https://images.unsplash.com/photo-1528183429752-a97d0bf99b5a?auto=format&fit=crop&w=1600&q=80",
    bannerAlt: "Bangkok at night",
    bodyParagraphs: [
      "Hiring builders in Bangkok, I optimize for ownership and craft under constraints — not title inflation. Ship something small that proves the bet; stay close to the work.",
      "Context for the market I hire into: /topics/tech-startup-thailand-sea. About how I work: /about.",
    ],
  },
  {
    id: "fallback-intelligence-ai-inside-erp",
    slug: "intelligence-ai-inside-erp",
    title: "Intelligence AI inside ERP",
    excerpt:
      "Where Intelligence AI belongs inside ERP/CRM — repeat decisions, not generic chat overlays.",
    publishedAt: "2026-09-10",
    tags: ["AI", "ERP", "Manut"],
    bannerSrc:
      "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1600&q=80",
    bannerAlt: "Digital interface",
    bodyParagraphs: [
      "Intelligence AI inside ERP should sit on decisions that already happen weekly: pricing exceptions, follow-up priority, inventory exceptions — not a blank chat box beside the grid.",
      "Hubs: /topics/erp-crm-internal-systems and /topics/ai-transformation-thailand. Product surface: /ventures/manut.",
    ],
  },
] as const;

export function formatBlogDate(iso: string): string {
  const day = iso.trim().slice(0, 10);
  return formatPressDate(day);
}

function coverUrl(image: SanityImage | null, altFallback: string) {
  if (!image?.asset?._ref) {
    return {
      bannerSrc: STOCK_BANNER,
      bannerAlt: altFallback,
    };
  }
  try {
    return {
      bannerSrc: urlFor(image).width(1600).height(900).fit("crop").auto("format").url(),
      bannerAlt: image.alt?.trim() || altFallback,
    };
  } catch {
    return {
      bannerSrc: STOCK_BANNER,
      bannerAlt: altFallback,
    };
  }
}

export function mapPostToBlogCard(post: PostSummary): BlogCard {
  const cover = coverUrl(post.coverImage, post.title);
  return {
    id: post._id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt?.trim() || "Read the full note.",
    publishedAt: post.publishedAt,
    tags: post.tags ?? [],
    ...cover,
  };
}

/**
 * Merge Sanity posts with cornerstone fallbacks by slug.
 * Sanity wins on collision so CMS edits replace stock cards; fallbacks fill gaps
 * so one Hello World post cannot hide the discovery cluster.
 */
export function resolveBlogCards(
  posts: readonly PostSummary[],
): readonly BlogCard[] {
  const bySlug = new Map<string, BlogCard>();
  for (const fallback of FALLBACK_BLOG_POSTS) {
    bySlug.set(fallback.slug, fallback);
  }
  for (const post of posts) {
    bySlug.set(post.slug, mapPostToBlogCard(post));
  }
  return [...bySlug.values()].sort((a, b) =>
    b.publishedAt.localeCompare(a.publishedAt),
  );
}

export function collectBlogTags(posts: readonly BlogCard[]): string[] {
  const set = new Set<string>();
  for (const post of posts) {
    for (const tag of post.tags) {
      const t = tag.trim();
      if (t) set.add(t);
    }
  }
  return [...set].sort((a, b) => a.localeCompare(b));
}

export function filterBlogPosts(
  posts: readonly BlogCard[],
  options: { query?: string; tag?: string | null },
): BlogCard[] {
  const q = options.query?.trim().toLowerCase() ?? "";
  const tag = options.tag?.trim() ?? "";

  return posts.filter((post) => {
    if (tag && !post.tags.some((t) => t.toLowerCase() === tag.toLowerCase())) {
      return false;
    }
    if (!q) return true;
    const haystack = `${post.title} ${post.excerpt} ${post.tags.join(" ")}`.toLowerCase();
    return haystack.includes(q);
  });
}

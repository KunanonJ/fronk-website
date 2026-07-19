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

/** Demo / cornerstone posts when Sanity has no published content yet. */
export const FALLBACK_BLOG_POSTS: readonly BlogCard[] = [
  {
    id: "fallback-ai-transformation-thailand-smes",
    slug: "ai-transformation-thailand-smes",
    title: "AI transformation for Thai SMEs",
    excerpt:
      "What AI transformation means for SMEs in Thailand — start from internal systems, not chatbot theater. Links the AI transformation hub.",
    publishedAt: "2026-07-10",
    tags: ["AI", "Thailand", "SME"],
    bannerSrc:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80",
    bannerAlt: "City skyline",
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
  },
] as const;

export function formatBlogDate(iso: string): string {
  const day = iso.trim().slice(0, 10);
  return formatPressDate(day);
}

function coverUrl(image: SanityImage | null, altFallback: string) {
  if (!image?.asset?._ref) {
    return {
      bannerSrc:
        "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80",
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
      bannerSrc:
        "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80",
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

export function resolveBlogCards(
  posts: readonly PostSummary[],
): readonly BlogCard[] {
  if (posts.length === 0) return FALLBACK_BLOG_POSTS;
  return posts.map(mapPostToBlogCard);
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

import type { BlogCard } from "@/lib/content/blog";
import { BLOG_PUBLIC } from "@/lib/content/blogVisibility";
import { getAllTopicPillars } from "@/lib/content/topics/pillars";
import type { LearnLang } from "@/lib/library/search";
import { PAGE_META } from "@/lib/content/pageMeta";

export type LearnLink = {
  title: string;
  description: string;
  href: string;
};

export const learnPage = {
  eyebrow: "Learn",
  title: "Learn",
  description: PAGE_META.learn.description,
  /** The h1 as the bento canvas draws it: muted opener, accent close. */
  headline: {
    muted: "How I think about",
    rest: "AI transformation, internal systems,",
    accent: "and shipping from Bangkok.",
  },
  lede: BLOG_PUBLIC
    ? "Topic hubs, writing, and operator notes."
    : "Topic hubs and operator notes.",
} as const;

/** A topic hub as a /learn card, in one language. */
export type LearnHub = {
  slug: string;
  lang: LearnLang;
  title: string;
  lede: string;
  /** The hub's path in this language, e.g. /th/topics/<slug>. */
  href: string;
  /** The same hub in the other language. */
  alt: { lang: LearnLang; href: string; label: string };
};

function hubPath(slug: string, lang: LearnLang): string {
  return lang === "th" ? `/th/topics/${slug}` : `/topics/${slug}`;
}

/** The topic hubs in `lang`: each pillar's h1 and lede, in TOPIC_SLUGS order. */
export function getLearnHubs(lang: LearnLang): readonly LearnHub[] {
  const other: LearnLang = lang === "th" ? "en" : "th";
  return getAllTopicPillars(lang).map((topic) => ({
    slug: topic.slug,
    lang,
    title: topic.h1,
    lede: topic.lede,
    href: hubPath(topic.slug, lang),
    alt: {
      lang: other,
      href: hubPath(topic.slug, other),
      label: other === "th" ? "อ่านภาษาไทย" : "Read in English",
    },
  }));
}

export function getLearnWritingLinks(
  posts: readonly BlogCard[],
  limit = 6,
): readonly LearnLink[] {
  // No "Writing" cards while the blog is hidden (BLOG_PUBLIC).
  if (!BLOG_PUBLIC) return [];
  return posts.slice(0, limit).map((post) => ({
    title: post.title,
    description: post.excerpt,
    href: `/blog/${post.slug}`,
  }));
}

/** Curated anchors into the about page. */
export const learnOperatorNotes: readonly LearnLink[] = [
  {
    title: "Four operating principles",
    description:
      "Ship the smallest bet, stay close to the work, optimise for reversibility, document as you go.",
    href: "/about#principles",
  },
  {
    title: "What I’m doing now",
    description:
      "GoGoCash, Manut, and operator work from Bangkok — current focus without the fluff.",
    href: "/about#now",
  },
  {
    title: "Quick FAQ",
    description:
      "Who Fronk is, what GoGoCash and Manut are, and how to reach out.",
    href: "/about#faq",
  },
] as const;

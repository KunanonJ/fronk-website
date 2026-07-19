import type { BlogCard } from "@/lib/content/blog";
import { getAllTopicPillars } from "@/lib/content/topics/pillars";

export type LearnLink = {
  title: string;
  description: string;
  href: string;
};

export const learnPage = {
  eyebrow: "Learn",
  title: "Learn",
  description:
    "How I think about AI transformation, internal systems, and shipping from Bangkok — hubs, writing, and operator notes.",
} as const;

export function getLearnTopicLinks(): readonly LearnLink[] {
  return getAllTopicPillars("en").map((topic) => ({
    title: topic.h1,
    description: topic.lede,
    href: `/topics/${topic.slug}`,
  }));
}

export function getLearnWritingLinks(
  posts: readonly BlogCard[],
  limit = 6,
): readonly LearnLink[] {
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
    description: "Who Fronk is, what GoGoCash and Manut are, and how to reach out.",
    href: "/about#faq",
  },
] as const;

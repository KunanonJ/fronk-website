import type { PortableTextBlock } from "@portabletext/react";

export interface SanityImage {
  _type: "image";
  asset: { _ref: string; _type: "reference" };
  alt?: string;
  hotspot?: unknown;
}

export interface PostSummary {
  _id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  publishedAt: string;
  tags: readonly string[] | null;
  coverImage: SanityImage | null;
  seo?: PageSeo | null;
}

export interface Post extends PostSummary {
  body: PortableTextBlock[];
  author: {
    name: string;
    bio: string | null;
    avatar: SanityImage | null;
  } | null;
}

export interface PageSeo {
  title?: string | null;
  description?: string | null;
}

export interface WritingPageContent {
  eyebrow?: string | null;
  heading?: string | null;
  description?: string | null;
  seo?: PageSeo | null;
}

export interface ResumeTimelineItem {
  title: string;
  subtitle?: string | null;
  timeframe?: string | null;
  description?: string | null;
  highlights?: readonly string[] | null;
  url?: string | null;
  logoDomain?: string | null;
  logoName?: string | null;
}

export interface ResumeTimelineSection {
  title: string;
  items: readonly ResumeTimelineItem[];
}

export interface ResumeProfile {
  name: string;
  headline: string;
  summary?: string | null;
  sections: readonly ResumeTimelineSection[] | null;
}

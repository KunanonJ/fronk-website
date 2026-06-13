import type { PortableTextBlock } from "@portabletext/react";
import type { Venture } from "@/lib/content/ventures";

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

export interface NavigationItem {
  label: string;
  href: string;
}

export interface CtaLink {
  label: string;
  href: string;
}

export interface SiteSocials {
  x?: string | null;
  linkedin?: string | null;
  github?: string | null;
  telegram?: string | null;
  farcaster?: string | null;
  website?: string | null;
}

export interface SiteSettings {
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  email: string;
  discordHandle?: string | null;
  socials: SiteSocials | null;
  navigation: readonly NavigationItem[] | null;
  footerTagline?: string | null;
}

export interface HomePageContent {
  heroEyebrow?: string | null;
  heroTitle?: string | null;
  heroTagline?: string | null;
  heroIntro?: string | null;
  primaryCta?: CtaLink | null;
  secondaryCta?: CtaLink | null;
  featuredSectionKicker?: string | null;
  featuredSectionTitle?: string | null;
  featuredLimit?: number | null;
  writingTitle?: string | null;
  writingDescription?: string | null;
  writingCta?: CtaLink | null;
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

export interface StandardPageContent {
  title: string;
  slug: string;
  eyebrow?: string | null;
  heading: string;
  description?: string | null;
  lastUpdated?: string | null;
  body: PortableTextBlock[] | null;
  seo?: PageSeo | null;
}

export type SanityVenture = Venture;

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

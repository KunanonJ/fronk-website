import { siteConfig } from "@/lib/site";
import type { CtaLink, HomePageContent } from "@/lib/sanity/types";
import { pickString } from "@/lib/utils/pickString";

function resolveCta(
  cta: CtaLink | null | undefined,
  fallback: CtaLink,
): CtaLink {
  if (!cta?.label?.trim() || !cta.href?.trim()) return fallback;
  return { label: cta.label.trim(), href: cta.href.trim() };
}

/**
 * One run of statement text. `strong` segments render heavier (the matveyan
 * light-base / semibold-emphasis weight contrast). Plain prose otherwise.
 */
export interface StatementSegment {
  text: string;
  strong?: boolean;
}

export const DEFAULT_HOME_PAGE = {
  heroEyebrow: "Bangkok · Founder",
  heroTitle: siteConfig.shortName,
  heroTagline: siteConfig.tagline,
  heroIntro:
    "I founded GoGoCash and build Manut AI — cashback for shoppers, an AI workspace for solo founders." as string | null,
  primaryCta: { label: "See ventures", href: "/#ventures" },
  secondaryCta: { label: "Contact", href: "/contact" },
  featuredSectionKicker: "Ventures",
  featuredSectionTitle: "Two products. Both live.",
  featuredLimit: 3,
  writingTitle: "Writing",
  writingDescription:
    "Long-form notes on building from zero — fundraising, hiring, shipping, and the daily reality of running early-stage companies.",
  writingCta: { label: "Read the journal", href: "/writing" },
  // Specialization statement (home §B). Composed only from already-published
  // facts — GoGoCash (cashback), Manut AI (AI workspace), Southeast Asia. The
  // `strong` words carry the weight-contrast emphasis.
  specializationEyebrow: "Operations / Software / Fintech / AI",
  specializationStatement: [
    { text: "I turn " },
    { text: "messy operations", strong: true },
    { text: " into " },
    { text: "software", strong: true },
    { text: " — cashback for " },
    { text: "shoppers", strong: true },
    { text: ", an " },
    { text: "AI workspace", strong: true },
    { text: " for " },
    { text: "solo founders", strong: true },
    { text: ", built in " },
    { text: "Southeast Asia", strong: true },
    { text: "." },
  ],
} as const;

export type ResolvedHomePage = {
  heroEyebrow: string;
  heroTitle: string;
  heroTagline: string;
  heroIntro: string | null;
  primaryCta: CtaLink;
  secondaryCta: CtaLink;
  featuredSectionKicker: string;
  featuredSectionTitle: string;
  featuredLimit: number;
  writingTitle: string;
  writingDescription: string;
  writingCta: CtaLink;
  specializationEyebrow: string;
  specializationStatement: readonly StatementSegment[];
};

export function resolveHomePage(cms: HomePageContent | null): ResolvedHomePage {
  const featuredLimit =
    typeof cms?.featuredLimit === "number" && cms.featuredLimit > 0
      ? Math.min(cms.featuredLimit, 6)
      : DEFAULT_HOME_PAGE.featuredLimit;

  return {
    heroEyebrow: pickString(
      cms?.heroEyebrow,
      DEFAULT_HOME_PAGE.heroEyebrow,
    ),
    heroTitle: pickString(cms?.heroTitle, DEFAULT_HOME_PAGE.heroTitle),
    heroTagline: pickString(cms?.heroTagline, DEFAULT_HOME_PAGE.heroTagline),
    heroIntro: cms?.heroIntro?.trim()
      ? cms.heroIntro.trim()
      : DEFAULT_HOME_PAGE.heroIntro,
    primaryCta: resolveCta(cms?.primaryCta, DEFAULT_HOME_PAGE.primaryCta),
    secondaryCta: resolveCta(cms?.secondaryCta, DEFAULT_HOME_PAGE.secondaryCta),
    featuredSectionKicker: pickString(
      cms?.featuredSectionKicker,
      DEFAULT_HOME_PAGE.featuredSectionKicker,
    ),
    featuredSectionTitle: pickString(
      cms?.featuredSectionTitle,
      DEFAULT_HOME_PAGE.featuredSectionTitle,
    ),
    featuredLimit,
    writingTitle: pickString(cms?.writingTitle, DEFAULT_HOME_PAGE.writingTitle),
    writingDescription: pickString(
      cms?.writingDescription,
      DEFAULT_HOME_PAGE.writingDescription,
    ),
    writingCta: resolveCta(cms?.writingCta, DEFAULT_HOME_PAGE.writingCta),
    // Code-owned honest content (no CMS field yet); editable in one place.
    specializationEyebrow: DEFAULT_HOME_PAGE.specializationEyebrow,
    specializationStatement: DEFAULT_HOME_PAGE.specializationStatement,
  };
}

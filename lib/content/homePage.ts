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

export const DEFAULT_HOME_PAGE = {
  heroEyebrow: "Currently shipping",
  heroTitle: siteConfig.shortName,
  heroTagline: siteConfig.tagline,
  heroIntro: null as string | null,
  primaryCta: { label: "See what I'm shipping", href: "/ventures" },
  secondaryCta: { label: "Read writing", href: "/writing" },
  featuredSectionKicker: "✦ Currently shipping",
  featuredSectionTitle: "Two bets. Both live.",
  featuredLimit: 3,
  writingTitle: "Currently writing",
  writingDescription:
    "Long-form notes on building from zero — fundraising, hiring, shipping, and the daily reality of running early-stage companies.",
  writingCta: { label: "Read the journal", href: "/writing" },
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
    heroIntro: cms?.heroIntro?.trim() ? cms.heroIntro.trim() : null,
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
  };
}

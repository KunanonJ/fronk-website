import { nav, siteConfig } from "@/lib/site";
import type { SiteSettings } from "@/lib/sanity/types";
import { pickString } from "@/lib/utils/pickString";

export const DEFAULT_SITE_SETTINGS = {
  name: siteConfig.name,
  shortName: siteConfig.shortName,
  tagline: siteConfig.tagline,
  description: siteConfig.description,
  email: siteConfig.email,
  discordHandle: siteConfig.discordHandle,
  socials: siteConfig.socials,
  navigation: nav,
  footerTagline: "Building fintech and digital workspaces from Bangkok.",
} as const;

export type ResolvedSiteSettings = {
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  email: string;
  discordHandle: string;
  socials: {
    x: string;
    linkedin: string;
    github: string;
    telegram: string;
    farcaster: string;
    website: string;
  };
  navigation: readonly { href: string; label: string }[];
  footerTagline: string;
};

export function resolveSiteSettings(
  cms: SiteSettings | null,
): ResolvedSiteSettings {
  const socials = cms?.socials;

  return {
    name: pickString(cms?.name, DEFAULT_SITE_SETTINGS.name),
    shortName: pickString(cms?.shortName, DEFAULT_SITE_SETTINGS.shortName),
    tagline: pickString(cms?.tagline, DEFAULT_SITE_SETTINGS.tagline),
    description: pickString(cms?.description, DEFAULT_SITE_SETTINGS.description),
    email: pickString(cms?.email, DEFAULT_SITE_SETTINGS.email),
    discordHandle: pickString(
      cms?.discordHandle,
      DEFAULT_SITE_SETTINGS.discordHandle,
    ),
    socials: {
      x: pickString(socials?.x, DEFAULT_SITE_SETTINGS.socials.x),
      linkedin: pickString(
        socials?.linkedin,
        DEFAULT_SITE_SETTINGS.socials.linkedin,
      ),
      github: pickString(socials?.github, DEFAULT_SITE_SETTINGS.socials.github),
      telegram: pickString(
        socials?.telegram,
        DEFAULT_SITE_SETTINGS.socials.telegram,
      ),
      farcaster: pickString(
        socials?.farcaster,
        DEFAULT_SITE_SETTINGS.socials.farcaster,
      ),
      website: pickString(
        socials?.website,
        DEFAULT_SITE_SETTINGS.socials.website,
      ),
    },
    navigation:
      cms?.navigation && cms.navigation.length > 0
        ? cms.navigation
        : DEFAULT_SITE_SETTINGS.navigation,
    footerTagline: pickString(
      cms?.footerTagline,
      DEFAULT_SITE_SETTINGS.footerTagline,
    ),
  };
}

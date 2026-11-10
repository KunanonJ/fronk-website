import type {
  ResumeProfile,
  ResumeTimelineItem,
  ResumeTimelineSection,
} from "@/lib/sanity/types";
import { pickString } from "@/lib/utils/pickString";
import {
  RESUME_LANGUAGES_FALLBACK,
  RESUME_SKILLS_FALLBACK,
  RESUME_SUMMARY_FALLBACK,
  RESUME_TIMELINE_FALLBACK,
  type ResolvedTimelineItem,
  type ResolvedTimelineSection,
  type ResumeSkillGroup,
} from "./resumeTimeline.fallback";

export type { ResolvedTimelineItem, ResolvedTimelineSection, ResumeSkillGroup };

/**
 * The header when Sanity holds no résumé document (today's state). The
 * headline is approved identity wording and leads with the AI role.
 */
export const DEFAULT_RESUME_PROFILE = {
  name: "Kunanon Jarat",
  headline:
    "AI Engineering Lead. Builds AI tools inside the businesses that use them. Based in Bangkok.",
  summary: RESUME_SUMMARY_FALLBACK,
} as const;

function mapCmsTimelineItem(item: ResumeTimelineItem): ResolvedTimelineItem {
  const highlights =
    item.highlights
      ?.map((entry) => entry.trim())
      .filter((entry) => entry.length > 0) ?? [];
  const description = item.description?.trim();

  const bullets =
    highlights.length > 0
      ? highlights
      : description
        ? [description]
        : undefined;

  return {
    title: item.title,
    org: item.subtitle?.trim() ?? "",
    period: item.timeframe?.trim() ?? "",
    href: item.url?.trim() || undefined,
    logoDomain: item.logoDomain?.trim() || undefined,
    logoName: item.logoName?.trim() || undefined,
    bullets,
  };
}

function mapCmsSections(
  sections: readonly ResumeTimelineSection[],
): readonly ResolvedTimelineSection[] {
  // GROQ returns null for a section whose items were never set; skip it
  // instead of failing the whole page.
  return sections
    .map((section) => ({
      title: section.title,
      items: (section.items ?? []).map(mapCmsTimelineItem),
    }))
    .filter((section) => section.items.length > 0);
}

export function resolveResumeProfile(cms: ResumeProfile | null) {
  const sections =
    cms?.sections && cms.sections.length > 0
      ? mapCmsSections(cms.sections)
      : RESUME_TIMELINE_FALLBACK;

  return {
    name: pickString(cms?.name, DEFAULT_RESUME_PROFILE.name),
    headline: pickString(cms?.headline, DEFAULT_RESUME_PROFILE.headline),
    summary: cms?.summary?.trim() || DEFAULT_RESUME_PROFILE.summary,
    sections,
    // Skills and languages live in the repo only; the CMS has no field for them.
    skills: RESUME_SKILLS_FALLBACK,
    languages: RESUME_LANGUAGES_FALLBACK,
  };
}

import type {
  ResumeProfile,
  ResumeTimelineItem,
  ResumeTimelineSection,
} from "@/lib/sanity/types";
import { pickString } from "@/lib/utils/pickString";
import {
  RESUME_SKILLS_FALLBACK,
  RESUME_TIMELINE_FALLBACK,
  type ResolvedTimelineItem,
  type ResolvedTimelineSection,
} from "./resumeTimeline.fallback";

export type { ResolvedTimelineItem, ResolvedTimelineSection };

export const DEFAULT_RESUME_PROFILE = {
  name: "Kunanon Jarat",
  headline: "Founder. IT Manager. Based in Bangkok.",
  summary: null as string | null,
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
  return sections.map((section) => ({
    title: section.title,
    items: section.items.map(mapCmsTimelineItem),
  }));
}

export function resolveResumeProfile(cms: ResumeProfile | null) {
  const sections =
    cms?.sections && cms.sections.length > 0
      ? mapCmsSections(cms.sections)
      : RESUME_TIMELINE_FALLBACK;

  return {
    name: pickString(cms?.name, DEFAULT_RESUME_PROFILE.name),
    headline: pickString(cms?.headline, DEFAULT_RESUME_PROFILE.headline),
    summary: cms?.summary?.trim() ? cms.summary.trim() : null,
    sections,
    skills: RESUME_SKILLS_FALLBACK,
  };
}

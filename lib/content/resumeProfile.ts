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
 * The header when Sanity holds no résumé document (the state on 11-11-26;
 * `pnpm seed` or Studio can create one). The headline is approved identity
 * wording and leads with the AI role.
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

/** The résumé as the page draws it, and whether Sanity could not be read. */
export type LoadedResumeProfile = ReturnType<typeof resolveResumeProfile> & {
  /** True when the Sanity read failed and the repo's résumé stands in. */
  degraded: boolean;
};

/**
 * The résumé for /resume. A failed Sanity read used to show the error page.
 * Now the repo's résumé stands in (owner, 11-11-26): a recruiter who clicks
 * Résumé should not meet an error. On 11-11-26 the production dataset held
 * no résumé document, so the stand-in was also what a good read drew; once
 * Studio holds one, the stand-in is the older copy. `degraded` lets the route
 * keep such a response out of the edge cache and ask again on the next
 * visit. A failed request is logged by `read` (lib/sanity/fetch.ts); the log
 * here also covers a document the mapper cannot draw, and says what the
 * visitor was shown.
 */
export async function loadResumeProfile(
  read: () => Promise<ResumeProfile | null>,
): Promise<LoadedResumeProfile> {
  try {
    return { ...resolveResumeProfile(await read()), degraded: false };
  } catch (error: unknown) {
    console.error("[resume] showing the repo's résumé instead", error);
    return { ...resolveResumeProfile(null), degraded: true };
  }
}

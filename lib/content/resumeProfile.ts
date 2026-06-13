import type { ResumeProfile } from "@/lib/sanity/types";
import { pickString } from "@/lib/utils/pickString";

export const DEFAULT_RESUME_PROFILE = {
  name: "Kunanon Jarat",
  headline: "Founder. IT Manager. Based in Bangkok.",
  summary: null as string | null,
} as const;

export function resolveResumeProfile(cms: ResumeProfile | null) {
  return {
    name: pickString(cms?.name, DEFAULT_RESUME_PROFILE.name),
    headline: pickString(cms?.headline, DEFAULT_RESUME_PROFILE.headline),
    summary: cms?.summary?.trim() ? cms.summary.trim() : null,
    sections:
      cms?.sections && cms.sections.length > 0 ? cms.sections : null,
  };
}

import type { ResolvedTimelineItem } from "@/lib/content/resumeProfile";
import type { ResumeDetail } from "@/lib/resume/search";

/*
 * Screen-only view logic for /resume (bento redesign, phase 7b; design spec
 * 4.4). The print rendering behind `pnpm pdf` ignores all of it. The search
 * schema lives in ./search, which the route loads up front.
 */

export type ResumeHeadline = {
  /** "Kunanon Jarat." */
  name: string;
  /** The headline's first sentence, muted beside the name ("Founder."). */
  muted?: string;
  /** Lines between the first and the last sentence. */
  middle: readonly string[];
  /** The last sentence, in the accent colour ("Based in Bangkok."). */
  accent?: string;
};

/**
 * The résumé h1 from the CMS name and headline, in the canvas shape:
 * "Kunanon Jarat. Founder." / "IT Manager & AI Engineering Lead." /
 * "Based in Bangkok." Shorter headlines drop the muted or middle parts.
 */
export function resumeHeadline(name: string, headline: string): ResumeHeadline {
  const fullName = /[.!?]$/.test(name.trim()) ? name.trim() : `${name.trim()}.`;
  const sentences = headline
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (sentences.length === 0) return { name: fullName, middle: [] };
  if (sentences.length === 1)
    return { name: fullName, middle: [], accent: sentences[0] };
  return {
    name: fullName,
    muted: sentences[0],
    middle: sentences.slice(1, -1),
    accent: sentences.at(-1),
  };
}

/** How a résumé section is drawn in the bento, chosen by its title. */
export type ResumeSectionKind =
  "current" | "roles" | "early" | "education" | "list" | "credentials";

const KINDS: Record<string, ResumeSectionKind> = {
  currently: "current",
  experience: "roles",
  "university-era": "early",
  education: "education",
  affiliations: "list",
  certifications: "credentials",
};

/** Slug for ids: "University-era" -> "university-era". */
export function sectionSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Sections the canvas does not draw (a new CMS section) read as roles. */
export function resumeSectionKind(title: string): ResumeSectionKind {
  return KINDS[sectionSlug(title)] ?? "roles";
}

/** Two columns, the first one taking the odd item. */
export function splitColumns<T>(
  items: readonly T[],
): [readonly T[], readonly T[]] {
  const half = Math.ceil(items.length / 2);
  return [items.slice(0, half), items.slice(half)];
}

/** A bullet saying the venture is live gets the Ember "live" square. */
export function isLiveBullet(text: string): boolean {
  return /^live at\b/i.test(text.trim());
}

/** "https://gogocash.co/" -> "gogocash.co", for the "gogocash.co →" link. */
export function linkLabel(href: string): string {
  return href.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
}

/** Bullets to show for an item at this detail level. */
export function visibleBullets(
  item: ResolvedTimelineItem,
  detail: ResumeDetail,
): readonly string[] {
  return detail === "detailed" ? (item.bullets ?? []) : [];
}

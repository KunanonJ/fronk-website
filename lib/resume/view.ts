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
  /** The headline's first sentence, muted beside the name ("AI Engineering Lead."). */
  muted?: string;
  /** Lines between the first and the last sentence. */
  middle: readonly string[];
  /** The last sentence, in the accent colour ("Based in Bangkok."). */
  accent?: string;
};

/**
 * The résumé h1 from the name and headline, in the canvas shape:
 * "Kunanon Jarat. AI Engineering Lead." / "Builds AI tools inside the
 * businesses that use them." / "Based in Bangkok." Shorter headlines drop the
 * muted or middle parts.
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

// A Map, not an object: a CMS section titled "Constructor" must not find
// Object.prototype.constructor here.
const KINDS = new Map<string, ResumeSectionKind>([
  ["currently", "current"],
  ["experience", "roles"],
  // Projects are drawn like the current roles: wells with a logo and a link.
  ["independent-projects", "current"],
  ["university-era", "early"],
  ["education", "education"],
  ["affiliations", "list"],
  ["training", "credentials"],
  ["certifications", "credentials"],
]);

/** Slug for ids: "University-era" -> "university-era". */
export function sectionSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Sections the canvas does not draw (a new CMS section) read as roles. */
export function resumeSectionKind(title: string): ResumeSectionKind {
  return KINDS.get(sectionSlug(title)) ?? "roles";
}

/**
 * Two columns of about equal weight, in order. Without a `weight` every item
 * counts the same, and the first column takes the odd one. With one (a role's
 * rough height), the split falls where the columns are closest in height, so
 * a column of long roles is not left beside a half-empty one.
 */
export function splitColumns<T>(
  items: readonly T[],
  weight: (item: T) => number = () => 1,
): [readonly T[], readonly T[]] {
  const weights = items.map(weight);
  const total = weights.reduce((sum, w) => sum + w, 0);
  let split = items.length;
  let closest = Infinity;
  let left = 0;
  for (let i = 0; i < items.length; i += 1) {
    left += weights[i]!;
    const gap = Math.abs(total - 2 * left);
    // `<=`: on a tie the later split wins, so the first column takes the odd item.
    if (gap <= closest) {
      closest = gap;
      split = i + 1;
    }
  }
  return [items.slice(0, split), items.slice(split)];
}

/** About how many characters fit on one line of a résumé column. */
const COLUMN_CHARS = 48;

/** A role row's rough height in text lines: title and organisation, note, bullets. */
export function rowWeight(
  item: ResolvedTimelineItem,
  detail: ResumeDetail,
): number {
  const lines = (text: string) => Math.ceil(text.length / COLUMN_CHARS);
  return (
    2 +
    (item.note ? lines(item.note) : 0) +
    visibleBullets(item, detail).reduce((sum, b) => sum + lines(b), 0)
  );
}

/** A bullet saying the venture is live gets the Ember "live" square. */
export function isLiveBullet(text: string): boolean {
  return /^live at\b/i.test(text.trim());
}

/** "https://gogocash.co/" -> "gogocash.co", for the "gogocash.co →" link. */
export function linkLabel(href: string): string {
  return href.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
}

/** How the printed résumé sets a group: full entries, or one line each. */
export type PrintGroupKind = "entries" | "lines";

export type PrintGroup = {
  title: string;
  kind: PrintGroupKind;
  items: readonly ResolvedTimelineItem[];
};

/** Screen sections the printed résumé leaves out, so it fits two pages. */
const SCREEN_ONLY = new Set(["university-era", "affiliations"]);

/** Screen sections that share one printed heading, as the CV groups them. */
const PRINT_HEADINGS = new Map<string, { title: string; kind: PrintGroupKind }>(
  [
    ["currently", { title: "Experience", kind: "entries" }],
    ["experience", { title: "Experience", kind: "entries" }],
    ["education", { title: "Education and training", kind: "lines" }],
    ["training", { title: "Education and training", kind: "lines" }],
  ],
);

/**
 * The résumé sections as the PDF prints them: the current role leads
 * Experience, Education and Training share a heading and print one line per
 * entry, and the screen-only sections are dropped. A section this file does
 * not know (a new CMS section) prints in full under its own title.
 */
export function printGroups(
  sections: readonly {
    title: string;
    items: readonly ResolvedTimelineItem[];
  }[],
): PrintGroup[] {
  const groups: {
    title: string;
    kind: PrintGroupKind;
    items: ResolvedTimelineItem[];
  }[] = [];
  for (const section of sections) {
    const slug = sectionSlug(section.title);
    if (SCREEN_ONLY.has(slug)) continue;
    const heading = PRINT_HEADINGS.get(slug) ?? {
      title: section.title,
      kind: "entries" as const,
    };
    let group = groups.find((g) => g.title === heading.title);
    if (!group) {
      group = { ...heading, items: [] };
      groups.push(group);
    }
    group.items.push(...section.items);
  }
  return groups;
}

/** Bullets to show for an item at this detail level. */
export function visibleBullets(
  item: ResolvedTimelineItem,
  detail: ResumeDetail,
): readonly string[] {
  return detail === "detailed" ? (item.bullets ?? []) : [];
}

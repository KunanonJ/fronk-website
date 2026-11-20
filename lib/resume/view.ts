import type {
  ResolvedTimelineItem,
  ResolvedTimelineSection,
} from "@/lib/content/resumeProfile";

/*
 * Screen-only view logic for /resume ("Snapshot", now-building program
 * phase 2, 20-11-26), and the print groups the PDF uses. The page reads the
 * sections by their titles, so a Sanity `resumeProfile` document flows
 * through the same way as the repo's résumé.
 */

export type ResumeHeadline = {
  /** "Kunanon Jarat." */
  name: string;
  /** The headline's first sentence, muted beside the name ("Solopreneur."). */
  muted?: string;
  /** Lines between the first and the last sentence. */
  middle: readonly string[];
  /** The last sentence, in the accent colour ("Based in Bangkok."). */
  accent?: string;
};

/**
 * The résumé h1 from the name and headline: "Kunanon Jarat. Solopreneur." /
 * "Builds AI tools inside the businesses that use them." / "Based in
 * Bangkok." Shorter headlines drop the muted or middle parts.
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

/** Slug for ids: "University-era" -> "university-era". */
export function sectionSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Where a section sits on the screen page. */
export type ResumeSectionKind =
  "now" | "roles" | "projects" | "learning" | "earlier";

// A Map, not an object: a CMS section titled "Constructor" must not find
// Object.prototype.constructor here.
const KINDS = new Map<string, ResumeSectionKind>([
  ["currently", "now"],
  ["experience", "roles"],
  ["independent-projects", "projects"],
  ["education", "learning"],
  ["training", "learning"],
  ["certifications", "learning"],
  ["university-era", "earlier"],
  ["affiliations", "earlier"],
]);

/** A section the page does not know (a new CMS section) reads as roles. */
export function resumeSectionKind(title: string): ResumeSectionKind {
  return KINDS.get(sectionSlug(title)) ?? "roles";
}

/** The sections in the screen page's order, by kind, each in data order. */
export type ResumeLayout = {
  /** What he is building now ("Currently"): the facts card and the tiles. */
  now?: ResolvedTimelineSection;
  /** Experience, then any section the page does not know: the timeline. */
  roles: readonly ResolvedTimelineSection[];
  /** Independent projects: tiles, after the timeline. */
  projects: readonly ResolvedTimelineSection[];
  /** Education and Training (or Certifications), side by side. */
  learning: readonly ResolvedTimelineSection[];
  /** University-era and Affiliations, folded into one closed <details>. */
  earlier: readonly ResolvedTimelineSection[];
};

/**
 * The page's layout from the résumé's sections. Any part may be missing (a
 * CMS document without "Currently", say): the page then leaves it out.
 */
export function resumeLayout(
  sections: readonly ResolvedTimelineSection[],
): ResumeLayout {
  const of = (kind: ResumeSectionKind) =>
    sections.filter((section) => resumeSectionKind(section.title) === kind);
  return {
    now: of("now")[0],
    roles: of("roles"),
    projects: of("projects"),
    learning: of("learning"),
    earlier: of("earlier"),
  };
}

/** A bullet saying the venture is live gets the coral "live" square. */
export function isLiveBullet(text: string): boolean {
  return /^live at\b/i.test(text.trim());
}

/** Whether an entry says it is live ("Live at gogocash.co."). */
export function isLive(item: ResolvedTimelineItem): boolean {
  return (item.bullets ?? []).some(isLiveBullet);
}

/**
 * A tile's one line: the entry's note, else its first bullet that is not
 * the "Live at" line, else nothing.
 */
export function tileLine(item: ResolvedTimelineItem): string | undefined {
  return item.note ?? item.bullets?.find((bullet) => !isLiveBullet(bullet));
}

/** "https://gogocash.co/" -> "gogocash.co", for the "gogocash.co ↗" link. */
export function linkLabel(href: string): string {
  return href.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
}

/** How the printed résumé sets a group: full entries, or one line each. */
type PrintGroupKind = "entries" | "lines";

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
 * The résumé sections as the PDF prints them: Currently (since 20-11-26 the
 * ventures he is building) leads Experience, Education and Training share a
 * heading and print one line per entry, and the screen-only sections are
 * dropped. A section this file does not know (a new CMS section) prints in
 * full under its own title.
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

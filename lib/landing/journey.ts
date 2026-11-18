import {
  orbitCopy,
  orbitTools,
  recordsCopy,
  type OrbitTool,
} from "@/lib/content/homeJourney";
import {
  RESUME_TIMELINE_FALLBACK,
  type ResolvedTimelineSection,
} from "@/lib/content/resumeTimeline.fallback";

/*
 * Pure helpers for the Home's Journey (profile redesign Phase 4, design spec
 * 8.6): the orbit's ring and the records card's rows. The résumé is read,
 * never edited: its periods keep their em-dash separators (the résumé's tests
 * parse them), and displayPeriod words them for the screen.
 */

/** A badge's colour pair, from the palette (no raw colour in components). */
export type PixelTone = "violet" | "ink" | "coral" | "tint";

const TONES: readonly PixelTone[] = ["violet", "ink", "coral", "tint"];
/** A file's preferred tones, alternating so the files differ too. */
const FILE_PREFERENCE: readonly (readonly PixelTone[])[] = [
  ["violet", "tint", "coral", "ink"],
  ["tint", "violet", "coral", "ink"],
];

export type RingItem =
  | (OrbitTool & { readonly type: "tool"; readonly tone: PixelTone })
  | { readonly type: "file"; readonly ext: string; readonly tone: PixelTone };

/**
 * The orbit, in ring order: the tools in /stack's order, with the file tiles
 * spread evenly between them (for 16 tools and 4 files: slots 2, 7, 12, 17).
 * Tools take the four tones in turn; a file takes the first tone neither of
 * its neighbours has, so no two neighbours share a colour.
 */
export function orbitRing(
  tools: readonly OrbitTool[] = orbitTools,
  files: readonly string[] = orbitCopy.files,
): RingItem[] {
  const total = tools.length + files.length;
  const every = files.length ? Math.floor(total / files.length) : total + 1;
  const order: ({ tool: number } | { file: number })[] = [];
  let tool = 0;
  let file = 0;
  for (let slot = 0; slot < total; slot += 1) {
    const fileSlot =
      file < files.length && slot === file * every + Math.floor(every / 2);
    if (fileSlot || tool >= tools.length) order.push({ file: file++ });
    else order.push({ tool: tool++ });
  }
  const toolTone = (index: number) => TONES[index % TONES.length]!;
  const toneAt = (slot: number) => {
    const item = order[(slot + total) % total]!;
    return "tool" in item ? toolTone(item.tool) : null;
  };
  return order.map((item, slot) => {
    if ("tool" in item)
      return { ...tools[item.tool]!, type: "tool", tone: toolTone(item.tool) };
    const taken = [toneAt(slot - 1), toneAt(slot + 1)];
    const prefer = FILE_PREFERENCE[item.file % FILE_PREFERENCE.length]!;
    return {
      type: "file",
      ext: files[item.file]!,
      tone: prefer.find((tone) => !taken.includes(tone)) ?? prefer[0]!,
    };
  });
}

/**
 * A résumé period for display, with no em dash: "Sep 2025 — Present" reads
 * "Sep 2025 to now", "Jan 2025 — Oct 2025" reads "Jan to Oct 2025".
 */
export function displayPeriod(period: string): string {
  const [from = "", to = ""] = period
    .split(/\s+[—–-]\s+/)
    .map((part) => part.trim());
  if (!to) return period.trim();
  const end = /^present$/i.test(to) ? "now" : to;
  const a = /^(\w+)\s+(\d{4})$/.exec(from);
  const b = /^(\w+)\s+(\d{4})$/.exec(end);
  if (a && b && a[2] === b[2]) return `${a[1]} to ${b[1]} ${b[2]}`;
  return `${from} to ${end}`;
}

export interface RecordRow {
  readonly key: string;
  /** The employer or school: the résumé's `org` before its first " · ". */
  readonly organisation: string;
  readonly title: string;
  readonly period: string;
}

/** The résumé sections that list employment, in the résumé's order. */
const EMPLOYMENT = new Set(["Currently", "Experience"]);

function rows(
  sections: readonly ResolvedTimelineSection[],
  pick: (title: string) => boolean,
): RecordRow[] {
  return sections
    .filter((section) => pick(section.title))
    .flatMap((section) => section.items)
    .map((item) => ({
      key: `${item.org}|${item.title}|${item.period}`,
      organisation: item.org.split(" · ")[0]!.trim(),
      title: item.title,
      period: displayPeriod(item.period),
    }));
}

/**
 * The records card (spec 8.6): the newest roles from the résumé's
 * employment sections, and its education.
 */
export function careerRecords(
  sections: readonly ResolvedTimelineSection[] = RESUME_TIMELINE_FALLBACK,
  roles: number = recordsCopy.roles,
): { employment: RecordRow[]; education: RecordRow[] } {
  return {
    employment: rows(sections, (title) => EMPLOYMENT.has(title)).slice(
      0,
      roles,
    ),
    education: rows(sections, (title) => title === "Education"),
  };
}

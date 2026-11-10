import type { ResolvedTimelineSection } from "@/lib/content/resumeProfile";

export type ExperienceEntry = { title: string; meta: string };

/** Short titles take the company ("Founder, GoGoCash") when both fit. */
const COMBINED_TITLE_MAX = 32;

/** "Sep 2025 — Present" -> "Sep 2025 – Present"; "Jan 2025 — Oct 2025" -> "Jan – Oct 2025". */
export function compactPeriod(period: string): string {
  const [from = "", to = ""] = period.split(/\s+[—–-]\s+/);
  if (!to) return period.trim();
  const a = from.match(/^(\w+)\s+(\d{4})$/);
  const b = to.match(/^(\w+)\s+(\d{4})$/);
  if (a && b && a[2] === b[2]) return `${a[1]} – ${b[1]} ${b[2]}`;
  return `${from} – ${to}`;
}

/**
 * The Home "Experience" timeline (bento canvas): the first `limit` résumé
 * entries, current roles first. A short title absorbs the company and the
 * meta line shows where; a long title keeps the company in the meta line.
 */
export function homeExperience(
  sections: readonly ResolvedTimelineSection[],
  limit = 4,
): ExperienceEntry[] {
  return sections
    .flatMap((section) => section.items)
    .slice(0, limit)
    .map((item) => {
      const parts = item.org.split(" · ").map((part) => part.trim());
      const company = parts[0] ?? "";
      const where = parts.length > 1 ? parts.at(-1)! : "";
      const period = compactPeriod(item.period);
      if (company && item.title.length + company.length <= COMBINED_TITLE_MAX)
        return {
          title: `${item.title}, ${company}`,
          meta: where ? `${where} · ${period}` : period,
        };
      return {
        title: item.title,
        meta: company ? `${company} · ${period}` : period,
      };
    });
}

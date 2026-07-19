export type ContributionDay = {
  date: string;
  count: number;
  /** 0–4 intensity bucket for cream heatmap cells. */
  level: number;
};

export type ContributionWeek = {
  days: readonly ContributionDay[];
};

export type ContributionCalendar = {
  total: number;
  weeks: readonly ContributionWeek[];
};

/** Map raw contribution count → 0–4 display level (GitHub-like steps). */
export function contributionLevel(count: number): number {
  if (!Number.isFinite(count) || count <= 0) return 0;
  if (count <= 2) return 1;
  if (count <= 5) return 2;
  if (count <= 10) return 3;
  return 4;
}

/** Cream alpha steps on black for levels 0–4. */
export const CONTRIBUTION_CREAM_ALPHA = [
  0.08, 0.22, 0.4, 0.62, 0.92,
] as const;

export function creamFillForLevel(level: number): string {
  const idx = Math.min(4, Math.max(0, Math.floor(level)));
  const alpha = CONTRIBUTION_CREAM_ALPHA[idx] ?? 0.08;
  return `rgba(222, 219, 200, ${alpha})`;
}

type GhDay = {
  date: string;
  contributionCount: number;
};

type GhWeek = {
  contributionDays: GhDay[];
};

/**
 * Normalize GitHub GraphQL calendar weeks into our shape.
 * Pads missing weekdays so the grid stays 7 rows.
 */
export function normalizeContributionCalendar(
  weeks: readonly GhWeek[],
  totalFromApi?: number,
): ContributionCalendar {
  const normalized: ContributionWeek[] = weeks.map((week) => {
    const byDow = new Map<number, GhDay>();
    for (const day of week.contributionDays) {
      const dow = new Date(`${day.date}T12:00:00Z`).getUTCDay();
      byDow.set(dow, day);
    }
    const days: ContributionDay[] = [];
    for (let dow = 0; dow < 7; dow++) {
      const raw = byDow.get(dow);
      if (!raw) {
        days.push({ date: "", count: 0, level: 0 });
        continue;
      }
      days.push({
        date: raw.date,
        count: raw.contributionCount,
        level: contributionLevel(raw.contributionCount),
      });
    }
    return { days };
  });

  const total =
    typeof totalFromApi === "number"
      ? totalFromApi
      : normalized.reduce(
          (sum, week) =>
            sum + week.days.reduce((s, d) => s + (d.count || 0), 0),
          0,
        );

  return { total, weeks: normalized };
}

/** Empty year grid — honest fallback when GitHub is unavailable. */
export function emptyContributionCalendar(weeks = 53): ContributionCalendar {
  const rows: ContributionWeek[] = Array.from({ length: weeks }, () => ({
    days: Array.from({ length: 7 }, () => ({
      date: "",
      count: 0,
      level: 0,
    })),
  }));
  return { total: 0, weeks: rows };
}

function parseTooltipCount(text: string): number {
  const trimmed = text.trim();
  if (/^no contributions/i.test(trimmed)) return 0;
  const match = trimmed.match(/^([\d,]+)\s+contributions?/i);
  if (!match) return 0;
  return Number(match[1]!.replace(/,/g, "")) || 0;
}

/**
 * Parse GitHub's public `/users/{login}/contributions` HTML
 * (works without a GraphQL token).
 */
export function parseGithubContributionsHtml(
  html: string,
): ContributionCalendar {
  const countById = new Map<string, number>();
  const tipRe =
    /<tool-tip[^>]*\bfor="([^"]+)"[^>]*>([\s\S]*?)<\/tool-tip>/gi;
  for (const match of html.matchAll(tipRe)) {
    countById.set(match[1]!, parseTooltipCount(match[2] ?? ""));
  }

  type Parsed = {
    week: number;
    dow: number;
    day: ContributionDay;
  };
  const parsed: Parsed[] = [];

  // Attribute order varies on GitHub's markup — parse attrs independently.
  const dayRe = /<td\b([^>]*\bContributionCalendar-day\b[^>]*)>/gi;
  for (const match of html.matchAll(dayRe)) {
    const attrs = match[1] ?? "";
    const id = attrs.match(/\bid="(contribution-day-component-(\d+)-(\d+))"/i);
    const date = attrs.match(/\bdata-date="(\d{4}-\d{2}-\d{2})"/i);
    const levelMatch = attrs.match(/\bdata-level="(\d)"/i);
    if (!id || !date || !levelMatch) continue;

    const dow = Number(id[2]);
    const week = Number(id[3]);
    const level = Math.min(4, Math.max(0, Number(levelMatch[1]) || 0));
    const count = countById.get(id[1]!) ?? 0;
    parsed.push({
      week,
      dow,
      day: { date: date[1]!, count, level },
    });
  }

  if (parsed.length === 0) {
    return emptyContributionCalendar(0);
  }

  const maxWeek = Math.max(...parsed.map((p) => p.week));
  const weeks: ContributionWeek[] = [];
  for (let w = 0; w <= maxWeek; w++) {
    const byDow = new Map<number, ContributionDay>();
    for (const p of parsed) {
      if (p.week === w) byDow.set(p.dow, p.day);
    }
    const days: ContributionDay[] = [];
    for (let dow = 0; dow < 7; dow++) {
      days.push(byDow.get(dow) ?? { date: "", count: 0, level: 0 });
    }
    weeks.push({ days });
  }

  const totalMatch = html.match(
    /([\d,]+)\s+contributions\s+in\s+the\s+last\s+year/i,
  );
  const total = totalMatch
    ? Number(totalMatch[1]!.replace(/,/g, "")) || 0
    : weeks.reduce(
        (sum, week) => sum + week.days.reduce((s, d) => s + d.count, 0),
        0,
      );

  return { total, weeks };
}

export const GITHUB_CONTRIBUTIONS_LOGIN = "KunanonJ";

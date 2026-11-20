/*
 * The footer's ship log (now-building-and-genz Phase 5): the latest commit
 * on main of the site's own public repository, as the Worker endpoint
 * /api/github/shipped answers it (src/server/api/githubShipped.ts) and the
 * footer shows it (components/profile/site/living/Living.tsx). Parsing and
 * checks only, so the server and the browser share them. Imports nothing,
 * so the footer's lazy chunk ties into no other chunk.
 */

/**
 * The site's public repository (the kunanonj.com project's source link) and
 * the branch that deploys. A test holds the owner to the contributions login.
 */
export const SITE_REPO = {
  owner: "KunanonJ",
  name: "fronk-website",
  branch: "main",
} as const;

/** Where the browser asks for it. */
export const SHIPPED_PATH = "/api/github/shipped";

/** A commit page on the site's repository. */
const COMMIT_URL = `https://github.com/${SITE_REPO.owner}/${SITE_REPO.name}/commit/`;

/** The longest subject the footer prints, in characters. */
export const SUBJECT_MAX = 80;

/** What the endpoint answers: the latest commit's subject, date and page. */
export interface Shipped {
  /** The message's first line, at most SUBJECT_MAX characters. */
  readonly subject: string;
  /** When it landed on main (the committer's date), ISO 8601 in UTC. */
  readonly date: string;
  /** The commit's page on GitHub. */
  readonly url: string;
}

/** A squash merge's pull request, at the end of its subject: " (#160)". */
const PULL_REQUEST = / \(#\d+\)$/;

/** How far back a cut may move to end on a whole word. */
const WORD_BACKTRACK = 16;

/**
 * A commit message's subject: its first line, spaces collapsed, at most
 * `max` characters. A longer one is cut with an ellipsis, on a word where
 * one ends near the cut and without the punctuation before it, and keeps
 * its pull request number. Characters are whole (never half a UTF-16 pair).
 */
export function commitSubject(message: string, max = SUBJECT_MAX): string {
  const line = (message.split(/\r?\n/, 1)[0] ?? "").replace(/\s+/g, " ").trim();
  if (Array.from(line).length <= max) return line;
  const pr = PULL_REQUEST.exec(line)?.[0] ?? "";
  const room = max - 1 - pr.length;
  let text = Array.from(line).slice(0, room).join("");
  const space = text.lastIndexOf(" ");
  if (space > 0 && space > text.length - WORD_BACKTRACK)
    text = text.slice(0, space);
  return `${text.replace(/[\s,;:.]+$/, "")}…${pr}`;
}

type GhCommit = {
  sha?: unknown;
  commit?: { message?: unknown; committer?: { date?: unknown } | null };
};

/**
 * The latest commit from GitHub's list of commits
 * (`GET /repos/{owner}/{repo}/commits?sha=main&per_page=1`), or null when
 * the answer is not one. The link is built from the SHA, never taken from
 * the answer, so it can only point at this repository.
 */
export function parseLatestCommit(json: unknown): Shipped | null {
  const latest = (Array.isArray(json) ? json[0] : undefined) as
    GhCommit | undefined;
  const sha = latest?.sha;
  const message = latest?.commit?.message;
  const date = latest?.commit?.committer?.date;
  if (typeof sha !== "string" || !/^[0-9a-f]{40}$/.test(sha)) return null;
  if (typeof message !== "string" || typeof date !== "string") return null;
  const at = Date.parse(date);
  const subject = commitSubject(message);
  if (Number.isNaN(at) || !subject) return null;
  return {
    subject,
    date: new Date(at).toISOString(),
    url: COMMIT_URL + sha,
  };
}

/** Whether an answer from the endpoint is a ship log the footer can show. */
export function isShipped(value: unknown): value is Shipped {
  const { subject, date, url } = (value ?? {}) as Record<string, unknown>;
  return (
    typeof subject === "string" &&
    subject.length > 0 &&
    typeof date === "string" &&
    !Number.isNaN(Date.parse(date)) &&
    typeof url === "string" &&
    url.startsWith(COMMIT_URL)
  );
}

/** The units the time since a commit is told in, largest first, in ms. */
const UNITS: readonly (readonly [Intl.RelativeTimeFormatUnit, number])[] = [
  ["year", 365 * 86_400_000],
  ["month", 30 * 86_400_000],
  ["week", 7 * 86_400_000],
  ["day", 86_400_000],
  ["hour", 3_600_000],
  ["minute", 60_000],
];

/**
 * How long ago `date` was, in the reader's words for it: "3h ago",
 * "yesterday", "this minute" (Intl.RelativeTimeFormat, narrow). Whole units,
 * never rounded up; a date ahead of `now` (a clock that runs slow) counts
 * as now.
 */
export function shippedAgo(date: string, now: number, locale = "en"): string {
  const ms = Math.min(0, Date.parse(date) - now);
  const format = new Intl.RelativeTimeFormat(locale, {
    style: "narrow",
    numeric: "auto",
  });
  for (const [unit, size] of UNITS)
    if (-ms >= size) return format.format(Math.trunc(ms / size), unit);
  return format.format(0, "minute");
}

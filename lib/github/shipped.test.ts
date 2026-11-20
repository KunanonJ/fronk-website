import { describe, expect, it } from "vitest";
import { GITHUB_CONTRIBUTIONS_LOGIN } from "@/lib/github/contributions";
import { getPortfolioProjectBySlug } from "@/lib/content/portfolio";
import {
  SITE_REPO,
  SUBJECT_MAX,
  commitSubject,
  isShipped,
  parseLatestCommit,
  shippedAgo,
} from "./shipped";

/*
 * The footer's ship log (now-building-and-genz Phase 5): GitHub's latest
 * commit on main, cut to its subject, its date and a link that can only
 * point at the site's own repository.
 */

const SHA = "a5ea607".padEnd(40, "0");
const URL = `https://github.com/KunanonJ/fronk-website/commit/${SHA}`;

/** GitHub's list of commits, as `?per_page=1` answers it (the fields read). */
function commits(message: string, date = "2026-11-20T08:12:33Z", sha = SHA) {
  return [
    {
      sha,
      html_url: "https://example.com/not-used",
      commit: {
        message,
        author: { date: "2026-11-19T01:00:00Z" },
        committer: { date },
      },
    },
  ];
}

describe("SITE_REPO", () => {
  it("is the site's public repository, the one its project page links", () => {
    expect(SITE_REPO.owner).toBe(GITHUB_CONTRIBUTIONS_LOGIN);
    const site = getPortfolioProjectBySlug("kunanonj-com");
    expect(site?.url).toBe(
      `https://github.com/${SITE_REPO.owner}/${SITE_REPO.name}`,
    );
    expect(SITE_REPO.branch).toBe("main");
  });
});

describe("commitSubject", () => {
  it("keeps the first line only, trimmed, with spaces collapsed", () => {
    expect(
      commitSubject(
        "  feat(hero):  the canvas   drifts \n\nBody\nCo-Authored-By: x",
      ),
    ).toBe("feat(hero): the canvas drifts");
    expect(commitSubject("fix: one\r\nTwo")).toBe("fix: one");
  });

  it("cuts a long subject on a whole word with an ellipsis, within the limit", () => {
    const cut = commitSubject(`feat: ${"wording ".repeat(20)}`);
    expect(Array.from(cut).length).toBeLessThanOrEqual(SUBJECT_MAX);
    expect(Array.from(cut).length).toBeGreaterThan(SUBJECT_MAX - 16);
    expect(cut).toMatch(/^feat: (wording )+wording…$/);
    // At the limit exactly, nothing is cut.
    const exact = "x".repeat(SUBJECT_MAX);
    expect(commitSubject(exact)).toBe(exact);
    // One long word is cut where it must be.
    expect(commitSubject("y".repeat(200))).toBe(`${"y".repeat(79)}…`);
  });

  it("keeps a squash merge's pull request number when it cuts", () => {
    // The real subject of #160: 81 characters.
    expect(
      commitSubject(
        "feat(secrets): ⌘K commands, a pixel party and a trait hunt across the site (#160)",
      ),
    ).toBe(
      "feat(secrets): ⌘K commands, a pixel party and a trait hunt across the… (#160)",
    );
  });

  it("drops the punctuation a cut leaves before the ellipsis", () => {
    // The real subject of #161: 86 characters.
    expect(
      commitSubject(
        "feat(hero): the canvas toolbar works: pen doodles, pixel stickers, ink, clear (#161)",
      ),
    ).toBe(
      "feat(hero): the canvas toolbar works: pen doodles, pixel stickers, ink… (#161)",
    );
  });

  it("never cuts a character in half", () => {
    const subject = commitSubject("🚀".repeat(100), 10);
    expect(Array.from(subject)).toEqual([...Array(9).fill("🚀"), "…"]);
  });
});

describe("parseLatestCommit", () => {
  it("reads the subject, the committer's date and builds the link from the SHA", () => {
    expect(
      parseLatestCommit(
        commits(
          "feat(resume): Snapshot, a recruiter-first résumé with a facts card (#159)\n\nBody",
        ),
      ),
    ).toEqual({
      subject:
        "feat(resume): Snapshot, a recruiter-first résumé with a facts card (#159)",
      date: "2026-11-20T08:12:33.000Z",
      url: URL,
    });
  });

  it("answers null for anything that is not a list holding a commit", () => {
    for (const json of [
      null,
      {},
      [],
      "nope",
      { message: "API rate limit exceeded" },
      commits("x", "not a date"),
      commits("x", undefined, "not-a-sha"),
      commits("x", undefined, `${SHA}/../../evil`),
      commits("   \n body only"),
      [{ sha: SHA, commit: { message: 7, committer: { date: "2026-11-20" } } }],
      [{ sha: SHA, commit: { message: "x", committer: null } }],
    ])
      expect(parseLatestCommit(json), JSON.stringify(json)).toBeNull();
  });
});

describe("isShipped", () => {
  const shipped = { subject: "fix: x", date: "2026-11-20T08:12:33Z", url: URL };

  it("takes the endpoint's answer", () => {
    expect(isShipped(shipped)).toBe(true);
  });

  it("refuses an answer that is missing a part, or links anywhere else", () => {
    for (const value of [
      null,
      undefined,
      {},
      { ...shipped, subject: "" },
      { ...shipped, date: "soon" },
      { ...shipped, url: "https://evil.example/commit/abc" },
      { ...shipped, url: "javascript:alert(1)" },
      { ...shipped, url: "https://github.com/someone/else/commit/abc" },
    ])
      expect(isShipped(value), JSON.stringify(value)).toBe(false);
  });
});

describe("shippedAgo", () => {
  const now = Date.parse("2026-11-20T12:00:00Z");
  const ago = (ms: number) => shippedAgo(new Date(now - ms).toISOString(), now);

  // The words are the engine's (they vary with its ICU data: "3h ago" or
  // "3 hr. ago"), so the unit and the count are what is checked.
  const said = new Intl.RelativeTimeFormat("en", {
    style: "narrow",
    numeric: "auto",
  });

  it("tells the time since in whole units, never rounded up", () => {
    for (const [ms, value, unit] of [
      [0, 0, "minute"],
      [59_000, 0, "minute"],
      [12 * 60_000, -12, "minute"],
      [3 * 3_600_000, -3, "hour"],
      [3 * 3_600_000 + 59 * 60_000, -3, "hour"],
      [30 * 3_600_000, -1, "day"],
      [5 * 86_400_000, -5, "day"],
      [15 * 86_400_000, -2, "week"],
      [65 * 86_400_000, -2, "month"],
      [400 * 86_400_000, -1, "year"],
    ] as const)
      expect(ago(ms), `${ms} ms`).toBe(said.format(value, unit));
  });

  it("reads as a time past, the footer's 'Shipped 3h ago'", () => {
    expect(ago(3 * 3_600_000)).toMatch(/^3\s?h.* ago$/);
    expect(ago(30 * 3_600_000)).toBe("yesterday");
  });

  it("counts a date ahead of the clock as now", () => {
    expect(ago(-5 * 60_000)).toBe(said.format(0, "minute"));
  });
});

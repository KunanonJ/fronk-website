import { describe, expect, it } from "vitest";
import {
  CONTRIBUTION_CREAM_ALPHA,
  contributionLevel,
  creamFillForLevel,
  emptyContributionCalendar,
  normalizeContributionCalendar,
  parseGithubContributionsHtml,
} from "./contributions";

describe("contributionLevel", () => {
  it("maps counts into 0–4 buckets", () => {
    expect(contributionLevel(0)).toBe(0);
    expect(contributionLevel(-1)).toBe(0);
    expect(contributionLevel(1)).toBe(1);
    expect(contributionLevel(2)).toBe(1);
    expect(contributionLevel(3)).toBe(2);
    expect(contributionLevel(5)).toBe(2);
    expect(contributionLevel(6)).toBe(3);
    expect(contributionLevel(10)).toBe(3);
    expect(contributionLevel(11)).toBe(4);
  });
});

describe("creamFillForLevel", () => {
  it("uses cream alphas for levels 0–4", () => {
    expect(creamFillForLevel(0)).toBe(
      `rgba(222, 219, 200, ${CONTRIBUTION_CREAM_ALPHA[0]})`,
    );
    expect(creamFillForLevel(4)).toBe(
      `rgba(222, 219, 200, ${CONTRIBUTION_CREAM_ALPHA[4]})`,
    );
    expect(creamFillForLevel(99)).toBe(
      `rgba(222, 219, 200, ${CONTRIBUTION_CREAM_ALPHA[4]})`,
    );
  });
});

describe("normalizeContributionCalendar", () => {
  it("pads weeks to 7 days and buckets levels", () => {
    const calendar = normalizeContributionCalendar(
      [
        {
          contributionDays: [
            { date: "2026-01-05", contributionCount: 0 }, // Mon
            { date: "2026-01-07", contributionCount: 4 }, // Wed
          ],
        },
      ],
      4,
    );

    expect(calendar.total).toBe(4);
    expect(calendar.weeks).toHaveLength(1);
    expect(calendar.weeks[0]!.days).toHaveLength(7);
    expect(calendar.weeks[0]!.days[1]).toEqual({
      date: "2026-01-05",
      count: 0,
      level: 0,
    });
    expect(calendar.weeks[0]!.days[3]).toEqual({
      date: "2026-01-07",
      count: 4,
      level: 2,
    });
  });
});

describe("emptyContributionCalendar", () => {
  it("returns an honest empty year grid", () => {
    const empty = emptyContributionCalendar(3);
    expect(empty.total).toBe(0);
    expect(empty.weeks).toHaveLength(3);
    expect(empty.weeks.every((w) => w.days.length === 7)).toBe(true);
    expect(empty.weeks[0]!.days[0]).toEqual({ date: "", count: 0, level: 0 });
  });
});

describe("parseGithubContributionsHtml", () => {
  const fixture = `
    <h2>3,376 contributions in the last year</h2>
    <td id="contribution-day-component-0-0" data-date="2025-07-20" data-level="0" class="ContributionCalendar-day"></td>
    <tool-tip for="contribution-day-component-0-0">No contributions on July 20th.</tool-tip>
    <td id="contribution-day-component-1-0" data-date="2025-07-21" data-level="2" class="ContributionCalendar-day"></td>
    <tool-tip for="contribution-day-component-1-0">4 contributions on July 21st.</tool-tip>
    <td id="contribution-day-component-0-1" data-date="2025-07-27" data-level="4" class="ContributionCalendar-day"></td>
    <tool-tip for="contribution-day-component-0-1">47 contributions on July 27th.</tool-tip>
  `;

  it("parses public contribution calendar HTML into weeks", () => {
    const calendar = parseGithubContributionsHtml(fixture);
    expect(calendar.total).toBe(3376);
    expect(calendar.weeks).toHaveLength(2);
    expect(calendar.weeks[0]!.days[0]).toEqual({
      date: "2025-07-20",
      count: 0,
      level: 0,
    });
    expect(calendar.weeks[0]!.days[1]).toEqual({
      date: "2025-07-21",
      count: 4,
      level: 2,
    });
    expect(calendar.weeks[1]!.days[0]).toEqual({
      date: "2025-07-27",
      count: 47,
      level: 4,
    });
  });

  it("returns empty calendar when markup is missing", () => {
    expect(parseGithubContributionsHtml("<div>nope</div>")).toEqual(
      emptyContributionCalendar(0),
    );
  });

  it("tolerates GitHub attribute order on day cells", () => {
    const githubOrder = `
      <h2>12 contributions in the last year</h2>
      <td tabindex="0" data-date="2026-01-04" id="contribution-day-component-0-0" data-level="1" class="ContributionCalendar-day"></td>
      <tool-tip for="contribution-day-component-0-0">2 contributions on January 4th.</tool-tip>
    `;
    const calendar = parseGithubContributionsHtml(githubOrder);
    expect(calendar.total).toBe(12);
    expect(calendar.weeks[0]!.days[0]).toEqual({
      date: "2026-01-04",
      count: 2,
      level: 1,
    });
  });
});

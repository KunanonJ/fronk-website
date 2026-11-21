import { describe, expect, it } from "vitest";
import { dayNumber, formatDay, relativeDay } from "./relativeDay";

/** The UTC day of an ISO time, as the browser's clock would give it. */
const day = (iso: string) => dayNumber(Date.parse(iso));
const COMMIT = "2026-11-16T21:37:52Z";
/** The UTC day `n` days after the commit's. */
const after = (n: number) => day(COMMIT) + n;

describe("relativeDay", () => {
  it.each([
    [0, "today"],
    [1, "yesterday"],
    [5, "5 days ago"],
    [29, "29 days ago"],
    [30, "last month"],
    [157, "5 months ago"],
    [364, "12 months ago"],
    [365, "last year"],
    [400, "last year"],
    [800, "2 years ago"],
  ])("%i days after reads %s", (days, words) => {
    expect(relativeDay(COMMIT, after(days))).toBe(words);
  });

  it("counts whole UTC days: late on the 16th to early on the 21st is 5", () => {
    expect(relativeDay(COMMIT, day("2026-11-21T00:30:00Z"))).toBe("5 days ago");
  });

  it("gives null for a day after today (a slow clock) and for no date", () => {
    expect(relativeDay(COMMIT, after(-1))).toBeNull();
    expect(relativeDay("not a date", after(0))).toBeNull();
  });
});

describe("formatDay", () => {
  it("writes the UTC day short, day first", () => {
    expect(formatDay(COMMIT)).toBe("16 Nov 2026");
    // 23:30 UTC is already the next day in Bangkok; the UTC day stays.
    expect(formatDay("2026-06-17T23:30:00Z")).toBe("17 Jun 2026");
  });
});

import { describe, expect, it } from "vitest";
import { formatDate, isoDate } from "./formatDate";

describe("formatDate", () => {
  it("formats an ISO string in en-US by default", () => {
    expect(formatDate("2024-03-14T00:00:00.000Z", "en-US")).toMatch(/March|Mar/);
  });

  it("accepts a Date object", () => {
    const date = new Date(Date.UTC(2024, 0, 1));
    expect(formatDate(date, "en-US")).toMatch(/January|Jan/);
  });

  it("throws on an invalid date string", () => {
    expect(() => formatDate("not-a-date")).toThrow();
  });
});

describe("isoDate", () => {
  it("returns ISO 8601 from a Date", () => {
    const date = new Date(Date.UTC(2024, 0, 1, 12, 30, 0));
    expect(isoDate(date)).toBe("2024-01-01T12:30:00.000Z");
  });
});

import { describe, expect, it } from "vitest";
import { formatPressDate, pressItems } from "@/lib/content/press";

describe("formatPressDate > given ISO YYYY-MM-DD", () => {
  it("formats as DD/MM/YYYY", () => {
    expect(formatPressDate("2026-07-09")).toBe("09/07/2026");
    expect(formatPressDate("2025-11-20")).toBe("20/11/2025");
  });
});

describe("formatPressDate > given invalid input", () => {
  it("returns the original string", () => {
    expect(formatPressDate("not-a-date")).toBe("not-a-date");
  });
});

describe("pressItems > stock catalog", () => {
  it("includes banner, title, description, date, and external href", () => {
    expect(pressItems.length).toBeGreaterThan(0);
    for (const item of pressItems) {
      expect(item.bannerSrc.length).toBeGreaterThan(0);
      expect(item.title.length).toBeGreaterThan(0);
      expect(item.description.length).toBeGreaterThan(0);
      expect(item.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(item.href).toMatch(/^https?:\/\//);
    }
  });
});

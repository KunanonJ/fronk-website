import { describe, expect, it } from "vitest";
import { SITE_UPDATED } from "./freshness";

describe("SITE_UPDATED", () => {
  it("is an ISO date that is not in the future", () => {
    expect(SITE_UPDATED).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    const date = new Date(`${SITE_UPDATED}T00:00:00Z`);
    expect(Number.isNaN(date.getTime())).toBe(false);
    expect(date.getTime()).toBeLessThanOrEqual(Date.now());
  });
});

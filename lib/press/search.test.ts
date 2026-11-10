import { describe, expect, it } from "vitest";
import * as v from "valibot";
import { PRESS_TYPES, pressItems } from "@/lib/content/press";
import {
  PRESS_FILTERS,
  matchesPressFilter,
  pressSearchSchema,
  type PressFilter,
} from "./search";

describe("press search params", () => {
  const parse = (input: unknown) => v.parse(pressSearchSchema, input);

  it("offers all plus each coverage type in lower case", () => {
    expect(PRESS_FILTERS).toEqual(["all", "feature", "product", "profile"]);
  });

  it("defaults to all", () => {
    expect(parse({})).toEqual({ type: "all" });
  });

  it.each(PRESS_FILTERS.map((type) => [type]))("reads ?type=%s", (type) => {
    expect(parse({ type })).toEqual({ type });
  });

  it.each([["Feature"], ["video"], [""], [1], [null]])(
    "falls back to all for %j without throwing",
    (type) => {
      expect(parse({ type })).toEqual({ type: "all" });
    },
  );
});

describe("matchesPressFilter", () => {
  const count = (filter: PressFilter) =>
    pressItems.filter((item) => matchesPressFilter(item, filter)).length;

  it("splits the coverage by type without overlap", () => {
    expect(count("all")).toBe(pressItems.length);
    const byType = PRESS_TYPES.map((t) =>
      count(t.toLowerCase() as PressFilter),
    );
    expect(byType.reduce((a, b) => a + b, 0)).toBe(pressItems.length);
  });

  it("matches the canvas counts", () => {
    expect([count("feature"), count("product"), count("profile")]).toEqual([
      1, 2, 1,
    ]);
  });
});

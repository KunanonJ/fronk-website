import { describe, expect, it } from "vitest";
import {
  autoplayMs,
  pageDepth,
  pageState,
  stepPage,
  turnsOnRelease,
  wordCount,
} from "@/components/profile/home/notebookRules";

/*
 * The notebook's rules (design spec 8.7): the autoplay wait, where each page
 * rests, how the piles stack, and when a released drag turns the page.
 */
describe("notebook rules", () => {
  it("waits 2 s plus 180 ms a word, between 7 and 18 s", () => {
    expect(autoplayMs(0)).toBe(7000);
    expect(autoplayMs(27)).toBe(7000);
    expect(autoplayMs(40)).toBe(9200);
    expect(autoplayMs(200)).toBe(18000);
    expect(wordCount("  Two   words ")).toBe(2);
  });

  it("rests pages turned, open or stacked, and stacks the piles", () => {
    expect([0, 1, 2].map((index) => pageState(index, 1))).toEqual([
      "turned",
      "current",
      "stacked",
    ]);
    // Page 1 open of 3: the open page tops the right pile, page 0 the left.
    expect(pageDepth(1, 1, 3)).toBeGreaterThan(pageDepth(2, 1, 3));
    expect(pageDepth(0, 2, 3)).toBeLessThan(pageDepth(1, 2, 3));
  });

  it("wraps round in both directions", () => {
    expect(stepPage(2, 1, 3)).toBe(0);
    expect(stepPage(0, -1, 3)).toBe(2);
    expect(stepPage(0, 1, 0)).toBe(0);
  });

  it("turns past a quarter of the leaf or on a flick, else springs back", () => {
    expect(turnsOnRelease(101, 400, 0)).toBe(true);
    expect(turnsOnRelease(99, 400, 0.2)).toBe(false);
    expect(turnsOnRelease(20, 400, 0.6)).toBe(true);
  });
});

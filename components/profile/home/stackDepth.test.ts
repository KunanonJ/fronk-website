import { describe, expect, it } from "vitest";
import {
  restingScrollTop,
  stackDepths,
} from "@/components/profile/home/stackDepth";

/*
 * The work stack's geometry (design spec 8.4): how far later cards cover each
 * card, and where a card rests uncovered.
 */
describe("stackDepths", () => {
  const STEP = 14;

  it("is 0 everywhere while the cards follow each other with their gap", () => {
    const boxes = [
      { top: 104, bottom: 704 },
      { top: 728, bottom: 1328 },
      { top: 1352, bottom: 1952 },
    ];
    expect(stackDepths(boxes, STEP)).toEqual([0, 0, 0]);
  });

  it("grows as the next card slides over, reaching 1 when it rests 14 px lower", () => {
    const halfway = [
      { top: 104, bottom: 704 },
      { top: 411, bottom: 1011 },
    ];
    expect(stackDepths(halfway, STEP)[0]).toBeCloseTo(293 / 586, 5);
    const resting = [
      { top: 104, bottom: 704 },
      { top: 118, bottom: 718 },
    ];
    expect(stackDepths(resting, STEP)).toEqual([1, 0]);
  });

  it("sums the cards over a card, and the last card is never covered", () => {
    const stacked = [
      { top: 104, bottom: 704 },
      { top: 118, bottom: 718 },
      { top: 132, bottom: 732 },
    ];
    expect(stackDepths(stacked, STEP)).toEqual([2, 1, 0]);
  });

  it("never goes below 0 or above 1 per card", () => {
    const odd = [
      { top: 104, bottom: 704 },
      { top: 50, bottom: 650 },
      { top: 2000, bottom: 2600 },
    ];
    expect(stackDepths(odd, STEP)).toEqual([1, 0, 0]);
  });

  it("ignores a card too short to be covered past the step", () => {
    expect(
      stackDepths(
        [
          { top: 104, bottom: 110 },
          { top: 118, bottom: 718 },
        ],
        STEP,
      ),
    ).toEqual([0, 0]);
  });
});

describe("restingScrollTop", () => {
  it("scrolls the card's place in the list to its sticky top", () => {
    expect(
      restingScrollTop({
        listTop: 1000,
        heights: [600, 600, 600],
        gap: 24,
        index: 2,
        stickyTop: 132,
      }),
    ).toBe(1000 + 2 * 624 - 132);
  });

  it("never asks for a negative scroll", () => {
    expect(
      restingScrollTop({
        listTop: 40,
        heights: [600],
        gap: 24,
        index: 0,
        stickyTop: 104,
      }),
    ).toBe(0);
  });
});

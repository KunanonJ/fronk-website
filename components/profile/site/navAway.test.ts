import { describe, expect, it } from "vitest";
import { NAV_STEP, NAV_TOP, navAway } from "@/components/profile/site/navAway";

/*
 * Hide on scroll (design spec 7.3): the thresholds are pinned as measured. A
 * position is recorded only after 6 px of movement, and the bar hides once the
 * page moves down past 24 px.
 */
function run(start: { lastY: number; away: boolean }, ys: number[]) {
  return ys.reduce((state, y) => navAway(state, y), start);
}

describe("navAway", () => {
  it("keeps the bar shown from the top to 26 px, and hides at 28 px", () => {
    const start = { lastY: 0, away: false };
    expect(run(start, [22])).toEqual({ lastY: 22, away: false });
    expect(run(start, [22, 24])).toEqual({ lastY: 22, away: false });
    expect(run(start, [22, 24, 26])).toEqual({ lastY: 22, away: false });
    expect(run(start, [22, 24, 26, 28])).toEqual({ lastY: 28, away: true });
  });

  it("shows the bar again after 6 px up", () => {
    const hidden = { lastY: 2920, away: true };
    expect(navAway(hidden, 2915)).toEqual(hidden);
    expect(navAway(hidden, 2914)).toEqual({ lastY: 2914, away: false });
  });

  it("shows the bar after 10 px up from 200 px down", () => {
    const at200 = run({ lastY: 0, away: false }, [200]);
    expect(at200.away).toBe(true);
    expect(navAway(at200, 190)).toEqual({ lastY: 190, away: false });
  });

  it("stays hidden while the page keeps moving down", () => {
    const hidden = { lastY: 100, away: true };
    expect(navAway(hidden, 110)).toEqual({ lastY: 110, away: true });
  });

  it("uses the thresholds of the spec", () => {
    expect(NAV_STEP).toBe(6);
    expect(NAV_TOP).toBe(24);
  });
});

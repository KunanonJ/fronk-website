import { describe, expect, it } from "vitest";
import {
  SPY_MARGIN,
  topmostSection,
} from "@/components/profile/site/scrollspy";

/*
 * The Home scrollspy (design spec 7.2): the topmost section the observer's band
 * holds is the one in view. The sections come in page order and do not overlap,
 * so the first visible one in that order is the topmost.
 */
const ORDER = ["work", "about", "journey"] as const;

describe("topmostSection", () => {
  it("takes the first visible section in page order, whatever else is visible", () => {
    expect(topmostSection(ORDER, new Set(["about", "work"]))).toBe("work");
    expect(topmostSection(ORDER, new Set(["journey", "about"]))).toBe("about");
    expect(topmostSection(ORDER, new Set(["journey"]))).toBe("journey");
  });

  it("is none when no section is in the band", () => {
    expect(topmostSection(ORDER, new Set())).toBeUndefined();
  });

  it("ignores ids that are not Home sections", () => {
    expect(topmostSection(ORDER, new Set(["elsewhere"]))).toBeUndefined();
  });

  it("uses a band across the top fifth of the viewport", () => {
    expect(SPY_MARGIN).toBe("-20% 0px -60% 0px");
  });
});

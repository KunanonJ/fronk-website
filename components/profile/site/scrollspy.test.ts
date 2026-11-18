import { describe, expect, it } from "vitest";
import {
  SPY_MARGIN,
  currentSection,
} from "@/components/profile/site/scrollspy";

/*
 * The Home scrollspy (design spec 7.2): the topmost section the observer's
 * band holds is the one in view. None in the band means no link is marked.
 */
describe("currentSection", () => {
  it("picks the topmost visible section", () => {
    expect(
      currentSection([
        { id: "about", top: 300 },
        { id: "work", top: 120 },
      ]),
    ).toBe("work");
  });

  it("is none when no section is in the band", () => {
    expect(currentSection([])).toBeUndefined();
  });

  it("keeps a tall section current while it is cut by the band's top", () => {
    expect(currentSection([{ id: "work", top: -400 }])).toBe("work");
  });

  it("uses a band across the top fifth of the viewport", () => {
    expect(SPY_MARGIN).toBe("-20% 0px -60% 0px");
  });
});

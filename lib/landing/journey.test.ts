import { describe, expect, it } from "vitest";
import { orbitTools } from "@/lib/content/homeJourney";
import { RESUME_TIMELINE_FALLBACK } from "@/lib/content/resumeTimeline.fallback";
import { careerRecords, displayPeriod, orbitRing } from "@/lib/landing/journey";

/*
 * The Journey's helpers (profile redesign Phase 4; plan steps 4b and 4c,
 * gate 5): the orbit's ring order, and the records card read from the
 * résumé with its periods worded without an em dash.
 */

describe("orbitRing", () => {
  const ring = orbitRing();

  it("holds every tool once, in /stack's order, and the four file tiles", () => {
    expect(
      ring.flatMap((item) => (item.type === "tool" ? [item.name] : [])),
    ).toEqual(orbitTools.map((tool) => tool.name));
    expect(
      ring.flatMap((item) => (item.type === "file" ? [item.ext] : [])),
    ).toEqual([".ts", ".md", ".json", ".csv"]);
  });

  it("spreads the file tiles evenly round the ring", () => {
    const slots = ring.flatMap((item, index) =>
      item.type === "file" ? [index] : [],
    );
    expect(slots).toEqual([2, 7, 12, 17]);
  });

  it("never gives two neighbours the same colour", () => {
    ring.forEach((item, index) => {
      const next = ring[(index + 1) % ring.length]!;
      expect(item.tone, `slot ${index}`).not.toBe(next.tone);
    });
  });

  it("is just the tools with no file tiles", () => {
    expect(orbitRing(orbitTools, [])).toHaveLength(orbitTools.length);
  });
});

describe("displayPeriod", () => {
  it("words the résumé's periods without an em dash", () => {
    expect(displayPeriod("Sep 2025 — Present")).toBe("Sep 2025 to now");
    expect(displayPeriod("Jan 2025 — Oct 2025")).toBe("Jan to Oct 2025");
    expect(displayPeriod("Nov 2023 — Sep 2024")).toBe("Nov 2023 to Sep 2024");
    expect(displayPeriod("Aug 2017 — Apr 2021")).toBe("Aug 2017 to Apr 2021");
    expect(displayPeriod("2025 — Present")).toBe("2025 to now");
    expect(displayPeriod("May 2026")).toBe("May 2026");
    expect(displayPeriod("In development")).toBe("In development");
  });

  it("leaves no dash in any period of the résumé", () => {
    for (const item of RESUME_TIMELINE_FALLBACK.flatMap((s) => s.items))
      expect(displayPeriod(item.period), item.period).not.toMatch(/[—–]/);
  });
});

describe("careerRecords", () => {
  const { employment, education } = careerRecords();
  const resume = (title: string) =>
    RESUME_TIMELINE_FALLBACK.find((section) => section.title === title)!.items;

  it("lists the four newest roles, as the résumé has them", () => {
    const roles = [...resume("Currently"), ...resume("Experience")].slice(0, 4);
    expect(employment).toHaveLength(4);
    employment.forEach((row, index) => {
      const item = roles[index]!;
      expect(row.title).toBe(item.title);
      expect(item.org.startsWith(row.organisation)).toBe(true);
      expect(row.period).toBe(displayPeriod(item.period));
    });
    expect(employment[0]).toMatchObject({
      organisation: "The Binary Holdings",
      period: "Sep 2025 to now",
    });
  });

  it("lists the education, and nothing from the projects or early roles", () => {
    expect(education).toEqual([
      expect.objectContaining({
        organisation: "Kasetsart University",
        title: "B.Eng. Electrical Engineering",
        period: "Aug 2017 to Apr 2021",
      }),
    ]);
    const shown = new Set(
      [...employment, ...education].map((row) => row.title),
    );
    for (const item of [
      ...resume("Independent projects"),
      ...resume("University-era"),
    ])
      expect(shown.has(item.title), item.title).toBe(false);
  });

  it("takes another count of roles", () => {
    expect(careerRecords(RESUME_TIMELINE_FALLBACK, 6).employment).toHaveLength(
      6,
    );
  });
});

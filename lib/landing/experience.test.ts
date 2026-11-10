import { describe, expect, it } from "vitest";
import { compactPeriod, homeExperience } from "@/lib/landing/experience";
import { RESUME_TIMELINE_FALLBACK } from "@/lib/content/resumeTimeline.fallback";

describe("compactPeriod", () => {
  it("uses an en dash and folds a shared year", () => {
    expect(compactPeriod("Sep 2025 — Present")).toBe("Sep 2025 – Present");
    expect(compactPeriod("Jan 2025 — Oct 2025")).toBe("Jan – Oct 2025");
    expect(compactPeriod("2025 — Present")).toBe("2025 – Present");
    expect(compactPeriod("Nov 2024 — Jan 2025")).toBe("Nov 2024 – Jan 2025");
    expect(compactPeriod("2021")).toBe("2021");
  });
});

describe("homeExperience", () => {
  it("renders the canvas timeline from the résumé data", () => {
    expect(homeExperience(RESUME_TIMELINE_FALLBACK)).toEqual([
      {
        title: "IT Manager & AI Engineering Lead",
        meta: "The Binary Holdings · Sep 2025 – Present",
      },
      {
        title: "AI Project Manager, Aiden Labs",
        meta: "Hybrid · Jan – Oct 2025",
      },
      { title: "Advisor, Aiden Labs", meta: "Remote · Nov – Dec 2024" },
      {
        title: "Technical Project Manager",
        meta: "The Binary Holdings · Sep – Dec 2024",
      },
    ]);
  });

  it("honours the limit", () => {
    expect(homeExperience(RESUME_TIMELINE_FALLBACK, 2)).toHaveLength(2);
  });
});

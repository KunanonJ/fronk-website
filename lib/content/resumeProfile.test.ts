import { describe, expect, it } from "vitest";
import {
  DEFAULT_RESUME_PROFILE,
  resolveResumeProfile,
} from "./resumeProfile";
import { RESUME_TIMELINE_FALLBACK } from "./resumeTimeline.fallback";

describe("resolveResumeProfile", () => {
  it("returns static header defaults when CMS content is missing", () => {
    expect(resolveResumeProfile(null)).toMatchObject({
      name: DEFAULT_RESUME_PROFILE.name,
      headline: DEFAULT_RESUME_PROFILE.headline,
      summary: null,
    });
  });

  it("uses static timeline sections when CMS sections are absent", () => {
    const profile = resolveResumeProfile(null);
    expect(profile.sections).toEqual(RESUME_TIMELINE_FALLBACK);
  });

  it("maps CMS timeline sections when present", () => {
    const profile = resolveResumeProfile({
      name: "Test Name",
      headline: "Test headline",
      sections: [
        {
          title: "Experience",
          items: [
            {
              title: "Founder",
              subtitle: "Acme Inc · Remote",
              timeframe: "2024 — Present",
              highlights: ["Shipped v1"],
              url: "https://acme.example",
              logoDomain: "acme.example",
            },
          ],
        },
      ],
    });

    expect(profile.sections).toHaveLength(1);
    expect(profile.sections[0]).toEqual({
      title: "Experience",
      items: [
        {
          title: "Founder",
          org: "Acme Inc · Remote",
          period: "2024 — Present",
          href: "https://acme.example",
          logoDomain: "acme.example",
          bullets: ["Shipped v1"],
        },
      ],
    });
  });

  it("uses description as a bullet when highlights are empty", () => {
    const profile = resolveResumeProfile({
      name: "Test",
      headline: "Headline",
      sections: [
        {
          title: "Currently",
          items: [
            {
              title: "Advisor",
              subtitle: "Example Co",
              timeframe: "2026",
              description: "Helped launch the beta.",
              highlights: null,
            },
          ],
        },
      ],
    });

    expect(profile.sections[0]?.items[0]?.bullets).toEqual([
      "Helped launch the beta.",
    ]);
  });
});

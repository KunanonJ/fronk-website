import { describe, expect, it, vi } from "vitest";
import {
  DEFAULT_RESUME_PROFILE,
  loadResumeProfile,
  resolveResumeProfile,
} from "./resumeProfile";
import { RESUME_TIMELINE_FALLBACK } from "./resumeTimeline.fallback";

describe("resolveResumeProfile", () => {
  it("returns static header defaults when CMS content is missing", () => {
    expect(resolveResumeProfile(null)).toMatchObject({
      name: DEFAULT_RESUME_PROFILE.name,
      headline: DEFAULT_RESUME_PROFILE.headline,
      summary: DEFAULT_RESUME_PROFILE.summary,
    });
  });

  it("leads the default headline with the AI role, not a founder title", () => {
    expect(DEFAULT_RESUME_PROFILE.headline).toMatch(/^AI Engineering Lead\./);
    expect(DEFAULT_RESUME_PROFILE.headline).not.toMatch(/Founder/);
  });

  it("prefers a CMS summary and keeps the repo's skill groups", () => {
    const profile = resolveResumeProfile({
      name: "Test",
      headline: "Headline.",
      summary: "  From the CMS.  ",
      sections: null,
    });
    expect(profile.summary).toBe("From the CMS.");
    expect(profile.skills.map((group) => group.label)).toEqual([
      "AI & Cloud",
      "Transformation & Delivery",
      "Engineering",
      "Tools",
    ]);
    expect(profile.skills[0]?.items).toContain("AI agents");
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

describe("loadResumeProfile", () => {
  it("draws what Sanity returns, and says the read worked", async () => {
    const profile = await loadResumeProfile(async () => ({
      name: "Test",
      headline: "Headline.",
      summary: "From the CMS.",
      sections: null,
    }));
    expect(profile.degraded).toBe(false);
    expect(profile.summary).toBe("From the CMS.");
  });

  it("draws the repo's résumé when Sanity holds no document", async () => {
    const profile = await loadResumeProfile(async () => null);
    expect(profile.degraded).toBe(false);
    expect(profile.sections).toBe(RESUME_TIMELINE_FALLBACK);
  });

  it("stands the repo's résumé in when the read fails, and flags it", async () => {
    // A recruiter who clicks Résumé must not meet the error page. The flag
    // keeps this stand-in out of the edge cache (src/lib/cache.ts).
    const logged = vi.spyOn(console, "error").mockImplementation(() => {});
    const failure = new Error("Sanity unreachable");
    const profile = await loadResumeProfile(async () => {
      throw failure;
    });
    expect(profile.degraded).toBe(true);
    expect(profile).toMatchObject(resolveResumeProfile(null));
    expect(profile.name).toBe(DEFAULT_RESUME_PROFILE.name);
    // Swallowed for the visitor, not for the operator.
    expect(logged).toHaveBeenCalledWith(
      "[resume] showing the repo's résumé instead",
      failure,
    );
    logged.mockRestore();
  });

  it("also stands in, and logs, when Sanity returns a document it cannot draw", async () => {
    // The request worked, so lib/sanity/fetch.ts logged nothing: without the
    // log here every visit would get the stand-in and nobody would know.
    const logged = vi.spyOn(console, "error").mockImplementation(() => {});
    const profile = await loadResumeProfile(
      async () =>
        ({ sections: "not a list" }) as unknown as Parameters<
          typeof resolveResumeProfile
        >[0],
    );
    expect(profile.degraded).toBe(true);
    expect(profile.sections).toBe(RESUME_TIMELINE_FALLBACK);
    expect(logged).toHaveBeenCalledTimes(1);
    logged.mockRestore();
  });
});

import { describe, expect, it } from "vitest";
import { siteConfig } from "@/lib/site";
import {
  ATMOSPHERIC_CTA,
  ENGAGE_STEPS,
  FOOTER_COPY,
  HOME_MARKETING,
  NARRATIVE,
} from "./homeMarketing";
import { DEFAULT_HOME_PAGE } from "./homePage";

describe("homeMarketing > Fronk voice contract", () => {
  it("aligns hero defaults to siteConfig tagline and honest ventures", () => {
    expect(DEFAULT_HOME_PAGE.heroEyebrow).toBe("Bangkok · Founder");
    expect(DEFAULT_HOME_PAGE.heroTagline).toBe(siteConfig.tagline);
    expect(DEFAULT_HOME_PAGE.heroIntro).toMatch(/GoGoCash/);
    expect(DEFAULT_HOME_PAGE.heroIntro).toMatch(/Manut AI/);
    expect(DEFAULT_HOME_PAGE.primaryCta).toEqual({
      label: "See ventures",
      href: "/ventures",
    });
    expect(DEFAULT_HOME_PAGE.secondaryCta).toEqual({
      label: "Contact",
      href: "/contact",
    });
    expect(DEFAULT_HOME_PAGE.featuredSectionKicker).toBe("Ventures");
    expect(DEFAULT_HOME_PAGE.featuredSectionTitle).toBe(
      "Two products. Both live.",
    );
  });

  it("uses founder-ops narrative without FogLAMP SaaS metaphors", () => {
    const blob = JSON.stringify({
      ...NARRATIVE,
      ...ENGAGE_STEPS,
      ...ATMOSPHERIC_CTA,
      ...FOOTER_COPY,
      ...HOME_MARKETING,
    });
    expect(blob.toLowerCase()).not.toMatch(/\bfog\b/);
    expect(blob.toLowerCase()).not.toMatch(/latency/);
    expect(blob.toLowerCase()).not.toMatch(/set up in three steps/);
    expect(NARRATIVE.beats[0]?.label).toBe("Shoppers");
    expect(NARRATIVE.closing).toMatch(/Binary Holdings/);
    expect(ENGAGE_STEPS.heading).toBe("How we start.");
    expect(ATMOSPHERIC_CTA.title).toBe("Building from Bangkok.");
    expect(FOOTER_COPY.title).toBe("Building from Bangkok.");
    expect(FOOTER_COPY.line).toMatch(/GoGoCash/);
    expect(HOME_MARKETING.previewLabel).toBe("Ventures");
  });
});

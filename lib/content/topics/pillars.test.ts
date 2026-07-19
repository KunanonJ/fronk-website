import { describe, expect, it } from "vitest";
import {
  TOPIC_SLUGS,
  getTopicPillar,
  isTopicSlug,
  topicHreflang,
} from "./pillars";

describe("topic pillars", () => {
  it("exposes three EN pillars with FAQs and related links", () => {
    for (const slug of TOPIC_SLUGS) {
      const pillar = getTopicPillar(slug, "en");
      expect(pillar, slug).toBeTruthy();
      expect(pillar!.faqs.length).toBeGreaterThanOrEqual(2);
      expect(pillar!.relatedLinks.length).toBeGreaterThanOrEqual(2);
      expect(pillar!.h1.length).toBeGreaterThan(10);
    }
  });

  it("exposes Thai mirrors for every slug", () => {
    for (const slug of TOPIC_SLUGS) {
      expect(getTopicPillar(slug, "th")).toBeTruthy();
    }
  });

  it("hreflang pairs en and th paths", () => {
    const langs = topicHreflang("ai-transformation-thailand");
    expect(langs.en).toBe("/topics/ai-transformation-thailand");
    expect(langs.th).toBe("/th/topics/ai-transformation-thailand");
  });

  it("rejects unknown slugs", () => {
    expect(isTopicSlug("nope")).toBe(false);
    expect(getTopicPillar("nope")).toBeNull();
  });
});

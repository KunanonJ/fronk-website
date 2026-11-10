import * as v from "valibot";
import { describe, expect, it } from "vitest";
import { contactSearchSchema } from "@/lib/contact/search";
import {
  HIRING_CONTACT_HREF,
  OPEN_TO_ROLES,
  RESUME_HREF,
} from "@/lib/content/availability";
import { aboutPage } from "@/lib/content/aboutPage";
import { CONTACT_TOPICS, HIRING_TOPIC } from "@/lib/content/contact";
import { FAQ_ITEMS } from "@/lib/content/faq";
import { OPEN_TO_ROLES as FROM_IDENTITY } from "@/lib/content/identity";
import {
  getAllTopicPillars,
  getTopicPillar,
} from "@/lib/content/topics/pillars";

/*
 * The availability line is shown on Home, About, the résumé, both FDE hubs,
 * the case studies and Contact. These tests keep every form of it saying
 * the one thing the owner approved.
 */
describe("availability", () => {
  it("is the one object the identity module re-exports", () => {
    expect(FROM_IDENTITY).toBe(OPEN_TO_ROLES);
  });

  it("builds the pill from the same roles and place as the sentence", () => {
    const { roles, location, sentence, pill } = OPEN_TO_ROLES;
    expect(pill.detail).toBe(`${roles.join(" and ")} · ${location}`);
    expect(sentence).toBe(
      `Open to ${roles.join(" and ")} roles, based in ${location}.`,
    );
    expect(pill.label).toBe("Open to roles");
  });

  it("never offers what the owner did not: relocation or travel", () => {
    expect(JSON.stringify(OPEN_TO_ROLES)).not.toMatch(
      /relocat|travel|on-?site/i,
    );
    // Nor do the pages that speak for him: About, the FAQ and every hub.
    // Only an offer counts: a sentence that merely mentions travel is fine.
    // (The résumé's "On-site, Bangkok" is where past jobs were, not an offer.)
    const spoken = JSON.stringify([
      aboutPage,
      FAQ_ITEMS,
      getAllTopicPillars("en"),
      getAllTopicPillars("th"),
    ]);
    expect(spoken).not.toMatch(
      /relocat|(willing|open|able|happy|available|ready) to travel|travel(ling|ing)? (for|to) (work|a role|roles|clients)/i,
    );
  });

  it("says the same in Thai, the pill being the sentence split in two", () => {
    const { th } = OPEN_TO_ROLES;
    expect(`${th.pill.label} ${th.pill.detail}`).toBe(th.sentence);
    for (const role of ["Forward Deployed Engineer", "AI"])
      expect(th.sentence).toContain(role);
    const hub = getTopicPillar("forward-deployed-ai-engineering", "th")!;
    expect(hub.proof).toContain(th.sentence);
    expect(hub.availability).toBe(th.pill);
  });

  it("shows on both FDE hubs and on no other topic hub", () => {
    const en = getTopicPillar("forward-deployed-ai-engineering", "en")!;
    expect(en.availability).toBe(OPEN_TO_ROLES.pill);
    expect(en.proof).toContain(OPEN_TO_ROLES.sentence);
    for (const locale of ["en", "th"] as const) {
      const withPill = getAllTopicPillars(locale)
        .filter((pillar) => pillar.availability)
        .map((pillar) => pillar.slug);
      expect(withPill, locale).toEqual(["forward-deployed-ai-engineering"]);
    }
  });
});

describe("the hiring path", () => {
  it("leads to the contact form with a topic the form knows", () => {
    const url = new URL(HIRING_CONTACT_HREF, "https://example.test");
    expect(url.pathname).toBe("/contact");
    const search = v.parse(
      contactSearchSchema,
      Object.fromEntries(url.searchParams),
    );
    expect(search).toEqual({ topic: "hiring" });
    expect(CONTACT_TOPICS).toContain(HIRING_TOPIC);
    expect(CONTACT_TOPICS[0]).toBe(HIRING_TOPIC);
  });

  it("is where both FDE hubs send their buttons, beside the résumé", () => {
    for (const locale of ["en", "th"] as const) {
      const hub = getTopicPillar("forward-deployed-ai-engineering", locale)!;
      expect(hub.ctaHref, locale).toBe(HIRING_CONTACT_HREF);
      expect(hub.secondaryCta?.href, locale).toBe(RESUME_HREF);
      expect(
        hub.relatedLinks.map((link) => link.href),
        locale,
      ).toContain(RESUME_HREF);
    }
  });
});

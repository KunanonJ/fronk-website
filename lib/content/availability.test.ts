import * as v from "valibot";
import { describe, expect, it } from "vitest";
import { contactSearchSchema } from "@/lib/contact/search";
import {
  AVAILABILITY,
  FUTURE_ROLE_CONTACT_HREF,
  RESUME_HREF,
  WORK_CONTACT_HREF,
} from "@/lib/content/availability";
import { aboutPage } from "@/lib/content/aboutPage";
import { contactPage } from "@/lib/content/contact";
import {
  CONTACT_TOPICS,
  INTENT_TOPICS,
  TOPIC_PROMPTS,
  messagePrompt,
} from "@/lib/content/contactTopics";
import { FAQ_ITEMS } from "@/lib/content/faq";
import { AVAILABILITY as FROM_IDENTITY } from "@/lib/content/identity";
import { getVentureBySlug } from "@/lib/content/ventures";
import {
  getAllTopicPillars,
  getTopicPillar,
} from "@/lib/content/topics/pillars";

/*
 * The availability line is shown on Home, About, the résumé, both FDE hubs,
 * the case studies and Contact. These tests keep every form of it saying
 * what the owner directed on 20-11-26: he is building GoGoCash and Manut AI
 * and is not looking for a full-time role; partnerships, projects, advisory,
 * talks and workshops are welcome.
 */
describe("availability", () => {
  it("is the one object the identity module re-exports", () => {
    expect(FROM_IDENTITY).toBe(AVAILABILITY);
  });

  it("names the two ventures the site lists, by their own names", () => {
    expect(AVAILABILITY.ventures).toEqual([
      getVentureBySlug("gogocash")!.name,
      getVentureBySlug("manut")!.name,
    ]);
  });

  it("builds the pill from the same ventures and place as the sentence", () => {
    const { ventures, location, sentence, pill } = AVAILABILITY;
    const building = ventures.join(" and ");
    expect(pill.label).toBe("Currently building");
    expect(pill.detail).toBe(`${building} · ${location}`);
    expect(sentence).toBe(
      `${pill.label} ${building} from ${location}, and not looking for a full-time role right now.`,
    );
  });

  it("says what he is open to without offering a role", () => {
    expect(AVAILABILITY.workWith).toBe(
      "Open to partnerships, freelance and consulting projects, advisory, talks and workshops.",
    );
    expect(AVAILABILITY.workWith).not.toMatch(/\brole/i);
  });

  it('never says "Open to roles" again, anywhere the site speaks for him', () => {
    const spoken = JSON.stringify([
      AVAILABILITY,
      aboutPage,
      FAQ_ITEMS,
      getAllTopicPillars("en"),
      getAllTopicPillars("th"),
    ]);
    expect(spoken).not.toMatch(/open to (roles|forward deployed)/i);
    expect(spoken).not.toMatch(/bangkok or remote/i);
    expect(spoken).not.toContain("เปิดรับตำแหน่ง");
  });

  it("never offers what the owner did not: relocation or travel", () => {
    expect(JSON.stringify(AVAILABILITY)).not.toMatch(
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

  it("says the same in Thai, the pill opening the sentence", () => {
    const { th } = AVAILABILITY;
    expect(th.pill.label).toBe("กำลังสร้าง");
    expect(th.sentence.startsWith(`${th.pill.label} ${th.pill.detail}`)).toBe(
      true,
    );
    for (const venture of AVAILABILITY.ventures)
      expect(th.sentence).toContain(venture);
    const hub = getTopicPillar("forward-deployed-ai-engineering", "th")!;
    expect(hub.proof).toContain(th.sentence);
    expect(hub.availability).toBe(th.pill);
  });

  it("shows on both FDE hubs and on no other topic hub", () => {
    const en = getTopicPillar("forward-deployed-ai-engineering", "en")!;
    expect(en.availability).toBe(AVAILABILITY.pill);
    expect(en.proof).toContain(AVAILABILITY.sentence);
    for (const locale of ["en", "th"] as const) {
      const withPill = getAllTopicPillars(locale)
        .filter((pillar) => pillar.availability)
        .map((pillar) => pillar.slug);
      expect(withPill, locale).toEqual(["forward-deployed-ai-engineering"]);
    }
  });
});

describe("the contact paths", () => {
  const searchOf = (href: string) => {
    const url = new URL(href, "https://example.test");
    expect(url.pathname).toBe("/contact");
    return v.parse(contactSearchSchema, Object.fromEntries(url.searchParams));
  };

  it("leads a work button to the form with Freelance or consulting chosen", () => {
    expect(searchOf(WORK_CONTACT_HREF)).toEqual({ topic: "project" });
    expect(INTENT_TOPICS.project).toBe("Freelance or consulting");
    expect(CONTACT_TOPICS[0]).toBe(INTENT_TOPICS.project);
    expect(messagePrompt([INTENT_TOPICS.project])).toBe(
      "What are you building, and where could I help?",
    );
  });

  it("keeps the old hiring address, now for a future role", () => {
    expect(FUTURE_ROLE_CONTACT_HREF).toBe("/contact?topic=hiring");
    expect(searchOf(FUTURE_ROLE_CONTACT_HREF)).toEqual({ topic: "hiring" });
    expect(INTENT_TOPICS.hiring).toBe("A future role");
    expect(CONTACT_TOPICS).toContain(INTENT_TOPICS.hiring);
    expect(messagePrompt([INTENT_TOPICS.hiring])).toMatch(
      /^Not looking right now/,
    );
  });

  it("asks the general question when no chosen topic has a prompt", () => {
    expect(messagePrompt([])).toBe(contactPage.messagePlaceholder);
    expect(messagePrompt(["GoGoCash", "Something else"])).toBe(
      contactPage.messagePlaceholder,
    );
    // The first chosen topic with a prompt wins.
    expect(
      messagePrompt(["GoGoCash", "A future role", INTENT_TOPICS.project]),
    ).toBe(TOPIC_PROMPTS["A future role"]);
  });

  it("is where both FDE hubs send their buttons, beside the résumé", () => {
    for (const locale of ["en", "th"] as const) {
      const hub = getTopicPillar("forward-deployed-ai-engineering", locale)!;
      expect(hub.ctaHref, locale).toBe(WORK_CONTACT_HREF);
      expect(hub.secondaryCta?.href, locale).toBe(RESUME_HREF);
      expect(
        hub.relatedLinks.map((link) => link.href),
        locale,
      ).toContain(RESUME_HREF);
    }
  });
});

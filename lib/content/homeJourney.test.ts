import { describe, expect, it } from "vitest";
import { OPEN_TO_ROLES, RESUME_HREF } from "@/lib/content/availability";
import {
  journeyCopy,
  orbitCopy,
  orbitTools,
  recordsCopy,
  storyCopy,
  type StoryRun,
} from "@/lib/content/homeJourney";
import { RESUME_TIMELINE_FALLBACK } from "@/lib/content/resumeTimeline.fallback";
import { stackItems, STACK_GROUPS } from "@/lib/content/stack";

/*
 * The Journey's copy (profile redesign Phase 4, design spec 15.5; plan gate
 * 5): the story states no figure and names only organisations the résumé
 * lists; the roles are the cleared availability; the tools are /stack's; no
 * line carries an em dash.
 */

const text = (runs: readonly StoryRun[]) =>
  runs.map((run) => (typeof run === "string" ? run : run.strong)).join("");

const story = storyCopy.paragraphs.map(text);

/** Every employer and school the résumé names, before its first " · ". */
const organisations = new Set(
  RESUME_TIMELINE_FALLBACK.flatMap((section) => section.items).map((item) =>
    item.org.split(" · ")[0]!.split(" - ")[0]!.trim(),
  ),
);

describe("the Journey's story", () => {
  it("states no figure", () => {
    for (const paragraph of story) expect(paragraph).not.toMatch(/\d/);
  });

  it("names only organisations the résumé lists", () => {
    const named = [...organisations].filter((name) =>
      story.some((paragraph) => paragraph.includes(name)),
    );
    expect(named).toEqual(
      expect.arrayContaining([
        "Kasetsart University",
        "Bitkub",
        "KK Venture Global",
        "Coins.co.th",
        "Playbux",
        "Aiden Labs",
        "The Binary Holdings",
      ]),
    );
    // A capitalised run that is not an organisation of the résumé would be a
    // claim nobody cleared; the allowed words are the sentence's own.
    const allowed = new Set([
      "I",
      "From",
      "Today",
      "IT",
      "AI",
      "Kasetsart",
      "University",
      ...[...organisations].flatMap((name) => name.split(/\s+/)),
    ]);
    for (const paragraph of story)
      for (const word of paragraph.match(/\b[A-Z][\w.]*/g) ?? [])
        expect(allowed.has(word.replace(/\.$/, "")), word).toBe(true);
  });

  it("bolds a key phrase in each paragraph", () => {
    for (const runs of storyCopy.paragraphs)
      expect(runs.some((run) => typeof run !== "string")).toBe(true);
  });

  it("states the cleared availability, with its roles and place as chips", () => {
    expect(storyCopy.roles).toBe(OPEN_TO_ROLES.sentence);
    expect(storyCopy.chips).toEqual([
      ...OPEN_TO_ROLES.roles,
      OPEN_TO_ROLES.location,
    ]);
  });
});

describe("the Journey's stage, orbit and records labels", () => {
  it("lists every /stack tool once, in order, with its group as the kind", () => {
    expect(orbitTools.map((tool) => tool.name)).toEqual(
      stackItems.map((item) => item.name),
    );
    const groups = new Set(STACK_GROUPS.map((group) => group.label));
    for (const tool of orbitTools) {
      expect(groups.has(tool.kind), tool.name).toBe(true);
      expect(tool.badge).toMatch(/^[A-Z]{2}$/);
    }
  });

  it("has four file tiles of our own", () => {
    expect(orbitCopy.files).toEqual([".ts", ".md", ".json", ".csv"]);
  });

  it("links the full résumé and lists four roles by default (spec 15.5)", () => {
    expect(recordsCopy.resume.href).toBe(RESUME_HREF);
    expect(recordsCopy.roles).toBe(4);
  });

  it("carries no em dash in any line", () => {
    const lines = [
      ...Object.values(journeyCopy),
      ...story,
      storyCopy.rolesHeading,
      ...Object.values(orbitCopy).flat(),
      recordsCopy.label,
      recordsCopy.employment,
      recordsCopy.education,
      recordsCopy.resume.label,
    ];
    for (const line of lines) expect(String(line)).not.toContain("—");
  });
});

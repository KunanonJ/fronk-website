import { describe, expect, it } from "vitest";
import * as v from "valibot";
import { DEFAULT_RESUME_PROFILE } from "@/lib/content/resumeProfile";
import { RESUME_TIMELINE_FALLBACK } from "@/lib/content/resumeTimeline.fallback";
import { resumeSearchSchema } from "./search";
import {
  isLiveBullet,
  linkLabel,
  printGroups,
  resumeHeadline,
  resumeSectionKind,
  rowWeight,
  splitColumns,
  visibleBullets,
} from "./view";

describe("resume search params", () => {
  const parse = (input: unknown) => v.parse(resumeSearchSchema, input);

  it("defaults to detailed", () => {
    expect(parse({})).toEqual({ view: "detailed" });
  });

  it("reads ?view=compact", () => {
    expect(parse({ view: "compact" })).toEqual({ view: "compact" });
  });

  it.each([["full"], [""], [1], [null], [["compact"]]])(
    "falls back to detailed for %j without throwing",
    (view) => {
      expect(parse({ view })).toEqual({ view: "detailed" });
    },
  );

  it("drops unrelated params", () => {
    expect(parse({ view: "compact", other: "x" })).toEqual({
      view: "compact",
    });
  });
});

describe("resumeHeadline", () => {
  it("splits the default headline into the canvas lines", () => {
    expect(
      resumeHeadline("Kunanon Jarat", DEFAULT_RESUME_PROFILE.headline),
    ).toEqual({
      name: "Kunanon Jarat.",
      muted: "AI Engineering Lead.",
      middle: ["Builds AI tools inside the businesses that use them."],
      accent: "Based in Bangkok.",
    });
  });

  it("copes with shorter CMS headlines", () => {
    expect(resumeHeadline("Ada.", "Engineer.")).toEqual({
      name: "Ada.",
      middle: [],
      accent: "Engineer.",
    });
    expect(resumeHeadline("Ada", "")).toEqual({ name: "Ada.", middle: [] });
    expect(resumeHeadline("Ada", "Founder. In Bangkok.")).toEqual({
      name: "Ada.",
      muted: "Founder.",
      middle: [],
      accent: "In Bangkok.",
    });
  });
});

describe("resume section layout", () => {
  it("maps every fallback section to its canvas card", () => {
    expect(
      RESUME_TIMELINE_FALLBACK.map((s) => resumeSectionKind(s.title)),
    ).toEqual([
      "current",
      "roles",
      "current",
      "early",
      "education",
      "list",
      "credentials",
    ]);
  });

  it("draws an unknown section as roles", () => {
    expect(resumeSectionKind("Volunteering")).toBe("roles");
    // A title that names an Object.prototype key is still just a title.
    expect(resumeSectionKind("Constructor")).toBe("roles");
    expect(resumeSectionKind("toString")).toBe("roles");
  });

  it("splits a list into two columns, the first taking the odd item", () => {
    expect(splitColumns([1, 2, 3, 4, 5])).toEqual([
      [1, 2, 3],
      [4, 5],
    ]);
    expect(splitColumns([])).toEqual([[], []]);
  });

  it("splits by weight where the two columns are closest in height", () => {
    const heights = [9, 1, 1, 1, 1, 1];
    expect(splitColumns(heights, (height) => height)).toEqual([
      [9],
      [1, 1, 1, 1, 1],
    ]);
    // One item cannot be split: it stays in the first column.
    expect(splitColumns([4], (height) => height)).toEqual([[4], []]);
  });

  it("weighs a role by its note and its visible bullets", () => {
    const role = {
      title: "Role",
      org: "Org",
      period: "2026",
      note: "x".repeat(60),
      bullets: ["x".repeat(48), "x".repeat(49)],
    };
    expect(rowWeight(role, "detailed")).toBe(2 + 2 + 1 + 2);
    expect(rowWeight(role, "compact")).toBe(2 + 2);
    expect(
      rowWeight({ title: "Role", org: "Org", period: "2026" }, "detailed"),
    ).toBe(2);
  });
});

describe("printGroups", () => {
  const groups = printGroups(RESUME_TIMELINE_FALLBACK);

  it("prints the CV's headings in the CV's order", () => {
    expect(groups.map((g) => [g.title, g.kind])).toEqual([
      ["Experience", "entries"],
      ["Independent projects", "entries"],
      ["Education and training", "lines"],
    ]);
  });

  it("leads Experience with the current role, then the past roles", () => {
    const [currently, experience] = RESUME_TIMELINE_FALLBACK;
    expect(groups[0]!.items).toEqual([
      ...currently!.items,
      ...experience!.items,
    ]);
  });

  it("leaves the screen-only sections out", () => {
    const printed = groups.flatMap((g) => g.items.map((item) => item.org));
    expect(printed.some((org) => org.includes("TEDx"))).toBe(false);
    expect(printed).not.toContain("Protocol Camp");
  });

  it("prints a section it does not know in full, under its own title", () => {
    const item = { title: "Mentor", org: "Example", period: "2026" };
    expect(printGroups([{ title: "Volunteering", items: [item] }])).toEqual([
      { title: "Volunteering", kind: "entries", items: [item] },
    ]);
    expect(printGroups([{ title: "Constructor", items: [item] }])).toEqual([
      { title: "Constructor", kind: "entries", items: [item] },
    ]);
  });
});

describe("resume item helpers", () => {
  it("spots the live bullets", () => {
    expect(isLiveBullet("Live at gogocash.co.")).toBe(true);
    expect(isLiveBullet("Delivered live dashboards.")).toBe(false);
  });

  it("labels links without the scheme", () => {
    expect(linkLabel("https://gogocash.co")).toBe("gogocash.co");
    expect(linkLabel("https://www.manut.xyz/")).toBe("manut.xyz");
  });

  it("hides bullets in the compact view", () => {
    const item = RESUME_TIMELINE_FALLBACK[0]!.items[0]!;
    expect(visibleBullets(item, "detailed").length).toBeGreaterThan(0);
    expect(visibleBullets(item, "compact")).toEqual([]);
  });
});

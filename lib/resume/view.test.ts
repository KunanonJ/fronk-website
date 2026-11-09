import { describe, expect, it } from "vitest";
import * as v from "valibot";
import { RESUME_TIMELINE_FALLBACK } from "@/lib/content/resumeTimeline.fallback";
import { resumeSearchSchema } from "./search";
import {
  isLiveBullet,
  linkLabel,
  resumeHeadline,
  resumeSectionKind,
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
      resumeHeadline(
        "Kunanon Jarat",
        "Founder. IT Manager & AI Engineering Lead. Based in Bangkok.",
      ),
    ).toEqual({
      name: "Kunanon Jarat.",
      muted: "Founder.",
      middle: ["IT Manager & AI Engineering Lead."],
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
      "early",
      "education",
      "list",
      "credentials",
    ]);
  });

  it("draws an unknown section as roles", () => {
    expect(resumeSectionKind("Volunteering")).toBe("roles");
  });

  it("splits a list into two columns, the first taking the odd item", () => {
    expect(splitColumns([1, 2, 3, 4, 5])).toEqual([
      [1, 2, 3],
      [4, 5],
    ]);
    expect(splitColumns([])).toEqual([[], []]);
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

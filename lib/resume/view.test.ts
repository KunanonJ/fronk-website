import { describe, expect, it } from "vitest";
import { DEFAULT_RESUME_PROFILE } from "@/lib/content/resumeProfile";
import { RESUME_TIMELINE_FALLBACK } from "@/lib/content/resumeTimeline.fallback";
import {
  isLive,
  isLiveBullet,
  linkLabel,
  printGroups,
  resumeHeadline,
  resumeLayout,
  resumeSectionKind,
  tileLine,
} from "./view";

describe("resumeHeadline", () => {
  it("splits the default headline into the h1's lines", () => {
    expect(
      resumeHeadline("Kunanon Jarat", DEFAULT_RESUME_PROFILE.headline),
    ).toEqual({
      name: "Kunanon Jarat.",
      muted: "Solopreneur.",
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
  it("places every fallback section by its title", () => {
    expect(
      RESUME_TIMELINE_FALLBACK.map((s) => resumeSectionKind(s.title)),
    ).toEqual([
      "now",
      "roles",
      "projects",
      "earlier",
      "learning",
      "earlier",
      "learning",
    ]);
  });

  it("reads an unknown section as roles", () => {
    expect(resumeSectionKind("Volunteering")).toBe("roles");
    // A title that names an Object.prototype key is still just a title.
    expect(resumeSectionKind("Constructor")).toBe("roles");
    expect(resumeSectionKind("toString")).toBe("roles");
    expect(resumeSectionKind("Certifications")).toBe("learning");
  });

  it("orders the page: building now, the roles, projects, learning, then the earlier entries", () => {
    const layout = resumeLayout(RESUME_TIMELINE_FALLBACK);
    expect(layout.now?.title).toBe("Currently");
    expect(layout.roles.map((s) => s.title)).toEqual(["Experience"]);
    expect(layout.projects.map((s) => s.title)).toEqual([
      "Independent projects",
    ]);
    expect(layout.learning.map((s) => s.title)).toEqual([
      "Education",
      "Training",
    ]);
    expect(layout.earlier.map((s) => s.title)).toEqual([
      "University-era",
      "Affiliations",
    ]);
  });

  it("keeps a CMS résumé's unknown sections with the roles, and copes with a missing Currently", () => {
    const item = { title: "Mentor", org: "Example", period: "2026" };
    const layout = resumeLayout([
      { title: "Experience", items: [item] },
      { title: "Volunteering", items: [item] },
    ]);
    expect(layout.now).toBeUndefined();
    expect(layout.roles.map((s) => s.title)).toEqual([
      "Experience",
      "Volunteering",
    ]);
    expect(layout.projects).toEqual([]);
    expect(layout.learning).toEqual([]);
    expect(layout.earlier).toEqual([]);
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

  it("leads Experience with what he is building now (Currently), then the roles", () => {
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
  const [gogocash, manut] = RESUME_TIMELINE_FALLBACK[0]!.items;

  it("spots the live bullets and the live entries", () => {
    expect(isLiveBullet("Live at gogocash.co.")).toBe(true);
    expect(isLiveBullet("Delivered live dashboards.")).toBe(false);
    expect(isLive(gogocash!)).toBe(true);
    expect(isLive({ title: "x", org: "y", period: "z" })).toBe(false);
  });

  it("gives a tile its note, else its first bullet that is not the live line", () => {
    expect(tileLine(gogocash!)).toBe(gogocash!.note);
    expect(tileLine(manut!)).toBe(
      "Building an ERP/CRM workspace with Intelligence AI for automotive SMEs.",
    );
    expect(
      tileLine({
        title: "x",
        org: "y",
        period: "z",
        bullets: ["Live at x.co."],
      }),
    ).toBeUndefined();
  });

  it("labels links without the scheme", () => {
    expect(linkLabel("https://gogocash.co")).toBe("gogocash.co");
    expect(linkLabel("https://www.manut.xyz/")).toBe("manut.xyz");
  });
});

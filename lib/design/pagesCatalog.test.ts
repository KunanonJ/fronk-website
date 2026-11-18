import { describe, expect, it } from "vitest";
import { read, sourceFiles } from "@/lib/design/sourceScan";

/**
 * Profile redesign, Phase 7 group D2: the pages it moves into the token scope
 * (skills, the résumé, the 404 and error pages, /design, the hidden blog and
 * press) are redesign components now, so they follow its rules. `@theme
 * inline` froze Tailwind's font-sans, font-mono and font-display utilities to
 * the Geist stacks, so inside the scope they would render the old fonts (the
 * same guard covers components/ds and components/profile in globals.test.ts);
 * colour comes from tokens, never raw hex.
 */
const files = [
  ...sourceFiles([
    "components/landing/skills",
    "components/landing/blog",
    "components/profile/catalog",
    "components/system",
  ]),
  "components/landing/StatusPage.tsx",
  "components/landing/PressPage.tsx",
  "components/resume/ResumePage.tsx",
  "components/resume/ResumeCards.tsx",
  "components/NotFound.tsx",
  "components/RouteError.tsx",
  "src/routes/_landing/skills/index.tsx",
  "src/routes/_landing/skills/$slug.tsx",
  "src/routes/_landing/resume.tsx",
  "src/routes/_landing/press.tsx",
  "src/routes/_landing/blog/index.tsx",
  "src/routes/_landing/blog/$slug.tsx",
  "src/routes/_system/design.tsx",
];

describe("Phase 7 group D2's pages", () => {
  it("scans the files it means to", () => {
    expect(files).toContain("components/landing/skills/SkillDetailPage.tsx");
    expect(files).toContain("components/system/DesignSystemPage.tsx");
    expect(files.length).toBeGreaterThan(15);
  });

  it("keep the frozen font utilities out", () => {
    const offenders = files.filter((f) =>
      /\bfont-(?:sans|mono|display)\b/.test(read(f)),
    );
    expect(offenders).toEqual([]);
  });

  it("take colour from tokens, never raw hex", () => {
    const offenders = files.filter((f) => /#[0-9a-fA-F]{3,8}\b/.test(read(f)));
    expect(offenders).toEqual([]);
  });

  it("use the profile main, not the old bento column", () => {
    const offenders = files.filter((f) => /\bPageMain\b/.test(read(f)));
    expect(offenders).toEqual([]);
  });
});

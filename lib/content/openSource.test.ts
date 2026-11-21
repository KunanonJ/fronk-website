import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { PIXEL_LETTERS } from "@/components/profile/home/PixelIcon";
import {
  OPEN_SOURCE_PROJECTS,
  OPEN_SOURCE_SYNCED_ON,
  STARS_SHOWN_FROM,
  openSourcePage,
  openSourceStrip,
  shownStars,
} from "@/lib/content/openSource";
// The test only: the page and its content module never load the skills snapshot.
import { PACK_INSTALL, SKILLS_TAG } from "@/lib/content/skills";
import { REPOS } from "@/scripts/sync-open-source.mjs";

/*
 * The open-source projects (owner request 21-11-26): the owner's three
 * repositories, the owner's words over GitHub's facts, and a module light
 * enough for Home.
 */

const byRepo = (repo: string) =>
  OPEN_SOURCE_PROJECTS.find((p) => p.facts.repo === repo)!;

describe("the open-source projects", () => {
  it("lists the owner's three repositories, in the owner's order, each once", () => {
    expect(OPEN_SOURCE_PROJECTS.map((p) => p.facts.repo)).toEqual(REPOS);
    expect(REPOS).toEqual([
      "KunanonJ/superstacks",
      "KunanonJ/thai-accounting-tax-law",
      "KunanonJ/OpenFinance",
    ]);
  });

  it("names MIT for each, as the owner chose", () => {
    for (const p of OPEN_SOURCE_PROJECTS) expect(p.facts.license).toBe("MIT");
    expect(openSourcePage.meta).toContain("MIT license");
  });

  it("gives each card a unique, URL-safe anchor", () => {
    const slugs = OPEN_SOURCE_PROJECTS.map((p) => p.slug);
    for (const slug of slugs)
      expect(slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("draws each badge from the pixel letters", () => {
    for (const p of OPEN_SOURCE_PROJECTS) {
      expect(p.badge, p.name).toHaveLength(2);
      for (const letter of p.badge)
        expect(Object.keys(PIXEL_LETTERS), p.name).toContain(letter);
    }
  });

  it("agrees with the skills snapshot", () => {
    const superstacks = byRepo("KunanonJ/superstacks");
    expect(superstacks.facts.release?.tag).toBe(SKILLS_TAG);
    expect(superstacks.install?.command).toBe(PACK_INSTALL.claudeCode[0]);
    expect(superstacks.more?.href).toBe("/skills");
  });

  it("links OpenFinance's demo where GitHub says it lives", () => {
    const openFinance = byRepo("KunanonJ/OpenFinance");
    expect(openFinance.demo?.href).toBe(openFinance.facts.homepage);
  });

  it("copies the Thai install from its README, one step per line", () => {
    const lines = byRepo(
      "KunanonJ/thai-accounting-tax-law",
    ).install!.command.split("\n");
    expect(lines).toHaveLength(3);
    expect(lines[0]).toBe(
      "git clone https://github.com/KunanonJ/thai-accounting-tax-law.git",
    );
  });

  it("dates the snapshot on a UTC day that is not in the future", () => {
    expect(OPEN_SOURCE_SYNCED_ON).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(OPEN_SOURCE_SYNCED_ON <= new Date().toISOString().slice(0, 10)).toBe(
      true,
    );
    for (const p of OPEN_SOURCE_PROJECTS)
      expect(p.facts.lastCommitAt.slice(0, 10) <= OPEN_SOURCE_SYNCED_ON).toBe(
        true,
      );
  });

  it("shows stars only from STARS_SHOWN_FROM", () => {
    expect(STARS_SHOWN_FROM).toBe(25);
    expect(shownStars(24)).toBeNull();
    expect(shownStars(25)).toBe(25);
  });

  it("writes its drafts plainly", () => {
    const words = JSON.stringify([
      OPEN_SOURCE_PROJECTS.map(({ facts: _facts, ...overlay }) => overlay),
      openSourcePage,
      openSourceStrip,
    ]);
    expect(words).not.toContain("\u2014");
    expect(words).not.toMatch(/\p{Extended_Pictographic}/u);
    expect(words).not.toMatch(/\b(he|him|his)\b/i);
  });

  it("never imports the skills snapshot", () => {
    for (const file of [
      "lib/content/openSource.ts",
      "components/profile/home/OpenSourceStrip.tsx",
      "components/profile/pages/library/OpenSourcePage.tsx",
    ]) {
      // Import specifiers only: a comment may name what the file avoids.
      const specifiers = [
        ...readFileSync(join(process.cwd(), file), "utf8").matchAll(
          /(?:\bfrom|\bimport)\s*\(?\s*["']([^"']+)["']/g,
        ),
      ].map((m) => m[1]!);
      expect(specifiers.length, file).toBeGreaterThan(0);
      for (const specifier of specifiers) {
        expect(specifier, file).not.toContain("content/skills");
        expect(specifier, file).not.toContain("SkillParts");
      }
    }
  });
});

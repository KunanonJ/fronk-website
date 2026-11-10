import { describe, expect, it } from "vitest";
import { primaryNav } from "@/lib/content/landing";
import snapshot from "@/lib/content/skills.generated.json";
import {
  ADAPTED_COUNT,
  ORIGINAL_COUNT,
  PACK_INSTALL,
  PLUGIN_ZIP,
  SKILL_PIPELINE,
  SKILL_SOURCES,
  SKILL_STAGES,
  SKILL_STAGE_MEMBERS,
  SKILLS_RELEASE_DATE,
  SKILLS_RELEASE_MONTH,
  SKILLS_REPO_URL,
  SKILLS_TAG,
  copyrightHolder,
  formatBytes,
  getAdjacentSkills,
  getAllSkillSlugs,
  getAllSkills,
  getSkillBySlug,
  getSkillsByStage,
  getStageSiblings,
  skillInstallCommands,
  skillsPage,
  sourceLabel,
} from "@/lib/content/skills";

const skills = getAllSkills();
const assetNames = new Set<string>([
  ...snapshot.skills.flatMap((s) => [s.zip.name, s.flatZip.name]),
  snapshot.pluginZip.name,
]);
const releaseDownload = `${SKILLS_REPO_URL}/releases/download/${SKILLS_TAG}`;

describe("skills snapshot", () => {
  it("has the 20 superstacks skills", () => {
    expect(snapshot.skills).toHaveLength(20);
    expect(skills).toHaveLength(20);
  });

  it("is pinned to one release tag", () => {
    expect(snapshot.tag).toMatch(/^v\d+\.\d+\.\d+$/);
    expect(snapshot.tag).toBe(`v${snapshot.version}`);
    expect(snapshot.releaseUrl).toBe(
      `${SKILLS_REPO_URL}/releases/tag/${SKILLS_TAG}`,
    );
  });

  it("has unique, URL-safe slugs", () => {
    const slugs = getAllSkillSlugs();
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs)
      expect(slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  });

  it("gives every skill a description, a license and a SKILL.md", () => {
    for (const s of skills) {
      expect(s.description.trim(), s.slug).not.toBe("");
      expect(s.license, s.slug).toBe("MIT");
      expect(s.content.startsWith("---\n"), s.slug).toBe(true);
      expect(s.content, s.slug).toContain(`name: ${s.name}`);
      expect(
        s.files.some((f) => f.path === "SKILL.md"),
        s.slug,
      ).toBe(true);
    }
  });
});

describe("skills stages", () => {
  it("puts every skill in exactly one stage", () => {
    const members = Object.values(SKILL_STAGE_MEMBERS).flat();
    expect(new Set(members).size).toBe(members.length);
    expect([...members].sort()).toEqual(
      snapshot.skills.map((s) => s.name).sort(),
    );
  });

  it("has a member list for every declared stage, and nothing else", () => {
    expect(Object.keys(SKILL_STAGE_MEMBERS).sort()).toEqual(
      SKILL_STAGES.map((s) => s.id).sort(),
    );
    for (const { stage, skills: inStage } of getSkillsByStage()) {
      expect(inStage.length, stage.id).toBeGreaterThan(0);
      for (const s of inStage) expect(s.stage).toBe(stage.id);
    }
  });

  it("links every pipeline step to a real skill", () => {
    for (const step of SKILL_PIPELINE) {
      expect(getSkillBySlug(step.slug), step.slug).not.toBeNull();
    }
  });
});

describe("skills attribution", () => {
  it("marks 12 skills adapted and 8 original", () => {
    expect(ADAPTED_COUNT).toBe(12);
    expect(ORIGINAL_COUNT).toBe(8);
  });

  it("gives every adapted skill its source, pinned SHA, license and copyright", () => {
    for (const s of skills.filter((x) => x.origin === "adapted")) {
      expect(s.source, s.slug).not.toBeNull();
      expect(s.source?.url, s.slug).toMatch(/^https:\/\/github\.com\//);
      expect(s.source?.sha, s.slug).toMatch(/^[0-9a-f]{40}$/);
      expect(s.source?.license.trim(), s.slug).not.toBe("");
      expect(s.source?.copyright, s.slug).toMatch(/^Copyright/);
      expect(s.source?.skills, s.slug).toContain(s.slug);
      expect(s.upstreamUrl, s.slug).toMatch(
        new RegExp(`^${s.source!.url}/blob/${s.source!.sha}/`),
      );
    }
  });

  it("calls a skill original only when sources.lock.json attributes it nowhere", () => {
    const attributed = new Set(SKILL_SOURCES.flatMap((s) => s.skills));
    for (const s of skills) {
      expect(s.origin === "adapted", s.slug).toBe(attributed.has(s.slug));
      if (s.origin === "original") expect(s.source, s.slug).toBeNull();
    }
  });

  it("credits the HumanLayer excerpt inside pr", () => {
    const pr = getSkillBySlug("pr")!;
    expect(pr.excerpts.map((e) => e.url)).toContain(
      "https://github.com/humanlayer/skills",
    );
  });

  it("formats upstream names and copyright holders", () => {
    const byName = new Map(SKILL_SOURCES.map((s) => [s.name, s]));
    expect(sourceLabel(byName.get("cursor/plugins pstack")!)).toBe(
      "pstack (cursor/plugins)",
    );
    expect(sourceLabel(byName.get("obra/superpowers")!)).toBe(
      "obra/superpowers",
    );
    expect(copyrightHolder("Copyright (c) 2025 Jesse Vincent")).toBe(
      "Jesse Vincent",
    );
  });
});

describe("skills downloads", () => {
  it("links each skill's ZIPs to release assets that exist in the snapshot", () => {
    for (const s of skills) {
      expect(s.zip.name).toBe(`${s.slug}.zip`);
      expect(s.flatZip.name).toBe(`${s.slug}-flat.zip`);
      for (const asset of [s.zip, s.flatZip]) {
        expect(assetNames.has(asset.name), asset.name).toBe(true);
        expect(asset.url).toBe(`${releaseDownload}/${asset.name}`);
        expect(asset.size, asset.name).toBeGreaterThan(0);
      }
    }
  });

  it("links the whole-pack ZIP to the release", () => {
    expect(PLUGIN_ZIP.name).toBe("superstacks-plugin.zip");
    expect(PLUGIN_ZIP.url).toBe(`${releaseDownload}/superstacks-plugin.zip`);
  });

  it("pins file and folder links to the release tag", () => {
    for (const s of skills) {
      expect(s.skillMdUrl).toBe(
        `${SKILLS_REPO_URL}/blob/${SKILLS_TAG}/${s.repoPath}/SKILL.md`,
      );
      expect(s.folderUrl).toBe(
        `${SKILLS_REPO_URL}/tree/${SKILLS_TAG}/${s.repoPath}`,
      );
      for (const f of s.files)
        expect(f.url.startsWith(`${SKILLS_REPO_URL}/blob/${SKILLS_TAG}/`)).toBe(
          true,
        );
    }
  });

  it("formats sizes for display", () => {
    expect(formatBytes(324)).toBe("324 B");
    expect(formatBytes(3809)).toBe("3.7 KB");
    expect(formatBytes(92808)).toBe("91 KB");
  });
});

describe("skills install commands", () => {
  it("keeps the README's whole-pack commands", () => {
    expect(PACK_INSTALL.claudeCode).toEqual([
      "/plugin marketplace add KunanonJ/superstacks",
      "/plugin install superstacks@superstacks",
    ]);
    expect(PACK_INSTALL.codex).toBe(
      "codex plugin marketplace add KunanonJ/superstacks",
    );
    expect(PACK_INSTALL.npx).toBe(
      "DISABLE_TELEMETRY=1 npx skills add KunanonJ/superstacks -g -s '*' --copy -y",
    );
  });

  it("swaps only the skill selector for a single skill", () => {
    const skill = getSkillBySlug("verify-loop")!;
    const { npx, copyPath } = skillInstallCommands(skill);
    expect(npx).toBe(PACK_INSTALL.npx.replace("-s '*'", "-s verify-loop"));
    expect(copyPath).toBe("plugins/superstacks/skills/verify-loop/");
  });
});

describe("skills helpers", () => {
  it("looks skills up by slug", () => {
    expect(getSkillBySlug("verify-loop")?.name).toBe("verify-loop");
    expect(getSkillBySlug("missing")).toBeNull();
  });

  it("wraps previous / next around the catalog", () => {
    const first = skills[0]!;
    const last = skills[skills.length - 1]!;
    expect(getAdjacentSkills(first.slug).prev).toBe(last);
    expect(getAdjacentSkills(last.slug).next).toBe(first);
    expect(getAdjacentSkills("missing")).toEqual({ prev: null, next: null });
  });

  it("lists stage siblings without the skill itself", () => {
    const skill = getSkillBySlug("verify-loop")!;
    const siblings = getStageSiblings(skill);
    expect(siblings.some((s) => s.slug === skill.slug)).toBe(false);
    for (const s of siblings) expect(s.stage).toBe(skill.stage);
  });

  it("reads user invocation from disable-model-invocation", () => {
    expect(getSkillBySlug("how")?.userInvoked).toBe(true);
    expect(getSkillBySlug("verify-loop")?.userInvoked).toBe(false);
    expect(skills.filter((s) => s.userInvoked)).toHaveLength(10);
  });
});

describe("skills nav", () => {
  it("is a top-level link named for what it is, after Portfolio and the résumé", () => {
    const labels = primaryNav.map((item) => item.label);
    // "Skills" alone read as a list of abilities; the page is the catalogue.
    expect(labels).not.toContain("Skills");
    const index = labels.indexOf("Agent skills");
    expect(labels.slice(index - 2, index)).toEqual(["Portfolio", "Résumé"]);
    expect(primaryNav[index]).toMatchObject({
      type: "link",
      label: "Agent skills",
      href: "/skills",
      icon: "skills",
    });
    expect(primaryNav[index - 1]).toMatchObject({
      type: "link",
      label: "Résumé",
      href: "/resume",
    });
  });
});

describe("skills page copy", () => {
  it("splits the h1 into the canvas lines without changing its text", () => {
    const { muted, rest, accent } = skillsPage.headline;
    expect(`${muted} ${rest} ${accent}`).toBe(skillsPage.title);
  });

  it("dates the release from the snapshot", () => {
    expect(SKILLS_RELEASE_DATE).toBe(snapshot.publishedAt.slice(0, 10));
    expect(SKILLS_RELEASE_DATE).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(SKILLS_RELEASE_MONTH).toMatch(/^[A-Z][a-z]{2} \d{4}$/);
  });
});

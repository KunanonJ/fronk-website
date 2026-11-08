import { describe, expect, it } from "vitest";
import {
  buildSnapshot,
  parseFrontmatter,
  serializeSnapshot,
} from "./sync-skills.mjs";

describe("parseFrontmatter", () => {
  it("reads scalars and disable-model-invocation", () => {
    const { data, body } = parseFrontmatter(
      [
        "---",
        "name: how",
        "description: Use for how-does-X-work walkthroughs, placement, and layering.",
        "license: MIT",
        "disable-model-invocation: true",
        "---",
        "# How",
        "",
      ].join("\n"),
    );
    expect(data).toEqual({
      name: "how",
      description:
        "Use for how-does-X-work walkthroughs, placement, and layering.",
      license: "MIT",
      "disable-model-invocation": true,
    });
    expect(body).toBe("# How\n");
  });

  it("reads nested maps and quoted strings", () => {
    const { data } = parseFrontmatter(
      [
        "---",
        "name: pr",
        "description: Use when writing a PR body.",
        "metadata:",
        "  credits:",
        "    skill: show-me",
        '    url: "https://github.com/humanlayer/skills/blob/main/SKILL.md"',
        "  note: 'it''s quoted'",
        "---",
        "",
      ].join("\n"),
    );
    expect(data.metadata).toEqual({
      credits: {
        skill: "show-me",
        url: "https://github.com/humanlayer/skills/blob/main/SKILL.md",
      },
      note: "it's quoted",
    });
  });

  it("reads lists, block scalars, booleans and CRLF line endings", () => {
    const { data } = parseFrontmatter(
      [
        "---",
        "name: x",
        "tags:",
        "  - one",
        "  - two",
        "description: >",
        "  Use when folding",
        "  long lines.",
        "body: |",
        "  line one",
        "  line two",
        "disable-model-invocation: false",
        "---",
        "",
      ].join("\r\n"),
    );
    expect(data.tags).toEqual(["one", "two"]);
    expect(data.description).toBe("Use when folding long lines.");
    expect(data.body).toBe("line one\nline two");
    expect(data["disable-model-invocation"]).toBe(false);
  });

  it("returns empty data when there is no frontmatter", () => {
    expect(parseFrontmatter("# Title\n")).toEqual({
      data: {},
      body: "# Title\n",
    });
  });

  it("throws on an unclosed fence or unsupported syntax", () => {
    expect(() => parseFrontmatter("---\nname: x\n")).toThrow(/closing/);
    expect(() => parseFrontmatter("---\n{ name: x }\n---\n")).toThrow(
      /Unsupported/,
    );
  });
});

const ROOT = "plugins/superstacks/skills";
const skillMd = (name: string, extra = "") =>
  `---\nname: ${name}\ndescription: Use when testing ${name}.\nlicense: MIT\n${extra}---\n\n# ${name}\n`;
const asset = (name: string, size: number) => ({
  name,
  size,
  browser_download_url: `https://github.com/KunanonJ/superstacks/releases/download/v1.0.0/${name}`,
});

function fixture() {
  return {
    tag: "v1.0.0",
    release: {
      tag_name: "v1.0.0",
      html_url: "https://github.com/KunanonJ/superstacks/releases/tag/v1.0.0",
      published_at: "2026-01-01T00:00:00Z",
      // Deliberately unsorted: the snapshot must not depend on API order.
      assets: [
        asset("zeta-flat.zip", 20),
        asset("superstacks-plugin.zip", 900),
        asset("alpha.zip", 11),
        asset("zeta.zip", 21),
        asset("alpha-flat.zip", 10),
      ],
    },
    tree: [
      { path: `${ROOT}/zeta`, type: "tree" },
      { path: `${ROOT}/zeta/SKILL.md`, type: "blob", size: 120 },
      { path: `${ROOT}/zeta/references/b.md`, type: "blob", size: 5 },
      { path: `${ROOT}/zeta/references`, type: "tree" },
      { path: `${ROOT}/alpha`, type: "tree" },
      { path: `${ROOT}/alpha/SKILL.md`, type: "blob", size: 100 },
      { path: "patches/zeta-v1.1.patch", type: "blob", size: 3 },
      { path: "patches/zeta.patch", type: "blob", size: 3 },
      { path: "patches/helper.patch", type: "blob", size: 3 },
      { path: "patches/README.md", type: "blob", size: 3 },
    ],
    skillFiles: {
      zeta: skillMd("zeta"),
      alpha: skillMd("alpha", "disable-model-invocation: true\n"),
    },
    sourcesLock: {
      version: "1.0.0",
      sources: [
        {
          name: "someone/skills",
          url: "https://github.com/someone/skills",
          sha: "a".repeat(40),
          license: "MIT",
          copyright: "Copyright (c) 2026 Someone",
          skills: ["zeta"],
        },
      ],
      copied: {
        "skills/zeta/SKILL.md": {
          source: "someone/skills",
          source_path: "skills/zeta/SKILL.md",
        },
        "skills/zeta/helper.md": {
          source: "someone/skills",
          source_path: "skills/zeta/helper.md",
        },
      },
    },
  };
}

describe("buildSnapshot", () => {
  it("sorts skills, files and patches, and maps invocation and source", () => {
    const snap = buildSnapshot(fixture());
    expect(snap.skills.map((s: { name: string }) => s.name)).toEqual([
      "alpha",
      "zeta",
    ]);
    const [alpha, zeta] = snap.skills;
    expect(alpha.userInvoked).toBe(true);
    expect(alpha.source).toBeNull();
    expect(zeta.userInvoked).toBe(false);
    expect(zeta.source).toBe("someone/skills");
    expect(zeta.upstreamPath).toBe("skills/zeta/SKILL.md");
    expect(zeta.files.map((f: { path: string }) => f.path)).toEqual([
      "SKILL.md",
      "references/b.md",
    ]);
    // `-v1.1` suffixes and copied helper files map back to their skill.
    expect(zeta.patches).toEqual([
      "patches/helper.patch",
      "patches/zeta-v1.1.patch",
      "patches/zeta.patch",
    ]);
    expect(zeta.zip.url).toBe(
      "https://github.com/KunanonJ/superstacks/releases/download/v1.0.0/zeta.zip",
    );
    expect(snap.pluginZip.name).toBe("superstacks-plugin.zip");
  });

  it("serialises identically regardless of input order (stable re-runs)", () => {
    const a = fixture();
    const b = fixture();
    b.tree.reverse();
    b.release.assets.reverse();
    const first = serializeSnapshot(buildSnapshot(a));
    expect(serializeSnapshot(buildSnapshot(b))).toBe(first);
    expect(serializeSnapshot(buildSnapshot(fixture()))).toBe(first);
    expect(first.endsWith("}\n")).toBe(true);
    expect(first).not.toMatch(/generatedAt|"date"/);
  });

  it("fails loudly when the release or the lock disagrees with the repo", () => {
    const missingZip = fixture();
    missingZip.release.assets = missingZip.release.assets.filter(
      (x) => x.name !== "alpha-flat.zip",
    );
    expect(() => buildSnapshot(missingZip)).toThrow(/alpha-flat\.zip/);

    const wrongName = fixture();
    wrongName.skillFiles.alpha = skillMd("beta");
    expect(() => buildSnapshot(wrongName)).toThrow(
      /does not match folder alpha/,
    );

    const ghostSkill = fixture();
    ghostSkill.sourcesLock.sources[0]!.skills.push("ghost");
    expect(() => buildSnapshot(ghostSkill)).toThrow(/ghost/);

    const wrongTag = fixture();
    wrongTag.release.tag_name = "v2.0.0";
    expect(() => buildSnapshot(wrongTag)).toThrow(/does not match/);
  });
});

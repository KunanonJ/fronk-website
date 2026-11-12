import { describe, expect, it } from "vitest";
import { getAllSkills } from "@/lib/content/skills";
import {
  AGENT_SKILLS_SCHEMA,
  GET,
  buildAgentSkillsIndex,
} from "./agentSkillsIndex";

/*
 * The rules of the Agent Skills discovery draft (0.2.0) that a client
 * checks: the schema URI, a name of lowercase letters, digits and single
 * hyphens up to 64 characters, a description up to 1,024 characters, a type
 * of "skill-md" or "archive", and a digest of "sha256:" and 64 lowercase hex
 * characters, which clients verify against the bytes they download.
 */

describe("/.well-known/agent-skills/index.json", () => {
  const index = buildAgentSkillsIndex();

  it("names the draft it follows", () => {
    expect(index.$schema).toBe(
      "https://schemas.agentskills.io/discovery/0.2.0/schema.json",
    );
    expect(AGENT_SKILLS_SCHEMA).toBe(index.$schema);
  });

  it("lists every skill the site publishes, once", () => {
    const names = index.skills.map((s) => s.name);
    expect(names).toEqual(getAllSkills().map((s) => s.name));
    expect(new Set(names).size).toBe(names.length);
    expect(names.length).toBe(20);
  });

  it("gives each entry the fields and formats the draft requires", () => {
    for (const entry of index.skills) {
      expect(Object.keys(entry).sort(), entry.name).toEqual([
        "description",
        "digest",
        "name",
        "type",
        "url",
      ]);
      expect(entry.name, entry.name).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
      expect(entry.name.length, entry.name).toBeLessThanOrEqual(64);
      expect(entry.description.length, entry.name).toBeGreaterThan(0);
      expect(entry.description.length, entry.name).toBeLessThanOrEqual(1024);
      expect(entry.type, entry.name).toBe("archive");
      expect(entry.digest, entry.name).toMatch(/^sha256:[0-9a-f]{64}$/);
    }
  });

  it("points each entry at its flat ZIP (SKILL.md at the root) and that file's digest", () => {
    const byName = new Map(getAllSkills().map((s) => [s.name, s]));
    for (const entry of index.skills) {
      const skill = byName.get(entry.name);
      expect(entry.url, entry.name).toBe(skill?.flatZip.url);
      expect(entry.url, entry.name).toMatch(
        new RegExp(`/${entry.name}-flat\\.zip$`),
      );
      expect(entry.digest, entry.name).toBe(skill?.flatZip.digest);
    }
  });

  it("is served as JSON that other origins may read", async () => {
    const res = GET();
    expect(res.headers.get("content-type")).toBe(
      "application/json; charset=utf-8",
    );
    expect(res.headers.get("access-control-allow-origin")).toBe("*");
    expect(JSON.parse(await res.text())).toEqual(index);
  });
});

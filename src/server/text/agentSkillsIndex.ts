import { getAllSkills } from "@/lib/content/skills";

/** The Agent Skills discovery draft this index follows. */
export const AGENT_SKILLS_SCHEMA =
  "https://schemas.agentskills.io/discovery/0.2.0/schema.json";

/**
 * /.well-known/agent-skills/index.json (Agent Skills discovery, draft
 * 0.2.0): one entry per skill. Each points at the skill's flat ZIP in the
 * Superstacks release, which holds SKILL.md at its root, with the sha256
 * GitHub reports for that file. Built from the committed snapshot
 * (lib/content/skills.generated.json), so it never calls GitHub.
 */
export function buildAgentSkillsIndex() {
  return {
    $schema: AGENT_SKILLS_SCHEMA,
    skills: getAllSkills().map((skill) => ({
      name: skill.name,
      type: "archive" as const,
      description: skill.description,
      url: skill.flatZip.url,
      digest: skill.flatZip.digest,
    })),
  };
}

/** Its route sets the cache headers. */
export function GET() {
  return new Response(`${JSON.stringify(buildAgentSkillsIndex(), null, 2)}\n`, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      // Browser-based clients may read it from another origin.
      "Access-Control-Allow-Origin": "*",
    },
  });
}

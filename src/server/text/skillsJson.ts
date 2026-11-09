import {
  PACK_INSTALL,
  PLUGIN_ZIP,
  SKILL_SOURCES,
  SKILLS_LICENSE,
  SKILLS_RELEASE_URL,
  SKILLS_REPO,
  SKILLS_REPO_URL,
  SKILLS_TAG,
  SKILLS_VERSION,
  getAllSkills,
  getSkillStage,
  skillInstallCommands,
  skillsPage,
} from "@/lib/content/skills";
import { siteConfig } from "@/lib/site";

/**
 * Machine-readable skills catalog for agents: names, descriptions, install
 * commands, release ZIP URLs, source and license. Built from the committed
 * snapshot, so it never calls GitHub. SKILL.md bodies are linked, not inlined.
 */
export function GET() {
  const base = siteConfig.url.replace(/\/$/, "");
  const body = {
    name: "Superstacks",
    description: skillsPage.description,
    page: `${base}/skills`,
    repository: SKILLS_REPO_URL,
    version: SKILLS_VERSION,
    tag: SKILLS_TAG,
    release: SKILLS_RELEASE_URL,
    license: SKILLS_LICENSE,
    install: {
      claudeCode: PACK_INSTALL.claudeCode,
      codex: PACK_INSTALL.codex,
      cursor: `Copy ${PACK_INSTALL.cursorFrom} from ${SKILLS_REPO} to ${PACK_INSTALL.cursorTo}`,
      npx: PACK_INSTALL.npx,
      pluginZip: PLUGIN_ZIP.url,
    },
    skills: getAllSkills().map((skill) => {
      const commands = skillInstallCommands(skill);
      return {
        name: skill.name,
        description: skill.description,
        page: `${base}/skills/${skill.slug}`,
        stage: getSkillStage(skill.stage).label,
        invocation: skill.userInvoked ? "user" : "model",
        origin: skill.origin,
        license: skill.license,
        source: skill.source
          ? {
              name: skill.source.name,
              url: skill.source.url,
              sha: skill.source.sha,
              license: skill.source.license,
              copyright: skill.source.copyright,
            }
          : null,
        install: {
          npx: commands.npx,
          path: commands.copyPath,
          zip: skill.zip.url,
          flatZip: skill.flatZip.url,
        },
        skillMd: skill.skillMdUrl,
      };
    }),
    sources: SKILL_SOURCES,
  };

  return new Response(`${JSON.stringify(body, null, 2)}\n`, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}

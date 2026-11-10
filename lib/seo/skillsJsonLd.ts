import {
  SKILLS_LICENSE,
  SKILLS_RELEASE_DATE,
  SKILLS_REPO_URL,
  SKILLS_VERSION,
  getAllSkills,
  type Skill,
} from "@/lib/content/skills";
import { PERSON_ID, WEBSITE_ID } from "@/lib/seo/jsonLd";
import { siteConfig } from "@/lib/site";

const BASE = siteConfig.url.replace(/\/$/, "");

/** SPDX license page, e.g. MIT -> https://spdx.org/licenses/MIT.html */
const spdx = (license: string) => `https://spdx.org/licenses/${license}.html`;

/**
 * SoftwareSourceCode for `/skills/[slug]`. Originals name the site's Person as
 * author; adapted skills keep the upstream as `isBasedOn` (with its copyright
 * line) and name the Person as maintainer, never as author.
 */
export function buildSkillJsonLd(skill: Skill): Record<string, unknown> {
  const url = `${BASE}/skills/${skill.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    "@id": `${url}/#code`,
    name: skill.name,
    description: skill.description,
    url,
    mainEntityOfPage: url,
    codeRepository: SKILLS_REPO_URL,
    programmingLanguage: "Markdown",
    version: SKILLS_VERSION,
    license: spdx(skill.license),
    isPartOf: { "@id": WEBSITE_ID },
    ...(skill.source
      ? {
          maintainer: { "@id": PERSON_ID },
          isBasedOn: {
            "@type": "SoftwareSourceCode",
            name: skill.source.name,
            codeRepository: skill.source.url,
            license: spdx(skill.source.license),
            copyrightNotice: skill.source.copyright,
            ...(skill.upstreamUrl ? { url: skill.upstreamUrl } : {}),
          },
        }
      : { author: { "@id": PERSON_ID } }),
  };
}

/**
 * The Superstacks pack on `/skills`: one SoftwareSourceCode authored by the
 * site's Person, with every skill page as a part, so "agent skills for Claude
 * Code" answers can cite the pack and its author.
 */
export function buildSkillsPackJsonLd(): Record<string, unknown> {
  const url = `${BASE}/skills`;
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    "@id": `${url}/#pack`,
    name: "Superstacks",
    description:
      "Agent skills for Claude Code, Codex and Cursor: planning, test-driven development, verify loops, code review and draft pull requests.",
    url,
    mainEntityOfPage: url,
    codeRepository: SKILLS_REPO_URL,
    programmingLanguage: "Markdown",
    version: SKILLS_VERSION,
    datePublished: SKILLS_RELEASE_DATE,
    license: spdx(SKILLS_LICENSE),
    author: { "@id": PERSON_ID },
    isPartOf: { "@id": WEBSITE_ID },
    hasPart: getAllSkills().map((skill) => ({
      "@id": `${BASE}/skills/${skill.slug}/#code`,
    })),
  };
}

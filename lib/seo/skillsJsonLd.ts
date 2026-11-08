import {
  SKILLS_REPO_URL,
  SKILLS_VERSION,
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

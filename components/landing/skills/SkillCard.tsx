import type { CSSProperties } from "react";
import Link from "@/components/navigation/Link";
import { DownloadIcon } from "@/components/bento/icons";
import { pillClass } from "@/components/ds/Pill";
import CopyButton from "@/components/landing/skills/CopyButton";
import { SkillTags } from "@/components/landing/skills/SkillParts";
import {
  formatBytes,
  skillInstallCommands,
  type Skill,
} from "@/lib/content/skills";

/**
 * One skill in a stage (profile redesign Phase 7c): a paper tile with the
 * name in mono, its chips, the description, Copy and ZIP, and "Details →".
 * The name is the card's one link to the skill's page, named by the name
 * alone; its ::after (`.ds-stretch`) covers the card, so the whole card
 * opens the page, and "Details →" only says so. Copy and ZIP sit above the
 * cover and name their skill for screen readers, so the many "Copy install"
 * and "ZIP" never collide.
 */
export default function SkillCard({ skill }: { skill: Skill }) {
  const { npx } = skillInstallCommands(skill);
  const headingId = `skill-${skill.slug}`;

  return (
    <li
      className="pf-skill-card__item"
      // Its name in a filter's view transition (globals.css).
      style={{ "--vt": `pf-s-${skill.slug}` } as CSSProperties}
    >
      <article aria-labelledby={headingId} className="pf-skill-card">
        <h3 id={headingId} className="pf-skill-card__name">
          <Link
            href={`/skills/${skill.slug}`}
            className="ds-stretch pf-skill-card__link"
          >
            {skill.name}
          </Link>
        </h3>
        <p className="pf-skill-card__tags">
          <SkillTags skill={skill} variant="card" />
        </p>
        <p className="t-small pf-cat-note">{skill.description}</p>
        <div className="pf-skill-card__actions">
          <CopyButton
            text={npx}
            label="Copy install"
            size="card"
            accessibleLabel={`Copy install command for ${skill.name}`}
            announcement={`Copied the install command for ${skill.name}`}
          />
          <a
            href={skill.zip.url}
            aria-label={`Download ZIP: ${skill.zip.name}, ${formatBytes(skill.zip.size)}`}
            className={pillClass({ variant: "ghost", size: "sm" })}
          >
            <span className="ds-pill__icon" aria-hidden="true">
              <DownloadIcon size={14} />
            </span>
            ZIP
          </a>
          <span aria-hidden className="ds-text-link pf-skill-card__details">
            Details <span className="ds-text-link__arrow">→</span>
          </span>
        </div>
      </article>
    </li>
  );
}

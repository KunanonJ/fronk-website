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
 * name in mono, its chips, the description and three actions. Every action
 * names its skill for screen readers, so twenty "Copy install" / "ZIP" /
 * "Details" never collide.
 */
export default function SkillCard({ skill }: { skill: Skill }) {
  const { npx } = skillInstallCommands(skill);
  const headingId = `skill-${skill.slug}`;

  return (
    <li className="pf-skill-card__item">
      <article aria-labelledby={headingId} className="pf-skill-card">
        <h3 id={headingId} className="pf-skill-card__name">
          {skill.name}
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
          <Link
            href={`/skills/${skill.slug}`}
            aria-label={`Details for ${skill.name}`}
            className="ds-text-link pf-skill-card__details"
          >
            Details →
          </Link>
        </div>
      </article>
    </li>
  );
}

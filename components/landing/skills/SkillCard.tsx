import Link from "@/components/navigation/Link";
import { DownloadIcon } from "@/components/bento/icons";
import CopyButton from "@/components/landing/skills/CopyButton";
import { SkillTags } from "@/components/landing/skills/SkillParts";
import {
  formatBytes,
  skillInstallCommands,
  type Skill,
} from "@/lib/content/skills";

/**
 * One skill in a stage card (bento canvas, design spec 4.8): an inner well
 * with the name, tags, description and three actions. Every action names
 * its skill for screen readers, so twenty "Copy install" / "ZIP" /
 * "Details" never collide. The <li> carries the well's radius, so the
 * catalog's hover lift draws a rounded shadow.
 */
export default function SkillCard({ skill }: { skill: Skill }) {
  const { npx } = skillInstallCommands(skill);
  const headingId = `skill-${skill.slug}`;

  return (
    <li className="flex min-w-0 rounded-well">
      <article
        aria-labelledby={headingId}
        className="flex flex-1 flex-col gap-3 rounded-well border border-hairline bg-page p-3.5"
      >
        <h3
          id={headingId}
          className="m-0 font-mono text-base leading-[1.35] font-medium [overflow-wrap:anywhere]"
        >
          {skill.name}
        </h3>
        <p className="m-0 flex flex-wrap gap-1.5">
          <SkillTags skill={skill} variant="card" />
        </p>
        <p className="m-0 text-meta leading-[1.5] text-ink-2">
          {skill.description}
        </p>
        <div className="mt-auto flex flex-wrap items-center gap-1.5">
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
            className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-hairline-strong bg-surface px-[11px] text-meta font-medium text-ink no-underline"
          >
            <DownloadIcon size={14} />
            ZIP
          </a>
          <Link
            href={`/skills/${skill.slug}`}
            aria-label={`Details for ${skill.name}`}
            className="ml-auto inline-flex min-h-11 items-center text-meta font-medium no-underline"
          >
            Details →
          </Link>
        </div>
      </article>
    </li>
  );
}

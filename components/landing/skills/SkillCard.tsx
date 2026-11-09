import Link from "@/components/navigation/Link";
import { ArrowRight } from "lucide-react";
import CopyButton from "@/components/landing/skills/CopyButton";
import {
  DownloadLink,
  InvocationBadge,
  OriginBadge,
  pillLinkClass,
} from "@/components/landing/skills/SkillParts";
import { skillInstallCommands, type Skill } from "@/lib/content/skills";

/**
 * Catalog card. `data-origin` / `data-invocation` drive the CSS-only filter
 * on `/skills` (no client JS). Every action names its skill for screen
 * readers, so twenty "Copy" / "Download" / "Details" never collide.
 */
export default function SkillCard({ skill }: { skill: Skill }) {
  const { npx } = skillInstallCommands(skill);
  const headingId = `skill-card-${skill.slug}`;

  return (
    <li
      data-origin={skill.origin}
      data-invocation={skill.userInvoked ? "user" : "model"}
      className="skill-card"
    >
      <article
        aria-labelledby={headingId}
        className="flex h-full flex-col rounded-card border border-hairline bg-surface p-6 shadow-card"
      >
        <h4
          id={headingId}
          className="break-words font-mono text-lead font-medium text-ink"
        >
          {skill.name}
        </h4>
        <div className="mt-3 flex flex-wrap gap-1.5">
          <OriginBadge skill={skill} />
          <InvocationBadge skill={skill} />
        </div>
        <p className="mt-3 text-small text-ink-2">{skill.description}</p>
        <div className="mt-auto flex flex-wrap items-center gap-2 pt-6">
          <CopyButton
            text={npx}
            label="Copy install"
            accessibleLabel={`Copy install command for ${skill.name}`}
            announcement={`Copied the install command for ${skill.name}`}
          />
          <DownloadLink asset={skill.zip} showSize={false}>
            ZIP
          </DownloadLink>
          <Link href={`/skills/${skill.slug}`} className={pillLinkClass}>
            Details
            <span className="sr-only"> for {skill.name}</span>
            <ArrowRight className="h-3.5 w-3.5 shrink-0" aria-hidden />
          </Link>
        </div>
      </article>
    </li>
  );
}

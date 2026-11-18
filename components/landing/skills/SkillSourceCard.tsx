import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { ArrowUpRightIcon } from "@/components/bento/icons";
import { pillClass } from "@/components/ds/Pill";
import CopyButton from "@/components/landing/skills/CopyButton";
import { EXTERNAL } from "@/components/landing/skills/SkillParts";
import { SKILLS_TAG, type Skill } from "@/lib/content/skills";
import { cn } from "@/lib/utils/cn";

/** Lines shown before "Show all". */
const HEAD_LINES = 15;

/**
 * SKILL.md (profile redesign Phase 7c): the source on the page colour, Copy
 * and GitHub. Long files show their first lines under a fade, with a
 * disclosure for the rest; the rest is in the HTML either way (`hidden`), so
 * crawlers and Copy always get the whole file. Short files show in full.
 */
export default function SkillSourceCard({ skill }: { skill: Skill }) {
  const [open, setOpen] = useState(false);
  const lines = skill.content.replace(/\n+$/, "").split("\n");
  const long = lines.length > HEAD_LINES;
  const head = long ? lines.slice(0, HEAD_LINES) : lines;

  return (
    <article
      id="skill-source"
      aria-labelledby="card-source"
      className="ds-tile pf-skill-tile pf-skill-tile--full"
    >
      <div className="pf-skill-source__head">
        <h2 id="card-source" className="ds-chip pf-cat-code">
          SKILL.md
        </h2>
        <div className="pf-skill-source__actions">
          <CopyButton
            text={skill.content}
            accessibleLabel={`Copy the SKILL.md of ${skill.name}`}
            announcement={`Copied the SKILL.md of ${skill.name}`}
          />
          <a
            href={skill.skillMdUrl}
            aria-label={`View on GitHub: ${skill.name} SKILL.md at ${SKILLS_TAG}`}
            {...EXTERNAL}
            className={pillClass({ variant: "ghost" })}
          >
            View on GitHub
            <span className="ds-pill__icon" aria-hidden="true">
              <ArrowUpRightIcon size={12} />
            </span>
          </a>
        </div>
      </div>
      <div id="skill-md" className="pf-skill-source__well">
        <pre
          className={cn(
            "pf-skill-source__code",
            long && !open && "pf-skill-source__code--fade",
          )}
        >
          {head.join("\n")}
        </pre>
        {long ? (
          <pre hidden={!open} className="pf-skill-source__code">
            {lines.slice(HEAD_LINES).join("\n")}
          </pre>
        ) : null}
      </div>
      {long ? (
        <button
          type="button"
          aria-expanded={open}
          aria-controls="skill-md"
          onClick={() => setOpen((value) => !value)}
          className={cn(
            pillClass({ variant: "ghost" }),
            "pf-skill-source__toggle",
          )}
        >
          <span>
            {open ? "Show fewer lines" : `Show all ${lines.length} lines`}
          </span>
          <span className="ds-pill__icon" aria-hidden="true">
            <ChevronDown size={14} className="pf-skill-source__chevron" />
          </span>
        </button>
      ) : null}
    </article>
  );
}

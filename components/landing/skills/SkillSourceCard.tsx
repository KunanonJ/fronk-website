import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { bentoSpan } from "@/components/bento/Bento";
import { ArrowUpRightIcon } from "@/components/bento/icons";
import CopyButton from "@/components/landing/skills/CopyButton";
import { EXTERNAL } from "@/components/landing/skills/SkillParts";
import { SKILLS_TAG, type Skill } from "@/lib/content/skills";
import { cn } from "@/lib/utils/cn";

/** Lines shown before "Show all": the canvas shows the first fifteen. */
const HEAD_LINES = 15;

const PRE =
  "m-0 font-mono text-meta leading-[1.65] [overflow-wrap:anywhere] whitespace-pre-wrap text-ink";

/**
 * SKILL.md (bento canvas, design spec 3.11 and 4.9): the source in a well,
 * Copy and GitHub. Long files show their first lines under a fade, with a
 * disclosure for the rest; the rest is in the HTML either way (`hidden`),
 * so crawlers and Copy always get the whole file. Short files show in full.
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
      className={cn(
        "relative flex scroll-mt-6 flex-col gap-4 overflow-hidden rounded-bento border border-hairline bg-surface px-5 pt-[18px] pb-5 text-ink shadow-card",
        bentoSpan(3),
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2
          id="card-source"
          className="m-0 rounded-full border border-hairline bg-page px-3 py-[7px] font-mono text-meta leading-none font-medium"
        >
          SKILL.md
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          <CopyButton
            text={skill.content}
            accessibleLabel={`Copy the SKILL.md of ${skill.name}`}
            announcement={`Copied the SKILL.md of ${skill.name}`}
          />
          <a
            href={skill.skillMdUrl}
            aria-label={`View on GitHub: ${skill.name} SKILL.md at ${SKILLS_TAG}`}
            {...EXTERNAL}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-hairline-strong bg-surface px-3.5 text-sm font-medium text-ink no-underline"
          >
            View on GitHub
            <ArrowUpRightIcon size={12} />
          </a>
        </div>
      </div>
      <div
        id="skill-md"
        className="min-w-0 rounded-well border border-hairline bg-page p-5"
      >
        <pre
          className={cn(
            PRE,
            long &&
              !open &&
              "[mask-image:linear-gradient(to_bottom,var(--ink)_55%,transparent)]",
          )}
        >
          {head.join("\n")}
        </pre>
        {long ? (
          <pre hidden={!open} className={PRE}>
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
          className="inline-flex min-h-11 items-center gap-2 self-start rounded-full border border-hairline-strong bg-surface px-[18px] text-sm font-medium text-ink"
        >
          <span>
            {open ? "Show fewer lines" : `Show all ${lines.length} lines`}
          </span>
          <ChevronDown
            aria-hidden
            size={14}
            className={cn(
              "transition-transform duration-150",
              open && "rotate-180",
            )}
          />
        </button>
      ) : null}
    </article>
  );
}

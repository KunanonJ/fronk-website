import { Kicker } from "@/components/bento/Bento";
import SkillCard from "@/components/landing/skills/SkillCard";
import { NOTE } from "@/components/landing/skills/SkillParts";
import {
  ADAPTED_COUNT,
  MODEL_INVOKED_COUNT,
  ORIGINAL_COUNT,
  USER_INVOKED_COUNT,
  getAllSkills,
  getSkillsByStage,
} from "@/lib/content/skills";
import { matchesSkillFilter, type SkillFilter } from "@/lib/skills/search";
import { cn } from "@/lib/utils/cn";
import { CARD_SURFACE } from "@/components/bento/classes";

const TOTAL = ORIGINAL_COUNT + ADAPTED_COUNT;

/** The canvas chips: by origin, then by who invokes the skill. */
const FILTERS: readonly { id: SkillFilter; label: string; count: number }[] = [
  { id: "all", label: "All", count: TOTAL },
  { id: "original", label: "Original", count: ORIGINAL_COUNT },
  { id: "adapted", label: "Adapted", count: ADAPTED_COUNT },
  { id: "auto", label: "Runs automatically", count: MODEL_INVOKED_COUNT },
  { id: "user", label: "You invoke", count: USER_INVOKED_COUNT },
];

function skillCount(n: number): string {
  return `${n} ${n === 1 ? "skill" : "skills"}`;
}

/**
 * The catalog (bento canvas, design spec 4.8): a filter card, then one card
 * per stage with its skills as wells. The filter is the `?show=` search
 * param, owned by the route; a stage with no matching skill is left out.
 */
export default function SkillsCatalog({
  show,
  onShowChange,
}: {
  show: SkillFilter;
  onShowChange: (next: SkillFilter) => void;
}) {
  const shown = getAllSkills().filter((s) => matchesSkillFilter(s, show));
  const stages = getSkillsByStage()
    .map(({ stage, skills }) => ({
      stage,
      skills: skills.filter((s) => matchesSkillFilter(s, show)),
    }))
    .filter(({ skills }) => skills.length > 0);

  return (
    <div className="flex flex-col gap-5">
      <article
        id="catalog"
        aria-labelledby="card-catalog"
        className={cn(
          CARD_SURFACE,
          "flex scroll-mt-6 flex-wrap items-center justify-between gap-x-5 gap-y-3.5",
        )}
      >
        <div className="flex flex-col items-start gap-2">
          <Kicker id="card-catalog">All {TOTAL} skills</Kicker>
          <p aria-live="polite" className={cn(NOTE, "ml-1")}>
            {show === "all"
              ? `Showing all ${TOTAL} skills`
              : `Showing ${shown.length} of ${TOTAL} skills`}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <span
            id="skills-filter-label"
            className="font-mono text-label text-ink-2 uppercase"
          >
            Show
          </span>
          <div
            role="group"
            aria-labelledby="skills-filter-label"
            className="flex flex-wrap gap-2"
          >
            {FILTERS.map((filter) => {
              const on = filter.id === show;
              return (
                <button
                  key={filter.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => onShowChange(filter.id)}
                  className={cn(
                    "inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-medium",
                    on
                      ? "border-cta bg-cta text-on-cta"
                      : "border-hairline-strong bg-surface text-ink-2",
                  )}
                >
                  <span>{filter.label}</span>
                  <span className="font-mono text-xs tabular-nums">
                    {filter.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </article>

      {stages.map(({ stage, skills }) => (
        <article
          key={stage.id}
          aria-labelledby={`stage-${stage.id}`}
          className={cn(CARD_SURFACE, "flex flex-col gap-[18px]")}
        >
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2.5">
            <div className="flex items-center gap-3">
              <Kicker id={`stage-${stage.id}`}>{stage.label}</Kicker>
              <span className="font-mono text-xs text-ink-2">
                {skillCount(skills.length)}
              </span>
            </div>
            <p className={NOTE}>{stage.blurb}</p>
          </div>
          <ul className="bento m-0 grid list-none grid-cols-1 gap-3 p-0 min-[641px]:grid-cols-2 lg:grid-cols-3">
            {skills.map((skill) => (
              <SkillCard key={skill.slug} skill={skill} />
            ))}
          </ul>
        </article>
      ))}
    </div>
  );
}

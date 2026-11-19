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

const TOTAL = ORIGINAL_COUNT + ADAPTED_COUNT;

/** The filter's pills: by origin, then by who invokes the skill. */
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
 * The catalog (profile redesign Phase 7c): a filter tile, then one section
 * per stage with its skills as paper tiles. The filter is the `?show=` search
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
    <div className="pf-skill-catalog">
      <article
        id="catalog"
        aria-labelledby="card-catalog"
        className="ds-tile pf-skill-filter"
      >
        <div className="pf-cat-stack">
          <h2 id="card-catalog" className="t-h3 pf-cat-title">
            All {TOTAL} skills
          </h2>
          <p aria-live="polite" className={NOTE}>
            {show === "all"
              ? `Showing all ${TOTAL} skills`
              : `Showing ${shown.length} of ${TOTAL} skills`}
          </p>
        </div>
        <div className="pf-skill-filter__controls">
          <span id="skills-filter-label" className="t-meta pf-cat-note">
            Show
          </span>
          <div
            role="group"
            aria-labelledby="skills-filter-label"
            className="pf-filter"
          >
            {FILTERS.map((filter) => (
              <button
                key={filter.id}
                type="button"
                aria-pressed={filter.id === show}
                onClick={() => onShowChange(filter.id)}
                className="pf-filter__option ds-press"
              >
                {filter.label} <span className="pf-count">{filter.count}</span>
              </button>
            ))}
          </div>
        </div>
      </article>

      {stages.map(({ stage, skills }) => (
        <article
          key={stage.id}
          aria-labelledby={`stage-${stage.id}`}
          className="pf-skill-stage"
        >
          <div className="pf-skill-stage__head">
            <h2 id={`stage-${stage.id}`} className="t-h3 pf-cat-title">
              {stage.label}
            </h2>
            <span className="t-meta pf-cat-note">
              {skillCount(skills.length)}
            </span>
            <p className={`${NOTE} pf-skill-stage__blurb`}>{stage.blurb}</p>
          </div>
          <ul className="pf-skill-stage__grid">
            {skills.map((skill) => (
              <SkillCard key={skill.slug} skill={skill} />
            ))}
          </ul>
        </article>
      ))}
    </div>
  );
}

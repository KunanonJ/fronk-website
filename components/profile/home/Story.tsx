import { Chip } from "@/components/ds/labels";
import { RecordsCard } from "@/components/profile/home/RecordsCard";
import { storyCopy, type StoryRun } from "@/lib/content/homeJourney";

/*
 * The Journey's story, `#story` (profile redesign Phase 4, design spec 8.6):
 * two paragraphs with their key phrases in bold, the roles I am open to with
 * the cleared availability and its chips, and the records card beside them
 * (under them below 1024 px). The "Read the story" pill on the stage links
 * here. /about puts the anchor on its own section instead (`anchor={false}`),
 * so "Read my story" lands with the section's heading in view.
 */

function Runs({ runs }: { runs: readonly StoryRun[] }) {
  return runs.map((run, index) =>
    typeof run === "string" ? (
      run
    ) : (
      <strong key={index} className="pf-story__key">
        {run.strong}
      </strong>
    ),
  );
}

export function Story({ anchor = true }: { anchor?: boolean }) {
  return (
    <div id={anchor ? "story" : undefined} className="ds-wrap pf-story">
      <div className="t-body pf-story__text">
        {storyCopy.paragraphs.map((runs, index) => (
          <p key={index}>
            <Runs runs={runs} />
          </p>
        ))}
        <h3 className="t-h3 pf-story__roles">{storyCopy.rolesHeading}</h3>
        <p>{storyCopy.roles}</p>
        <ul className="pf-story__chips">
          {storyCopy.chips.map((chip) => (
            <li key={chip}>
              <Chip>{chip}</Chip>
            </li>
          ))}
        </ul>
      </div>
      <RecordsCard />
    </div>
  );
}

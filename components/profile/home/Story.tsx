import type { ReactNode } from "react";
import { Chip } from "@/components/ds/labels";
import { RecordsCard } from "@/components/profile/home/RecordsCard";
import { storyCopy, type StoryRun } from "@/lib/content/homeJourney";

/*
 * The Journey's story, `#story` (profile redesign Phase 4, design spec 8.6):
 * two paragraphs with their key phrases in bold, what I am building now
 * with the availability and its chips, and the records card beside them
 * (under them below 1024 px). The "Read the story" pill on the stage links
 * here. /about puts the anchor on its own section instead (`anchor={false}`),
 * so "Read my story" lands with the section's heading in view. It also
 * fills the now slot with its own Now (`now`), and leaves out the story's
 * closing sentence (`latest={false}`), which that Now tells in full (owner
 * decision 21-11-26). Home passes nothing and keeps all three.
 */

/**
 * The runs with neighbouring strings joined, so the closing sentence draws in
 * one text node with the words before it, exactly as one string did.
 */
function joined(runs: readonly StoryRun[]): StoryRun[] {
  const out: StoryRun[] = [];
  for (const run of runs) {
    const last = out.at(-1);
    if (typeof run === "string" && typeof last === "string")
      out[out.length - 1] = last + run;
    else out.push(run);
  }
  return out;
}

function Runs({ runs }: { runs: readonly StoryRun[] }) {
  return joined(runs).map((run, index) =>
    typeof run === "string" ? (
      run
    ) : (
      <strong key={index} className="pf-story__key">
        {run.strong}
      </strong>
    ),
  );
}

/** Home's now block: what I am building now, the availability and its chips. */
function StoryNow() {
  return (
    <>
      <h3 className="t-h3 pf-story__now">{storyCopy.nowHeading}</h3>
      <p>{storyCopy.now}</p>
      <ul className="pf-story__chips">
        {storyCopy.chips.map((chip) => (
          <li key={chip}>
            <Chip>{chip}</Chip>
          </li>
        ))}
      </ul>
    </>
  );
}

export function Story({
  anchor = true,
  latest = true,
  now = <StoryNow />,
}: {
  anchor?: boolean;
  /** The last paragraph's closing sentence, the latest role. */
  latest?: boolean;
  /** What follows the paragraphs in the text column; Home's now block by default. */
  now?: ReactNode;
}) {
  return (
    <div id={anchor ? "story" : undefined} className="ds-wrap pf-story">
      <div className="t-body pf-story__text">
        {storyCopy.paragraphs.map((runs, index, all) => (
          <p key={index}>
            <Runs
              runs={
                latest && index === all.length - 1
                  ? [...runs, ...storyCopy.latest]
                  : runs
              }
            />
          </p>
        ))}
        {now}
      </div>
      <RecordsCard />
    </div>
  );
}

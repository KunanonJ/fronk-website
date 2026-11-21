import { AVAILABILITY, RESUME_HREF } from "@/lib/content/availability";
import { keepNamesWhole } from "@/lib/content/keepWhole";
import { STACK_GROUPS, stackItems } from "@/lib/content/stack";

/*
 * The redesigned Home's Journey (profile redesign Phase 4, design spec 8.6
 * and 15.5): the stage's copy, the tool orbit, the story and the records
 * card's labels.
 *
 * The owner approved this copy as is on 21-11-26 (umbrella input R9). The
 * story is drafted from the résumé
 * (lib/content/resumeTimeline.fallback.ts): every organisation it names is an
 * employer or the university there, and it states no figure. The "now"
 * paragraph and chips are the availability (availability.ts), the
 * tools are /stack's (stack.ts), and the records card reads the résumé
 * through lib/landing/journey.ts. Nothing here repeats the About story, which
 * the About bento already shows.
 */

/** A run of story text; `strong` runs are the bold key phrases. */
export type StoryRun = string | { readonly strong: string };

/** A tool in the orbit, with its two-letter mono badge from /stack. */
export interface OrbitTool {
  readonly name: string;
  /** The group label from /stack: Build, Ship or Operate. */
  readonly kind: string;
  readonly badge: string;
}

const groupLabel = new Map(
  STACK_GROUPS.map((group) => [group.id, group.label]),
);

export const journeyCopy = {
  /** The nav's label for the section. */
  eyebrow: "Journey",
  heading: "From smart contracts to AI engineering.",
  lead: "Engineering first, then the delivery around it.",
  /** The ghost pill to #story. */
  storyLink: "Read the story",
} as const;

export const orbitCopy = {
  /** The tool list's name for assistive technology. */
  label: "Tools I use",
  /** Our own decorative file tiles (spec 15.5; plan step 4b). */
  files: [".ts", ".md", ".json", ".csv"],
  previous: "Turn the tools left",
  next: "Turn the tools right",
  pause: "Pause the orbit",
  play: "Play the orbit",
} as const;

/** Every tool on /stack, in its order, with its group as the kind. */
export const orbitTools: readonly OrbitTool[] = stackItems.map((item) => ({
  name: item.name,
  kind: groupLabel.get(item.group) ?? "",
  badge: item.badge,
}));

export const storyCopy = {
  /**
   * From the résumé: the university, then each employer in order; no figure.
   * The last paragraph closes with `latest`.
   */
  paragraphs: [
    [
      "I studied ",
      { strong: "electrical engineering at Kasetsart University" },
      ", then started on smart contracts at Bitkub and blockchain development at KK Venture Global.",
    ],
    [
      "From there I moved into delivery: ",
      { strong: "business systems" },
      " at KK Venture Global, IT projects at Coins.co.th, product launches at Playbux, then AI projects at Aiden Labs.",
    ],
  ] as const satisfies readonly (readonly StoryRun[])[],
  /**
   * The last paragraph's closing sentence, the role that ended, kept apart
   * so /about can leave it out: its Now, right under the story, tells the
   * same role in full (owner decision 21-11-26).
   */
  latest: [
    " Most recently I led ", // Owner direction 20-11-26.
    // The name unbroken on phones (keepWhole.ts).
    {
      strong: keepNamesWhole("IT and AI engineering at The Binary Holdings"),
    },
    ".",
  ] as const satisfies readonly StoryRun[],
  nowHeading: "What I’m building now", // Owner direction 20-11-26.
  /**
   * The availability the owner directed on 20-11-26 (availability.ts), its
   * names unbroken.
   */
  now: keepNamesWhole(AVAILABILITY.sentence),
  chips: [...AVAILABILITY.ventures, AVAILABILITY.location],
} as const;

export const recordsCopy = {
  /** The card's name for assistive technology. */
  label: "Career records",
  employment: "Employment",
  /** The résumé's own section name. */
  education: "Education",
  resume: { label: "Full résumé", href: RESUME_HREF },
  /** How many roles the card lists, newest first (spec 15.5: default 4). */
  roles: 4,
} as const;

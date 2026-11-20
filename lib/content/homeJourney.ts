import { AVAILABILITY, RESUME_HREF } from "@/lib/content/availability";
import { keepNamesWhole } from "@/lib/content/keepWhole";
import { STACK_GROUPS, stackItems } from "@/lib/content/stack";

/*
 * The redesigned Home's Journey (profile redesign Phase 4, design spec 8.6
 * and 15.5): the stage's copy, the tool orbit, the story and the records
 * card's labels.
 *
 * Lines marked DRAFT wait for the owner's approval, line by line (umbrella
 * input R9). The story is drafted from the résumé
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
  heading: "From smart contracts to AI engineering.", // DRAFT
  lead: "Engineering first, then the delivery around it.", // DRAFT
  /** The ghost pill to #story. */
  storyLink: "Read the story", // DRAFT (plan step 4a)
} as const;

export const orbitCopy = {
  /** The tool list's name for assistive technology. */
  label: "Tools I use", // DRAFT
  /** Our own decorative file tiles (spec 15.5; plan step 4b). */
  files: [".ts", ".md", ".json", ".csv"],
  previous: "Turn the tools left", // DRAFT
  next: "Turn the tools right", // DRAFT
  pause: "Pause the orbit", // DRAFT
  play: "Play the orbit", // DRAFT
} as const;

/** Every tool on /stack, in its order, with its group as the kind. */
export const orbitTools: readonly OrbitTool[] = stackItems.map((item) => ({
  name: item.name,
  kind: groupLabel.get(item.group) ?? "",
  badge: item.badge,
}));

export const storyCopy = {
  /**
   * DRAFT, from the résumé: the university, then each employer in order;
   * no figure.
   */
  paragraphs: [
    [
      "I studied ", // DRAFT
      { strong: "electrical engineering at Kasetsart University" }, // DRAFT
      ", then started on smart contracts at Bitkub and blockchain development at KK Venture Global.", // DRAFT
    ],
    [
      "From there I moved into delivery: ", // DRAFT
      { strong: "business systems" }, // DRAFT
      " at KK Venture Global, IT projects at Coins.co.th, product launches at Playbux, then AI projects at Aiden Labs. Most recently I led ", // DRAFT (owner direction 20-11-26)
      // DRAFT; the name unbroken on phones (keepWhole.ts).
      {
        strong: keepNamesWhole("IT and AI engineering at The Binary Holdings"),
      },
      ".",
    ],
  ] as const satisfies readonly (readonly StoryRun[])[],
  nowHeading: "What I’m building now", // DRAFT (owner direction 20-11-26)
  /**
   * The availability the owner directed on 20-11-26 (availability.ts), its
   * names unbroken.
   */
  now: keepNamesWhole(AVAILABILITY.sentence),
  chips: [...AVAILABILITY.ventures, AVAILABILITY.location],
} as const;

export const recordsCopy = {
  /** The card's name for assistive technology. */
  label: "Career records", // DRAFT
  employment: "Employment", // DRAFT (plan step 4c)
  /** The résumé's own section name. */
  education: "Education",
  resume: { label: "Full résumé", href: RESUME_HREF }, // DRAFT label
  /** How many roles the card lists, newest first (spec 15.5: default 4). */
  roles: 4,
} as const;

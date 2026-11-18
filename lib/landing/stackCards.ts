import {
  STACK_ENTRIES,
  workCopy,
  type StackEntry,
} from "@/lib/content/homeWorkAbout";
import { ventures as homeVentures } from "@/lib/content/landing";
import {
  getPortfolioProjectBySlug,
  outcomeLine,
  type PortfolioImage,
  type PortfolioMockup,
} from "@/lib/content/portfolio";
import { PROFILE_BASE } from "@/lib/content/profileChrome";
import { getVentureBySlug } from "@/lib/content/ventures";

/*
 * The redesigned Home's stacked case cards (profile redesign Phase 3, design
 * spec 8.4 and 15.3): a pure mapper from the content modules to what a card
 * shows. Nothing is typed here: names, chips, summaries, the evidence line
 * and the media are read from portfolio.ts, ventures.ts and landing.ts, so
 * the claim audits that hold those modules hold the cards too.
 */

/** The case-card materials, in card order (spec 2.4); a seventh card wraps. */
export const MATERIAL_HUES = [253, 79, 292, 327, 266, 301] as const;

export type MaterialHue = (typeof MATERIAL_HUES)[number];

export function materialHue(index: number): MaterialHue {
  return MATERIAL_HUES[index % MATERIAL_HUES.length]!;
}

/** A code-drawn picture: a project's mockup, or a venture's logo and steps. */
export type StackArt =
  | { readonly type: "mockup"; readonly mockup: PortfolioMockup }
  | {
      readonly type: "venture";
      readonly logo: string;
      readonly steps: readonly string[];
      /** True when the steps are the product's loop, drawn as a flow. */
      readonly loop: boolean;
    };

/** A real screenshot, or a code-drawn illustration that says so. */
export type StackMedia =
  | { readonly kind: "screenshot"; readonly image: PortfolioImage }
  | { readonly kind: "illustration"; readonly art: StackArt };

export interface StackCardModel {
  readonly kind: StackEntry["kind"];
  readonly slug: string;
  /** The case study, under the profile base while the redesign is a preview. */
  readonly href: string;
  readonly name: string;
  /** Category and period for a project; "Venture" and its start for a venture. */
  readonly chips: readonly string[];
  /** The tagline. */
  readonly summary: string;
  /**
   * The first cleared outcome as its line ("Label: value"), or a venture's
   * count as the Home's ventures copy words it. None when neither exists.
   */
  readonly evidence?: string;
  readonly media: StackMedia | null;
  readonly hue: MaterialHue;
  /** The card's id, when an address must land on it (GoGoCash: "ventures"). */
  readonly anchor?: string;
}

function projectCard(entry: StackEntry, index: number): StackCardModel {
  const project = getPortfolioProjectBySlug(entry.slug);
  if (!project) {
    throw new Error(`The work stack names a missing project, "${entry.slug}".`);
  }
  const first = project.outcomes?.[0];
  const media: StackMedia | null = project.cover
    ? { kind: "screenshot", image: project.cover }
    : project.mockup
      ? {
          kind: "illustration",
          art: { type: "mockup", mockup: project.mockup },
        }
      : null;
  return {
    kind: "project",
    slug: project.slug,
    href: `${PROFILE_BASE}/portfolio/${project.slug}`,
    name: project.name,
    chips: [project.category, project.period],
    summary: project.tagline,
    evidence: first ? outcomeLine(first) : undefined,
    media,
    hue: materialHue(index),
    anchor: entry.anchor,
  };
}

function ventureCard(entry: StackEntry, index: number): StackCardModel {
  const venture = getVentureBySlug(entry.slug);
  if (!venture) {
    throw new Error(`The work stack names a missing venture, "${entry.slug}".`);
  }
  // The Home's ventures copy leads with the count it states, as the owner
  // worded it there; a venture whose first item states no figure shows none.
  const home = homeVentures.cards.find(
    (card) => card.href === `/ventures/${venture.slug}`,
  );
  const counted = home?.items[0];
  const loop = venture.caseStudy?.loop;
  return {
    kind: "venture",
    slug: venture.slug,
    href: `${PROFILE_BASE}/ventures/${venture.slug}`,
    name: venture.name,
    chips: [workCopy.venture, `${workCopy.since} ${venture.year}`],
    summary: venture.tagline,
    evidence: counted && /\d/.test(counted) ? counted : undefined,
    media: {
      kind: "illustration",
      art: {
        type: "venture",
        logo: venture.logo,
        steps: loop ?? venture.stack,
        loop: Boolean(loop),
      },
    },
    hue: materialHue(index),
    anchor: entry.anchor,
  };
}

/** The work stack's cards, in the order of `STACK_ENTRIES` (umbrella R7). */
export function stackCards(
  entries: readonly StackEntry[] = STACK_ENTRIES,
): StackCardModel[] {
  return entries.map((entry, index) =>
    entry.kind === "project"
      ? projectCard(entry, index)
      : ventureCard(entry, index),
  );
}

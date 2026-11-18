import { aboutPage } from "@/lib/content/aboutPage";
import {
  FEATURED_PORTFOLIO_SLUGS,
  portfolioPage,
} from "@/lib/content/portfolio";

/*
 * The redesigned Home's work stack and About bento (profile redesign Phase 3,
 * design spec 8.4, 8.5, 15.3 and 15.4): which cases the stack shows, in what
 * order, which figures the stats tile shows, and the two sections' copy.
 *
 * No figure is typed here. The stack's evidence lines and the stats tile's
 * numbers are read from portfolio.ts, ventures.ts and landing.ts by
 * lib/landing/stackCards.ts and lib/landing/aboutStats.ts, so the claim audits
 * (portfolioOutcomes.test.ts, ventureCase.test.ts) hold them where they are
 * cleared. This module only points at them.
 *
 * Lines marked DRAFT wait for the owner's approval (umbrella inputs R8 and
 * R9) and are not final copy until he gives it. The About story itself is
 * today's /about copy (R13: recruiter-fit Phase 4 rewrites it there, and the
 * tile follows).
 *
 * Named for its two sections rather than `home.ts`: the hero lane (Phase 2)
 * adds lib/content/home.ts at the same time, and the merge may fold the two.
 */

/** A case in the stack: a project of portfolio.ts or a venture of ventures.ts. */
export interface StackEntry {
  readonly kind: "project" | "venture";
  readonly slug: string;
  /** An id the card carries, for an address that must keep landing on it. */
  readonly anchor?: string;
}

/**
 * The stack, in order (umbrella input R7, its default): the three featured
 * projects, then both ventures. GoGoCash carries `id="ventures"`, so /#ventures
 * (the /work redirect, the venture breadcrumbs, the 404 page and the menu)
 * keeps landing on a venture.
 */
export const STACK_ENTRIES: readonly StackEntry[] = [
  ...FEATURED_PORTFOLIO_SLUGS.map((slug) => ({
    kind: "project" as const,
    slug,
  })),
  { kind: "venture", slug: "gogocash", anchor: "ventures" },
  { kind: "venture", slug: "manut" },
];

/** The work stack's header and card labels (spec 8.4). */
export const workCopy = {
  /** The article's name: a smoke test reads "Selected work" (spec 13, item 26). */
  eyebrow: portfolioPage.title,
  heading: "Projects and ventures, from problem to outcome.", // DRAFT
  lead: "Internal tools and AI agents at The Binary Holdings, and two ventures of my own.", // DRAFT
  /** The card's call to action; the case's name follows it, visually hidden. */
  cta: "Read the case study", // DRAFT (plan step 3c, the design system's card)
  /** A venture's first chip (spec 8.4); its second is "Since" and its year. */
  venture: "Venture", // DRAFT
  since: "Since", // DRAFT
  /** On every code-drawn picture (owner decision 4 of 18-11-26). */
  illustration: "Illustration",
} as const;

/**
 * A figure of the stats tile, by where it is cleared (umbrella input R8: only
 * figures already cleared; the tile shows fewer rather than an uncleared one).
 * The value is read from that place, never typed here.
 */
export type StatSource =
  | { readonly project: string; readonly outcome: string }
  | { readonly venture: string; readonly metric: string };

/** The About bento's copy (spec 8.5 and 15.4). */
export const aboutCopy = {
  eyebrow: "About", // DRAFT (the nav's label)
  heading: "AI engineering, close to the work.", // DRAFT
  lead: "How I work, and the results so far.", // DRAFT
  briefLabel: "In short", // DRAFT
  /** Today's About story, as /about prints it. */
  brief: aboutPage.story.paragraphs,
  mess: {
    // DRAFT: the mess a system has to hold, each in the case copy's words:
    // TBH Intranet's "The problem" (portfolio.ts) for the first three, Manut
    // AI's description and "What it is" (ventures.ts) for the last two.
    chips: [
      "Several legal entities",
      "Thai accounting requirements",
      "Multi-step approvals",
      "A dozen disconnected tools",
      "Spreadsheets and five tabs",
    ],
    line: "Then one system holds it.", // DRAFT
  },
  stats: {
    figures: [
      { project: "tbh-intranet", outcome: "Adoption" },
      { venture: "gogocash", metric: "Registered users" },
      { venture: "gogocash", metric: "Merchants" },
    ] satisfies readonly StatSource[],
    footnote: "From the TBH Intranet and GoGoCash case studies.", // DRAFT
  },
  motion: {
    caption: "The mess, then the system", // DRAFT
    pause: "Pause the animation",
    play: "Play the animation",
  },
  /** The four operating principles, as /about prints them. */
  principles: aboutPage.principles.items,
} as const;

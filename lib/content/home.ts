import { aboutPage } from "@/lib/content/aboutPage";
import { AVAILABILITY } from "@/lib/content/availability";
import { PERSON_NAME } from "@/lib/content/identity";
import { keepNamesWhole } from "@/lib/content/keepWhole";
import { hero } from "@/lib/content/landing";
import {
  getFeaturedPortfolioProjects,
  portfolioPage,
  type PortfolioImage,
  type PortfolioMockup,
} from "@/lib/content/portfolio";
import { caseHref } from "@/lib/content/profileChrome";
import { RESUME_TIMELINE_FALLBACK } from "@/lib/content/resumeTimeline.fallback";
import { getVentureBySlug } from "@/lib/content/ventures";

/*
 * Copy of the redesigned Home's top (profile redesign, Phase 2; design spec
 * 8.1 to 8.3 and 15.2): the hero, its canvas mock and the logo strip. The
 * hero's own lines are read from the site's cleared content. The owner
 * approved the rest (the strip's eyebrow, the mock's interface labels and
 * the link and pager wording) as is on 21-11-26. Nothing here holds a
 * figure.
 */

/** Line 1 of the h1, which never moves: "Hi, I’m Kunanon Jarat." */
const greetingLine = `${hero.greeting} ${hero.name}`;

/**
 * Phrase 1 of line 2: today's headline, so the h1 reads exactly as the live
 * Home's does (owner decision O9 of 10-11-26, the parity gate).
 */
const canonicalPhrase = [...hero.headline, hero.headlineAccent].join(" ");

/**
 * Alternate phrases for line 2 (umbrella input R5). Empty until the owner
 * approves lines; with one phrase the line holds still and never rotates.
 */
const ALTERNATE_PHRASES: readonly string[] = [];

export const homeHero = {
  greetingLine,
  /** Line 2's phrases; the first is the one the server renders. */
  phrases: [canonicalPhrase, ...ALTERNATE_PHRASES] as readonly string[],
  /** The h1's accessible name, whatever phrase shows. */
  title: `${greetingLine} ${canonicalPhrase}`,
  /**
   * Umbrella input R4: the accent badge and one plain chip. Since the owner's
   * direction of 20-11-26 the chip names the ventures, so the two read as
   * one phrase: "Currently building, GoGoCash and Manut AI".
   */
  badge: AVAILABILITY.pill.label,
  chip: AVAILABILITY.ventures.join(" and "),
  /** The lede, its names unbroken ("Manut / AI" on phones; keepWhole.ts). */
  lead: keepNamesWhole(hero.homeLead),
  primaryCta: hero.primaryCta,
  resumeCta: hero.resumeCta,
  /** How long a phrase stays (spec 5.5: measured 4,202 ms). */
  rotateMs: 4200,
} as const;

/**
 * The résumé sections that list employers (umbrella input R6). "Currently"
 * holds his own ventures since 20-11-26, which the strip adds at its end.
 */
const EMPLOYER_SECTIONS: ReadonlySet<string> = new Set(["Experience"]);

/**
 * The ventures R6 names for the strip, by slug: GoGoCash and Manut AI. A
 * venture added to ventures.ts later does not join the strip until the
 * owner adds it here.
 */
const STRIP_VENTURES = ["gogocash", "manut"] as const;

/**
 * The logo strip (spec 8.3, umbrella input R6): every employer in the résumé,
 * then R6's two ventures, as typographic wordmarks until the owner supplies
 * SVG ones. Read from the résumé and the ventures, so the strip never names
 * an organisation the site does not already list.
 */
function logoNames(): readonly string[] {
  const employers = RESUME_TIMELINE_FALLBACK.filter((section) =>
    EMPLOYER_SECTIONS.has(section.title),
  ).flatMap((section) => section.items.map((item) => item.logoName ?? ""));
  const ventures = STRIP_VENTURES.map((slug) => {
    const venture = getVentureBySlug(slug);
    if (!venture) throw new Error(`The strip's venture "${slug}" is missing.`);
    return venture.name;
  });
  return [...new Set([...employers, ...ventures])].filter(Boolean);
}

export const logoStrip = {
  label: "Where I’ve worked", // R6: the strip's eyebrow.
  names: logoNames(),
} as const;

/** The owner's first name, for the mock's breadcrumb, comment and cursor. */
const firstName = PERSON_NAME.split(" ")[0] ?? PERSON_NAME;

/**
 * The comment bubble's line: one of the owner's cleared operating principles
 * (the About page), as on the owner-approved canvas.
 */
const principles = aboutPage.principles.items;
const commentLine = (principles[2] ?? principles[0]).title;

export interface MockFrame {
  readonly slug: string;
  readonly name: string;
  /** The discipline badge and the inspector's Area. */
  readonly category: string;
  readonly period: string;
  /** The case study. Phase 5 builds these pages on the preview. */
  readonly href: string;
  /** A real screenshot where one is registered. */
  readonly cover?: PortfolioImage;
  /** Otherwise a textless drawing of this kind of screen. */
  readonly mockup?: PortfolioMockup["kind"];
}

/** The canvas mock (spec 8.2, owner decision 3): the three featured projects. */
export const canvasMock = {
  /** The group that holds the frame links. */
  label: "Featured projects",
  breadcrumb: { owner: firstName, file: portfolioPage.title },
  share: "Share",
  layersTabs: ["Layers", "Assets"],
  layersGroup: portfolioPage.title,
  inspectorTabs: ["Design", "Prototype"],
  area: "Area",
  period: "Period",
  open: "Open project",
  /** On every code-drawn picture (owner decision 4 of 18-11-26). */
  illustration: "Illustration",
  comment: {
    initial: firstName.charAt(0),
    who: `${firstName} · just now`,
    line: commentLine,
  },
  cursor: firstName,
  frames: getFeaturedPortfolioProjects().map((project): MockFrame => ({
    slug: project.slug,
    name: project.name,
    category: project.category,
    period: project.period,
    href: caseHref("portfolio", project.slug),
    cover: project.cover,
    mockup: project.mockup?.kind,
  })),
  /** A frame link's name: its visible label first (WCAG 2.5.3). */
  frameName: (name: string) => `${name}: open the case study`,
  /** A pager button's name, on phones. */
  showName: (name: string) => `Show ${name}`,
  /** What the pager says once a reader turns to a frame. */
  shown: (name: string, index: number, count: number) =>
    `${name}, ${index + 1} of ${count}`,
  /**
   * The canvas toolbar's buttons, from 810 px with a mouse
   * (now-building-and-genz Phase 4). The tools' own words, which load with
   * them, are in ./canvasTools.
   */
  tools: {
    label: "Canvas tools",
    move: "Move",
    stickers: "Stickers",
    /** The Stickers button's tooltip and description once it is on. */
    stamp: "press again to stamp one",
    pen: "Pen",
    ink: (colour: string) => `Ink: ${colour}`,
    inks: { violet: "violet", coral: "coral" },
    clear: "Clear the canvas",
  },
} as const;

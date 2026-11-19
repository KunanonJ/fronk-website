import {
  HIRING_CONTACT_HREF,
  OPEN_TO_ROLES,
  RESUME_HREF,
} from "@/lib/content/availability";
import { withoutHiddenBlogLinks } from "@/lib/content/blogVisibility";
import {
  STACK_ENTRIES,
  aboutCopy,
  workCopy,
} from "@/lib/content/homeWorkAbout";
import {
  FEATURED_PORTFOLIO_SLUGS,
  getAllPortfolioProjects,
  getPortfolioProjectBySlug,
  outcomeLine,
  portfolioPage,
  type PortfolioArchitecture,
  type PortfolioImage,
  type PortfolioMockup,
  type PortfolioProject,
} from "@/lib/content/portfolio";
import { PROFILE_BASE, homeHref } from "@/lib/content/profileChrome";
import {
  VENTURE_RELATED_TOPICS,
  getAllVentures,
  getVentureBySlug,
  type Venture,
} from "@/lib/content/ventures";
import { materialHue, type MaterialHue } from "@/lib/landing/stackCards";
import { pad2 } from "@/lib/utils/pad2";

/*
 * The case-study view model (profile redesign Phase 5, design spec 9 and
 * 15.7): pure mappers from a project of portfolio.ts or a venture of
 * ventures.ts to the one shape the template renders. Nothing here types a
 * figure, a claim or a case's own words. Every line is read from the content
 * modules, so the claim audits that hold those modules hold the case pages
 * too. The template's labels are in `caseCopy`: most are today's labels on the
 * live case pages, and the few that are new with the redesign are marked
 * DRAFT for the owner's approval.
 */

type CaseKind = "project" | "venture";

export interface CaseLink {
  readonly label: string;
  readonly href: string;
}

/** A label and its value: a meta item, a figure, a before or an after. */
export interface CaseFact {
  readonly label: string;
  readonly value: string;
  /** A line under the value, such as the month a running total was true. */
  readonly note?: string;
}

/** A code-drawn picture of a project's screen, or of a venture's loop. */
export type CaseArt =
  | { readonly type: "mockup"; readonly mockup: PortfolioMockup }
  | {
      readonly type: "venture";
      readonly logo: string;
      /** The loop's stages, or the venture's categories when it has none. */
      readonly steps: readonly string[];
      readonly loop: boolean;
    };

/** A real screenshot, or a code-drawn illustration that says so. */
export type CaseMedia =
  | { readonly kind: "screenshot"; readonly image: PortfolioImage }
  | {
      readonly kind: "illustration";
      readonly art: CaseArt;
      /** What the picture shows, for assistive technology. */
      readonly label: string;
    };

/** A showcase picture drawn in code from the case's own data (spec 9.9). */
export type ShowcaseArt =
  | { readonly type: "flow"; readonly steps: readonly string[] }
  | {
      readonly type: "layers";
      readonly layers: readonly {
        readonly label: string;
        readonly nodes: number;
      }[];
    };

export type ShowcaseMedia =
  | { readonly kind: "screenshot"; readonly image: PortfolioImage }
  | {
      readonly kind: "illustration";
      readonly art: ShowcaseArt;
      readonly label: string;
    };

export interface ShowcaseTile {
  readonly id: string;
  readonly size: "full" | "half";
  /** The tile's CSS aspect ratio, such as "16 / 10". */
  readonly ratio: string;
  readonly tone: "default" | "deep" | "brand" | "paper";
  readonly media: ShowcaseMedia;
  readonly title: string;
  readonly text?: string;
  /** Moves until paused (a flow); a still picture otherwise. */
  readonly animated: boolean;
}

export type CaseBlock =
  | { readonly type: "prose"; readonly paragraphs: readonly string[] }
  | { readonly type: "facts"; readonly items: readonly CaseFact[] }
  | { readonly type: "points"; readonly items: readonly string[] }
  | {
      readonly type: "steps";
      readonly label: string;
      readonly steps: readonly {
        readonly label: string;
        readonly detail?: string;
      }[];
    }
  | {
      readonly type: "layers";
      readonly label: string;
      readonly layers: PortfolioArchitecture["layers"];
    }
  | {
      readonly type: "chips";
      readonly label: string;
      readonly items: readonly string[];
    }
  | {
      readonly type: "links";
      readonly label: string;
      readonly links: readonly CaseLink[];
      readonly more?: CaseLink;
    }
  | { readonly type: "showcase"; readonly tiles: readonly ShowcaseTile[] };

export interface CaseChapter {
  /** The anchor, "ch-01": the rail and the address hash use it. */
  readonly id: string;
  /** "01", "02": the kicker's and the rail's number. */
  readonly number: string;
  readonly title: string;
  /**
   * A t-h3 line under the kicker (spec 9.7 and 15.7: owner input). None is
   * cleared yet, so the kicker is the chapter's h2.
   */
  readonly headline?: string;
  readonly blocks: readonly CaseBlock[];
}

/** The evidence rows above the cover (spec 9.3). */
export interface CaseEvidence {
  /** A project's cleared outcomes, or a venture's figures in their place. */
  readonly figures?: {
    readonly heading: string;
    readonly items: readonly CaseFact[];
    /** Where the figures are stated ("As stated in the résumé →"). */
    readonly source?: CaseLink;
  };
  /** A project's part, or a venture's "My role" section. */
  readonly part?: { readonly heading: string; readonly text: string };
}

/** A card of "More projects" (spec 9.12). */
export interface CaseMoreCard {
  readonly kind: CaseKind;
  readonly slug: string;
  readonly href: string;
  readonly name: string;
  /** Category and period; "Venture" and the timeline. */
  readonly meta: readonly string[];
  readonly summary: string;
  readonly media: CaseMedia | null;
  /** The material behind a drawn picture (spec 2.4). */
  readonly hue: MaterialHue;
}

export interface CaseStudy {
  readonly kind: CaseKind;
  readonly slug: string;
  /** The live address, which the JSON-LD and the Markdown twin keep. */
  readonly path: string;
  /** Where the template is served: under the profile base while a preview. */
  readonly href: string;
  readonly name: string;
  readonly tagline: string;
  /**
   * The h1's first span: "{name}." for a project and "{name}" for a venture,
   * so the h1 reads exactly as the live page's does (umbrella input R12).
   */
  readonly titleName: string;
  /** A venture's square logo, drawn in the h1 with empty alt text. */
  readonly logo?: string;
  readonly back: CaseLink;
  readonly eyebrow: string;
  readonly lead: string;
  /**
   * "By {name} · {role}", the name linked to /about as the author: the live
   * project pages print it for search, and on a venture it carries the live
   * page's "My role" footer (his name and the About link).
   */
  readonly byline?: { readonly author: CaseLink; readonly role: string };
  /** The public site or the source: a new tab. */
  readonly external?: CaseLink;
  /** A project's first cleared outcome as one line, for cards. */
  readonly firstOutcome?: string;
  readonly evidence: CaseEvidence;
  readonly cover: CaseMedia | null;
  /**
   * The case-card material (spec 2.4) behind a drawn cover: the case's card
   * on the Home stack wears the same one.
   */
  readonly hue: MaterialHue;
  readonly meta: readonly CaseFact[];
  readonly chapters: readonly CaseChapter[];
  readonly more: readonly CaseMoreCard[];
}

/** The template's labels (spec 9 and 15.7). */
export const caseCopy = {
  /** Back links follow the BreadcrumbList parent (spec 9.2). */
  backToProjects: "All projects",
  backToVentures: "Ventures",
  /** The venture eyebrow's first word, as the live venture pages print it. */
  venture: workCopy.venture,
  outcome: "Outcome",
  /** A smoke test pins this name, arrow included (spec 12 item 18). */
  outcomeSource: { label: "As stated in the résumé →", href: RESUME_HREF },
  part: "My part",
  /** The label /proof gives the same figures. */
  ventureFigures: "Venture metrics",
  /** The cover's name: a smoke test reads `article "Interface"`. */
  interface: "Interface",
  illustration: workCopy.illustration,
  /** Spec 9.4, keeping the live caption's honesty wording. */
  coverCaption: "Illustration, not real data.", // DRAFT (spec 9.4, ours)
  byline: "By",
  meta: {
    role: "Role",
    organisation: "Organisation",
    period: "Period",
    access: "Access",
    started: "Started",
    status: "Status",
    offer: "Offer",
  },
  /** A venture's status; "Live" is the live venture pages' word. */
  status: {
    active: "Live",
    acquired: "Acquired", // DRAFT (no venture has it)
    "shut-down": "Shut down", // DRAFT (no venture has it)
    paused: "Paused", // DRAFT (no venture has it)
  } satisfies Record<Venture["status"], string>,
  /** The rail and the phone contents (spec 9.6). */
  contents: "On this page", // DRAFT (spec 9.6)
  chapter: {
    does: "What it does",
    flow: "How it works",
    architecture: "Architecture",
    stack: "Tech stack",
    related: "Related topics",
  },
  before: "Before",
  after: "After",
  layers: "Layers, top to bottom",
  loop: "The core loop",
  categories: "Categories",
  allTopics: { label: "All topics", href: "/learn" },
  /**
   * The accessible names of the drawn pictures, composed from the case's own
   * words (spec 9.9 and 15.7): new with the redesign.
   */
  art: {
    venture: (name: string, steps: readonly string[]) =>
      `Illustration of ${name}: ${steps.join(", ")}`, // DRAFT
    flow: (title: string, steps: readonly string[]) =>
      `Illustration of ${title}: ${steps.join(", ")}`, // DRAFT
    layers: (layers: readonly string[]) =>
      `Illustration of the architecture: ${layers.join(", ")}`, // DRAFT
  },
  /** The showcase's tile buttons and viewer (spec 9.9, 9.10). */
  enlarge: "Enlarge", // DRAFT (spec 9.9, ours)
  close: "Close", // DRAFT
  pause: aboutCopy.motion.pause,
  play: aboutCopy.motion.play,
  /** The end of the page (spec 9.11, 9.12). */
  hire: {
    kicker: portfolioPage.hire.kicker,
    heading: portfolioPage.hire.heading,
    sentence: OPEN_TO_ROLES.sentence,
    resume: { label: portfolioPage.hire.resumeLabel, href: RESUME_HREF },
    contact: {
      label: portfolioPage.hire.contactLabel,
      href: HIRING_CONTACT_HREF,
    },
  },
  more: "More projects",
  allProjects: { label: "All projects", href: "/portfolio" },
  moreCta: workCopy.cta,
} as const;

/** The Access value the live project pages print (`accessDetail`). */
export function caseAccess(access: PortfolioProject["access"]): string {
  return access === "internal" ? "Internal tool (no public link)" : "Public";
}

/** The h1's text, as the parity reference reads it (R12). */
export function caseHeading(study: CaseStudy): string {
  return `${study.titleName} ${study.tagline}`;
}

/**
 * A case's material: its Home stack card's (spec 2.4, in card order), and for
 * a project the stack leaves out, the next one along.
 */
function caseHue(kind: CaseKind, slug: string): MaterialHue {
  const stacked = STACK_ENTRIES.findIndex(
    (entry) => entry.kind === kind && entry.slug === slug,
  );
  if (stacked >= 0) return materialHue(stacked);
  const rest = getAllPortfolioProjects().filter(
    (project) =>
      !STACK_ENTRIES.some(
        (entry) => entry.kind === "project" && entry.slug === project.slug,
      ),
  );
  const at = rest.findIndex((project) => project.slug === slug);
  return materialHue(STACK_ENTRIES.length + Math.max(at, 0));
}

const projectHref = (slug: string) => `${PROFILE_BASE}/portfolio/${slug}`;
const ventureHref = (slug: string) => `${PROFILE_BASE}/ventures/${slug}`;

/** "01", "02": chapters are numbered in page order. */
function numbered(
  drafts: readonly Omit<CaseChapter, "id" | "number">[],
): CaseChapter[] {
  return drafts.map((draft, index) => {
    const number = pad2(index + 1);
    return { ...draft, id: `ch-${number}`, number };
  });
}

/** The live project cards' name for the drawing (ProjectCards.tsx). */
function mockupLabel(name: string): string {
  return `Illustrative mockup of ${name}`;
}

/** The byline's author: the site's, as the live project pages link him. */
const AUTHOR: CaseLink = {
  label: portfolioPage.author.name,
  href: portfolioPage.author.href,
};

function projectMedia(project: PortfolioProject): CaseMedia | null {
  if (project.cover) return { kind: "screenshot", image: project.cover };
  if (project.mockup) {
    return {
      kind: "illustration",
      art: { type: "mockup", mockup: project.mockup },
      label: mockupLabel(project.name),
    };
  }
  return null;
}

function ventureMedia(venture: Venture): CaseMedia {
  const loop = venture.caseStudy?.loop;
  const steps = loop && loop.length > 1 ? loop : venture.stack;
  return {
    kind: "illustration",
    art: {
      type: "venture",
      logo: venture.logo,
      steps,
      loop: steps === loop,
    },
    label: caseCopy.art.venture(venture.name, steps),
  };
}

/**
 * The showcase of "What it does" (spec 9.9 and 15.7): registered screenshots
 * first, then pictures drawn from the case's own data, captioned from it: the
 * workflow (moving, with a pause control) and the architecture's layers. Two
 * drawings sit side by side; one alone takes the full width.
 */
function projectShowcase(project: PortfolioProject): ShowcaseTile[] {
  const shots: ShowcaseTile[] = (project.gallery ?? []).map((image, i) => ({
    id: `shot-${i + 1}`,
    size: "full",
    ratio: `${image.width} / ${image.height}`,
    tone: "paper",
    media: { kind: "screenshot", image },
    title: project.name,
    text: image.alt,
    animated: false,
  }));
  const drawn: Omit<ShowcaseTile, "size" | "ratio">[] = [];
  const { workflow, architecture } = project;
  if (workflow) {
    const steps = workflow.steps.map((step) => step.label);
    drawn.push({
      id: "flow",
      tone: "brand",
      media: {
        kind: "illustration",
        art: { type: "flow", steps },
        label: caseCopy.art.flow(workflow.title, steps),
      },
      title: workflow.title,
      text: steps.join(" · "),
      animated: steps.length > 1,
    });
  }
  if (architecture) {
    const layers = architecture.layers.map((layer) => ({
      label: layer.label,
      nodes: layer.nodes.length,
    }));
    const labels = layers.map((layer) => layer.label);
    drawn.push({
      id: "layers",
      tone: "default",
      media: {
        kind: "illustration",
        art: { type: "layers", layers },
        label: caseCopy.art.layers(labels),
      },
      title: caseCopy.chapter.architecture,
      text: labels.join(" · "),
      animated: false,
    });
  }
  const pair = drawn.length === 2;
  return [
    ...shots,
    ...drawn.map((tile) => ({
      ...tile,
      size: pair ? ("half" as const) : ("full" as const),
      ratio: pair ? "1 / 1" : "16 / 10",
    })),
  ];
}

function projectChapters(project: PortfolioProject): CaseChapter[] {
  const [problem, ...rest] = project.sections;
  const drafts: Omit<CaseChapter, "id" | "number">[] = [];
  if (problem) {
    drafts.push({
      title: problem.heading,
      blocks: [
        { type: "prose", paragraphs: [problem.body] },
        ...(project.beforeAfter
          ? [
              {
                type: "facts" as const,
                items: [
                  { label: caseCopy.before, value: project.beforeAfter.before },
                  { label: caseCopy.after, value: project.beforeAfter.after },
                ],
              },
            ]
          : []),
      ],
    });
  }
  const tiles = projectShowcase(project);
  if (project.highlights.length > 0 || tiles.length > 0) {
    drafts.push({
      title: caseCopy.chapter.does,
      blocks: [
        ...(project.highlights.length > 0
          ? [{ type: "points" as const, items: project.highlights }]
          : []),
        ...(tiles.length > 0 ? [{ type: "showcase" as const, tiles }] : []),
      ],
    });
  }
  if (project.workflow) {
    drafts.push({
      title: caseCopy.chapter.flow,
      blocks: [
        {
          type: "steps",
          label: project.workflow.title,
          steps: project.workflow.steps.map(({ label, detail }) => ({
            label,
            detail,
          })),
        },
      ],
    });
  }
  if (project.architecture) {
    drafts.push({
      title: caseCopy.chapter.architecture,
      blocks: [
        {
          type: "layers",
          label: caseCopy.layers,
          layers: project.architecture.layers,
        },
      ],
    });
  }
  for (const section of rest) {
    drafts.push({
      title: section.heading,
      blocks: [{ type: "prose", paragraphs: [section.body] }],
    });
  }
  if (project.stack.length > 0) {
    drafts.push({
      title: caseCopy.chapter.stack,
      blocks: [
        {
          type: "chips",
          label: caseCopy.chapter.stack,
          items: project.stack,
        },
      ],
    });
  }
  return numbered(drafts);
}

function projectCard(project: PortfolioProject): CaseMoreCard {
  return {
    kind: "project",
    slug: project.slug,
    href: projectHref(project.slug),
    name: project.name,
    meta: [project.category, project.period],
    summary: project.tagline,
    media: projectMedia(project),
    hue: caseHue("project", project.slug),
  };
}

function ventureCard(venture: Venture): CaseMoreCard {
  return {
    kind: "venture",
    slug: venture.slug,
    href: ventureHref(venture.slug),
    name: venture.name,
    meta: [
      caseCopy.venture,
      venture.caseStudy?.timeline ?? String(venture.year),
    ],
    summary: venture.tagline,
    media: ventureMedia(venture),
    hue: caseHue("venture", venture.slug),
  };
}

/** The next two projects in list order, wrapping (spec 9.12). */
function nextProjects(slug: string): PortfolioProject[] {
  const all = getAllPortfolioProjects();
  const at = all.findIndex((project) => project.slug === slug);
  return [1, 2]
    .map((step) => all[(at + step) % all.length]!)
    .filter((project) => project.slug !== slug);
}

/** A project as the case-study template shows it. */
export function projectCase(project: PortfolioProject): CaseStudy {
  const outcomes = project.outcomes ?? [];
  const first = outcomes[0];
  return {
    kind: "project",
    slug: project.slug,
    path: `/portfolio/${project.slug}`,
    href: projectHref(project.slug),
    name: project.name,
    tagline: project.tagline,
    titleName: `${project.name}.`,
    back: { label: caseCopy.backToProjects, href: "/portfolio" },
    eyebrow: `${project.category} · ${project.period}`,
    lead: project.summary,
    byline: { author: AUTHOR, role: project.role },
    external:
      project.access === "public" && project.url
        ? { label: project.urlLabel ?? "Visit", href: project.url }
        : undefined,
    firstOutcome: first ? outcomeLine(first) : undefined,
    evidence: {
      figures:
        outcomes.length > 0
          ? {
              heading: caseCopy.outcome,
              items: outcomes.map(({ label, value }) => ({ label, value })),
              source: caseCopy.outcomeSource,
            }
          : undefined,
      part: project.myPart
        ? { heading: caseCopy.part, text: project.myPart }
        : undefined,
    },
    cover: projectMedia(project),
    hue: caseHue("project", project.slug),
    meta: [
      { label: caseCopy.meta.role, value: project.role },
      { label: caseCopy.meta.organisation, value: project.organization },
      { label: caseCopy.meta.period, value: project.period },
      { label: caseCopy.meta.access, value: caseAccess(project.access) },
    ],
    chapters: projectChapters(project),
    more: nextProjects(project.slug).map(projectCard),
  };
}

/** The section headed "My role" moves to the evidence rows (spec 9.3). */
const ROLE_HEADING = "My role";

function ventureChapters(
  venture: Venture,
  related: readonly CaseLink[],
): CaseChapter[] {
  const sections = (venture.caseStudy?.sections ?? []).filter(
    (section) => section.heading !== ROLE_HEADING,
  );
  const [what, stands, ...rest] = sections;
  const loop = venture.caseStudy?.loop ?? [];
  const drafts: Omit<CaseChapter, "id" | "number">[] = [];
  if (what) {
    drafts.push({
      title: what.heading,
      blocks: [
        { type: "prose", paragraphs: [what.body] },
        ...(venture.stack.length > 0
          ? [
              {
                type: "chips" as const,
                label: caseCopy.categories,
                items: venture.stack,
              },
            ]
          : []),
      ],
    });
  }
  if (stands) {
    drafts.push({
      title: stands.heading,
      blocks: [
        { type: "prose", paragraphs: [stands.body] },
        ...(loop.length > 1
          ? [
              {
                type: "steps" as const,
                label: caseCopy.loop,
                steps: loop.map((label) => ({ label })),
              },
            ]
          : []),
      ],
    });
  }
  for (const section of rest) {
    drafts.push({
      title: section.heading,
      blocks: [{ type: "prose", paragraphs: [section.body] }],
    });
  }
  if (related.length > 0) {
    drafts.push({
      title: caseCopy.chapter.related,
      blocks: [
        {
          type: "links",
          label: caseCopy.chapter.related,
          links: related,
          more: caseCopy.allTopics,
        },
      ],
    });
  }
  return numbered(drafts);
}

/**
 * A venture as the case-study template shows it. "Also building" becomes
 * More projects (spec 9.12): the other venture, then the first featured
 * project.
 */
export function ventureCase(venture: Venture): CaseStudy {
  const caseStudy = venture.caseStudy;
  const role = caseStudy?.sections.find(
    (section) => section.heading === ROLE_HEADING,
  );
  const related = withoutHiddenBlogLinks(
    VENTURE_RELATED_TOPICS[venture.slug] ?? [],
  );
  const other = getAllVentures().find(
    (candidate) => candidate.slug !== venture.slug && candidate.caseStudy,
  );
  const featured = getPortfolioProjectBySlug(FEATURED_PORTFOLIO_SLUGS[0]);
  const metrics = venture.metrics ?? [];
  return {
    kind: "venture",
    slug: venture.slug,
    path: `/ventures/${venture.slug}`,
    href: ventureHref(venture.slug),
    name: venture.name,
    tagline: venture.tagline,
    titleName: venture.name,
    logo: venture.logo,
    back: { label: caseCopy.backToVentures, href: homeHref("ventures") },
    eyebrow: caseStudy
      ? `${caseCopy.venture} · ${caseStudy.timeline}`
      : caseCopy.venture,
    lead: caseStudy?.intro ?? venture.description,
    // The live page's "My role" footer: his name, linked to /about.
    byline: { author: AUTHOR, role: venture.role },
    external: { label: `Visit ${venture.urlLabel}`, href: venture.url },
    evidence: {
      figures:
        metrics.length > 0
          ? {
              heading: caseCopy.ventureFigures,
              items: metrics.map(({ label, value, asOf }) => ({
                label,
                value,
                note: asOf ? `As of ${asOf}` : undefined,
              })),
            }
          : undefined,
      part: role ? { heading: role.heading, text: role.body } : undefined,
    },
    cover: ventureMedia(venture),
    hue: caseHue("venture", venture.slug),
    meta: [
      { label: caseCopy.meta.role, value: venture.role },
      { label: caseCopy.meta.started, value: String(venture.year) },
      { label: caseCopy.meta.status, value: caseCopy.status[venture.status] },
      ...(venture.offer
        ? [{ label: caseCopy.meta.offer, value: venture.offer.label }]
        : []),
    ],
    chapters: ventureChapters(venture, related),
    more: [
      ...(other ? [ventureCard(other)] : []),
      ...(featured ? [projectCard(featured)] : []),
    ],
  };
}

/** The case at /portfolio/<slug>, or none. */
export function findProjectCase(slug: string): CaseStudy | null {
  const project = getPortfolioProjectBySlug(slug);
  return project ? projectCase(project) : null;
}

/** The case at /ventures/<slug>: only a venture with a case study has one. */
export function findVentureCase(slug: string): CaseStudy | null {
  const venture = getVentureBySlug(slug);
  return venture?.caseStudy ? ventureCase(venture) : null;
}

/** Every case the template renders: the projects, then the ventures. */
export function allCaseStudies(): CaseStudy[] {
  return [
    ...getAllPortfolioProjects().map(projectCase),
    ...getAllVentures()
      .filter((venture) => venture.caseStudy)
      .map(ventureCase),
  ];
}

import { aboutPage } from "@/lib/content/aboutPage";
import { contactPage } from "@/lib/content/contact";
import { portfolioPage } from "@/lib/content/portfolio";

/*
 * The h1s and labels of the core pages the Phase 6 cutover restyles (the
 * portfolio index, About and Contact; profile redesign, plan step 6d). Every
 * line is read from the pages' own content modules or is the label the live
 * pages already printed; nothing here is new copy. The h1s keep their text
 * word for word (the parity gate reads it), only their markup changes.
 */

/** One part of an h1 line: plain, muted (`--muted`), or the italic accent. */
export interface HeadlinePart {
  readonly text: string;
  readonly tone?: "muted" | "accent";
}
export type HeadlineLines = readonly (readonly HeadlinePart[])[];

/** /portfolio: "Selected work: internal tools, automations and AI agents." */
export const portfolioHeadline: HeadlineLines = portfolioPage.headline.map(
  (line, index, lines) =>
    line.map((segment): HeadlinePart => ({
      text: segment.text,
      // The last of several lines was the accent line on the live page.
      tone:
        "muted" in segment && segment.muted
          ? "muted"
          : index === lines.length - 1 && lines.length > 1
            ? "accent"
            : undefined,
    })),
);

const about = aboutPage.hero.headline;
/** /about: "About Kunanon Jarat: AI, ERP/CRM and startups in Bangkok." */
export const aboutHeadline: HeadlineLines = [
  [{ text: about.muted, tone: "muted" }, { text: about.name }],
  [{ text: about.focus }, { text: about.joiner, tone: "muted" }],
  [{ text: about.accent, tone: "accent" }],
];

const contact = contactPage.headline;
/** /contact: "Building in fintech, AI or ops? Let’s talk." */
export const contactHeadline: HeadlineLines = [
  [
    { text: contact.muted, tone: "muted" },
    { text: contact.focus },
    { text: contact.joiner, tone: "muted" },
    { text: contact.focusTail },
  ],
  [{ text: contact.lead }, { text: contact.accent, tone: "accent" }],
];

/** The h1's text as the parity gate reads it: the parts joined by spaces. */
export function headlineText(lines: HeadlineLines): string {
  return lines.map((line) => line.map((part) => part.text).join(" ")).join(" ");
}

/** The portfolio index's labels, as the live page printed them. */
export const workIndexCopy = {
  projects: "Projects",
  filter: "Filter projects by category",
  all: "All",
  /** "2 of 5 projects": the count beside the filter. */
  count: (shown: number, total: number) => `${shown} of ${total} projects`,
} as const;

/** About's labels that lived in its components. */
export const aboutPageCopy = {
  socials: "Social profiles",
  /** The pixel portrait over the photo (PortraitPlay). */
  portrait: {
    tryTrait: (found: number, total: number) =>
      `Pixel portrait: try a trait (${found} of ${total} found)`, // DRAFT
    showPhoto: "Photo", // DRAFT
    showPixels: "Pixels", // DRAFT
    toPhoto: "Show the photo", // DRAFT
    toPixels: "Show the pixels", // DRAFT
    count: (found: number, total: number) => `${found}/${total} traits`, // DRAFT
    gold: "Gold edition", // DRAFT
    found: (label: string, found: number, total: number) =>
      `${label}. ${found} of ${total} traits found.`, // DRAFT
    goldFound: "All six traits found: the gold edition.", // DRAFT
  },
} as const;

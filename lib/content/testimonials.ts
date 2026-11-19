/*
 * Recommendations from people the owner has worked with, for the Home's
 * notebook (profile redesign Phase 4, design spec 8.7 and 15.6). Owner
 * decision 5 of 18-11-26: build the notebook, and keep it hidden until real
 * quotes exist.
 *
 * Empty until the owner clears at least TESTIMONIALS_MIN quotes. With fewer,
 * the Home renders no notebook section, no heading and no link to it
 * (`notebookEntries`). Add only words the person agreed to publish, with the
 * day the owner cleared them. Never add a sample or a paraphrase here: the
 * preview's samples live in components/profile/preview/sampleNotes.ts.
 *
 * The claim audit in testimonials.test.ts holds every quote to this file: a
 * quote that appears in any other source file fails the build.
 */

export interface Testimonial {
  /** The person's own words, as they agreed to publish them. */
  readonly quote: string;
  readonly name: string;
  /** Their role when they wrote it, such as "Engineering Manager". */
  readonly role: string;
  readonly organisation?: string;
  /** One or two letters for the avatar, such as "KJ". */
  readonly initials: string;
  /** Where the words were given, such as "LinkedIn recommendation". */
  readonly source: string;
  /** The day the owner cleared the quote for the site, dd-mm-yy. */
  readonly clearedOn: string;
}

/** The notebook shows only with this many cleared quotes or more. */
export const TESTIMONIALS_MIN = 3;

/** Cleared quotes, newest first. None yet (umbrella input R11). */
export const TESTIMONIALS: readonly Testimonial[] = [];

/** True for a real calendar day written dd-mm-yy, as the repo dates things. */
export function isClearedOn(value: string): boolean {
  const match = /^(\d{2})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const [day, month, year] = match.slice(1).map(Number) as [
    number,
    number,
    number,
  ];
  const date = new Date(Date.UTC(2000 + year, month - 1, day));
  return date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

/** Entries with words, a name and a valid clearance date. */
export function clearedTestimonials(
  entries: readonly Testimonial[] = TESTIMONIALS,
): readonly Testimonial[] {
  return entries.filter(
    (entry) =>
      entry.quote.trim() !== "" &&
      entry.name.trim() !== "" &&
      isClearedOn(entry.clearedOn),
  );
}

/**
 * What the Home's notebook shows: every cleared entry once there are
 * TESTIMONIALS_MIN of them, otherwise nothing at all.
 */
export function notebookEntries(
  entries: readonly Testimonial[] = TESTIMONIALS,
): readonly Testimonial[] {
  const cleared = clearedTestimonials(entries);
  return cleared.length >= TESTIMONIALS_MIN ? cleared : [];
}

/** "Role, Organisation", or the role alone. */
export function roleLine(entry: Testimonial): string {
  return entry.organisation
    ? `${entry.role}, ${entry.organisation}`
    : entry.role;
}

/**
 * The notebook's words (spec 15.6, owner input). Every line is a DRAFT until
 * the owner approves it; nothing renders on the Home before 3 quotes exist.
 */
export const notesCopy = {
  eyebrow: "Recommendations", // DRAFT
  heading: "What it is like to work with me.", // DRAFT
  /** The carousel's accessible name. */
  label: "Recommendations", // DRAFT
  coverLabel: "Notes", // DRAFT
  coverLine: "Notes from people I have worked with.", // DRAFT
  /** "3 notes", on the cover. */
  countSuffix: "notes", // DRAFT
  /** A page's name for assistive technology: "Note 2 of 3". */
  pageLabel: "Note", // DRAFT
  previous: "Previous page", // spec 8.7
  next: "Next page", // spec 8.7
  pause: "Pause notes", // DRAFT (plan step 4e)
  play: "Play notes", // DRAFT (plan step 4e)
} as const;

import type { Testimonial } from "@/lib/content/testimonials";

/*
 * Sample notes for /preview/system only (profile redesign Phase 4, plan step
 * 4f): the notebook needs pages to review before real recommendations exist.
 * Each one says plainly that it is a sample, names no real person, and has no
 * clearance date, so the Home's 3-quote rule (notebookEntries) would drop
 * them even if they were passed to it. Never move these into
 * lib/content/testimonials.ts.
 */
export const SAMPLE_NOTES: readonly Testimonial[] = [
  {
    quote:
      "Sample note one. A real recommendation goes here, in the words of the person who gave it, once they agree to publish it.",
    name: "Sample person",
    role: "Sample role",
    organisation: "Sample organisation",
    initials: "S1",
    source: "Sample, not a recommendation",
    clearedOn: "",
  },
  {
    quote:
      "Sample note two. The Home shows this notebook only when three or more cleared recommendations exist.",
    name: "Sample person",
    role: "Sample role",
    initials: "S2",
    source: "Sample, not a recommendation",
    clearedOn: "",
  },
  {
    quote:
      "Sample note three, a longer one. It checks how a page holds several lines of handwriting: the words wrap on the ruled lines, the name and role stay at the foot of the page, and the book grows taller rather than cutting the text off.",
    name: "Sample person",
    role: "Sample role",
    organisation: "Sample organisation",
    initials: "S3",
    source: "Sample, not a recommendation",
    clearedOn: "",
  },
];

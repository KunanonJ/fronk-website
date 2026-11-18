import { lazy, Suspense } from "react";
import { SectionHeader } from "@/components/profile/home/SectionHeader";
import {
  notebookEntries,
  notesCopy,
  TESTIMONIALS,
  type Testimonial,
} from "@/lib/content/testimonials";

/*
 * The Home's testimonial notebook section (profile redesign Phase 4, design
 * spec 8.7; owner decision 5 of 18-11-26). It renders only with
 * TESTIMONIALS_MIN or more owner-cleared quotes in
 * lib/content/testimonials.ts; with fewer, nothing at all: no section, no
 * heading, no link. Today there are none, so the Home shows no notebook.
 *
 * The notebook's code loads on demand (spec 13, item 34): a Home without
 * enough quotes never downloads it, and one with them streams it in with the
 * section's server HTML.
 */
const Notebook = lazy(() =>
  import("@/components/profile/home/Notebook").then((module) => ({
    default: module.Notebook,
  })),
);

export default function Notes({
  entries = TESTIMONIALS,
}: {
  /** Cleared entries; the Home passes none and reads the content module. */
  entries?: readonly Testimonial[];
}) {
  const shown = notebookEntries(entries);
  if (shown.length === 0) return null;
  return (
    <section aria-labelledby="notes-title" className="pf-notes">
      <div className="ds-wrap">
        <SectionHeader
          align="centred"
          eyebrow={notesCopy.eyebrow}
          title={notesCopy.heading}
          titleId="notes-title"
          titleMaxWidth={16}
          className="pf-notes__head"
        />
        <Suspense fallback={null}>
          <Notebook entries={shown} />
        </Suspense>
      </div>
    </section>
  );
}

import { Suspense } from "react";
import { SectionHeader } from "@/components/profile/home/SectionHeader";
import { FeatureBoundary, lazyFeature } from "@/components/ui/LazyFeature";
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
 * section's server HTML. While it loads, its place is held at the book's
 * least height, so the footer does not jump. If it fails to load (a stale
 * chunk after a deploy), the section goes and the rest of the Home stays
 * (components/ui/LazyFeature.tsx).
 */
const Notebook = lazyFeature(async () => ({
  default: (await import("@/components/profile/home/Notebook")).Notebook,
}));

export default function Notes({
  entries = TESTIMONIALS,
}: {
  /** Cleared entries; the Home passes none and reads the content module. */
  entries?: readonly Testimonial[];
}) {
  const shown = notebookEntries(entries);
  if (shown.length === 0) return null;
  return (
    <FeatureBoundary>
      <section aria-labelledby="notes-title" className="pf-notes">
        <div className="ds-wrap">
          <SectionHeader
            align="centred"
            eyebrow={notesCopy.eyebrow}
            title={notesCopy.heading}
            titleId="notes-title"
            titleMaxWidth={16}
            titleClassName="pf-notes__title"
            className="pf-notes__head"
          />
          <Suspense
            fallback={
              <div
                className="pf-book-wrap pf-book-wrap--pending"
                aria-hidden="true"
              />
            }
          >
            <Notebook entries={shown} />
          </Suspense>
        </div>
      </section>
    </FeatureBoundary>
  );
}

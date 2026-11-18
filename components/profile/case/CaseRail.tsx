import type { MouseEvent } from "react";
import { caseCopy, type CaseChapter } from "@/lib/content/caseStudy";
import { cn } from "@/lib/utils/cn";

/*
 * The contents (profile redesign Phase 5, design spec 9.6): the rail beside
 * the chapters from 1100 px, and under 1100 px a closed "On this page"
 * disclosure after the meta row (ours: the reference had none on phones).
 * Both list the numbered chapters; the one in view is `aria-current=
 * "location"`. The links are plain in-page anchors, so they work without
 * script too. Styles: `.pf-case-toc*` and `.pf-case-rail*` in case.css.
 */

type Go = (event: MouseEvent<HTMLAnchorElement>, id: string) => void;

function ContentsList({
  chapters,
  active,
  go,
}: {
  chapters: readonly CaseChapter[];
  active: string | undefined;
  go: Go;
}) {
  return (
    <ol className="pf-case-toc">
      {chapters.map((chapter) => {
        const current = chapter.id === active;
        return (
          <li key={chapter.id}>
            <a
              href={`#${chapter.id}`}
              className={cn("pf-case-toc__link", current && "is-current")}
              aria-current={current ? "location" : undefined}
              onClick={(event) => go(event, chapter.id)}
            >
              <span className="pf-case-toc__number" aria-hidden="true">
                {chapter.number}
              </span>
              <span>{chapter.title}</span>
            </a>
          </li>
        );
      })}
    </ol>
  );
}

/** The sticky rail, from 1100 px. */
export function CaseRail(props: {
  chapters: readonly CaseChapter[];
  active: string | undefined;
  go: Go;
}) {
  return (
    <div className="pf-case-rail">
      <nav className="pf-case-rail__nav" aria-labelledby="case-rail-title">
        <p id="case-rail-title" className="t-meta pf-case-rail__title">
          {caseCopy.contents}
        </p>
        <ContentsList {...props} />
      </nav>
    </div>
  );
}

/** The phone contents: a closed disclosure, under 1100 px. */
export function CaseContents(props: {
  chapters: readonly CaseChapter[];
  active: string | undefined;
  go: Go;
}) {
  return (
    <nav className="pf-case-contents" aria-labelledby="case-contents-title">
      <details className="pf-case-contents__details">
        <summary
          id="case-contents-title"
          className="t-meta pf-case-contents__summary"
        >
          {caseCopy.contents}
        </summary>
        <ContentsList {...props} />
      </details>
    </nav>
  );
}

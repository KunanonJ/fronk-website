import { useEffect, useRef } from "react";
import { ChromeProvider, useChrome } from "@/components/bento/ChromeContext";
import { ArrowUpRightIcon } from "@/components/bento/icons";
import SharePanel from "@/components/bento/SharePanel";
import SharePill from "@/components/bento/SharePill";
import { pillClass } from "@/components/ds/Pill";
import type { CaseLink } from "@/lib/content/caseStudy";
import { cn } from "@/lib/utils/cn";

/*
 * The case hero's pills (profile redesign Phase 5, design spec 9.2 and 13
 * item 27): the public site or the source in a new tab, then the existing
 * Share pill. SharePill is reused as it is: it opens the share panel through
 * the bento chrome's state, which the live header provides and the preview
 * chrome does not, so this row provides it, and draws the same panel under
 * itself. Escape closes it and returns focus to the pill; a press outside the
 * row closes it, and so does focus that moves out of the row (Tab past the
 * panel), which leaves focus where it went: the panel would cover it there
 * (WCAG 2.4.11). Styles: `.pf-case-actions*` in src/styles/profile/case.css.
 */

function ShareRow({ external }: { external?: CaseLink }) {
  const { panel, close } = useChrome();
  const row = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (panel !== "share") return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close(true);
    };
    const onPointer = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (target && row.current?.contains(target)) return;
      close();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [panel, close]);

  return (
    <div
      ref={row}
      className="pf-case-actions"
      onBlur={(event) => {
        // Focus going nowhere (another window, the share sheet) keeps it open.
        const next = event.relatedTarget;
        if (
          panel === "share" &&
          next instanceof Node &&
          !event.currentTarget.contains(next)
        ) {
          close();
        }
      }}
    >
      {external ? (
        <a
          href={external.href}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            pillClass({ variant: "ghost", size: "lg" }),
            "pf-case-actions__external",
          )}
        >
          <span>
            {external.label}{" "}
            <span className="sr-only">(opens in a new tab)</span>
          </span>
          <span className="pf-case-actions__arrow" aria-hidden="true">
            <ArrowUpRightIcon size={16} />
          </span>
        </a>
      ) : null}
      <SharePill />
      {panel === "share" ? (
        <div className="pf-case-actions__panel">
          <SharePanel />
        </div>
      ) : null}
    </div>
  );
}

export function CaseActions({ external }: { external?: CaseLink }) {
  return (
    <ChromeProvider>
      <ShareRow external={external} />
    </ChromeProvider>
  );
}

import { useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";
import type { Preview } from "@/components/profile/site/preview/LinkPreviews";
import previewCss from "@/src/styles/preview.css?url";

/*
 * A link preview's card (LinkPreviews), loaded on first use with its
 * stylesheet. A manual popover, so it sits above everything without a
 * z-index; a tooltip that describes its link while it shows. Placed under
 * the link, or above it when there is no room, inside the screen, and kept
 * there as the page scrolls (keyboard focus scrolls smoothly to its link);
 * hidden while the link is off the screen.
 */

/** Between the link and the card, and the card and the screen's edge. */
const GAP = 8;
const EDGE = 16;

export default function PreviewCard({
  preview,
  id,
}: {
  preview: Preview;
  id: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { entry, link } = preview;

  useLayoutEffect(() => {
    const card = ref.current;
    if (!card) return;
    if (typeof card.showPopover === "function") card.showPopover();
    const place = () => {
      const box = link.getBoundingClientRect();
      card.style.visibility =
        box.bottom < 0 || box.top > innerHeight ? "hidden" : "";
      const below = box.bottom + GAP + card.offsetHeight <= innerHeight - EDGE;
      const top = below
        ? box.bottom + GAP
        : Math.max(EDGE, box.top - GAP - card.offsetHeight);
      const left = Math.min(
        Math.max(EDGE, box.left),
        innerWidth - card.offsetWidth - EDGE,
      );
      card.style.top = `${Math.round(top)}px`;
      card.style.left = `${Math.round(left)}px`;
      // The side it opened on picks its entrance; a later flip keeps it.
      card.dataset.side ??= below ? "below" : "above";
    };
    place();
    window.addEventListener("scroll", place, { passive: true });
    window.addEventListener("resize", place);
    link.setAttribute("aria-describedby", id);
    return () => {
      window.removeEventListener("scroll", place);
      window.removeEventListener("resize", place);
      link.removeAttribute("aria-describedby");
    };
  }, [link, id]);

  return createPortal(
    <>
      <link rel="stylesheet" href={previewCss} precedence="pf-preview" />
      <div
        ref={ref}
        id={id}
        role="tooltip"
        popover="manual"
        className="pf-preview"
        lang={entry.lang}
      >
        {entry.meta ? (
          <p className="t-meta pf-preview__meta">{entry.meta}</p>
        ) : null}
        <p className="pf-preview__title">{entry.title}</p>
        <p className="pf-preview__summary">{entry.summary}</p>
      </div>
    </>,
    document.body,
  );
}

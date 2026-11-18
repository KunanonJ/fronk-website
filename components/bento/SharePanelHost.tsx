import { useEffect, useRef } from "react";
import { useChrome } from "@/components/bento/ChromeContext";
import SharePanel from "@/components/bento/SharePanel";

/** Buttons that open the share panel: the hero Share pills. */
const PANEL_TRIGGERS = "[data-panel-trigger]";

/*
 * The share panel of the hero Share pills on the pages Phase 7 restyles
 * (profile redesign, Phase 6; design spec 13 item 27). The old header drew it
 * and owned its Escape and outside-press handling; the pill nav has no Share
 * button, so the layout draws the panel under the bar's right end, where the
 * old header put it. A press outside the panel and the pill closes it;
 * navigating closes it (ChromeProvider). Focus that moves outside both closes
 * it too and stays where it went, as the case pages' row does
 * (components/profile/case/CaseActions): the panel would cover it there
 * (WCAG 2.4.11). Focus going nowhere (another window, the share sheet) keeps
 * it open. Escape closes it, and sends focus back to the pill only from the
 * panel or the pill. Print drops it, as it drops the skip link.
 */
export default function SharePanelHost() {
  const { panel, close } = useChrome();
  const ref = useRef<HTMLDivElement>(null);
  const open = panel === "share";

  useEffect(() => {
    if (!open) return;
    /** The panel, or a pill that opens it. */
    const holds = (node: EventTarget | null): boolean =>
      node instanceof Element &&
      (Boolean(ref.current?.contains(node)) ||
        node.closest(PANEL_TRIGGERS) !== null);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close(holds(document.activeElement));
    };
    const onPointer = (event: PointerEvent) => {
      if (!holds(event.target)) close();
    };
    // Focus leaving the panel or the pill for a place outside both.
    const onFocusOut = (event: FocusEvent) => {
      if (
        holds(event.target) &&
        event.relatedTarget instanceof Element &&
        !holds(event.relatedTarget)
      ) {
        close();
      }
    };
    // Focus coming back from the browser's own UI onto the page outside both:
    // the panel is last in the page, so in a browser Tab past its last row
    // leaves the page, and the next Tab lands on the skip link.
    const onFocusIn = (event: FocusEvent) => {
      const target = event.target;
      if (
        target instanceof Element &&
        target !== document.body &&
        !holds(target)
      ) {
        close();
      }
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("focusout", onFocusOut);
    document.addEventListener("focusin", onFocusIn);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("focusout", onFocusOut);
      document.removeEventListener("focusin", onFocusIn);
    };
  }, [open, close]);

  if (!open) return null;
  return (
    // The bar's row, in the chrome's token scope as the bar is: --bar-top
    // from the top, --bar-row tall, inside the page gutter (--pad). The
    // panel hangs 60 px below the row's top, right-aligned, as before.
    // Fixed, so print would draw it over the page: the print rule in
    // globals.css drops [data-print-hide].
    <div
      ref={ref}
      lang="en"
      data-design="profile"
      data-print-hide
      className="pointer-events-none fixed top-[var(--bar-top)] right-[var(--pad)] z-[85] h-[var(--bar-row)] w-[min(340px,calc(100vw-32px))] [&>*]:pointer-events-auto"
    >
      <SharePanel />
    </div>
  );
}

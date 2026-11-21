import { useEffect, useId, useState } from "react";
import { FeatureBoundary, lazyFeature } from "@/components/ui/LazyFeature";
import { loadSearchIndex, type SearchEntry } from "@/lib/search/match";

/*
 * Link previews (premium interactions, item 6): a case study's text link
 * (in prose, a text link or a hub's link list) shows a small card with the
 * case's eyebrow, name and tagline: after 400 ms under a fine pointer, at
 * once on keyboard focus. The cards around the site that open a case show
 * it already, so they have none. WCAG 1.4.13: Esc dismisses it, the pointer
 * can move onto it, and it stays until the pointer or focus leaves. Touch
 * just navigates. One delegated listener; the card's code, its stylesheet
 * and the index (/search.json) load on first use, while the delay runs.
 */

const PreviewCard = lazyFeature(
  () => import("@/components/profile/site/preview/PreviewCard"),
);

/** The links that preview: a case study's, in running text. */
export const PREVIEW_LINKS =
  'a:is(.ds-prose-link, .ds-text-link, .pf-hub-links__link):is([href^="/portfolio/"], [href^="/ventures/"])';

/** Under the pointer, a preview waits this long, so passing over is calm. */
const HOVER_MS = 400;
/** On keyboard focus. */
const FOCUS_MS = 120;
/** Leaving the link or the card: time to cross the gap between them. */
const LEAVE_MS = 160;

export interface Preview {
  readonly entry: SearchEntry;
  readonly link: HTMLAnchorElement;
}

/** The index entry for a link's page, unless it is this page. */
async function entryFor(link: HTMLAnchorElement): Promise<SearchEntry | null> {
  const path = new URL(link.href).pathname.replace(/(.)\/$/, "$1");
  if (path === window.location.pathname) return null;
  const index = await loadSearchIndex();
  return index.find((entry) => entry.path === path) ?? null;
}

export function LinkPreviews() {
  const [preview, setPreview] = useState<Preview | null>(null);
  const id = useId();

  useEffect(() => {
    let showTimer = 0;
    let hideTimer = 0;
    /** Bumped on every show and hide, so a late lookup cannot reopen it. */
    let turn = 0;
    let pending: HTMLAnchorElement | null = null;
    let shown: HTMLAnchorElement | null = null;
    let touch = false;

    const linkOf = (target: EventTarget | null) =>
      target instanceof Element
        ? target.closest<HTMLAnchorElement>(PREVIEW_LINKS)
        : null;
    const inCard = (target: EventTarget | null) =>
      target instanceof Element && target.closest(".pf-preview") !== null;

    const show = (link: HTMLAnchorElement, delay: number) => {
      window.clearTimeout(hideTimer);
      if (link === shown || link === pending) return;
      window.clearTimeout(showTimer);
      pending = link;
      const mine = ++turn;
      // Warm the card and the index while the delay runs.
      PreviewCard.preload();
      void loadSearchIndex().catch(() => undefined);
      showTimer = window.setTimeout(() => {
        void entryFor(link)
          .catch(() => null)
          .then((entry) => {
            if (mine !== turn || !entry || !link.isConnected) return;
            pending = null;
            shown = link;
            setPreview({ entry, link });
          });
      }, delay);
    };

    const hide = (delay: number) => {
      window.clearTimeout(showTimer);
      window.clearTimeout(hideTimer);
      pending = null;
      turn += 1;
      const close = () => {
        shown = null;
        setPreview(null);
      };
      if (delay === 0) close();
      else hideTimer = window.setTimeout(close, delay);
    };

    const onPointerOver = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      const link = linkOf(event.target);
      if (link) show(link, HOVER_MS);
      else if (inCard(event.target)) window.clearTimeout(hideTimer);
    };
    const onPointerOut = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      const from =
        linkOf(event.target) ?? (inCard(event.target) ? shown : null);
      if (!from) return;
      const to = event.relatedTarget;
      if (inCard(to) || (to instanceof Node && from.contains(to))) return;
      if (linkOf(to) === from) return;
      hide(LEAVE_MS);
    };
    const onPointerDown = (event: PointerEvent) => {
      touch = event.pointerType === "touch";
      if (!inCard(event.target)) hide(0);
    };
    const onFocusIn = (event: FocusEvent) => {
      const link = linkOf(event.target);
      if (!link || touch || !link.matches(":focus-visible")) return;
      show(link, FOCUS_MS);
    };
    const onFocusOut = (event: FocusEvent) => {
      if (linkOf(event.target)) hide(0);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      touch = false;
      if (event.key === "Escape" || event.key === "Enter") hide(0);
    };

    document.addEventListener("pointerover", onPointerOver);
    document.addEventListener("pointerout", onPointerOut);
    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("focusout", onFocusOut);
    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(hideTimer);
      document.removeEventListener("pointerover", onPointerOver);
      document.removeEventListener("pointerout", onPointerOut);
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("focusout", onFocusOut);
      document.removeEventListener("keydown", onKeyDown, true);
    };
  }, []);

  return preview ? (
    <FeatureBoundary key={preview.entry.path}>
      <PreviewCard preview={preview} id={id} />
    </FeatureBoundary>
  ) : null;
}

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { PixelPortrait } from "@/components/profile/site/PixelPortrait";
import type { ProfileLink } from "@/components/profile/site/ProfileLink";
import type { TraitNews } from "@/lib/brand/traitEvents";
import { PORTRAIT_TRAITS, wornPortrait } from "@/lib/brand/portraitTraits";
import { readTraits } from "@/lib/brand/traitStore";
import { secretsCopy } from "@/lib/content/secretsCopy";
import secretsCss from "@/src/styles/secrets.css?url";

/*
 * The found-trait toast (now-building-and-genz Phase 3), loaded by Secrets
 * when a trait is first found anywhere but /about's own button: the nav's
 * cut wearing it, "You found Shades · 2/6", and a link to /about's portrait.
 * Under the nav bar, clear of what the reader meets next where a trait is
 * found (the footer's links, the contact card's actions; secrets.css says
 * why). It goes by itself after 5 s, waits while the pointer or focus is on
 * it, and closes with its button or Esc. Its line is a polite status,
 * filled a frame after the region is in the page so it is read. While a
 * modal dialog is open (⌘K found the trait) it waits for the
 * dialog to close: everything else is inert until then. It slides in only
 * with motion allowed and never flashes. Its stylesheet comes with it
 * (src/styles/secrets.css). The shell hands it the nav's drawing, the
 * portrait and the link component it already has.
 */

/** How long the toast stays while nobody points at it or focuses it. */
export const TOAST_MS = 5000;

/** Links and controls: what the toast must not lie over. */
const TARGETS =
  "a[href], button, input, select, textarea, summary, [role='button']";

/** How many of the page's drawn links and controls `toast` lies over. */
function covered(toast: HTMLElement): number {
  const box = toast.getBoundingClientRect();
  let count = 0;
  for (const el of document.querySelectorAll(TARGETS)) {
    if (toast.contains(el)) continue;
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    if (
      r.left < box.right &&
      r.right > box.left &&
      r.top < box.bottom &&
      r.bottom > box.top
    ) {
      count += 1;
    }
  }
  return count;
}

/**
 * Where it stands, chosen once as it shows: under the bar, or at the foot of
 * the screen when the top would lie over a link or a control and the foot
 * over fewer (secrets.css).
 */
function place(toast: HTMLElement) {
  // Measured where it rests, not where its entrance starts.
  toast.style.animation = "none";
  const top = covered(toast);
  if (top > 0) {
    toast.dataset.place = "low";
    if (covered(toast) >= top) delete toast.dataset.place;
  }
  toast.style.removeProperty("animation");
}

export default function TraitToast({
  news,
  base,
  Portrait,
  Link,
  onClose,
}: {
  news: TraitNews;
  /** The nav's 16 x 16 cut, to dress. */
  base: readonly string[];
  Portrait: typeof PixelPortrait;
  Link: typeof ProfileLink;
  onClose: () => void;
}) {
  const [shown, setShown] = useState(
    () => !document.querySelector("dialog[open]"),
  );
  const [said, setSaid] = useState(false);
  const [held, setHeld] = useState({ pointer: false, focus: false });
  const [found] = useState(() => readTraits().found.length);
  const box = useRef<HTMLDivElement>(null);
  /** Where focus was before it came into the toast, to give it back. */
  const back = useRef<HTMLElement | null>(null);
  const closeRef = useRef(onClose);

  const label =
    PORTRAIT_TRAITS.find((trait) => trait.id === news.id)?.label ?? news.id;
  const { toast } = secretsCopy;
  const line = news.isNew
    ? toast.found(label, found, PORTRAIT_TRAITS.length)
    : toast.again(label);

  /** Closes it; focus inside goes back where it came from. */
  const close = () => {
    if (box.current?.contains(document.activeElement)) back.current?.focus();
    onClose();
  };
  useEffect(() => {
    closeRef.current = close;
  });

  // A modal dialog makes the page inert: wait until it closes.
  useEffect(() => {
    if (shown) return;
    const dialog = document.querySelector("dialog[open]");
    const show = () => setShown(true);
    if (!dialog) {
      // It closed before this ran.
      const frame = requestAnimationFrame(show);
      return () => cancelAnimationFrame(frame);
    }
    dialog.addEventListener("close", show, { once: true });
    return () => dialog.removeEventListener("close", show);
  }, [shown]);

  // Its place, before it paints: once its stylesheet has placed it (a few
  // frames at most; without the sheet it stays where it is).
  useLayoutEffect(() => {
    const toast = box.current;
    if (!shown || !toast) return;
    let frame = 0;
    let tries = 10;
    const settle = () => {
      if (getComputedStyle(toast).position === "fixed") place(toast);
      else if ((tries -= 1) > 0) frame = requestAnimationFrame(settle);
    };
    settle();
    return () => cancelAnimationFrame(frame);
  }, [shown]);

  // The region is in the page first, its words a frame later, so they are read.
  useEffect(() => {
    if (!shown) return;
    const frame = requestAnimationFrame(() => setSaid(true));
    return () => cancelAnimationFrame(frame);
  }, [shown]);

  // It goes after TOAST_MS, counted again whenever it is let go.
  const holding = held.pointer || held.focus;
  useEffect(() => {
    if (!shown || holding) return;
    const timer = window.setTimeout(() => closeRef.current(), TOAST_MS);
    return () => window.clearTimeout(timer);
  }, [shown, holding]);

  // Esc closes it, unless a dialog is open and Esc is the dialog's.
  useEffect(() => {
    if (!shown) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || event.defaultPrevented) return;
      if (document.querySelector("dialog[open]")) return;
      closeRef.current();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [shown]);

  if (!shown) return null;
  return (
    <>
      <link rel="stylesheet" href={secretsCss} precedence="pf-secrets" />
      <div
        ref={box}
        className="pf-toast"
        data-testid="trait-toast"
        onPointerEnter={() => setHeld((h) => ({ ...h, pointer: true }))}
        onPointerLeave={() => setHeld((h) => ({ ...h, pointer: false }))}
        onFocus={(event) => {
          const from = event.relatedTarget;
          if (!event.currentTarget.contains(from)) {
            back.current = from instanceof HTMLElement ? from : null;
          }
          setHeld((h) => ({ ...h, focus: true }));
        }}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) {
            setHeld((h) => ({ ...h, focus: false }));
          }
        }}
      >
        <Portrait
          rows={wornPortrait(base, news.id, found)}
          className="pf-toast__portrait"
        />
        <div className="pf-toast__text">
          <p role="status" className="pf-toast__line">
            {said ? line : ""}
          </p>
          <Link
            href="/about#portrait"
            className="pf-toast__link"
            onClick={onClose}
          >
            {toast.see}
          </Link>
        </div>
        <button
          type="button"
          className="pf-toast__close"
          aria-label={toast.dismiss}
          onClick={close}
        >
          {/* A cross, drawn here: the icon set's would tie this chunk to it. */}
          <svg
            viewBox="0 0 24 24"
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
    </>
  );
}

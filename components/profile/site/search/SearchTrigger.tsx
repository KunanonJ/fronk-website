import { useCallback, useEffect, useRef, useState } from "react";
import { FeatureBoundary, lazyFeature } from "@/components/ui/LazyFeature";
import { searchCopy } from "@/lib/content/profileChrome";

/*
 * Search (premium interactions, item 8): the nav's round button, from 810 px
 * beside the theme toggle, and ⌘K or Ctrl+K anywhere. The phone menu opens
 * the same dialog with `openSearch`. The dialog's code and stylesheet load
 * on first use (SearchDialog), so the first load carries only this button.
 * If its code fails to load, nothing opens and the page stays
 * (components/ui/LazyFeature.tsx); the search closes again, so the next
 * press, ⌘K or the menu's Search asks for it once more. If only the
 * stylesheet fails, the dialog opens plain, and the next open asks for the
 * stylesheet again and waits for it, 3 s at most.
 * No single-key shortcut: one would need an off switch (WCAG 2.1.4).
 *
 * Keys typed while it opens are kept for its field (UX hunt 22-11-26): the
 * first open loads the code and the stylesheet, a third of a second or
 * more, and the first letters of a quick "⌘K verify" were lost. From the
 * press until the dialog opens, a character joins the query, Backspace
 * takes one back, Enter is held from the page (it would press whatever has
 * focus there) and Escape gives the opening up; none of them reaches the
 * page, as none would from the field. The field starts with what was kept.
 * A press or focus moving elsewhere first ends the keeping, so the page is
 * the reader's again while the dialog takes its time, and so does a failed
 * load.
 */

const SearchDialog = lazyFeature(
  () => import("@/components/profile/site/search/SearchDialog"),
);

/** The event the phone menu's Search button sends. */
const OPEN_SEARCH = "pf:open-search";

/** Opens the search dialog from anywhere on the page. */
export function openSearch(): void {
  window.dispatchEvent(new Event(OPEN_SEARCH));
}

/**
 * The magnifier of the nav's button and the phone menu's Search: lucide's
 * Search at 18 px, drawn here in the markup lucide gives it. It was the
 * entry chunk's only lucide icon, and it brought lucide's icon runtime
 * into the chunk every page loads.
 */
export function SearchIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="lucide lucide-search"
      aria-hidden="true"
    >
      <path d="m21 21-4.34-4.34" />
      <circle cx="11" cy="11" r="8" />
    </svg>
  );
}

/** The keys typed while the dialog loads, which its field starts with. */
export interface TypedKeys {
  /** What was typed since the dialog was asked for. */
  keys: string;
  /** Whether keys are kept: from the press until the dialog opens, a press or focus moving. */
  keeping: boolean;
}

/** A key that types a character: one, with no shortcut modifier (AltGr types). */
function typesCharacter(event: KeyboardEvent): boolean {
  const chord =
    event.metaKey ||
    ((event.ctrlKey || event.altKey) && !event.getModifierState?.("AltGraph"));
  return !chord && [...event.key].length === 1;
}

export function SearchTrigger() {
  const [open, setOpen] = useState(false);
  /** Whether the dialog is asked for: `open`, without waiting for a render. */
  const asked = useRef(false);
  const typed = useRef<TypedKeys>({ keys: "", keeping: false });

  const show = useCallback(() => {
    if (asked.current) return;
    asked.current = true;
    typed.current = { keys: "", keeping: true };
    setOpen(true);
  }, []);
  const hide = useCallback(() => {
    asked.current = false;
    typed.current.keeping = false;
    setOpen(false);
  }, []);
  /** The dialog is open: what is typed now is its field's. */
  const opened = useCallback(() => {
    typed.current.keeping = false;
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (
        (event.metaKey || event.ctrlKey) &&
        !event.altKey &&
        !event.shiftKey &&
        event.key.toLowerCase() === "k"
      ) {
        event.preventDefault();
        show();
        return;
      }
      const kept = typed.current;
      if (!kept.keeping || event.isComposing) return;
      if (event.key === "Backspace") {
        kept.keys = [...kept.keys].slice(0, -1).join("");
      } else if (event.key === "Escape") {
        hide();
      } else if (typesCharacter(event)) {
        kept.keys += event.key;
      } else if (event.key !== "Enter") {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
    };
    /** The reader turns to the page: what they type next is the page's. */
    const release = () => {
      typed.current.keeping = false;
    };
    // Captured on the window, ahead of the page's own listeners.
    window.addEventListener("keydown", onKey, true);
    window.addEventListener("pointerdown", release, true);
    window.addEventListener("focusin", release, true);
    window.addEventListener(OPEN_SEARCH, show);
    return () => {
      window.removeEventListener("keydown", onKey, true);
      window.removeEventListener("pointerdown", release, true);
      window.removeEventListener("focusin", release, true);
      window.removeEventListener(OPEN_SEARCH, show);
    };
  }, [show, hide]);

  return (
    <>
      <button
        type="button"
        className="pf-search-toggle"
        aria-label={searchCopy.open}
        aria-haspopup="dialog"
        aria-keyshortcuts="Meta+K Control+K"
        title={`${searchCopy.open} (${searchCopy.shortcut})`}
        onClick={show}
        // Starts loading the dialog before it is asked for.
        onPointerEnter={SearchDialog.preload}
        onFocus={SearchDialog.preload}
      >
        <SearchIcon />
      </button>
      {open ? (
        <FeatureBoundary onFail={hide}>
          <SearchDialog onClose={hide} onOpen={opened} typedRef={typed} />
        </FeatureBoundary>
      ) : null}
    </>
  );
}

import { useEffect, useState } from "react";
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
 * stylesheet again and waits for it.
 * No single-key shortcut: one would need an off switch (WCAG 2.1.4).
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

export function SearchTrigger() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (
        (event.metaKey || event.ctrlKey) &&
        !event.altKey &&
        !event.shiftKey &&
        event.key.toLowerCase() === "k"
      ) {
        event.preventDefault();
        setOpen(true);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener(OPEN_SEARCH, onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(OPEN_SEARCH, onOpen);
    };
  }, []);

  return (
    <>
      <button
        type="button"
        className="pf-search-toggle"
        aria-label={searchCopy.open}
        aria-haspopup="dialog"
        aria-keyshortcuts="Meta+K Control+K"
        title={`${searchCopy.open} (${searchCopy.shortcut})`}
        onClick={() => setOpen(true)}
        // Starts loading the dialog before it is asked for.
        onPointerEnter={SearchDialog.preload}
        onFocus={SearchDialog.preload}
      >
        <SearchIcon />
      </button>
      {open ? (
        <FeatureBoundary onFail={() => setOpen(false)}>
          <SearchDialog onClose={() => setOpen(false)} />
        </FeatureBoundary>
      ) : null}
    </>
  );
}

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { FeatureBoundary, lazyFeature } from "@/components/ui/LazyFeature";
import { searchCopy } from "@/lib/content/profileChrome";

/*
 * Search (premium interactions, item 8): the nav's round button, from 810 px
 * beside the theme toggle, and ⌘K or Ctrl+K anywhere. The phone menu opens
 * the same dialog with `openSearch`. The dialog's code and stylesheet load
 * on first use (SearchDialog), so the first load carries only this button.
 * If they fail to load, nothing opens and the page stays
 * (components/ui/LazyFeature.tsx).
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
        <Search size={18} strokeWidth={1.8} aria-hidden="true" />
      </button>
      {open ? (
        <FeatureBoundary>
          <SearchDialog onClose={() => setOpen(false)} />
        </FeatureBoundary>
      ) : null}
    </>
  );
}

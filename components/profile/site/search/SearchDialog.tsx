import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import { createPortal } from "react-dom";
import { useRouter } from "@tanstack/react-router";
import { Search, X } from "lucide-react";
import { searchCopy } from "@/lib/content/profileChrome";
import {
  groupResults,
  loadSearchIndex,
  searchEntries,
  type SearchEntry,
} from "@/lib/search/match";
import searchCss from "@/src/styles/search.css?url";

/*
 * The search dialog (premium interactions, item 8), loaded on first use by
 * SearchTrigger. A native modal <dialog>: it holds focus, Esc closes it, a
 * press on the backdrop closes it, and closing returns focus where it was.
 * Inside, an ARIA combobox: the field keeps focus, the arrows move through
 * the results (aria-activedescendant), Enter opens one, and a polite line
 * says how many there are. The index (/search.json) is fetched on first
 * open. Its stylesheet comes with it (React holds the dialog until it has
 * loaded), so none of this weighs on a page's first load.
 */

export default function SearchDialog({ onClose }: { onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const router = useRouter();
  const id = useId();
  const [entries, setEntries] = useState<SearchEntry[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  useEffect(() => {
    const el = dialog.current;
    if (el && !el.open) el.showModal();
  }, []);

  useEffect(() => {
    let live = true;
    loadSearchIndex().then(
      (list) => {
        if (live) setEntries(list);
      },
      () => {
        if (live) setFailed(true);
      },
    );
    return () => {
      live = false;
    };
  }, []);

  const groups = useMemo(
    () => (entries ? groupResults(searchEntries(entries, query)) : []),
    [entries, query],
  );
  const results = groups.flatMap((group) => group.entries);
  /** Each group's first result's place in `results`. */
  const starts = groups.map((_, g) =>
    groups.slice(0, g).reduce((sum, group) => sum + group.entries.length, 0),
  );
  const current = Math.min(active, Math.max(0, results.length - 1));
  const optionId = (at: number) => `${id}-option-${at}`;

  // The active result stays in view as the arrows move through a long list.
  useEffect(() => {
    document
      .getElementById(`${id}-option-${current}`)
      ?.scrollIntoView({ block: "nearest" });
  }, [id, current]);

  const open = (entry: SearchEntry) => {
    dialog.current?.close();
    void router.navigate({ to: entry.path as never });
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (results.length === 0) return;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const step = event.key === "ArrowDown" ? 1 : -1;
      setActive((current + step + results.length) % results.length);
    } else if (event.key === "Enter") {
      event.preventDefault();
      open(results[current]!);
    }
  };

  const onBackdrop = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === event.currentTarget) event.currentTarget.close();
  };

  const note = failed
    ? searchCopy.failed
    : entries === null
      ? searchCopy.loading
      : results.length === 0
        ? searchCopy.empty(query.trim())
        : null;

  return createPortal(
    <>
      <link rel="stylesheet" href={searchCss} precedence="pf-search" />
      <dialog
        ref={dialog}
        className="pf-search"
        aria-labelledby={`${id}-label`}
        onClose={onClose}
        onClick={onBackdrop}
      >
        <div className="pf-search__field">
          <Search
            className="pf-search__icon"
            size={18}
            strokeWidth={1.8}
            aria-hidden="true"
          />
          <label id={`${id}-label`} htmlFor={`${id}-input`} className="sr-only">
            {searchCopy.open}
          </label>
          <input
            id={`${id}-input`}
            className="pf-search__input"
            type="text"
            role="combobox"
            aria-expanded={results.length > 0}
            aria-controls={`${id}-list`}
            aria-autocomplete="list"
            aria-activedescendant={
              results.length > 0 ? optionId(current) : undefined
            }
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            enterKeyHint="go"
            placeholder={searchCopy.placeholder}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActive(0);
            }}
            onKeyDown={onKeyDown}
            autoFocus
          />
          {/* A keyboard closes with Esc, named here; touch gets a button. */}
          <kbd className="pf-search__key" aria-hidden="true">
            {searchCopy.closeKey}
          </kbd>
          <button
            type="button"
            className="pf-search__close"
            aria-label={searchCopy.close}
            onClick={() => dialog.current?.close()}
          >
            <X size={18} strokeWidth={1.8} aria-hidden="true" />
          </button>
        </div>
        <div className="pf-search__body">
          {note ? <p className="pf-search__note">{note}</p> : null}
          <div
            id={`${id}-list`}
            role="listbox"
            aria-labelledby={`${id}-label`}
            className="pf-search__list"
            hidden={results.length === 0}
          >
            {groups.map((group, g) => (
              <div
                key={group.kind}
                role="group"
                aria-label={searchCopy.groups[group.kind]}
              >
                <p className="t-meta pf-search__group" aria-hidden="true">
                  {searchCopy.groups[group.kind]}
                </p>
                {group.entries.map((entry, i) => {
                  const mine = starts[g]! + i;
                  return (
                    <div
                      key={entry.path}
                      id={optionId(mine)}
                      role="option"
                      aria-selected={mine === current}
                      lang={entry.lang}
                      className="pf-search__option"
                      onPointerMove={() => {
                        if (mine !== current) setActive(mine);
                      }}
                      onClick={() => open(entry)}
                    >
                      <span className="pf-search__title">{entry.title}</span>
                      <span className="pf-search__summary">
                        {entry.meta ? `${entry.meta} · ` : ""}
                        {entry.summary}
                      </span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
        <p className="pf-search__foot" aria-hidden="true">
          {searchCopy.hints.map((hint) => (
            <span key={hint}>{hint}</span>
          ))}
        </p>
        <p className="sr-only" aria-live="polite">
          {entries ? searchCopy.count(results.length) : ""}
        </p>
      </dialog>
    </>,
    document.body,
  );
}

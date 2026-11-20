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
import { award } from "@/lib/brand/traitStore";
import { sayHello, searchCopy } from "@/lib/content/profileChrome";
import { secretsCopy } from "@/lib/content/secretsCopy";
import {
  matchCommands,
  randomCase,
  type SearchCommand,
} from "@/lib/search/commands";
import {
  groupResults,
  loadSearchIndex,
  searchEntries,
  type SearchEntry,
} from "@/lib/search/match";
import { writeClipboard } from "@/lib/utils/clipboard";
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
 *
 * Commands (now-building-and-genz Phase 3; lib/search/commands.ts): a query
 * that starts with "/" lists them in a "Commands" group instead, in the same
 * listbox, and Enter runs one. Some leave (/party, /theme, /random, the
 * pages); some answer in a line under the field, which the polite line reads
 * too (/copy email, /shortcuts, and the two hidden ones, which find the Gold
 * earring trait).
 */

/** An answer under the field: its words, and the shortcuts for /shortcuts. */
interface Answer {
  readonly line: string;
  readonly shortcuts?: boolean;
}

const { commands: commandCopy } = secretsCopy;
/** The public address (the Say hello popover's, siteConfig's). */
const EMAIL = sayHello.address;

/** One option of the listbox: a result, or a command (`command`). */
function SearchOption({
  id,
  selected,
  title,
  summary,
  lang,
  command,
  onPoint,
  onPick,
}: {
  id: string;
  selected: boolean;
  title: string;
  summary: string;
  lang?: string;
  command?: boolean;
  onPoint: () => void;
  onPick: () => void;
}) {
  return (
    <div
      id={id}
      role="option"
      aria-selected={selected}
      lang={lang}
      className="pf-search__option"
      onPointerMove={onPoint}
      onClick={onPick}
    >
      <span
        className={
          command ? "pf-search__title pf-search__command" : "pf-search__title"
        }
      >
        {title}
      </span>
      <span className="pf-search__summary">{summary}</span>
    </div>
  );
}

export default function SearchDialog({ onClose }: { onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const router = useRouter();
  const id = useId();
  const [entries, setEntries] = useState<SearchEntry[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [answer, setAnswer] = useState<Answer | null>(null);

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

  const commands = useMemo(() => matchCommands(query), [query]);
  const groups = useMemo(
    () =>
      entries && !commands ? groupResults(searchEntries(entries, query)) : [],
    [entries, query, commands],
  );
  const results = groups.flatMap((group) => group.entries);
  const count = commands ? commands.length : results.length;
  /** Each group's first result's place in `results`. */
  const starts = groups.map((_, g) =>
    groups.slice(0, g).reduce((sum, group) => sum + group.entries.length, 0),
  );
  const current = Math.min(active, Math.max(0, count - 1));
  const optionId = (at: number) => `${id}-option-${at}`;

  // The active result stays in view as the arrows move through a long list.
  useEffect(() => {
    document
      .getElementById(`${id}-option-${current}`)
      ?.scrollIntoView({ block: "nearest" });
  }, [id, current]);

  const go = (to: string, hash?: string) => {
    dialog.current?.close();
    void router.navigate({ to: to as never, hash });
  };

  const open = (entry: SearchEntry) => go(entry.path);

  /** Runs a command: some leave the dialog, some answer in it. */
  const run = (command: SearchCommand) => {
    switch (command.id) {
      case "party":
        dialog.current?.close();
        void import("@/components/profile/site/secrets/pixelParty").then(
          (party) => party.startParty(),
        );
        return;
      case "theme-light":
      case "theme-dark": {
        dialog.current?.close();
        // The nav's toggle (in every page's nav, shown or not) switches the
        // way a press on it does: the fade, and the guard on transitions.
        const dark = command.id === "theme-dark";
        if (document.documentElement.classList.contains("dark") !== dark) {
          document
            .querySelector<HTMLButtonElement>(".pf-theme-toggle")
            ?.click();
        }
        return;
      }
      case "copy-email":
        void writeClipboard(EMAIL).then((ok) =>
          setAnswer({
            line: ok
              ? commandCopy.copied(EMAIL)
              : commandCopy.copyFailed(EMAIL),
          }),
        );
        return;
      case "random":
        loadSearchIndex().then(
          (list) => {
            const pick = randomCase(list);
            if (pick) open(pick);
          },
          () => setAnswer({ line: searchCopy.failed }),
        );
        return;
      case "traits":
        go("/about", "portrait");
        return;
      case "resume":
      case "contact":
        go(`/${command.id}`);
        return;
      case "shortcuts":
        setAnswer({ line: commandCopy.shortcutsTitle, shortcuts: true });
        return;
      case "sudo":
      case "gm":
        setAnswer({ line: commandCopy[command.id] });
        award("earring", "search");
        return;
    }
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (count === 0) return;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const step = event.key === "ArrowDown" ? 1 : -1;
      setActive((current + step + count) % count);
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (commands) run(commands[current]!);
      else open(results[current]!);
    }
  };

  const onBackdrop = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === event.currentTarget) event.currentTarget.close();
  };

  const note = commands
    ? commands.length === 0
      ? commandCopy.none(query.trim())
      : null
    : failed
      ? searchCopy.failed
      : entries === null
        ? searchCopy.loading
        : results.length === 0
          ? searchCopy.empty(query.trim())
          : null;

  /** What the polite line says: the answer, else how many there are. */
  const said = answer
    ? answer.shortcuts
      ? `${answer.line}: ${commandCopy.shortcuts.map((keys) => keys.join(", ")).join(". ")}.`
      : answer.line
    : commands
      ? commandCopy.count(commands.length)
      : entries
        ? searchCopy.count(results.length)
        : "";

  /** The props every option shares: its place, and pointing at it. */
  const place = (at: number) => ({
    id: optionId(at),
    selected: at === current,
    onPoint: () => {
      if (at !== current) setActive(at);
    },
  });

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
            aria-expanded={count > 0}
            aria-controls={`${id}-list`}
            aria-autocomplete="list"
            aria-activedescendant={count > 0 ? optionId(current) : undefined}
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            enterKeyHint="go"
            placeholder={searchCopy.placeholder}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActive(0);
              setAnswer(null);
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
          {answer ? (
            // The polite line below reads it out as it comes.
            <div className="pf-search__answer">
              <p className="pf-search__answer-line">{answer.line}</p>
              {answer.shortcuts ? (
                <dl className="pf-search__keys">
                  {commandCopy.shortcuts.map(([keys, does]) => (
                    <div key={keys}>
                      <dt>
                        <kbd>{keys}</kbd>
                      </dt>
                      <dd>{does}</dd>
                    </div>
                  ))}
                </dl>
              ) : null}
            </div>
          ) : null}
          {note ? <p className="pf-search__note">{note}</p> : null}
          <div
            id={`${id}-list`}
            role="listbox"
            aria-labelledby={`${id}-label`}
            className="pf-search__list"
            hidden={count === 0}
          >
            {commands ? (
              <div role="group" aria-label={commandCopy.group}>
                <p className="t-meta pf-search__group" aria-hidden="true">
                  {commandCopy.group}
                </p>
                {commands.map((command, at) => (
                  <SearchOption
                    key={command.id}
                    {...place(at)}
                    title={command.name}
                    summary={command.summary}
                    command
                    onPick={() => run(command)}
                  />
                ))}
              </div>
            ) : (
              groups.map((group, g) => (
                <div
                  key={group.kind}
                  role="group"
                  aria-label={searchCopy.groups[group.kind]}
                >
                  <p className="t-meta pf-search__group" aria-hidden="true">
                    {searchCopy.groups[group.kind]}
                  </p>
                  {group.entries.map((entry, i) => (
                    <SearchOption
                      key={entry.path}
                      {...place(starts[g]! + i)}
                      title={entry.title}
                      summary={`${entry.meta ? `${entry.meta} · ` : ""}${entry.summary}`}
                      lang={entry.lang}
                      onPick={() => open(entry)}
                    />
                  ))}
                </div>
              ))
            )}
          </div>
        </div>
        <p className="pf-search__foot" aria-hidden="true">
          {searchCopy.hints.map((hint) => (
            <span key={hint}>{hint}</span>
          ))}
        </p>
        <p className="sr-only" aria-live="polite">
          {said}
        </p>
      </dialog>
    </>,
    document.body,
  );
}

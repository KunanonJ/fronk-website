import {
  FOUND_KEY,
  TRAITS_EVENT,
  WORN_KEY,
  type TraitNews,
} from "@/lib/brand/traitEvents";
import { PORTRAIT_TRAITS, wornPortrait } from "@/lib/brand/portraitTraits";

/*
 * The visitor's traits (owner, 20-11-26; now-building-and-genz Phase 3):
 * which of the portrait's six traits they have found, and the one they wear.
 * /about's "Try a trait" finds them in turn; around the site the visitor
 * finds them (the pixel party, the end of a case, a contact draft, a ⌘K
 * secret, a first sticker on Home's canvas, the 404 patched). Kept on this
 * device only, under the keys /about has used since the portrait shipped, so
 * nothing found before is lost. Where storage is blocked they last as long as
 * the page.
 *
 * A store for useSyncExternalStore(subscribeTraits, readTraits,
 * serverTraits): the server's snapshot is nothing found, so the server and
 * hydration draw the plain portrait and never mismatch; the saved traits
 * arrive in the render after. Every change is also sent on window
 * (TRAITS_EVENT): the shell, which does not load this module until a trait
 * is found, listens for it to show the toast and dress the nav's avatar.
 */

export interface Traits {
  readonly found: readonly string[];
  readonly worn: string | null;
}

/** Where a trait was found. /about's own button says so itself: no toast. */
export type TraitSource =
  "about" | "party" | "case" | "contact" | "search" | "canvas" | "notfound";

const NOTHING: Traits = { found: [], worn: null };
const listeners = new Set<() => void>();
let cached: { raw: string; traits: Traits } | undefined;
/** The traits once storage has refused a write: kept for the page's life. */
let memory: Traits | undefined;

const known = (id: unknown): id is string =>
  PORTRAIT_TRAITS.some((trait) => trait.id === id);

/** The saved traits; the same object until they change. */
export function readTraits(): Traits {
  if (memory) return memory;
  try {
    const found = localStorage.getItem(FOUND_KEY);
    const worn = localStorage.getItem(WORN_KEY);
    const raw = `${found}|${worn}`;
    if (cached?.raw !== raw) {
      const list: unknown = JSON.parse(found ?? "[]");
      cached = {
        raw,
        traits: {
          found: Array.isArray(list) ? [...new Set(list.filter(known))] : [],
          worn: known(worn) ? worn : null,
        },
      };
    }
    return cached.traits;
  } catch {
    return NOTHING;
  }
}

/** The server's snapshot, and hydration's: nothing found. */
export const serverTraits = (): Traits => NOTHING;

/** Calls `listener` on every change, here or in another tab. */
export function subscribeTraits(listener: () => void): () => void {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

/** Tells the page: the toast shows news; the nav redraws either way. */
export function tell(news: TraitNews | null): void {
  window.dispatchEvent(new CustomEvent(TRAITS_EVENT, { detail: news }));
}

function save(traits: Traits, news: TraitNews | null): void {
  try {
    localStorage.setItem(FOUND_KEY, JSON.stringify(traits.found));
    if (traits.worn) localStorage.setItem(WORN_KEY, traits.worn);
    else localStorage.removeItem(WORN_KEY);
  } catch {
    memory = traits;
  }
  listeners.forEach((listener) => listener());
  tell(news);
}

/** Puts on a trait (found or not: /about tries them all). */
export function wear(id: string): void {
  if (known(id)) save({ ...readTraits(), worn: id }, null);
}

/**
 * Marks a trait found and puts it on; true when it is new. A new one found
 * anywhere but /about's button is news for the toast.
 */
export function award(id: string, source: TraitSource): boolean {
  const { found } = readTraits();
  if (!known(id) || found.includes(id)) return false;
  save(
    { found: [...found, id], worn: id },
    source === "about" ? null : { id, isNew: true },
  );
  return true;
}

/**
 * Keeps a drawing (the nav's cut) dressed as the visitor has it: `set` gets
 * it now and after every change. Returns the unsubscribe.
 */
export function watchAvatar(
  base: readonly string[],
  set: (rows: readonly string[]) => void,
): () => void {
  const draw = () => {
    const { worn, found } = readTraits();
    set(wornPortrait(base, worn, found.length));
  };
  draw();
  return subscribeTraits(draw);
}

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PORTRAIT_SMALL } from "@/lib/brand/pixelPortrait";
import { withTrait, PORTRAIT_TRAITS } from "@/lib/brand/portraitTraits";
import {
  FOUND_KEY,
  TRAITS_EVENT,
  WORN_KEY,
  type TraitNews,
} from "@/lib/brand/traitEvents";

/*
 * The visitor's traits (now-building-and-genz Phase 3): kept under the keys
 * /about has always used, told to the shell on every change (news only for a
 * trait found away from /about's button), the plain portrait on the server,
 * and the page's memory when storage refuses.
 */

type Store = typeof import("@/lib/brand/traitStore");

/** A fresh store module: its cache and memory start empty. */
async function freshStore(): Promise<Store> {
  vi.resetModules();
  return import("@/lib/brand/traitStore");
}

/** Every `detail` sent on TRAITS_EVENT while the test runs. */
function told(): (TraitNews | null)[] {
  const said: (TraitNews | null)[] = [];
  window.addEventListener(TRAITS_EVENT, (event) =>
    said.push((event as CustomEvent<TraitNews | null>).detail),
  );
  return said;
}

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("the trait store", () => {
  it("keeps the keys /about has used since the portrait shipped", () => {
    expect(FOUND_KEY).toBe("pf-portrait-found");
    expect(WORN_KEY).toBe("pf-portrait-worn");
  });

  it("starts with nothing found, and the server always has nothing", async () => {
    const store = await freshStore();
    expect(store.readTraits()).toEqual({ found: [], worn: null });
    localStorage.setItem(FOUND_KEY, JSON.stringify(["shades"]));
    expect(store.serverTraits()).toEqual({ found: [], worn: null });
  });

  it("reads what /about saved before, leaving out what it does not know", async () => {
    localStorage.setItem(
      FOUND_KEY,
      JSON.stringify(["cap", "nope", "cap", 7, "pin"]),
    );
    localStorage.setItem(WORN_KEY, "pin");
    const store = await freshStore();
    expect(store.readTraits()).toEqual({ found: ["cap", "pin"], worn: "pin" });
    // The same object until something changes, as useSyncExternalStore needs.
    expect(store.readTraits()).toBe(store.readTraits());
    localStorage.setItem(WORN_KEY, "mystery");
    expect(store.readTraits().worn).toBeNull();
    localStorage.setItem(FOUND_KEY, "{not json");
    expect(store.readTraits()).toEqual({ found: [], worn: null });
  });

  it("awards a trait once: found, worn, saved, and news for the toast", async () => {
    const store = await freshStore();
    const said = told();
    const listener = vi.fn();
    const stop = store.subscribeTraits(listener);

    expect(store.award("earring", "search")).toBe(true);
    expect(store.readTraits()).toEqual({ found: ["earring"], worn: "earring" });
    expect(JSON.parse(localStorage.getItem(FOUND_KEY)!)).toEqual(["earring"]);
    expect(localStorage.getItem(WORN_KEY)).toBe("earring");
    expect(said).toEqual([{ id: "earring", isNew: true }]);
    expect(listener).toHaveBeenCalledTimes(1);

    // Found already: nothing changes, nothing is said.
    expect(store.award("earring", "case")).toBe(false);
    expect(said).toHaveLength(1);
    // Not a trait at all.
    expect(store.award("crown", "party")).toBe(false);
    expect(said).toHaveLength(1);
    stop();
  });

  it("says nothing for the toast about a trait found on /about's button", async () => {
    const store = await freshStore();
    const said = told();
    expect(store.award("shades", "about")).toBe(true);
    // The shell still hears of it (the nav redraws), with no news.
    expect(said).toEqual([null]);
  });

  it("puts on a trait without finding it", async () => {
    const store = await freshStore();
    store.award("cap", "party");
    const said = told();
    store.wear("pin");
    expect(store.readTraits()).toEqual({ found: ["cap"], worn: "pin" });
    expect(said).toEqual([null]);
    store.wear("crown");
    expect(store.readTraits().worn).toBe("pin");
  });

  it("keeps the traits in memory for the page when storage refuses", async () => {
    const store = await freshStore();
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceededError");
    });
    expect(store.award("glasses", "case")).toBe(true);
    expect(store.readTraits()).toEqual({ found: ["glasses"], worn: "glasses" });
    expect(store.award("glasses", "case")).toBe(false);
  });

  it("dresses a drawing as the visitor has it, now and on every change", async () => {
    const store = await freshStore();
    const set = vi.fn();
    const stop = store.watchAvatar(PORTRAIT_SMALL, set);
    expect(set).toHaveBeenLastCalledWith(PORTRAIT_SMALL);
    store.award("shades", "party");
    expect(set).toHaveBeenLastCalledWith(
      withTrait(PORTRAIT_SMALL, PORTRAIT_TRAITS[0]),
    );
    // All six: the gold edition, outline and all.
    for (const { id } of PORTRAIT_TRAITS) store.award(id, "about");
    const gold = set.mock.lastCall![0] as string[];
    expect(gold.join("")).not.toContain("k");
    stop();
    store.wear("cap");
    expect(set.mock.lastCall![0]).toBe(gold);
  });
});

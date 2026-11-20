import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TRAITS_EVENT, type TraitNews } from "@/lib/brand/traitEvents";

/*
 * The pixel party (now-building-and-genz Phase 3): a burst of the intro's
 * pixels out of the nav's avatar, gone within PARTY_MS (under 3 s), then
 * Shades go on; under reduced motion, no burst at all, only the trait and
 * the news for the toast.
 */

type Party = typeof import("@/components/profile/site/secrets/pixelParty");

/** Motion allowed, or reduced. */
function motion(reduced: boolean) {
  vi.spyOn(window, "matchMedia").mockImplementation(
    (query: string) =>
      ({
        matches: reduced && query.includes("reduce"),
        media: query,
        addEventListener: () => {},
        removeEventListener: () => {},
      }) as unknown as MediaQueryList,
  );
}

/** Fresh modules: the party's and the store's state start empty. */
async function freshParty(): Promise<Party> {
  vi.resetModules();
  return import("@/components/profile/site/secrets/pixelParty");
}

function told(): (TraitNews | null)[] {
  const said: (TraitNews | null)[] = [];
  window.addEventListener(TRAITS_EVENT, (event) =>
    said.push((event as CustomEvent<TraitNews | null>).detail),
  );
  return said;
}

const burst = () => document.querySelector('[data-testid="party-pixels"]');
const found = () =>
  JSON.parse(localStorage.getItem("pf-portrait-found") ?? "[]") as string[];

beforeEach(() => {
  localStorage.clear();
  document.body.innerHTML =
    '<header class="pf-nav" data-away><svg class="pf-nav__avatar"></svg></header>';
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  document.body.innerHTML = "";
});

describe("the pixel party", () => {
  it("bursts out of the avatar, is gone in under 3 s, then puts on Shades", async () => {
    motion(false);
    vi.useFakeTimers();
    const { startParty, PARTY_MS } = await freshParty();
    const said = told();
    startParty();
    const pixels = burst();
    expect(pixels).not.toBeNull();
    expect(pixels!.getAttribute("aria-hidden")).toBe("true");
    expect(pixels!.querySelectorAll(".intro-pixel").length).toBeGreaterThan(20);
    // The bar comes back so the avatar is seen.
    expect(document.querySelector(".pf-nav")!.hasAttribute("data-away")).toBe(
      false,
    );
    expect(PARTY_MS).toBeLessThan(3000);
    // A second call while it runs adds nothing.
    startParty();
    expect(
      document.querySelectorAll('[data-testid="party-pixels"]'),
    ).toHaveLength(1);
    expect(found()).toEqual([]);

    vi.advanceTimersByTime(PARTY_MS);
    expect(burst()).toBeNull();
    expect(found()).toEqual(["shades"]);
    expect(localStorage.getItem("pf-portrait-worn")).toBe("shades");
    expect(said).toEqual([{ id: "shades", isNew: true }]);
  });

  it("under reduced motion: no burst, Shades at once, and the news", async () => {
    motion(true);
    const { startParty } = await freshParty();
    const said = told();
    startParty();
    expect(burst()).toBeNull();
    expect(found()).toEqual(["shades"]);
    expect(said).toEqual([{ id: "shades", isNew: true }]);
  });

  it("puts Shades on again for a visitor who found them, and says so", async () => {
    motion(true);
    localStorage.setItem(
      "pf-portrait-found",
      JSON.stringify(["shades", "cap"]),
    );
    localStorage.setItem("pf-portrait-worn", "cap");
    const { startParty } = await freshParty();
    const said = told();
    startParty();
    expect(localStorage.getItem("pf-portrait-worn")).toBe("shades");
    expect(found()).toEqual(["shades", "cap"]);
    expect(said.at(-1)).toEqual({ id: "shades", isNew: false });
  });
});

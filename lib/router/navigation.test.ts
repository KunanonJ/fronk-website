import { afterEach, describe, expect, it, vi } from "vitest";

/*
 * How the visitor reached the current entry (lib/router/navigation.ts): by
 * a link or a fresh load, where a script may land on the hash, or by Back,
 * Forward or a reload, where the router has put the page back and a script
 * must leave it (WorkStack's #ventures).
 */

type Listener = (event: { action: { type: string } }) => void;

/** A fresh module (it keeps the last action) and a history to drive it. */
async function setUp(load: string) {
  vi.resetModules();
  vi.spyOn(performance, "getEntriesByType").mockReturnValue([
    { type: load } as PerformanceNavigationTiming,
  ]);
  // vitest.setup.ts mocks the module for components: the real one here.
  const { followHistory, returnedTo } = await vi.importActual<
    typeof import("@/lib/router/navigation")
  >("@/lib/router/navigation");
  let listener: Listener = () => {};
  followHistory({
    subscribe: (next) => {
      listener = next as unknown as Listener;
      return () => {};
    },
  });
  const act = (type: string) => listener({ action: { type } });
  return { returnedTo, act };
}

afterEach(() => vi.restoreAllMocks());

describe("returnedTo", () => {
  it("is false on a page opened fresh, and after a link in the app", async () => {
    const { returnedTo, act } = await setUp("navigate");
    expect(returnedTo()).toBe(false);
    act("PUSH");
    expect(returnedTo()).toBe(false);
    act("REPLACE");
    expect(returnedTo()).toBe(false);
  });

  it("is true after Back, Forward or a jump through the history", async () => {
    const { returnedTo, act } = await setUp("navigate");
    for (const type of ["BACK", "FORWARD", "GO"]) {
      act(type);
      expect(returnedTo(), type).toBe(true);
    }
    act("PUSH");
    expect(returnedTo()).toBe(false);
  });

  it("is true on a page a reload or Back brought back, until a link is followed", async () => {
    for (const load of ["reload", "back_forward"]) {
      const { returnedTo, act } = await setUp(load);
      expect(returnedTo(), load).toBe(true);
      act("PUSH");
      expect(returnedTo(), load).toBe(false);
    }
  });
});

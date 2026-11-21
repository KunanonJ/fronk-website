import { describe, expect, it, vi } from "vitest";
import { reloadOnStaleChunk } from "@/src/lib/staleChunk";

/*
 * A navigation whose chunk a deploy removed (src/lib/staleChunk.ts): while
 * the router is loading a page, a chunk that fails asks for the files
 * linked since hydration that have not loaded once more past the caches,
 * then reloads the page asked for, at the top, once per page and build,
 * and its event is canceled; while it is idle (a feature's chunk on the
 * page in use) nothing happens. The browser's globals are handed in.
 */

const ORIGIN = "https://kunanonj.com";
const KEY = "pf-chunk-reload";
// Unit tests have no build define (src/lib/buildId.ts).
const BUILD = "dev";
const asset = (name: string) => `${ORIGIN}/assets/${name}`;
/** The page a navigation asked for: the router has committed its address. */
const PAGE = "/skills/how";

type Listener = (event: {
  target?: unknown;
  preventDefault?: () => void;
}) => void;

function run({
  status = "pending",
  path = PAGE,
  flag = null as string | null,
  storage = true,
  answer = () => Promise.resolve() as Promise<unknown>,
} = {}) {
  const listeners = new Map<string, Listener[]>();
  const listen = (type: string, listener: Listener) =>
    listeners.set(type, [...(listeners.get(type) ?? []), listener]);
  const unlisten = (type: string, listener: Listener) =>
    listeners.set(
      type,
      (listeners.get(type) ?? []).filter((each) => each !== listener),
    );
  const emit = (type: string, event: Parameters<Listener>[0]) =>
    (listeners.get(type) ?? []).forEach((listener) => listener(event));

  // The page's links: at hydration, then the ones a navigation adds.
  const links = [asset("index-A.js"), asset("profile-B.css")];
  const store = new Map<string, string>(flag ? [[KEY, flag]] : []);
  const blocked = () => {
    throw new Error("storage is blocked");
  };
  const sessionStorage = storage
    ? {
        getItem: (key: string) => store.get(key) ?? null,
        setItem: (key: string, value: string) => store.set(key, value),
      }
    : { getItem: blocked, setItem: blocked };
  // The router's scrolling: "manual" while the page is in use, handed back
  // to the browser as it goes (its pagehide listener, added at startup).
  const history = { scrollRestoration: "manual" };
  listen("pagehide", () => {
    history.scrollRestoration = "auto";
  });
  /** The reader leaves the page, or a reload replaces it. */
  const leave = () => emit("pagehide", {});
  const reload = vi.fn(leave);
  const fetch = vi.fn((...[, init]: [string, RequestInit]) => {
    expect(init).toEqual({ cache: "reload" });
    return answer();
  });
  const timers: (() => void)[] = [];
  const win = {
    location: { origin: ORIGIN, pathname: path, reload },
    history,
    document: {
      querySelectorAll: (selector: string) => {
        expect(selector).toBe("link");
        return links.map((href) => ({ href }));
      },
      addEventListener: (
        type: string,
        listener: Listener,
        capture: boolean,
      ) => {
        expect(capture).toBe(true);
        listen(`document:${type}`, listener);
      },
      removeEventListener: (type: string, listener: Listener) =>
        unlisten(`document:${type}`, listener),
    },
    sessionStorage,
    fetch,
    setTimeout: (callback: () => void, ms: number) => {
      expect(ms).toBe(3000);
      timers.push(callback);
    },
    addEventListener: listen,
    removeEventListener: unlisten,
  };
  const router = { state: { status } };
  const off = reloadOnStaleChunk(router, win as unknown as Window);

  /** A navigation adds the links of its chunk and the chunk's imports. */
  const navigate = (...names: string[]) =>
    links.push(...names.map((name) => asset(name)));
  /** A linked file that loaded. */
  const loaded = (name: string) =>
    emit("document:load", { target: { href: asset(name) } });
  /** Vite's preload helper: the event, then whether it was canceled. */
  const chunkFails = () => {
    const event = { preventDefault: vi.fn() };
    emit("vite:preloadError", event);
    return event.preventDefault.mock.calls.length > 0;
  };
  const settle = () => new Promise((done) => setTimeout(done, 0));
  return {
    router,
    history,
    leave,
    store,
    reload,
    fetch,
    timers,
    off,
    navigate,
    loaded,
    chunkFails,
    settle,
  };
}

describe("a navigation whose chunk a deploy removed", () => {
  it("asks for the files that did not load again, then reloads the page once", async () => {
    const page = run();
    page.navigate("_slug-C.js", "arrow-D.js");
    page.loaded("arrow-D.js");
    expect(page.chunkFails()).toBe(true);
    expect(page.store.get(KEY)).toBe(`${BUILD} ${PAGE}`);
    expect(page.fetch.mock.calls.map(([url]) => url)).toEqual([
      asset("_slug-C.js"),
    ]);
    expect(page.reload).not.toHaveBeenCalled();
    await page.settle();
    expect(page.reload).toHaveBeenCalledTimes(1);
    // The 3 s fallback finds the reload asked for.
    page.timers.forEach((callback) => callback());
    expect(page.reload).toHaveBeenCalledTimes(1);
  });

  it("opens the fresh page at the top: its entry stays manual after the router's pagehide", async () => {
    const page = run();
    page.navigate("_slug-C.js");
    page.chunkFails();
    await page.settle();
    expect(page.reload).toHaveBeenCalledTimes(1);
    // Left "auto", the browser reopens the page at the old page's offset.
    expect(page.history.scrollRestoration).toBe("manual");
  });

  it("cancels every later failure on the way out, and reloads no more", async () => {
    const page = run();
    page.navigate("_slug-C.js");
    expect(page.chunkFails()).toBe(true);
    // The loader's import and the component's fail alike.
    expect(page.chunkFails()).toBe(true);
    await page.settle();
    expect(page.fetch).toHaveBeenCalledTimes(1);
    expect(page.reload).toHaveBeenCalledTimes(1);
  });

  it("cancels a feature's failure too once the reload is on its way", () => {
    const page = run({ answer: () => new Promise(() => {}) });
    page.navigate("_slug-C.js");
    page.chunkFails();
    page.router.state.status = "idle";
    expect(page.chunkFails()).toBe(true);
    expect(page.fetch).toHaveBeenCalledTimes(1);
  });

  it("reloads after 3 s when the files never answer", () => {
    const page = run({ answer: () => new Promise(() => {}) });
    page.navigate("_slug-C.js");
    page.chunkFails();
    expect(page.reload).not.toHaveBeenCalled();
    page.timers.forEach((callback) => callback());
    expect(page.reload).toHaveBeenCalledTimes(1);
  });

  it("reloads with nothing to ask for when every file linked since hydration loaded", async () => {
    const page = run();
    page.navigate("_slug-C.js");
    page.loaded("_slug-C.js");
    page.chunkFails();
    expect(page.fetch).not.toHaveBeenCalled();
    await page.settle();
    expect(page.reload).toHaveBeenCalledTimes(1);
  });

  it("leaves a page alone when the router is idle: a feature's chunk", async () => {
    const page = run({ status: "idle" });
    page.navigate("SearchDialog-E.js");
    expect(page.chunkFails()).toBe(false);
    await page.settle();
    page.timers.forEach((callback) => callback());
    expect(page.fetch).not.toHaveBeenCalled();
    expect(page.reload).not.toHaveBeenCalled();
    expect(page.store.has(KEY)).toBe(false);
    // A reader leaving keeps the router's way: the browser's scrolling.
    page.leave();
    expect(page.history.scrollRestoration).toBe("auto");
  });

  it("reloads a page once per build: the same page failing again shows the error", async () => {
    const page = run({ flag: `${BUILD} ${PAGE}` });
    page.navigate("_slug-C.js");
    // Canceled all the same: TanStack's lazy route component would reload.
    expect(page.chunkFails()).toBe(true);
    await page.settle();
    page.timers.forEach((callback) => callback());
    expect(page.reload).not.toHaveBeenCalled();
  });

  it("reloads another page of the same build: one failed answer uses up no other page's reload", async () => {
    // A 502 on a skill's chunk reloaded that skill; a deploy came later.
    const page = run({ path: "/about", flag: `${BUILD} ${PAGE}` });
    page.navigate("about-F.js");
    expect(page.chunkFails()).toBe(true);
    await page.settle();
    expect(page.reload).toHaveBeenCalledTimes(1);
    expect(page.store.get(KEY)).toBe(`${BUILD} /about`);
  });

  it("reloads a newer build once more after a later deploy", async () => {
    const page = run({ flag: `mwpxq4kz ${PAGE}` });
    page.navigate("_slug-C.js");
    expect(page.chunkFails()).toBe(true);
    await page.settle();
    expect(page.reload).toHaveBeenCalledTimes(1);
    expect(page.store.get(KEY)).toBe(`${BUILD} ${PAGE}`);
  });

  it("never reloads without session storage", async () => {
    const page = run({ storage: false });
    page.navigate("_slug-C.js");
    expect(page.chunkFails()).toBe(true);
    await page.settle();
    page.timers.forEach((callback) => callback());
    expect(page.reload).not.toHaveBeenCalled();
  });

  it("stops listening when the root route unmounts", async () => {
    const page = run();
    page.off();
    page.navigate("_slug-C.js");
    expect(page.chunkFails()).toBe(false);
    await page.settle();
    expect(page.reload).not.toHaveBeenCalled();
  });
});

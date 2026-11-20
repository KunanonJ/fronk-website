import { describe, expect, it, vi } from "vitest";
import { ASSET_RETRY_SCRIPT } from "@/src/lib/assetRetry";

/*
 * The asset retry (UX sweep 21-11-26): when the page's own script,
 * stylesheet or module preload fails before the page has loaded, the file
 * is asked for again past the caches and the page reloads once; never a
 * second time until a load is clean, and nothing for anyone else's files or
 * after the load. The script runs here as the browser would run it, with the
 * browser's globals handed in.
 */

const ORIGIN = "https://kunanonj.com";
const KEY = "pf-asset-retry";

type Target = Record<string, unknown>;

const script = (src: string): Target => ({ tagName: "SCRIPT", src });
const link = (rel: string, href: string, more: Target = {}): Target => ({
  tagName: "LINK",
  rel,
  href,
  media: "",
  ...more,
});
const ENTRY_URL = `${ORIGIN}/assets/index-BAGyaEw_.js`;
const ENTRY = script(ENTRY_URL);

function run({
  links = [] as Target[],
  flag = false,
  storage = true,
  answer = Promise.resolve() as Promise<unknown>,
} = {}) {
  const listeners = new Map<
    string,
    ((event: { target?: unknown }) => void)[]
  >();
  const capture = new Map<string, unknown>();
  const store = new Map<string, string>(flag ? [[KEY, "1"]] : []);
  const blocked = () => {
    throw new Error("storage is blocked");
  };
  const sessionStorage = storage
    ? {
        getItem: (key: string) => store.get(key) ?? null,
        setItem: (key: string, value: unknown) => store.set(key, String(value)),
        removeItem: (key: string) => store.delete(key),
      }
    : { getItem: blocked, setItem: blocked, removeItem: blocked };
  const reload = vi.fn();
  const fetch = vi.fn(() => answer);
  const timers: (() => void)[] = [];
  const setTimeout = vi.fn((callback: () => void, ms: number) => {
    expect(ms).toBe(3000);
    timers.push(callback);
  });
  const addEventListener = (
    type: string,
    listener: (event: { target?: unknown }) => void,
    options?: unknown,
  ) => {
    listeners.set(type, [...(listeners.get(type) ?? []), listener]);
    capture.set(type, options);
  };
  const document = {
    querySelectorAll: (selector: string) => {
      expect(selector).toBe('link[rel="stylesheet"]');
      return links.filter((l) => l.rel === "stylesheet");
    },
  };
  const matchMedia = (query: string) => ({ matches: query !== "print" });
  // The inline script, as the browser runs it, its globals handed in.
  new Function(
    "location",
    "addEventListener",
    "document",
    "sessionStorage",
    "matchMedia",
    "fetch",
    "setTimeout",
    ASSET_RETRY_SCRIPT,
  )(
    { origin: ORIGIN, reload },
    addEventListener,
    document,
    sessionStorage,
    matchMedia,
    fetch,
    setTimeout,
  );
  const fire = (type: string, target?: Target) => {
    for (const listener of listeners.get(type) ?? []) listener({ target });
  };
  return {
    reload,
    fetch,
    store,
    capture,
    error: (target: Target) => fire("error", target),
    load: () => fire("load"),
    /** Lets the answer to the second request arrive. */
    settle: () => answer.then(flush, flush),
    /** The 3 s wait running out. */
    timeout: () => timers.forEach((callback) => callback()),
  };
}

/** Lets pending promise callbacks run. */
const flush = () => new Promise<void>((done) => queueMicrotask(done));

describe("the asset retry script", () => {
  it("is small, and listens in the capture phase (load errors do not bubble)", () => {
    expect(ASSET_RETRY_SCRIPT.length).toBeLessThan(800);
    const page = run();
    expect(page.capture.get("error")).toBe(true);
  });

  it("asks for the failed file again past the caches, then reloads once, the flag set first", async () => {
    const page = run();
    page.error(ENTRY);
    expect(page.store.get(KEY)).toBe("1");
    expect(page.fetch).toHaveBeenCalledExactlyOnceWith(ENTRY_URL, {
      cache: "reload",
    });
    // The reload waits for that answer.
    expect(page.reload).not.toHaveBeenCalled();
    await page.settle();
    expect(page.reload).toHaveBeenCalledTimes(1);
    // The 3 s wait running out afterwards reloads nothing more.
    page.timeout();
    expect(page.reload).toHaveBeenCalledTimes(1);
    // Another file of the same page failing: still the one reload.
    page.error(script(`${ORIGIN}/assets/jsx-runtime-Wy9s6hX0.js`));
    await flush();
    expect(page.fetch).toHaveBeenCalledTimes(1);
    expect(page.reload).toHaveBeenCalledTimes(1);
  });

  it("reloads anyway when the second request fails, or after 3 s without an answer", async () => {
    const failed = run({ answer: Promise.reject(new Error("offline")) });
    failed.error(ENTRY);
    await failed.settle();
    expect(failed.reload).toHaveBeenCalledTimes(1);

    const slow = run({ answer: new Promise(() => {}) });
    slow.error(ENTRY);
    await flush();
    expect(slow.reload).not.toHaveBeenCalled();
    slow.timeout();
    expect(slow.reload).toHaveBeenCalledTimes(1);
  });

  it("reloads for a failed stylesheet or module preload of the site's", async () => {
    const sheet = run();
    sheet.error(link("stylesheet", `${ORIGIN}/assets/profile-Cbhcq59O.css`));
    await sheet.settle();
    expect(sheet.reload).toHaveBeenCalledTimes(1);
    const preload = run();
    preload.error(link("modulepreload", `${ORIGIN}/assets/Pill-C0DOORhT.js`));
    await preload.settle();
    expect(preload.reload).toHaveBeenCalledTimes(1);
  });

  it("checks the stylesheets that settled before it ran: a failed one has no rules", async () => {
    const loaded = { cssRules: [{}, {}] };
    // Chromium keeps an empty sheet for a failed stylesheet; WebKit none.
    for (const sheet of [{ cssRules: [] }, null]) {
      const failed = run({
        links: [
          link("stylesheet", `${ORIGIN}/assets/fonts-DSfuDgWh.css`, {
            sheet: loaded,
          }),
          link("stylesheet", `${ORIGIN}/assets/profile-Cbhcq59O.css`, {
            sheet,
          }),
        ],
      });
      expect(failed.fetch).toHaveBeenCalledExactlyOnceWith(
        `${ORIGIN}/assets/profile-Cbhcq59O.css`,
        { cache: "reload" },
      );
      await failed.settle();
      expect(failed.reload).toHaveBeenCalledTimes(1);
    }

    const fine = run({
      links: [
        link("stylesheet", `${ORIGIN}/assets/globals-DPWzJH11.css`, {
          sheet: loaded,
        }),
        // A print sheet does not hold the script back: still loading.
        link("stylesheet", `${ORIGIN}/assets/print.css`, {
          sheet: null,
          media: "print",
        }),
        // Not the site's own.
        link("stylesheet", "https://fonts.example/x.css", { sheet: null }),
      ],
    });
    await fine.settle();
    expect(fine.fetch).not.toHaveBeenCalled();
    expect(fine.reload).not.toHaveBeenCalled();
  });

  it("a sheet it cannot read stops neither the check nor the listening", async () => {
    const unreadable = Object.defineProperty(
      link("stylesheet", `${ORIGIN}/assets/a.css`),
      "sheet",
      {
        get() {
          throw new Error("SecurityError");
        },
      },
    );
    const page = run({
      links: [
        unreadable,
        link("stylesheet", `${ORIGIN}/assets/b.css`, { sheet: null }),
      ],
    });
    await page.settle();
    expect(page.reload).toHaveBeenCalledTimes(1);
    expect(page.capture.has("load")).toBe(true);
  });

  it("never loops: a reload already tried waits for a clean load", async () => {
    const page = run({ flag: true });
    page.error(ENTRY);
    await page.settle();
    expect(page.fetch).not.toHaveBeenCalled();
    expect(page.reload).not.toHaveBeenCalled();
    // This load failed too: the flag stays, so the next failure waits too.
    page.load();
    expect(page.store.get(KEY)).toBe("1");
  });

  it("clears the flag on a clean load, so a later failure may reload once more", () => {
    const page = run({ flag: true });
    page.load();
    expect(page.store.has(KEY)).toBe(false);
  });

  it("leaves other files, inline scripts and late failures alone", async () => {
    const page = run();
    page.error({ tagName: "IMG", src: `${ORIGIN}/assets/cover.png` });
    page.error(link("preload", `${ORIGIN}/assets/onest-latin.woff2`));
    page.error(script("https://static.cloudflareinsights.com/beacon.min.js"));
    page.error(script(""));
    page.error({});
    // After the load event: a lazy file never reloads a page in use.
    page.load();
    page.error(script(`${ORIGIN}/assets/TraitToast-abc.js`));
    page.error(link("stylesheet", `${ORIGIN}/assets/secrets-T-102j-4.css`));
    await page.settle();
    expect(page.fetch).not.toHaveBeenCalled();
    expect(page.reload).not.toHaveBeenCalled();
  });

  it("never reloads without session storage, where it could not stop a loop", async () => {
    const page = run({ storage: false });
    page.error(ENTRY);
    await page.settle();
    expect(page.reload).not.toHaveBeenCalled();
  });
});

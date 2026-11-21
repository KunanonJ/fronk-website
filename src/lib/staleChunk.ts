import { BUILD_ID } from "@/src/lib/buildId";

/*
 * A navigation whose code a deploy removed loads its page fresh, once.
 *
 * Each deploy replaces the hashed files under /assets and the old ones are
 * gone. A tab opened before it keeps the old build's code, so a link
 * followed inside the site can ask for a route's chunk (or one its loader
 * imports) that now answers 404. Vite's preload helper then sends a
 * cancelable `vite:preloadError` on window and throws. A route whose loader
 * imports its chunk (a skill's) shows the error page, and "Try again" fails
 * the same way; a route without a loader is reloaded by TanStack's lazy
 * route component, by a rule of its own (below).
 *
 * Whose chunk: the router's status is "pending" from the moment a load
 * starts (a link, Back or Forward, a redirect, Try again) until the new
 * page is committed, and "idle" otherwise; intent preloads leave it idle
 * (router-core load-client.ts). A failure while it is idle is a feature's
 * chunk on the page in use (the search dialog, the living status), and the
 * page is left alone, as src/lib/assetRetry.ts promises. A failure while it
 * is pending is the navigation's, and the page asked for is loaded as a
 * document.
 *
 * Where to: the router commits a navigation to history before it loads it
 * (commitLocation: history.push queues pushState for a microtask, then the
 * load starts), and a chunk's answer comes later, so the address is already
 * the destination. `location.reload()` loads it and keeps its history entry
 * (`assign` would add a second one; `replace` to an address with a hash
 * would only scroll).
 *
 * How: first the site's files linked since hydration that have not loaded
 * are asked for again past the caches (`cache: "reload"`), as the asset
 * retry does: WebKit keeps a failed module script and serves it to the
 * reloaded page. Vite links a chunk and its new imports (modulepreload or
 * stylesheet) before it imports the chunk, so the failed file is among
 * them even when its link's error comes after the import's, as it can in
 * every engine. The reload waits for the answers, or 3 s at most.
 *
 * Once per build: the session flag holds the id of the build that reloaded
 * (src/lib/buildId.ts), set before the reload. The fresh page is a newer
 * build, which may reload once in turn after a later deploy; a page of the
 * same build (files that keep failing) never reloads again and shows the
 * error page. Without session storage it never reloads.
 *
 * A navigation's failure is this file's alone: its event is canceled, so
 * the import resolves empty and the route fails with a plain error, not a
 * missing module that TanStack's lazy route component would reload as well
 * (once per error message, and without asking for the file again). The
 * same goes for every failure once the reload is on its way. Listening
 * starts after hydration (the root route): until then the page's own files
 * are the asset retry's.
 */

const FLAG = "pf-chunk-reload";

type Router = { readonly state: { readonly status: string } };

/** Listens for the site's chunks failing to load; returns the unsubscribe. */
export function reloadOnStaleChunk(router: Router, win: Window = window) {
  const assets = `${win.location.origin}/assets/`;
  const doc = win.document;
  const linked = () =>
    new Set(Array.from(doc.querySelectorAll("link"), (link) => link.href));
  // The page's links at hydration, and every link that has loaded since
  // (a load event never reaches window, so the document hears it).
  const loaded = linked();
  let reloading = false;

  const onLoad = ({ target }: Event) => {
    const href = (target as { href?: unknown } | null)?.href;
    if (typeof href === "string") loaded.add(href);
  };

  const onChunkError = (event: Event) => {
    if (!reloading && router.state.status !== "pending") return;
    event.preventDefault();
    if (reloading) return;
    try {
      if (win.sessionStorage.getItem(FLAG) === BUILD_ID) return;
      win.sessionStorage.setItem(FLAG, BUILD_ID);
    } catch {
      return;
    }
    reloading = true;
    let asked = false;
    const reload = () => {
      if (asked) return;
      asked = true;
      win.location.reload();
    };
    const again = [...linked()]
      .filter((url) => url.startsWith(assets) && !loaded.has(url))
      .map((url) => win.fetch(url, { cache: "reload" }).catch(() => undefined));
    void Promise.all(again).then(reload);
    win.setTimeout(reload, 3000);
  };

  doc.addEventListener("load", onLoad, true);
  win.addEventListener("vite:preloadError", onChunkError);
  return () => {
    doc.removeEventListener("load", onLoad, true);
    win.removeEventListener("vite:preloadError", onChunkError);
  };
}
